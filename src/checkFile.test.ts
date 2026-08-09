import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFile } from "./checkFile.js";
import type { FetchLike } from "./remoteLinks.js";

describe("checkFile", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "mdlinks-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("reports local links that resolve and ones that don't", async () => {
    await writeFile(join(dir, "target.md"), "# Target\n");
    const mdPath = join(dir, "source.md");
    await writeFile(
      mdPath,
      [
        "# Source",
        "",
        "See [target](./target.md) for details.",
        "This one is [missing](./missing.md).",
        "This one is a [mailto link](mailto:me@example.com) and is skipped entirely.",
      ].join("\n"),
    );

    const results = await checkFile(mdPath);

    expect(results).toEqual([
      { url: "./target.md", ok: true, resolvedPath: join(dir, "target.md") },
      { url: "./missing.md", ok: false, resolvedPath: join(dir, "missing.md") },
    ]);
  });

  it("checks remote links using the injected fetch implementation", async () => {
    const mdPath = join(dir, "source.md");
    await writeFile(
      mdPath,
      [
        "See [live](https://example.com/ok) and [dead](https://example.com/missing).",
      ].join("\n"),
    );

    const fetchImpl: FetchLike = async (url) => ({
      ok: !url.endsWith("/missing"),
      status: url.endsWith("/missing") ? 404 : 200,
    });

    const results = await checkFile(mdPath, { fetchImpl });

    expect(results).toEqual([
      { url: "https://example.com/ok", ok: true },
      { url: "https://example.com/missing", ok: false },
    ]);
  });
});
