// Bluesky via the public AppView (no auth). Lexicons: app.bsky.actor.getProfile,
// app.bsky.graph.getFollows, app.bsky.actor.defs#profileView.
import {
  ConnectorError,
  getJson,
  type Fetch,
  type OwnAccount,
  type Page,
  type SourceAccount,
} from './types';

export const BLUESKY_APPVIEW = 'https://public.api.bsky.app/xrpc';

type ProfileView = { did: string; handle: string; displayName?: string; avatar?: string };
type ProfileViewDetailed = ProfileView & { followsCount?: number };

/** Accepts "dana.bsky.social", "@dana.bsky.social" or a profile URL. */
export function normaliseBlueskyHandle(input: string): string {
  let h = input.trim();
  const url = h.match(/bsky\.app\/profile\/([^/?#]+)/i);
  if (url?.[1]) h = url[1];
  h = h.replace(/^@/, '').toLowerCase();
  // Bare names get the default domain, the way the Bluesky app shows them.
  if (!h.includes('.') && !h.startsWith('did:')) h = `${h}.bsky.social`;
  if (!/^(did:[a-z]+:[a-z0-9._:-]+|[a-z0-9-]+(\.[a-z0-9-]+)+)$/.test(h)) {
    throw new ConnectorError('That does not look like a Bluesky handle.', 'invalid');
  }
  return h;
}

function toAccount(p: ProfileView): SourceAccount {
  return {
    platform: 'bluesky',
    externalId: p.did,
    handle: `@${p.handle}`,
    displayName: p.displayName?.trim() || p.handle,
    avatarUrl: p.avatar ?? null,
    feedUrl: null,
  };
}

export async function getBlueskyProfile(
  handle: string,
  fetchImpl: Fetch = fetch,
): Promise<OwnAccount> {
  const actor = normaliseBlueskyHandle(handle);
  const url = `${BLUESKY_APPVIEW}/app.bsky.actor.getProfile?actor=${encodeURIComponent(actor)}`;
  try {
    const { data } = await getJson<ProfileViewDetailed>(fetchImpl, url);
    return { ...toAccount(data), followsCount: data.followsCount ?? null };
  } catch (e) {
    // The AppView answers 400 for unknown handles.
    if (e instanceof ConnectorError && e.message.includes('400')) {
      throw new ConnectorError('That Bluesky account was not found.', 'not_found');
    }
    throw e;
  }
}

export async function getBlueskyFollows(
  did: string,
  cursor: string | null = null,
  fetchImpl: Fetch = fetch,
): Promise<Page> {
  const params = new URLSearchParams({ actor: did, limit: '100' });
  if (cursor) params.set('cursor', cursor);
  const { data } = await getJson<{ follows: ProfileView[]; cursor?: string }>(
    fetchImpl,
    `${BLUESKY_APPVIEW}/app.bsky.graph.getFollows?${params}`,
  );
  return { accounts: data.follows.map(toAccount), cursor: data.cursor ?? null };
}
