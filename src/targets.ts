import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { glob, isDynamicPattern } from "tinyglobby";

/**
 * Expands a list of CLI arguments — file paths, directories, or glob
 * patterns — into a sorted, deduplicated list of markdown file paths.
 *
 * A directory is searched recursively for `.md` files. A glob pattern that
 * matches nothing is dropped. A literal path that doesn't exist and isn't a
 * glob pattern is passed through unchanged, so that checking it later
 * produces a clear "file not found" error instead of being silently
 * skipped.
 */
export async function resolveMarkdownFiles(patterns: readonly string[]): Promise<string[]> {
  const files = new Set<string>();

  for (const pattern of patterns) {
    const stats = await stat(pattern).catch(() => undefined);

    if (stats?.isFile()) {
      files.add(resolve(pattern));
      continue;
    }

    if (stats?.isDirectory()) {
      const matches = await glob("**/*.md", { cwd: pattern, absolute: true });
      for (const match of matches) files.add(match);
      continue;
    }

    const matches = await glob(pattern, { absolute: true, onlyFiles: true });
    const markdownMatches = matches.filter((match) => match.endsWith(".md"));

    if (markdownMatches.length > 0) {
      for (const match of markdownMatches) files.add(match);
    } else if (!isDynamicPattern(pattern)) {
      files.add(resolve(pattern));
    }
  }

  return [...files].sort();
}
