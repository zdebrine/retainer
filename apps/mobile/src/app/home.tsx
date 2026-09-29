import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Node } from '@/components/node';
import { Screen } from '@/components/screen';
import { Text } from '@/components/text';
import { useAuth } from '@/features/auth/auth-provider';
import { formatClock, formatUntil, nextBriefing } from '@/features/schedule';
import { space } from '@/theme';

// Placeholder for the briefing screens (M4): shows the closed state (wireframe 2d) with the
// next briefing time, since there is no briefing yet.
export default function Home() {
  const { profile, signOut } = useAuth();
  const now = new Date();
  const mode = profile?.window_mode ?? 'twice';
  const next = nextBriefing(now, mode);

  return (
    <Screen style={styles.screen}>
      <View style={styles.center}>
        <Node size={48} />
        <Text variant="title" style={styles.text}>
          You&apos;re set.
        </Text>
        <Text tone="dim" style={styles.text}>
          {next
            ? `Your first briefing opens at ${formatClock(next)}.`
            : `Open Retainer whenever you like. You have ${profile?.daily_limit_min ?? 20} minutes a day.`}
        </Text>
        {next ? (
          <Text variant="data" tone="dim">
            Next briefing {formatClock(next)} · {formatUntil(now, next)}
          </Text>
        ) : null}
      </View>
      <Button
        label="Sign out"
        kind="quiet"
        onPress={async () => {
          await signOut();
          router.replace('/');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { padding: space[5] },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: space[4] },
  text: { textAlign: 'center' },
});
