import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { resolveMarkdownFiles } from "./targets.js";

describe("resolveMarkdownFiles", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(join(tmpdir(), "mdlinks-targets-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("returns a literal file path unchanged", async () => {
    const file = join(dir, "a.md");
    await writeFile(file, "# a\n");

    expect(await resolveMarkdownFiles([file])).toEqual([file]);
  });

  it("finds markdown files recursively in a directory", async () => {
    await mkdir(join(dir, "nested"));
    await writeFile(join(dir, "a.md"), "# a\n");
    await writeFile(join(dir, "nested", "b.md"), "# b\n");
    await writeFile(join(dir, "c.txt"), "not markdown\n");

    expect(await resolveMarkdownFiles([dir])).toEqual([join(dir, "a.md"), join(dir, "nested", "b.md")]);
  });

  it("expands a glob pattern", async () => {
    await writeFile(join(dir, "a.md"), "# a\n");
    await writeFile(join(dir, "b.md"), "# b\n");
    await writeFile(join(dir, "c.txt"), "not markdown\n");

    expect(await resolveMarkdownFiles([join(dir, "*.md")])).toEqual([join(dir, "a.md"), join(dir, "b.md")]);
  });

  it("deduplicates files reached through multiple arguments", async () => {
    const file = join(dir, "a.md");
    await writeFile(file, "# a\n");

    expect(await resolveMarkdownFiles([file, dir])).toEqual([file]);
  });

  it("drops a glob pattern that matches nothing", async () => {
    expect(await resolveMarkdownFiles([join(dir, "*.md")])).toEqual([]);
  });

  it("passes through a literal missing path unchanged", async () => {
    const missing = join(dir, "missing.md");
    expect(await resolveMarkdownFiles([missing])).toEqual([missing]);
  });
});
