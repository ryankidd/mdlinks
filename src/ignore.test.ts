import { describe, expect, it } from "vitest";
import { isIgnored } from "./ignore.js";

describe("isIgnored", () => {
  it("matches a literal pattern with no wildcard", () => {
    expect(isIgnored("mailto:me@example.com", ["mailto:me@example.com"])).toBe(true);
    expect(isIgnored("mailto:other@example.com", ["mailto:me@example.com"])).toBe(false);
  });

  it("matches * as a wildcard anywhere in the pattern", () => {
    expect(isIgnored("mailto:me@example.com", ["mailto:*"])).toBe(true);
    expect(isIgnored("http://localhost:3000/", ["*localhost*"])).toBe(true);
    expect(isIgnored("http://example.com/", ["*localhost*"])).toBe(false);
  });

  it("returns false when no pattern matches", () => {
    expect(isIgnored("https://example.com", [])).toBe(false);
    expect(isIgnored("https://example.com", ["https://other.com"])).toBe(false);
  });

  it("treats other regex metacharacters in the pattern as literal", () => {
    expect(isIgnored("https://example.com/a.b", ["https://example.com/a.b"])).toBe(true);
    expect(isIgnored("https://example.com/aXb", ["https://example.com/a.b"])).toBe(false);
  });
});
