import { checkFile, type CheckFileOptions, type LinkCheckResult } from "./checkFile.js";

export interface FileLinkCheckResult {
  file: string;
  results: LinkCheckResult[];
}

/**
 * Runs checkFile over multiple markdown files and aggregates the results,
 * keyed by file.
 */
export async function checkFiles(
  filePaths: readonly string[],
  options: CheckFileOptions = {},
): Promise<FileLinkCheckResult[]> {
  const fileResults: FileLinkCheckResult[] = [];

  for (const file of filePaths) {
    const results = await checkFile(file, options);
    fileResults.push({ file, results });
  }

  return fileResults;
}
