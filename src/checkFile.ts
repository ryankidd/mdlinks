import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { extractLinks, isLocalLink, isRemoteLink } from "./links.js";
import { isIgnored } from "./ignore.js";
import { createLimiter } from "./limit.js";
import { checkRemoteLink, DEFAULT_REMOTE_TIMEOUT_MS, type FetchLike } from "./remoteLinks.js";

export interface LinkCheckResult {
  url: string;
  ok: boolean;
  resolvedPath?: string;
}

export interface CheckFileOptions {
  /** Max number of remote links checked at once. Defaults to 5. */
  concurrency?: number;
  /** Per-request timeout in milliseconds for remote link checks. */
  timeoutMs?: number;
  /** Override for the fetch implementation used to check remote links. */
  fetchImpl?: FetchLike;
  /** Glob patterns (`*` wildcard) for URLs to skip entirely. */
  ignore?: readonly string[];
}

const DEFAULT_CONCURRENCY = 5;

export async function checkFile(filePath: string, options: CheckFileOptions = {}): Promise<LinkCheckResult[]> {
  const markdown = await readFile(filePath, "utf8");
  const baseDir = dirname(filePath);
  const limit = createLimiter(options.concurrency ?? DEFAULT_CONCURRENCY);

  const checks = extractLinks(markdown).map((link): Promise<LinkCheckResult> | undefined => {
    if (isIgnored(link.url, options.ignore ?? [])) {
      return undefined;
    }

    if (isLocalLink(link.url)) {
      const [target] = link.url.split("#");
      const resolvedPath = resolve(baseDir, target);
      return Promise.resolve({
        url: link.url,
        ok: target === "" || existsSync(resolvedPath),
        resolvedPath,
      });
    }

    if (isRemoteLink(link.url)) {
      return limit(async () => ({
        url: link.url,
        ok: await checkRemoteLink(link.url, {
          fetchImpl: options.fetchImpl,
          timeoutMs: options.timeoutMs ?? DEFAULT_REMOTE_TIMEOUT_MS,
        }),
      }));
    }

    return undefined;
  });

  return Promise.all(checks.filter((check): check is Promise<LinkCheckResult> => check !== undefined));
}
