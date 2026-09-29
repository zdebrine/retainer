// Connector tests with fixtures shaped like the documented responses (Bluesky lexicons,
// Mastodon API docs, RSS 2.0 / Atom). The platforms themselves are not called.
import {
  ConnectorError,
  channelFromResponse,
  findFeedLink,
  getBlueskyFollows,
  getBlueskyProfile,
  getMastodonAccount,
  getMastodonFollowing,
  initials,
  nextLink,
  normaliseBlueskyHandle,
  normaliseName,
  normaliseYouTubeHandle,
  parseFeedInfo,
  parseMastodonAddress,
  resolveFeed,
  separate,
  suggestPeople,
  type SourceAccount,
} from '@retainer/shared';

type Route = { status?: number; json?: unknown; text?: string; headers?: Record<string, string> };

function mockFetch(routes: Record<string, Route>) {
  const calls: string[] = [];
  const fn = jest.fn(async (url: string) => {
    calls.push(url);
    const r = routes[url];
    if (!r) return new Response('not found', { status: 404 });
    const body = r.json !== undefined ? JSON.stringify(r.json) : (r.text ?? '');
    return new Response(body, { status: r.status ?? 200, headers: r.headers });
  });
  return { fetch: fn as unknown as typeof fetch, calls };
}

describe('Bluesky', () => {
  it('normalises handles', () => {
    expect(normaliseBlueskyHandle('@Dana.bsky.social')).toBe('dana.bsky.social');
    expect(normaliseBlueskyHandle('dana')).toBe('dana.bsky.social');
    expect(normaliseBlueskyHandle('https://bsky.app/profile/dana.example.com')).toBe(
      'dana.example.com',
    );
    expect(() => normaliseBlueskyHandle('not a handle!')).toThrow(ConnectorError);
  });

  it('reads the profile and pages through follows', async () => {
    const base = 'https://public.api.bsky.app/xrpc';
    const { fetch } = mockFetch({
      [`${base}/app.bsky.actor.getProfile?actor=alex.bsky.social`]: {
        json: {
          did: 'did:plc:alex',
          handle: 'alex.bsky.social',
          displayName: 'Alex Morgan',
          followsCount: 2,
        },
      },
      [`${base}/app.bsky.graph.getFollows?actor=did%3Aplc%3Aalex&limit=100`]: {
        json: {
          subject: { did: 'did:plc:alex', handle: 'alex.bsky.social' },
          follows: [
            {
              did: 'did:plc:dana',
              handle: 'dana.bsky.social',
              displayName: 'Dana Okafor',
              avatar: 'https://cdn/a.jpg',
            },
          ],
          cursor: 'c1',
        },
      },
      [`${base}/app.bsky.graph.getFollows?actor=did%3Aplc%3Aalex&limit=100&cursor=c1`]: {
        json: {
          subject: { did: 'did:plc:alex', handle: 'alex.bsky.social' },
          follows: [{ did: 'did:plc:theo', handle: 'theol.bsky.social' }],
        },
      },
    });
    const me = await getBlueskyProfile('@alex.bsky.social', fetch);
    expect(me).toMatchObject({
      externalId: 'did:plc:alex',
      handle: '@alex.bsky.social',
      followsCount: 2,
    });
    const p1 = await getBlueskyFollows(me.externalId, null, fetch);
    expect(p1.accounts[0]).toEqual({
      platform: 'bluesky',
      externalId: 'did:plc:dana',
      handle: '@dana.bsky.social',
      displayName: 'Dana Okafor',
      avatarUrl: 'https://cdn/a.jpg',
      feedUrl: null,
    });
    const p2 = await getBlueskyFollows(me.externalId, p1.cursor, fetch);
    expect(p2).toMatchObject({ cursor: null, accounts: [{ displayName: 'theol.bsky.social' }] });
  });

  it('reports unknown handles as not found', async () => {
    const { fetch } = mockFetch({
      'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=nobody.bsky.social': {
        status: 400,
        json: { error: 'InvalidRequest' },
      },
    });
    await expect(getBlueskyProfile('nobody', fetch)).rejects.toMatchObject({ kind: 'not_found' });
  });
});

describe('Mastodon', () => {
  it('parses addresses', () => {
    expect(parseMastodonAddress('@dana@Mastodon.Social')).toEqual({
      user: 'dana',
      host: 'mastodon.social',
    });
    expect(parseMastodonAddress('https://hachyderm.io/@theo')).toEqual({
      user: 'theo',
      host: 'hachyderm.io',
    });
    expect(() => parseMastodonAddress('dana')).toThrow(/full address/);
  });

  it('parses the Link header', () => {
    expect(
      nextLink(
        '<https://m.example/api/v1/accounts/1/following?limit=2&max_id=7>; rel="next", <https://m.example/x?since_id=8>; rel="prev"',
      ),
    ).toBe('https://m.example/api/v1/accounts/1/following?limit=2&max_id=7');
    expect(nextLink(null)).toBeNull();
  });

  it('looks up the account and pages following, making local accts global', async () => {
    const host = 'mastodon.social';
    const next = `https://${host}/api/v1/accounts/14715/following?limit=80&max_id=99`;
    const { fetch } = mockFetch({
      [`https://${host}/api/v1/accounts/lookup?acct=alex`]: {
        json: {
          id: '14715',
          username: 'alex',
          acct: 'alex',
          display_name: 'Alex',
          url: `https://${host}/@alex`,
          following_count: 2,
        },
      },
      [`https://${host}/api/v1/accounts/14715/following?limit=80`]: {
        json: [
          {
            id: '1',
            username: 'dana',
            acct: 'dana',
            display_name: 'Dana Okafor',
            url: `https://${host}/@dana`,
          },
        ],
        headers: { Link: `<${next}>; rel="next"` },
      },
      [next]: {
        json: [
          {
            id: '2',
            username: 'theo',
            acct: 'theo@hachyderm.io',
            display_name: '',
            url: 'https://hachyderm.io/@theo',
          },
        ],
      },
    });
    const me = await getMastodonAccount('@alex@mastodon.social', fetch);
    expect(me).toMatchObject({
      host,
      accountId: '14715',
      handle: '@alex@mastodon.social',
      followsCount: 2,
    });
    const p1 = await getMastodonFollowing(host, me.accountId, null, fetch);
    expect(p1.accounts[0]).toMatchObject({
      handle: '@dana@mastodon.social',
      externalId: `https://${host}/@dana`,
    });
    expect(p1.cursor).toBe(next);
    const p2 = await getMastodonFollowing(host, me.accountId, p1.cursor, fetch);
    expect(p2.accounts[0]).toMatchObject({ handle: '@theo@hachyderm.io', displayName: 'theo' });
    expect(p2.cursor).toBeNull();
  });

  it('refuses page links to another host', async () => {
    await expect(
      getMastodonFollowing('mastodon.social', '1', 'https://evil.example/x'),
    ).rejects.toThrow(ConnectorError);
  });

  it('explains servers that do not allow public reading', async () => {
    const { fetch } = mockFetch({
      'https://locked.example/api/v1/accounts/lookup?acct=a': { status: 401, json: {} },
    });
    await expect(getMastodonAccount('a@locked.example', fetch)).rejects.toMatchObject({
      kind: 'private',
    });
  });
});

const RSS = `<?xml version="1.0"?><rss version="2.0"><channel><title>Dana's notes</title><link>https://dana.example.com/</link><item><title>Hi</title></item></channel></rss>`;
const ATOM = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><title type="text">Theo writes</title><link rel="self" href="https://theo.example/feed.xml"/><link href="https://theo.example/"/></feed>`;

describe('RSS', () => {
  it('reads RSS and Atom titles', () => {
    expect(parseFeedInfo(RSS)).toEqual({
      title: "Dana's notes",
      siteUrl: 'https://dana.example.com/',
    });
    expect(parseFeedInfo(ATOM)).toEqual({ title: 'Theo writes', siteUrl: 'https://theo.example/' });
    expect(parseFeedInfo('<html><body>hi</body></html>')).toBeNull();
  });

  it('finds the feed link in a page', () => {
    const html = `<head><link rel="stylesheet" href="/a.css"><link rel="alternate" type="application/rss+xml" title="Feed" href="/feed.xml"></head>`;
    expect(findFeedLink(html, 'https://dana.example.com/blog/')).toBe(
      'https://dana.example.com/feed.xml',
    );
  });

  it('resolves a site address to its feed', async () => {
    const { fetch } = mockFetch({
      'https://dana.example.com/': {
        text: '<link rel="alternate" type="application/rss+xml" href="https://dana.example.com/rss">',
      },
      'https://dana.example.com/rss': { text: RSS },
    });
    await expect(resolveFeed('dana.example.com', fetch)).resolves.toEqual({
      platform: 'rss',
      externalId: 'https://dana.example.com/rss',
      handle: 'dana.example.com',
      displayName: "Dana's notes",
      avatarUrl: null,
      feedUrl: 'https://dana.example.com/rss',
    });
  });

  it('says so when there is no feed', async () => {
    const { fetch } = mockFetch({ 'https://nofeed.example/': { text: '<html></html>' } });
    await expect(resolveFeed('nofeed.example', fetch)).rejects.toMatchObject({
      kind: 'unsupported',
    });
  });
});

describe('YouTube', () => {
  it('normalises handles and maps channels', () => {
    expect(normaliseYouTubeHandle('https://www.youtube.com/@JulesMarin')).toBe('@JulesMarin');
    expect(normaliseYouTubeHandle('julesmarin')).toBe('@julesmarin');
    expect(() => normaliseYouTubeHandle('@a')).toThrow(ConnectorError);
    expect(
      channelFromResponse('@julesmarin', {
        items: [
          {
            id: 'UC123',
            snippet: {
              title: 'Jules Marin',
              customUrl: '@julesmarin',
              thumbnails: { default: { url: 'https://yt/t.jpg' } },
            },
          },
        ],
      }),
    ).toEqual({
      platform: 'youtube',
      externalId: 'UC123',
      handle: '@julesmarin',
      displayName: 'Jules Marin',
      avatarUrl: 'https://yt/t.jpg',
      feedUrl: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC123',
    });
    expect(() => channelFromResponse('@x', { items: [] })).toThrow(/not found/);
  });
});

describe('people', () => {
  const acct = (platform: SourceAccount['platform'], id: string, name: string): SourceAccount => ({
    platform,
    externalId: id,
    handle: `@${id}`,
    displayName: name,
    avatarUrl: null,
    feedUrl: null,
  });

  it('groups the same name across Bluesky and Mastodon, but not feeds', () => {
    const people = suggestPeople([
      acct('bluesky', 'b1', 'Dana Okafor'),
      acct('mastodon', 'm1', 'dana okafor 🌊'),
      acct('rss', 'r1', 'Dana Okafor'),
      acct('bluesky', 'b2', 'Theo'),
      acct('bluesky', 'b3', 'Al'),
      acct('mastodon', 'm3', 'Al'),
    ]);
    expect(people.map((p) => [p.displayName, p.accounts.map((a) => a.externalId)])).toEqual([
      ['Dana Okafor', ['b1', 'm1']],
      ['Dana Okafor', ['r1']],
      ['Theo', ['b2']],
      ['Al', ['b3']],
      ['Al', ['m3']],
    ]);
  });

  it('never merges two accounts from the same platform', () => {
    expect(
      suggestPeople([acct('bluesky', 'a', 'Sam Ortiz'), acct('bluesky', 'b', 'Sam Ortiz')]),
    ).toHaveLength(2);
  });

  it('separates a grouped person', () => {
    const people = suggestPeople([
      acct('bluesky', 'b1', 'Dana Okafor'),
      acct('mastodon', 'm1', 'Dana Okafor'),
    ]);
    expect(separate(people, people[0]!.key)).toHaveLength(2);
  });

  it('normalises names and makes initials', () => {
    expect(normaliseName('Élodie  Brûlé ✨')).toBe('elodie brule');
    expect(initials('Dana Okafor')).toBe('DO');
    expect(initials('Mom')).toBe('M');
    expect(initials('@theo.lindqvist')).toBe('TL');
  });
});
