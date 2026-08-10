#!/usr/bin/env node
import { Command } from "commander";
import { checkFiles } from "./checkFiles.js";
import { resolveMarkdownFiles } from "./targets.js";

function collect(value: string, previous: string[]): string[] {
  return [...previous, value];
}

const program = new Command();

program
  .name("mdlinks")
  .description("Check markdown files for broken links")
  .argument("<paths...>", "markdown files, directories, or glob patterns")
  .option("-i, --ignore <pattern>", "ignore URLs matching a glob pattern (repeatable)", collect, [] as string[])
  .action(async (paths: string[], options: { ignore: string[] }) => {
    const files = await resolveMarkdownFiles(paths);

    if (files.length === 0) {
      console.error("no markdown files found");
      process.exitCode = 1;
      return;
    }

    const fileResults = await checkFiles(files, { ignore: options.ignore });
    let brokenTotal = 0;

    for (const { file, results } of fileResults) {
      if (fileResults.length > 1) console.log(`\n${file}`);

      for (const result of results) {
        const status = result.ok ? "OK  " : "FAIL";
        console.log(`${status}  ${result.url}`);
      }

      brokenTotal += results.filter((r) => !r.ok).length;
    }

    if (brokenTotal > 0) {
      console.error(`\n${brokenTotal} broken link(s) found`);
      process.exitCode = 1;
    }
  });

program.parseAsync();
