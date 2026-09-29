import {
  channelFromResponse,
  ConnectorError,
  normaliseYouTubeHandle,
  type ChannelsListResponse,
  type OwnAccount,
  type PersonDraft,
  type Platform,
  type SourceAccount,
} from '@retainer/shared';

import { supabase } from '@/lib/supabase';

/** Records the user's own account on a platform (one per platform). */
export async function saveConnection(
  userId: string,
  platform: Platform,
  own: OwnAccount,
): Promise<void> {
  const { error } = await supabase.from('connections').upsert(
    {
      user_id: userId,
      platform,
      external_id: own.externalId,
      handle: own.handle,
      display_name: own.displayName,
    },
    { onConflict: 'user_id,platform' },
  );
  if (error) throw error;
}

export async function removeConnection(userId: string, platform: Platform): Promise<void> {
  const { error } = await supabase
    .from('connections')
    .delete()
    .eq('user_id', userId)
    .eq('platform', platform);
  if (error) throw error;
}

/** Saves the reviewed list of people, replacing any previous list. */
export async function savePeople(people: PersonDraft[]): Promise<number> {
  const payload = people.map((p) => ({
    display_name: p.displayName,
    accounts: p.accounts.map((a: SourceAccount) => ({
      platform: a.platform,
      external_id: a.externalId,
      handle: a.handle,
      display_name: a.displayName,
      avatar_url: a.avatarUrl,
      feed_url: a.feedUrl,
    })),
  }));
  const { data, error } = await supabase.rpc('replace_people', { people: payload });
  if (error) throw error;
  return data as number;
}

/** Looks up a channel through the youtube-lookup Edge Function, which holds the API key. */
export async function lookupYouTubeChannel(input: string): Promise<SourceAccount> {
  const handle = normaliseYouTubeHandle(input);
  const { data, error } = await supabase.functions.invoke<ChannelsListResponse>('youtube-lookup', {
    body: { handle },
  });
  if (error || !data)
    throw new ConnectorError('YouTube could not be reached. Try again.', 'network');
  return channelFromResponse(handle, data);
}
