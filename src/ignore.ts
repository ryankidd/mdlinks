/**
 * Minimal glob matcher for ignore patterns. `*` matches any run of
 * characters; everything else (including other glob metacharacters) is
 * matched literally, so patterns like `mailto:*` or `*localhost*` work
 * without pulling in a full glob library for URL strings.
 */
function patternToRegExp(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`);
}

export function isIgnored(url: string, patterns: readonly string[]): boolean {
  return patterns.some((pattern) => patternToRegExp(pattern).test(url));
}
