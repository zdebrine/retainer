import { router } from 'expo-router';

import { Button } from '@/components/button';
import { ComparePair, InfoRow, OnboardingScreen, Stack, StepHeader } from '@/components/onboarding';
import { Text } from '@/components/text';

// Wireframe 02 · Why Retainer costs money. The price is explained before it is asked for.
export default function Price() {
  return (
    <OnboardingScreen
      footer={<Button label="Continue" kind="fill" block onPress={() => router.push('/sign-in')} />}
    >
      <StepHeader
        large
        eyebrow="Before you start"
        title={
          <>
            Why Retainer costs{' '}
            <Text variant="data-lg" style={{ fontSize: 30, lineHeight: 38 }}>
              $4.99
            </Text>{' '}
            a month
          </>
        }
      />
      <ComparePair
        emphasis="right"
        left={{
          label: 'Free apps',
          items: [
            'Paid by advertisers. They earn more the longer you scroll and the more they know about you.',
          ],
        }}
        right={{
          label: 'Retainer',
          items: ['Paid by you. We earn the same whether you stay 5 minutes or 5 hours.'],
        }}
      />
      <Text tone="dim">
        Selling your attention and data doesn&apos;t fit the humane technology principles we build
        to. Charging you means our only job is to serve you.
      </Text>
      <Stack gap={1}>
        <InfoRow title="No ads, ever" caption="Nobody pays to reach you through Retainer" />
        <InfoRow
          title="Your data is not sold or shared"
          caption="It is used only to build your briefing"
        />
        <InfoRow
          title="Nothing to keep you here"
          caption="No streaks, counts or reminders to come back"
        />
        <InfoRow
          title="Uses third-party AI"
          caption="Posts are read by a model from Anthropic, OpenAI or Google, or on your phone. Part of the price pays for it."
        />
      </Stack>
    </OnboardingScreen>
  );
}
