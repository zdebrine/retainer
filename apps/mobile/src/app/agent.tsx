import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import {
  ChoiceCard,
  OnboardingScreen,
  RuleQuote,
  Stack,
  StepHeader,
} from '@/components/onboarding';
import { Text } from '@/components/text';
import { AGENTS, agentCta, agentSees, useOnboarding } from '@/features/onboarding/store';

// Wireframe 06b · Choose your AI agent. "On this phone" ships with the on-device module later
// (spec §8.3); it can be chosen now and is honoured once supported.
export default function Agent() {
  const provider = useOnboarding((s) => s.aiProvider);
  const setProvider = useOnboarding((s) => s.setAiProvider);
  return (
    <OnboardingScreen
      footer={
        <>
          <Button
            label={agentCta(provider)}
            kind="fill"
            block
            onPress={() => router.push('/time')}
          />
          <Text variant="caption" tone="dim" style={styles.center}>
            Included in your subscription. Switch any time in Settings.
          </Text>
        </>
      }
    >
      <StepHeader
        eyebrow="Step 3 of 4"
        title="Which AI reads for you?"
        body="Posts from the accounts you chose are sent to the company that makes the model. Pick on-phone to keep them on this device."
      />
      <Stack gap={2}>
        {AGENTS.map((a) => (
          <ChoiceCard
            key={a.provider}
            selected={provider === a.provider}
            onPress={() => setProvider(a.provider)}
            accessibilityLabel={`${a.name}, ${a.maker}`}
          >
            <View style={styles.nameRow}>
              <Text variant="ui">{a.name}</Text>
              <Text variant="caption" tone="dim" style={styles.maker}>
                {a.maker}
              </Text>
            </View>
            <Text variant="caption" tone="dim">
              {a.note}
            </Text>
          </ChoiceCard>
        ))}
      </Stack>
      <RuleQuote text={agentSees(provider)} source="What the agent sees" />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  maker: { fontSize: 12, lineHeight: 16 },
  center: { textAlign: 'center' },
});
