import { router } from 'expo-router';

import { Button } from '@/components/button';
import { ComparePair, InfoRow, OnboardingScreen, Stack, StepHeader } from '@/components/onboarding';
import { Text } from '@/components/text';

// Wireframe 06 · How Retainer uses AI.
export default function HowAi() {
  return (
    <OnboardingScreen
      footer={
        <Button label="Choose a model" kind="fill" block onPress={() => router.push('/agent')} />
      }
    >
      <StepHeader
        eyebrow="Step 3 of 4"
        title="How Retainer uses AI"
        body="AI does one job here. It reads new posts from the accounts you connected and keeps the ones from your people."
      />
      <ComparePair
        left={{
          label: 'It does',
          items: [
            'Read posts at 6:00 am and 6:00 pm',
            'Remove ads, suggestions and strangers',
            'Write the "Why this" line on each post',
          ],
        }}
        right={{
          label: 'It does not',
          items: [
            'Read your messages or passwords',
            'Post, like, reply or follow for you',
            'Rank posts to keep you reading',
          ],
        }}
        emphasis="none"
      />
      <Stack gap={2}>
        <Text variant="micro" tone="dim">
          Worth knowing
        </Text>
        <Stack gap={1}>
          <InfoRow
            title="Posts leave your phone"
            caption="Cloud models are run by Anthropic, OpenAI or Google. The company you pick processes the posts under its business terms."
          />
          <InfoRow
            title="It will sometimes be wrong"
            caption="It may miss a post or keep one it shouldn't. Tap Adjust on any post to correct it."
          />
          <InfoRow
            title="You can see every decision"
            caption="Settings lists what was kept and removed in each briefing."
          />
        </Stack>
      </Stack>
    </OnboardingScreen>
  );
}
