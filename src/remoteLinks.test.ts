import { describe, expect, it } from "vitest";
import { checkRemoteLink, type FetchLike } from "./remoteLinks.js";

function fakeFetch(handler: (url: string, method: string) => { ok: boolean; status: number }): FetchLike {
  return async (url, init) => handler(url, init.method);
}

describe("checkRemoteLink", () => {
  it("returns true when HEAD succeeds", async () => {
    const calls: string[] = [];
    const fetchImpl = fakeFetch((_url, method) => {
      calls.push(method);
      return { ok: true, status: 200 };
    });

    await expect(checkRemoteLink("https://example.com", { fetchImpl })).resolves.toBe(true);
    expect(calls).toEqual(["HEAD"]);
  });

  it("returns false when HEAD fails with a real error status", async () => {
    const fetchImpl = fakeFetch(() => ({ ok: false, status: 404 }));

    await expect(checkRemoteLink("https://example.com/missing", { fetchImpl })).resolves.toBe(false);
  });

  it("falls back to GET when the server doesn't allow HEAD", async () => {
    const calls: string[] = [];
    const fetchImpl = fakeFetch((_url, method) => {
      calls.push(method);
      return method === "HEAD" ? { ok: false, status: 405 } : { ok: true, status: 200 };
    });

    await expect(checkRemoteLink("https://example.com", { fetchImpl })).resolves.toBe(true);
    expect(calls).toEqual(["HEAD", "GET"]);
  });

  it("falls back to GET when HEAD throws outright", async () => {
    const calls: string[] = [];
    const fetchImpl: FetchLike = async (_url, init) => {
      calls.push(init.method);
      if (init.method === "HEAD") throw new Error("connection reset");
      return { ok: true, status: 200 };
    };

    await expect(checkRemoteLink("https://example.com", { fetchImpl })).resolves.toBe(true);
    expect(calls).toEqual(["HEAD", "GET"]);
  });

  it("returns false when both HEAD and the GET fallback fail", async () => {
    const fetchImpl = fakeFetch(() => ({ ok: false, status: 405 }));

    await expect(checkRemoteLink("https://example.com", { fetchImpl })).resolves.toBe(false);
  });

  it("aborts the request once the timeout elapses", async () => {
    const fetchImpl: FetchLike = (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener("abort", () => reject(new Error("aborted")));
      });

    await expect(checkRemoteLink("https://example.com", { fetchImpl, timeoutMs: 10 })).resolves.toBe(false);
  });
});
