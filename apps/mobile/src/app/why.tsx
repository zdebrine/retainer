import { router } from 'expo-router';

import { Button } from '@/components/button';
import { ComparePair, InfoRow, OnboardingScreen, Stack, StepHeader } from '@/components/onboarding';
import { Text } from '@/components/text';

// Wireframe 01b · What Retainer is for.
export default function Why() {
  return (
    <OnboardingScreen
      footer={<Button label="Continue" kind="fill" block onPress={() => router.push('/price')} />}
    >
      <StepHeader
        large
        eyebrow="Why Retainer exists"
        title="Social media that serves you, not the platform."
      />
      <Text tone="dim">
        The useful part of social media is staying connected to people you care about. Retainer
        keeps that part and leaves out what was built to hold your attention.
      </Text>
      <ComparePair
        left={{
          label: 'Kept',
          items: ['Posts from your people', 'News from the lives you follow', 'A clear end'],
        }}
        right={{ label: 'Left out', items: ['The algorithm', 'Ads and outrage', 'Endless scroll'] }}
      />
      <Stack gap={1}>
        <InfoRow
          title="Your time back"
          caption="A few minutes twice a day, then Retainer closes."
        />
        <InfoRow
          title="Informed about what matters to you"
          caption="Not lost in a sea of ads and division."
        />
      </Stack>
    </OnboardingScreen>
  );
}
