import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { extractLinks, isLocalLink } from "./links.js";

export interface LinkCheckResult {
  url: string;
  ok: boolean;
  resolvedPath: string;
}

export async function checkFile(filePath: string): Promise<LinkCheckResult[]> {
  const markdown = await readFile(filePath, "utf8");
  const baseDir = dirname(filePath);

  return extractLinks(markdown)
    .filter((link) => isLocalLink(link.url))
    .map((link) => {
      const [target] = link.url.split("#");
      const resolvedPath = resolve(baseDir, target);
      return {
        url: link.url,
        ok: target === "" || existsSync(resolvedPath),
        resolvedPath,
      };
    });
}
