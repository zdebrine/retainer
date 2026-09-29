import { PLATFORM_NAMES, separate } from '@retainer/shared';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Button } from '@/components/button';
import { OnboardingScreen, StepHeader } from '@/components/onboarding';
import { Text } from '@/components/text';
import { savePeople } from '@/features/sources/api';
import { useSources } from '@/features/sources/store';
import { useTheme } from '@/theme';

// People review (spec §9): accounts that look like the same person are grouped, so a briefing
// talks about Dana, not @dana on two platforms. Not in the wireframe yet.
export default function People() {
  const { colors } = useTheme();
  const { people, setPeople } = useSources();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setMessage(null);
    try {
      await savePeople(people);
      router.push('/ai');
    } catch {
      setMessage('Your list could not be saved. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  const n = people.length;
  return (
    <OnboardingScreen
      footer={
        <>
          <Button
            label={busy ? 'Saving…' : `Continue with ${n} ${n === 1 ? 'person' : 'people'}`}
            kind="fill"
            block
            disabled={busy || !n}
            onPress={confirm}
          />
          {message ? (
            <Text
              variant="caption"
              tone="dim"
              style={styles.center}
              accessibilityLiveRegion="polite"
            >
              {message}
            </Text>
          ) : null}
        </>
      }
    >
      <StepHeader
        eyebrow="Step 2 of 4"
        title="Your people"
        body="Accounts with the same name on different platforms are grouped as one person. Separate any that are not."
      />
      <View>
        {people.map((p) => (
          <View key={p.key} style={[styles.row, { borderTopColor: colors.hairline }]}>
            <Avatar name={p.displayName} uri={p.accounts[0]?.avatarUrl} on />
            <View style={styles.flex}>
              <Text numberOfLines={1} style={styles.name}>
                {p.displayName}
              </Text>
              <Text variant="data" tone="dim" style={styles.small} numberOfLines={1}>
                {p.accounts
                  .map((a) => PLATFORM_NAMES[a.platform].replace(' feeds', ''))
                  .join(' · ')}
              </Text>
            </View>
            {p.accounts.length > 1 ? (
              <Button
                label="Separate"
                kind="quiet"
                onPress={() => setPeople(separate(people, p.key))}
              />
            ) : null}
          </View>
        ))}
      </View>
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, height: 60, borderTopWidth: 1 },
  flex: { flex: 1, minWidth: 0 },
  name: { lineHeight: 20 },
  small: { fontSize: 12, lineHeight: 16 },
  center: { textAlign: 'center' },
});
