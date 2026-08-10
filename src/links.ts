const INLINE_LINK = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
const CODE_SPAN_OR_FENCE = /```[\s\S]*?```|`[^`\n]*`/g;

export interface MarkdownLink {
  text: string;
  url: string;
}

/**
 * Replaces fenced and inline code spans with equal-length whitespace so a
 * literal `[text](url)` shown as an example inside code isn't picked up as
 * a real link, while leaving every other character's position unchanged.
 */
function maskCodeSpans(markdown: string): string {
  return markdown.replace(CODE_SPAN_OR_FENCE, (match) => match.replace(/[^\n]/g, " "));
}

export function extractLinks(markdown: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  for (const match of maskCodeSpans(markdown).matchAll(INLINE_LINK)) {
    links.push({ text: match[1], url: match[2] });
  }
  return links;
}

export function isLocalLink(url: string): boolean {
  if (url.startsWith("#")) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(url);
}

export function isRemoteLink(url: string): boolean {
  return /^https?:/i.test(url);
}
