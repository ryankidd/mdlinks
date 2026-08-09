import { describe, expect, it } from "vitest";
import { isRemoteLink } from "./links.js";

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
