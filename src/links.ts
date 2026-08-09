const INLINE_LINK = /\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

export interface MarkdownLink {
  text: string;
  url: string;
}

export function extractLinks(markdown: string): MarkdownLink[] {
  const links: MarkdownLink[] = [];
  for (const match of markdown.matchAll(INLINE_LINK)) {
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
