// Mastodon and compatible servers via their public REST API (docs: methods/accounts).
// GET /api/v1/accounts/lookup?acct= and GET /api/v1/accounts/:id/following (public since 4.0,
// unless the owner hides their network). Pagination follows the Link header.
import {
  ConnectorError,
  getJson,
  type Fetch,
  type OwnAccount,
  type Page,
  type SourceAccount,
} from './types';

type Account = {
  id: string;
  username: string;
  acct: string;
  display_name: string;
  avatar?: string;
  url: string;
  following_count?: number;
};

/** "@dana@mastodon.social", "dana@mastodon.social" or "https://mastodon.social/@dana". */
export function parseMastodonAddress(input: string): { user: string; host: string } {
  const s = input.trim();
  const url = s.match(/^https?:\/\/([^/]+)\/@([^/?#@]+)\/?$/i);
  if (url?.[1] && url[2]) return { host: url[1].toLowerCase(), user: url[2] };
  const m = s.replace(/^@/, '').match(/^([a-z0-9_.-]+)@([a-z0-9.-]+\.[a-z]{2,})$/i);
  if (!m?.[1] || !m[2]) {
    throw new ConnectorError('Use your full address, like @you@mastodon.social.', 'invalid');
  }
  return { user: m[1], host: m[2].toLowerCase() };
}

/** Mastodon's `acct` is local ("dana") for accounts on the same server; make it global. */
function toAccount(a: Account, host: string): SourceAccount {
  const acct = a.acct.includes('@') ? a.acct : `${a.acct}@${host}`;
  return {
    platform: 'mastodon',
    externalId: a.url,
    handle: `@${acct}`,
    displayName: a.display_name?.trim() || a.username,
    avatarUrl: a.avatar ?? null,
    feedUrl: null,
  };
}

export type MastodonOwnAccount = OwnAccount & { host: string; accountId: string };

export async function getMastodonAccount(
  address: string,
  fetchImpl: Fetch = fetch,
): Promise<MastodonOwnAccount> {
  const { user, host } = parseMastodonAddress(address);
  const { data } = await getJson<Account>(
    fetchImpl,
    `https://${host}/api/v1/accounts/lookup?acct=${encodeURIComponent(user)}`,
  );
  return {
    ...toAccount(data, host),
    followsCount: data.following_count ?? null,
    host,
    accountId: data.id,
  };
}

/** The URL of the rel="next" page in a Link header, if any. */
export function nextLink(header: string | null): string | null {
  if (!header) return null;
  for (const part of header.split(',')) {
    const m = part.match(/<([^>]+)>\s*;\s*rel="?next"?/);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** First page when `cursor` is null; the cursor is the next page's full URL on the same host. */
export async function getMastodonFollowing(
  host: string,
  accountId: string,
  cursor: string | null = null,
  fetchImpl: Fetch = fetch,
): Promise<Page> {
  const url =
    cursor ?? `https://${host}/api/v1/accounts/${encodeURIComponent(accountId)}/following?limit=80`;
  if (!url.startsWith(`https://${host}/`))
    throw new ConnectorError('Unexpected page link.', 'invalid');
  const { data, res } = await getJson<Account[]>(fetchImpl, url);
  return {
    accounts: data.map((a) => toAccount(a, host)),
    cursor: nextLink(res.headers.get('link')),
  };
}
