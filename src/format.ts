import type { FileLinkCheckResult } from "./checkFiles.js";

export type OutputFormat = "text" | "json";

export function countBroken(fileResults: readonly FileLinkCheckResult[]): number {
  return fileResults.reduce((total, { results }) => total + results.filter((r) => !r.ok).length, 0);
}

export function formatResults(fileResults: readonly FileLinkCheckResult[], format: OutputFormat): string {
  if (format === "json") {
    const brokenCount = countBroken(fileResults);
    return JSON.stringify({ ok: brokenCount === 0, brokenCount, files: fileResults }, null, 2);
  }

  const lines: string[] = [];
  for (const { file, results } of fileResults) {
    if (fileResults.length > 1) lines.push(`\n${file}`);
    for (const result of results) {
      lines.push(`${result.ok ? "OK  " : "FAIL"}  ${result.url}`);
    }
  }
  return lines.join("\n");
}
