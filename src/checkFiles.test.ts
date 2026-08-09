import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFiles } from "./checkFiles.js";

describe("checkFiles", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "mdlinks-checkfiles-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("aggregates results across multiple files, keyed by file", async () => {
    const a = join(dir, "a.md");
    const b = join(dir, "b.md");
    await writeFile(a, "See [missing](./nope.md).");
    await writeFile(b, "# b\n");

    const fileResults = await checkFiles([a, b]);

    expect(fileResults).toEqual([
      { file: a, results: [{ url: "./nope.md", ok: false, resolvedPath: join(dir, "nope.md") }] },
      { file: b, results: [] },
    ]);
  });
});
