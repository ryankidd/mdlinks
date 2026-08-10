#!/usr/bin/env node
import { Command } from "commander";
import { checkFiles } from "./checkFiles.js";
import { resolveMarkdownFiles } from "./targets.js";
import { countBroken, formatResults, type OutputFormat } from "./format.js";

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

const program = new Command();

program
  .name("mdlinks")
  .description("Check markdown files for broken links")
  .argument("<paths...>", "markdown files, directories, or glob patterns")
  .option("-i, --ignore <pattern>", "ignore URLs matching a glob pattern (repeatable)", collect, [] as string[])
  .option("-f, --format <format>", "output format: text or json", "text")
  .action(async (paths: string[], options: { ignore: string[]; format: string }) => {
    if (options.format !== "text" && options.format !== "json") {
      console.error(`unknown format: ${options.format}`);
      process.exitCode = 2;
      return;
    }
    const format = options.format as OutputFormat;

    let files: string[];
    try {
      files = await resolveMarkdownFiles(paths);
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
      return;
    }

    if (files.length === 0) {
      console.error("no markdown files found");
      process.exitCode = 2;
      return;
    }

    let fileResults;
    try {
      fileResults = await checkFiles(files, { ignore: options.ignore });
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error));
      process.exitCode = 2;
      return;
    }

    console.log(formatResults(fileResults, format));

    const brokenTotal = countBroken(fileResults);
    if (format === "text" && brokenTotal > 0) {
      console.error(`\n${brokenTotal} broken link(s) found`);
    }
    if (brokenTotal > 0) {
      process.exitCode = 1;
    }
  });

program.parseAsync();
