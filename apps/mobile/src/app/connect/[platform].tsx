import {
  ConnectorError,
  getBlueskyProfile,
  getMastodonAccount,
  PLATFORM_NAMES,
  resolveFeed,
  type Platform,
  type SourceAccount,
} from '@retainer/shared';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { OnboardingScreen, Stack, StepHeader } from '@/components/onboarding';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useAuth } from '@/features/auth/auth-provider';
import { lookupYouTubeChannel, saveConnection } from '@/features/sources/api';
import { useSources } from '@/features/sources/store';
import { useTheme } from '@/theme';

const COPY: Record<Platform, { title: string; body: string; placeholder: string; action: string }> =
  {
    bluesky: {
      title: 'Your Bluesky handle',
      body: 'Retainer reads who you follow from your public profile. You choose who comes through next.',
      placeholder: 'you.bsky.social',
      action: 'Connect Bluesky',
    },
    mastodon: {
      title: 'Your Mastodon address',
      body: 'Retainer reads who you follow from your public profile. Servers that hide follows will say so.',
      placeholder: '@you@mastodon.social',
      action: 'Connect Mastodon',
    },
    rss: {
      title: 'Feeds to read',
      body: 'Paste a blog, newsletter or podcast address. Retainer finds its feed.',
      placeholder: 'example.com',
      action: 'Add feed',
    },
    youtube: {
      title: 'Channels to read',
      body: 'Add each channel by its handle. New videos arrive in your briefing; you tap to play.',
      placeholder: '@channelname',
      action: 'Add channel',
    },
  };

// Connecting one platform (from screen 04). Bluesky and Mastodon connect one own account;
// feeds and channels are a list.
export default function ConnectPlatform() {
  const { platform } = useLocalSearchParams<{ platform: Platform }>();
  const { colors } = useTheme();
  const { session } = useAuth();
  const { bluesky, mastodon, added, setBluesky, setMastodon, add, remove } = useSources();
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const copy = COPY[platform] ?? COPY.rss;
  const list = platform === 'rss' || platform === 'youtube';
  const items = added.filter((a) => a.platform === platform);
  const own = platform === 'bluesky' ? bluesky : platform === 'mastodon' ? mastodon : null;

  async function submit() {
    setBusy(true);
    setMessage(null);
    try {
      if (platform === 'bluesky' || platform === 'mastodon') {
        const account =
          platform === 'bluesky' ? await getBlueskyProfile(input) : await getMastodonAccount(input);
        if (platform === 'bluesky') setBluesky(account);
        else setMastodon(account as Awaited<ReturnType<typeof getMastodonAccount>>);
        if (session)
          await saveConnection(session.user.id, platform, account).catch(() => undefined);
        router.back();
        return;
      }
      const account: SourceAccount =
        platform === 'youtube' ? await lookupYouTubeChannel(input) : await resolveFeed(input);
      add(account);
      setInput('');
    } catch (e) {
      setMessage(e instanceof ConnectorError ? e.message : 'That did not work. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <OnboardingScreen
      footer={
        list || own ? (
          <Button label="Done" kind="fill" block onPress={() => router.back()} />
        ) : (
          <Button label="Back" kind="quiet" onPress={() => router.back()} />
        )
      }
    >
      <StepHeader
        eyebrow={PLATFORM_NAMES[platform] ?? 'Connect'}
        title={copy.title}
        body={copy.body}
      />
      <Stack gap={2}>
        <TextField
          value={input}
          onChangeText={setInput}
          placeholder={copy.placeholder}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={platform === 'rss' ? 'url' : 'default'}
          accessibilityLabel={copy.title}
          editable={!busy}
          onSubmitEditing={() => input.trim() && submit()}
          returnKeyType="go"
        />
        <Button
          label={busy ? 'Looking…' : copy.action}
          disabled={busy || !input.trim()}
          onPress={submit}
        />
        {message ? (
          <Text variant="caption" tone="dim" accessibilityLiveRegion="polite">
            {message}
          </Text>
        ) : null}
      </Stack>

      {own ? (
        <View style={[styles.row, { borderTopColor: colors.hairline }]}>
          <Avatar name={own.displayName} uri={own.avatarUrl} on />
          <View style={styles.flex}>
            <Text>{own.displayName}</Text>
            <Text variant="data" tone="dim" style={styles.small}>
              {own.handle}
              {own.followsCount != null ? ` · follows ${own.followsCount}` : ''}
            </Text>
          </View>
        </View>
      ) : null}

      {list && items.length ? (
        <View>
          {items.map((a) => (
            <View key={a.externalId} style={[styles.row, { borderTopColor: colors.hairline }]}>
              <Avatar name={a.displayName} uri={a.avatarUrl} on />
              <View style={styles.flex}>
                <Text numberOfLines={1}>{a.displayName}</Text>
                <Text variant="data" tone="dim" style={styles.small} numberOfLines={1}>
                  {a.handle}
                </Text>
              </View>
              <Button label="Remove" kind="quiet" onPress={() => remove(a)} />
            </View>
          ))}
        </View>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 60, borderTopWidth: 1 },
  flex: { flex: 1, minWidth: 0 },
  small: { fontSize: 12, lineHeight: 16 },
});
