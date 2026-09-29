import {
  accountKey,
  ConnectorError,
  getBlueskyProfile,
  getMastodonAccount,
  normaliseName,
  PLATFORM_NAMES,
  type Platform,
  type SourceAccount,
} from '@retainer/shared';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { StepHeader, Toggle } from '@/components/onboarding';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { useSources } from '@/features/sources/store';
import { useFollows } from '@/features/sources/use-follows';
import { radius, space, useTheme } from '@/theme';

// Wireframe 05 · Choose accounts per platform.
export default function Accounts() {
  const { colors } = useTheme();
  const { bluesky, mastodon, added, selected, toggle, add, groupSelected } = useSources();

  const tabs = useMemo(() => {
    const t: Platform[] = [];
    if (bluesky) t.push('bluesky');
    if (mastodon) t.push('mastodon');
    if (added.some((a) => a.platform === 'youtube')) t.push('youtube');
    if (added.some((a) => a.platform === 'rss')) t.push('rss');
    return t;
  }, [bluesky, mastodon, added]);
  const [tab, setTab] = useState<Platform | null>(null);
  const current = tab && tabs.includes(tab) ? tab : (tabs[0] ?? null);

  const bskyFollows = useFollows('bluesky', bluesky);
  const mastoFollows = useFollows('mastodon', mastodon);
  const follows =
    current === 'bluesky' ? bskyFollows : current === 'mastodon' ? mastoFollows : null;
  const own = current === 'bluesky' ? bluesky : current === 'mastodon' ? mastodon : null;

  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Accounts added by handle on this platform come first, then everyone followed.
  const list = useMemo(() => {
    if (!current) return [];
    const extra = added.filter((a) => a.platform === current);
    const seen = new Set(extra.map(accountKey));
    const all = [...extra, ...(follows?.accounts ?? []).filter((a) => !seen.has(accountKey(a)))];
    const q = normaliseName(query.replace(/^@/, ''));
    if (!q) return all;
    return all.filter(
      (a) => normaliseName(a.displayName).includes(q) || a.handle.toLowerCase().includes(q),
    );
  }, [current, added, follows?.accounts, query]);

  const onHere = list.filter((a) => selected[accountKey(a)]).length;
  const total = Object.keys(selected).length;
  const canAddByHandle =
    (current === 'bluesky' || current === 'mastodon') &&
    query.trim().length > 2 &&
    list.length === 0;

  async function addByHandle() {
    setAdding(true);
    setMessage(null);
    try {
      const found =
        current === 'bluesky' ? await getBlueskyProfile(query) : await getMastodonAccount(query);
      const account: SourceAccount = {
        platform: found.platform,
        externalId: found.externalId,
        handle: found.handle,
        displayName: found.displayName,
        avatarUrl: found.avatarUrl,
        feedUrl: null,
      };
      add(account);
      setQuery('');
    } catch (e) {
      setMessage(e instanceof ConnectorError ? e.message : 'That account could not be found.');
    } finally {
      setAdding(false);
    }
  }

  const header = (
    <View style={styles.header}>
      <StepHeader eyebrow="Step 2 of 4" title="Who should come through?" />
      <View style={styles.tabs}>
        {tabs.map((t) => {
          const on = t === current;
          return (
            <Pressable
              key={t}
              accessibilityRole="tab"
              accessibilityState={{ selected: on }}
              onPress={() => setTab(t)}
              style={[
                styles.tab,
                {
                  backgroundColor: on ? colors.ink : 'transparent',
                  borderColor: on ? colors.ink : colors.hairline,
                },
              ]}
            >
              <Text variant="ui" style={{ color: on ? colors.void : colors.dim }}>
                {PLATFORM_NAMES[t]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {own ? (
        <View
          style={[styles.signedIn, { backgroundColor: colors.deep, borderColor: colors.hairline }]}
        >
          <Text variant="ui">Reading as {own.handle}</Text>
          <Text variant="caption" tone="dim" style={styles.small}>
            Public profile{own.followsCount != null ? ` · follows ${own.followsCount}` : ''}
          </Text>
        </View>
      ) : null}
      {current === 'bluesky' || current === 'mastodon' ? (
        <TextField
          value={query}
          onChangeText={(t) => {
            setQuery(t);
            setMessage(null);
          }}
          placeholder="Search, or type a @handle to add"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search or add by handle"
        />
      ) : null}
      {canAddByHandle ? (
        <Button
          label={adding ? 'Looking…' : `Add ${query.trim()}`}
          disabled={adding}
          onPress={addByHandle}
        />
      ) : null}
      {message || follows?.error ? (
        <Text variant="caption" tone="dim">
          {message ?? follows?.error}
        </Text>
      ) : null}
      <View style={styles.countRow}>
        <Text variant="micro" tone="dim">
          {current === 'rss' ? 'Feeds' : current === 'youtube' ? 'Channels' : 'Accounts you follow'}
        </Text>
        <Text variant="micro" tone="dim">
          {follows?.loading ? 'Loading…' : `${onHere} of ${list.length} on`}
        </Text>
      </View>
    </View>
  );

  return (
    <Screen>
      <FlatList
        data={list}
        keyExtractor={accountKey}
        ListHeaderComponent={header}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const on = !!selected[accountKey(item)];
          return (
            <View style={[styles.row, { borderTopColor: colors.hairline }]}>
              <Avatar name={item.displayName} uri={item.avatarUrl} on={on} />
              <View style={styles.flex}>
                <Text numberOfLines={1} style={styles.name}>
                  {item.displayName}
                </Text>
                <Text variant="data" tone="dim" style={styles.small} numberOfLines={1}>
                  {item.handle}
                </Text>
              </View>
              <Toggle
                value={on}
                onValueChange={() => toggle(item)}
                accessibilityLabel={`${item.displayName} on your list`}
              />
            </View>
          );
        }}
        ListFooterComponent={
          follows?.truncated ? (
            <Text variant="caption" tone="dim" style={styles.more}>
              Showing the first 2,000. Search for anyone else by handle.
            </Text>
          ) : null
        }
      />
      <View style={styles.footer}>
        <Button
          label={
            total
              ? `Continue with ${total} account${total === 1 ? '' : 's'}`
              : 'Choose at least one'
          }
          kind="fill"
          block
          disabled={!total}
          onPress={() => {
            groupSelected();
            router.push('/people');
          }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: space[5], paddingTop: space[4], paddingBottom: space[4] },
  header: { gap: space[4], paddingBottom: space[2] },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: space[2] },
  tab: {
    height: 36,
    paddingHorizontal: 14,
    borderRadius: radius.node,
    borderWidth: 1,
    justifyContent: 'center',
  },
  signedIn: {
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.panel,
    borderWidth: 1,
  },
  countRow: { flexDirection: 'row', justifyContent: 'space-between' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[3], height: 60, borderTopWidth: 1 },
  flex: { flex: 1, minWidth: 0 },
  name: { lineHeight: 20 },
  small: { fontSize: 12, lineHeight: 16 },
  more: { paddingVertical: space[4], textAlign: 'center' },
  footer: { paddingHorizontal: space[5], paddingTop: space[4], paddingBottom: space[4] },
});
