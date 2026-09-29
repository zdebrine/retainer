import { PLATFORM_NAMES, type Platform } from '@retainer/shared';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { OnboardingScreen, StepHeader, Toggle } from '@/components/onboarding';
import { Text } from '@/components/text';
import { useAuth } from '@/features/auth/auth-provider';
import { removeConnection } from '@/features/sources/api';
import { useSources } from '@/features/sources/store';
import { env } from '@/lib/env';
import { useTheme } from '@/theme';

// Wireframe 04 · Connect platforms, with the Phase 1 platform set (spec §6, §20).
const LATER = ['Instagram', 'TikTok', 'Facebook'];

export default function Connect() {
  const { colors } = useTheme();
  const { session } = useAuth();
  const { bluesky, mastodon, added, setBluesky, setMastodon } = useSources();

  const feeds = added.filter((a) => a.platform === 'rss').length;
  const channels = added.filter((a) => a.platform === 'youtube').length;

  const rows: { platform: Platform; on: boolean; note: string }[] = [
    {
      platform: 'bluesky',
      on: !!bluesky,
      note: bluesky ? `Reading as ${bluesky.handle}` : 'Not connected',
    },
    {
      platform: 'mastodon',
      on: !!mastodon,
      note: mastodon ? `Reading as ${mastodon.handle}` : 'Not connected',
    },
    ...(env.youtubeEnabled
      ? [
          {
            platform: 'youtube' as const,
            on: channels > 0,
            note: channels ? `${channels} channel${channels === 1 ? '' : 's'}` : 'Add channels',
          },
        ]
      : []),
    {
      platform: 'rss',
      on: feeds > 0,
      note: feeds ? `${feeds} feed${feeds === 1 ? '' : 's'}` : 'Blogs, newsletters, podcasts',
    },
  ];
  const count = rows.filter((r) => r.on).length;

  function onToggle(platform: Platform, on: boolean) {
    if (on) {
      router.push({ pathname: '/connect/[platform]', params: { platform } });
      return;
    }
    if (platform === 'bluesky') setBluesky(null);
    else if (platform === 'mastodon') setMastodon(null);
    else {
      // Feeds and channels are managed on their own screen.
      router.push({ pathname: '/connect/[platform]', params: { platform } });
      return;
    }
    if (session) removeConnection(session.user.id, platform).catch(() => undefined);
  }

  return (
    <OnboardingScreen
      footer={
        <Button
          label={count ? `Continue with ${count} connected` : 'Connect at least one'}
          kind="fill"
          block
          disabled={!count}
          onPress={() => router.push('/accounts')}
        />
      }
    >
      <StepHeader
        eyebrow="Step 1 of 4"
        title="Where do your people post?"
        body="Retainer reads public posts. It never signs in, posts, likes, follows or messages."
      />
      <View>
        {rows.map(({ platform, on, note }) => (
          <Pressable
            key={platform}
            onPress={() => router.push({ pathname: '/connect/[platform]', params: { platform } })}
            style={[styles.row, { borderTopColor: colors.hairline }]}
            accessibilityRole="button"
            accessibilityLabel={`${PLATFORM_NAMES[platform]}, ${note}`}
          >
            <View style={styles.flex}>
              <Text style={styles.name}>{PLATFORM_NAMES[platform]}</Text>
              <Text variant="caption" tone="dim" style={styles.note} numberOfLines={1}>
                {note}
              </Text>
            </View>
            <Toggle
              value={on}
              onValueChange={(v) => onToggle(platform, v)}
              accessibilityLabel={`Connect ${PLATFORM_NAMES[platform]}`}
            />
          </Pressable>
        ))}
        <Text variant="micro" tone="dim" style={styles.section}>
          Coming later
        </Text>
        {LATER.map((name) => (
          <View key={name} style={[styles.row, { borderTopColor: colors.hairline }]}>
            <Text tone="dim" style={styles.name}>
              {name}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    height: 56,
    borderTopWidth: 1,
  },
  flex: { flex: 1 },
  name: { lineHeight: 20 },
  note: { fontSize: 12, lineHeight: 16 },
  section: { paddingTop: 24, paddingBottom: 8 },
});
