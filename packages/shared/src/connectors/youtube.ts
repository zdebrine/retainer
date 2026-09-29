// YouTube channels. Handle lookup needs an API key, so it runs in the youtube-lookup Edge Function;
// posts are read from the channel's public feed, which needs no key.
import { ConnectorError, type SourceAccount } from './types';

/** "@handle", "handle" or "https://www.youtube.com/@handle". */
export function normaliseYouTubeHandle(input: string): string {
  const s = input.trim();
  const url = s.match(/youtube\.com\/(@[^/?#]+)/i);
  const h = (url?.[1] ?? s).replace(/^@?/, '@');
  if (!/^@[A-Za-z0-9._-]{3,30}$/.test(h)) {
    throw new ConnectorError('Use the channel handle, like @channelname.', 'invalid');
  }
  return h;
}

export function youTubeFeedUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`;
}

/** Shape of a YouTube Data API v3 channels.list response (part=snippet). */
export type ChannelsListResponse = {
  items?: {
    id: string;
    snippet?: { title?: string; customUrl?: string; thumbnails?: { default?: { url?: string } } };
  }[];
};

export function channelFromResponse(handle: string, res: ChannelsListResponse): SourceAccount {
  const item = res.items?.[0];
  if (!item) throw new ConnectorError('That YouTube channel was not found.', 'not_found');
  return {
    platform: 'youtube',
    externalId: item.id,
    handle: item.snippet?.customUrl || handle,
    displayName: item.snippet?.title?.trim() || handle,
    avatarUrl: item.snippet?.thumbnails?.default?.url ?? null,
    feedUrl: youTubeFeedUrl(item.id),
  };
}
