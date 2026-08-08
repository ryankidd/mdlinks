#!/usr/bin/env node
import { Command } from "commander";
import { checkFile } from "./checkFile.js";

const program = new Command();

program
  .name("mdlinks")
  .description("Check a markdown file for broken links")
  .argument("<file>", "path to a markdown file")
  .action(async (file: string) => {
    const results = await checkFile(file);
    const broken = results.filter((r) => !r.ok);

    for (const result of results) {
      const status = result.ok ? "OK  " : "FAIL";
      console.log(`${status}  ${result.url}`);
    }

    if (broken.length > 0) {
      console.error(`\n${broken.length} broken link(s) found`);
      process.exitCode = 1;
    }
  });

program.parseAsync();
