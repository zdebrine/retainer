import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { OnboardingScreen, StepHeader, Toggle } from '@/components/onboarding';
import { Text } from '@/components/text';
import { useTheme } from '@/theme';

// Wireframe 04 · Connect platforms, with the Phase 1 platform set (spec §6, §20).
// Connecting arrives with the connectors in M2; until then the rows show what is coming.
const LAUNCH = ['Bluesky', 'YouTube', 'Mastodon', 'RSS feeds'];
const LATER = ['Instagram', 'TikTok', 'Facebook'];

export default function Connect() {
  const { colors } = useTheme();
  return (
    <OnboardingScreen
      footer={
        <>
          <Button label="Continue" kind="fill" block onPress={() => router.push('/ai')} />
          <Text variant="caption" tone="dim" style={styles.center}>
            Connecting accounts arrives in the next build.
          </Text>
        </>
      }
    >
      <StepHeader
        eyebrow="Step 1 of 4"
        title="Where do your people post?"
        body="Retainer signs in read-only. It never posts, likes, follows or messages."
      />
      <View>
        {LAUNCH.map((name) => (
          <View key={name} style={[styles.row, { borderTopColor: colors.hairline }]}>
            <View>
              <Text style={styles.name}>{name}</Text>
              <Text variant="caption" tone="dim" style={styles.note}>
                Not connected
              </Text>
            </View>
            <Toggle
              value={false}
              onValueChange={() => {}}
              disabled
              accessibilityLabel={`Connect ${name}`}
            />
          </View>
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
    height: 56,
    borderTopWidth: 1,
  },
  name: { lineHeight: 20 },
  note: { fontSize: 12, lineHeight: 16 },
  section: { paddingTop: 24, paddingBottom: 8 },
  center: { textAlign: 'center' },
});
