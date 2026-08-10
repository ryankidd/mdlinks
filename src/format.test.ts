import { describe, expect, it } from "vitest";
import { countBroken, formatResults } from "./format.js";
import type { FileLinkCheckResult } from "./checkFiles.js";

const oneFile: FileLinkCheckResult[] = [
  {
    file: "a.md",
    results: [
      { url: "./ok.md", ok: true, resolvedPath: "/tmp/ok.md" },
      { url: "./bad.md", ok: false, resolvedPath: "/tmp/bad.md" },
    ],
  },
];

const twoFiles: FileLinkCheckResult[] = [
  { file: "a.md", results: [{ url: "./bad.md", ok: false, resolvedPath: "/tmp/bad.md" }] },
  { file: "b.md", results: [] },
];

describe("countBroken", () => {
  it("counts failing results across all files", () => {
    expect(countBroken(oneFile)).toBe(1);
    expect(countBroken(twoFiles)).toBe(1);
    expect(countBroken([{ file: "c.md", results: [] }])).toBe(0);
  });
});

describe("formatResults", () => {
  it("renders one file's results without a file header in text format", () => {
    expect(formatResults(oneFile, "text")).toBe("OK    ./ok.md\nFAIL  ./bad.md");
  });

  it("groups results under a file header when checking multiple files", () => {
    expect(formatResults(twoFiles, "text")).toBe("\na.md\nFAIL  ./bad.md\n\nb.md");
  });

  it("renders a JSON summary with ok/brokenCount/files", () => {
    const parsed = JSON.parse(formatResults(oneFile, "json"));
    expect(parsed).toEqual({ ok: false, brokenCount: 1, files: oneFile });
  });

  it("marks JSON output ok when nothing is broken", () => {
    const parsed = JSON.parse(formatResults([{ file: "c.md", results: [] }], "json"));
    expect(parsed.ok).toBe(true);
    expect(parsed.brokenCount).toBe(0);
  });
});
