// Looks up a YouTube channel by @handle (spec §6). The API key stays on the server; the app maps
// the response with channelFromResponse in @retainer/shared. Requires a signed-in user (verify_jwt).

const HANDLE = /^@[A-Za-z0-9._-]{3,30}$/;

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  const key = Deno.env.get('YOUTUBE_API_KEY');
  if (!key) return Response.json({ error: 'not_configured' }, { status: 503 });

  let handle: string;
  try {
    handle = String(((await req.json()) as { handle?: unknown }).handle ?? '');
  } catch {
    return Response.json({ error: 'bad_request' }, { status: 400 });
  }
  if (!HANDLE.test(handle)) return Response.json({ error: 'invalid_handle' }, { status: 400 });

  const url = new URL('https://www.googleapis.com/youtube/v3/channels');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('forHandle', handle);
  url.searchParams.set('key', key);

  const res = await fetch(url);
  if (!res.ok) {
    console.error('youtube channels.list failed', res.status, await res.text());
    return Response.json({ error: 'upstream' }, { status: 502 });
  }
  const data = (await res.json()) as {
    items?: {
      id: string;
      snippet?: { title?: string; customUrl?: string; thumbnails?: { default?: { url?: string } } };
    }[];
  };
  // Return only what the app needs.
  const items = (data.items ?? []).slice(0, 1).map((i) => ({
    id: i.id,
    snippet: {
      title: i.snippet?.title,
      customUrl: i.snippet?.customUrl,
      thumbnails: { default: { url: i.snippet?.thumbnails?.default?.url } },
    },
  }));
  return Response.json({ items });
});
