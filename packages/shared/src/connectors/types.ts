/** Phase 1 platforms (spec §6). All are read from public data; no platform credentials are stored. */
export type Platform = 'bluesky' | 'mastodon' | 'rss' | 'youtube';

export const PLATFORM_NAMES: Record<Platform, string> = {
  bluesky: 'Bluesky',
  mastodon: 'Mastodon',
  rss: 'RSS feeds',
  youtube: 'YouTube',
};

/** An account Retainer can read: someone the user follows, a feed, or a channel. */
export type SourceAccount = {
  platform: Platform;
  /** Stable id on the platform: Bluesky DID, Mastodon account URL, feed URL, YouTube channel id. */
  externalId: string;
  /** Shown in mono under the name: @dana.bsky.social, @dana@mastodon.social, example.com. */
  handle: string;
  displayName: string;
  avatarUrl: string | null;
  /** Where Retainer reads posts from, when it is not derivable from externalId (feeds). */
  feedUrl: string | null;
};

export type Page = { accounts: SourceAccount[]; cursor: string | null };

/** The user's own account on a platform, whose follows are imported. */
export type OwnAccount = SourceAccount & { followsCount: number | null };

export class ConnectorError extends Error {
  constructor(
    message: string,
    readonly kind: 'not_found' | 'private' | 'invalid' | 'network' | 'unsupported',
  ) {
    super(message);
    this.name = 'ConnectorError';
  }
}

export type Fetch = typeof fetch;

/** fetch + JSON with connector errors, shared by every connector. */
export async function getJson<T>(
  fetchImpl: Fetch,
  url: string,
): Promise<{ data: T; res: Response }> {
  let res: Response;
  try {
    res = await fetchImpl(url, { headers: { Accept: 'application/json' } });
  } catch {
    throw new ConnectorError('Could not reach the server. Check your connection.', 'network');
  }
  if (res.status === 404) throw new ConnectorError('That account was not found.', 'not_found');
  if (res.status === 401 || res.status === 403) {
    throw new ConnectorError('That account or server does not allow public reading.', 'private');
  }
  if (!res.ok) throw new ConnectorError(`The server answered ${res.status}.`, 'network');
  return { data: (await res.json()) as T, res };
}
