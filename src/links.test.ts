import { describe, expect, it } from "vitest";
import { extractLinks, isRemoteLink } from "./links.js";

describe("extractLinks", () => {
  it("extracts a real inline link", () => {
    expect(extractLinks("See [target](./target.md) for details.")).toEqual([
      { text: "target", url: "./target.md" },
    ]);
  });

  it("ignores link syntax shown inside an inline code span", () => {
    expect(extractLinks("It scans links (`[text](url)`) in markdown.")).toEqual([]);
  });

  it("ignores link syntax shown inside a fenced code block", () => {
    const markdown = ["```md", "[text](url)", "```", "", "[real](./real.md)"].join("\n");
    expect(extractLinks(markdown)).toEqual([{ text: "real", url: "./real.md" }]);
  });
});

describe("isRemoteLink", () => {
  it("accepts http and https URLs", () => {
    expect(isRemoteLink("http://example.com")).toBe(true);
    expect(isRemoteLink("https://example.com/path")).toBe(true);
  });

  it("rejects local paths and other schemes", () => {
    expect(isRemoteLink("./local.md")).toBe(false);
    expect(isRemoteLink("../other.md")).toBe(false);
    expect(isRemoteLink("mailto:me@example.com")).toBe(false);
    expect(isRemoteLink("#section")).toBe(false);
  });
});
