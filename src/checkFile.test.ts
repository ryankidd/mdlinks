import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkFile } from "./checkFile.js";

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
        "External links like [example](https://example.com) are ignored.",
      ].join("\n"),
    );

    const results = await checkFile(mdPath);

    expect(results).toEqual([
      { url: "./target.md", ok: true, resolvedPath: join(dir, "target.md") },
      { url: "./missing.md", ok: false, resolvedPath: join(dir, "missing.md") },
    ]);
  });
});
