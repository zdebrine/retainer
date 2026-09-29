// RSS 2.0 and Atom feeds. A page URL is accepted too: its <link rel="alternate"> feed is used.
import { XMLParser } from 'fast-xml-parser';

import { ConnectorError, type Fetch, type SourceAccount } from './types';

const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });

function text(v: unknown): string {
  if (typeof v === 'string') return v.trim();
  if (v && typeof v === 'object' && '#text' in v)
    return String((v as { '#text': unknown })['#text']).trim();
  return '';
}

export type FeedInfo = { title: string; siteUrl: string | null };

/** Title and site link of an RSS or Atom document, or null if it is not a feed. */
export function parseFeedInfo(xml: string): FeedInfo | null {
  let doc: Record<string, unknown>;
  try {
    doc = parser.parse(xml) as Record<string, unknown>;
  } catch {
    return null;
  }
  const rss = doc.rss as { channel?: { title?: unknown; link?: unknown } } | undefined;
  if (rss?.channel)
    return { title: text(rss.channel.title), siteUrl: text(rss.channel.link) || null };
  const feed = doc.feed as { title?: unknown; link?: unknown } | undefined;
  if (feed) {
    const links = Array.isArray(feed.link) ? feed.link : feed.link ? [feed.link] : [];
    const alt = links.find(
      (l: Record<string, string>) => !l['@_rel'] || l['@_rel'] === 'alternate',
    ) as Record<string, string> | undefined;
    return { title: text(feed.title), siteUrl: alt?.['@_href'] ?? null };
  }
  return null;
}

/** The first RSS/Atom <link rel="alternate"> in an HTML page, resolved against the page URL. */
export function findFeedLink(html: string, pageUrl: string): string | null {
  for (const tag of html.match(/<link\b[^>]*>/gi) ?? []) {
    const attr = (name: string) =>
      tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, 'i'))?.[1];
    const type = attr('type')?.toLowerCase();
    if (
      attr('rel')?.toLowerCase().includes('alternate') &&
      (type === 'application/rss+xml' || type === 'application/atom+xml')
    ) {
      const href = attr('href');
      if (href) return new URL(href, pageUrl).toString();
    }
  }
  return null;
}

export function normaliseUrl(input: string): string {
  let s = input.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    return new URL(s).toString();
  } catch {
    throw new ConnectorError('That does not look like a web address.', 'invalid');
  }
}

async function fetchText(fetchImpl: Fetch, url: string): Promise<string> {
  let res: Response;
  try {
    res = await fetchImpl(url, {
      headers: { Accept: 'application/rss+xml, application/atom+xml, text/html;q=0.8, */*;q=0.5' },
    });
  } catch {
    throw new ConnectorError('Could not reach that address.', 'network');
  }
  if (!res.ok)
    throw new ConnectorError(
      `That address answered ${res.status}.`,
      res.status === 404 ? 'not_found' : 'network',
    );
  return res.text();
}

/** Resolves a feed or site URL into a feed account. */
export async function resolveFeed(input: string, fetchImpl: Fetch = fetch): Promise<SourceAccount> {
  let url = normaliseUrl(input);
  let body = await fetchText(fetchImpl, url);
  let info = parseFeedInfo(body);
  if (!info) {
    const feedUrl = findFeedLink(body, url);
    if (!feedUrl) throw new ConnectorError('No feed was found at that address.', 'unsupported');
    url = feedUrl;
    body = await fetchText(fetchImpl, url);
    info = parseFeedInfo(body);
    if (!info) throw new ConnectorError('No feed was found at that address.', 'unsupported');
  }
  const host = new URL(info.siteUrl || url).hostname.replace(/^www\./, '');
  return {
    platform: 'rss',
    externalId: url,
    handle: host,
    displayName: info.title || host,
    avatarUrl: null,
    feedUrl: url,
  };
}
