export type FetchLike = (url: string, init: { method: string; signal: AbortSignal }) => Promise<{ ok: boolean; status: number }>;

export interface RemoteCheckOptions {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}

export const DEFAULT_REMOTE_TIMEOUT_MS = 5000;

const METHOD_NOT_ALLOWED = 405;
const NOT_IMPLEMENTED = 501;

async function fetchOnce(
  fetchImpl: FetchLike,
  url: string,
  method: "HEAD" | "GET",
  timeoutMs: number,
): Promise<{ ok: boolean; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetchImpl(url, { method, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks whether a remote URL resolves, preferring a HEAD request and
 * falling back to GET when the server doesn't seem to support HEAD (or
 * the HEAD request fails outright, e.g. a connection reset).
 */
export async function checkRemoteLink(url: string, options: RemoteCheckOptions = {}): Promise<boolean> {
  const { fetchImpl = fetch, timeoutMs = DEFAULT_REMOTE_TIMEOUT_MS } = options;

  let headResponse: { ok: boolean; status: number } | undefined;
  try {
    headResponse = await fetchOnce(fetchImpl, url, "HEAD", timeoutMs);
  } catch {
    headResponse = undefined;
  }

  if (headResponse?.ok) return true;

  const shouldTryGet =
    !headResponse || headResponse.status === METHOD_NOT_ALLOWED || headResponse.status === NOT_IMPLEMENTED;

  if (!shouldTryGet) return false;

  try {
    const getResponse = await fetchOnce(fetchImpl, url, "GET", timeoutMs);
    return getResponse.ok;
  } catch {
    return false;
  }
}
