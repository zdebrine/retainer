import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import {
  OnboardingScreen,
  RadioRow,
  RuleQuote,
  Segmented,
  Stack,
  StepHeader,
} from '@/components/onboarding';
import { Text } from '@/components/text';
import { useAuth } from '@/features/auth/auth-provider';
import { updateProfile } from '@/features/auth/profile';
import { DAILY_LIMITS, WINDOWS, ruleSummary, useOnboarding } from '@/features/onboarding/store';
import { useSources } from '@/features/sources/store';

// Wireframe 07 · Daily limit. The last onboarding step saves every choice to the profile.
export default function Time() {
  const { session, refreshProfile } = useAuth();
  const { aiProvider, dailyLimit, windowMode, setDailyLimit, setWindowMode } = useOnboarding();
  const peopleCount = useSources((s) => s.people.length);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function finish() {
    if (!session) return router.replace('/');
    setBusy(true);
    setMessage(null);
    try {
      await updateProfile(session.user.id, {
        ai_provider: aiProvider,
        daily_limit_min: dailyLimit,
        window_mode: windowMode,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
        onboarded_at: new Date().toISOString(),
      });
      await refreshProfile();
      router.replace('/home');
    } catch {
      setMessage('Your settings could not be saved. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <OnboardingScreen
      footer={
        <>
          <Button
            label={
              peopleCount
                ? `Start with ${peopleCount} ${peopleCount === 1 ? 'person' : 'people'}`
                : 'Finish setup'
            }
            kind="fill"
            block
            disabled={busy}
            onPress={finish}
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
        eyebrow="Step 4 of 4"
        title="How much time should this take?"
        body="When the time is used, Retainer closes and says when it opens next."
      />
      <Stack gap={3}>
        <Text variant="micro" tone="dim">
          Each day
        </Text>
        <Segmented
          label="Daily limit"
          options={DAILY_LIMITS.map((m) => ({ value: m, label: `${m} min` }))}
          value={dailyLimit}
          onChange={setDailyLimit}
        />
      </Stack>
      <Stack gap={3}>
        <Text variant="micro" tone="dim">
          Open at
        </Text>
        <View accessibilityRole="radiogroup">
          {WINDOWS.map((w) => (
            <RadioRow
              key={w.mode}
              title={w.name}
              caption={w.hours}
              selected={windowMode === w.mode}
              onPress={() => setWindowMode(w.mode)}
            />
          ))}
        </View>
      </Stack>
      <RuleQuote text={ruleSummary(dailyLimit, windowMode)} source="Your rule" />
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({ center: { textAlign: 'center' } });
