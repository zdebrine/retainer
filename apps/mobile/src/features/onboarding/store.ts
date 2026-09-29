import { create } from 'zustand';

import type { AiProvider, DailyLimit, WindowMode } from '@/features/auth/profile';

/** Choices made during onboarding, saved to the profile on the last step. */
type OnboardingState = {
  aiProvider: AiProvider;
  dailyLimit: DailyLimit;
  windowMode: WindowMode;
  setAiProvider: (p: AiProvider) => void;
  setDailyLimit: (m: DailyLimit) => void;
  setWindowMode: (w: WindowMode) => void;
};

export const useOnboarding = create<OnboardingState>((set) => ({
  aiProvider: 'anthropic',
  dailyLimit: 20,
  windowMode: 'twice',
  setAiProvider: (aiProvider) => set({ aiProvider }),
  setDailyLimit: (dailyLimit) => set({ dailyLimit }),
  setWindowMode: (windowMode) => set({ windowMode }),
}));

export const DAILY_LIMITS: DailyLimit[] = [10, 20, 30, 45];

/** Briefing windows are fixed at 6:00 am / 6:00 pm local time (spec §7). */
export const WINDOWS: { mode: WindowMode; name: string; hours: string }[] = [
  { mode: 'once', name: 'Once a day', hours: '6:00 pm' },
  { mode: 'twice', name: 'Twice a day', hours: '6:00 am · 6:00 pm' },
  { mode: 'on_open', name: 'Whenever I open it', hours: 'Until the time is used' },
];

/** The "Your rule" line on screen 07. */
export function ruleSummary(limit: DailyLimit, mode: WindowMode): string {
  if (mode === 'on_open') return `Show me my people for ${limit} minutes a day.`;
  const hours = WINDOWS.find((w) => w.mode === mode)!.hours.replace(' · ', ' and ');
  return `Show me my people for ${limit} minutes a day, opening at ${hours}.`;
}

export const AGENTS: { provider: AiProvider; name: string; maker: string; note: string }[] = [
  { provider: 'anthropic', name: 'Claude', maker: 'Anthropic', note: 'Posts sent to Anthropic' },
  { provider: 'openai', name: 'ChatGPT', maker: 'OpenAI', note: 'Posts sent to OpenAI' },
  { provider: 'google', name: 'Gemini', maker: 'Google', note: 'Posts sent to Google' },
  {
    provider: 'on_device',
    name: 'On this phone',
    maker: 'No company',
    note: 'Sorted here · slower, uses more battery',
  },
];

/**
 * "What the agent sees" on screen 06b. The on-phone copy is the corrected wording from spec §20:
 * posts from Phase 1 platforms are still collected by Retainer's servers.
 */
export function agentSees(provider: AiProvider): string {
  if (provider === 'on_device') {
    return "Posts are sorted on this phone and no company's model reads them. Retainer's servers still collect them from Bluesky, YouTube and the other platforms you connect.";
  }
  const maker = AGENTS.find((a) => a.provider === provider)!.maker;
  return `${maker} receives the text, photos and author of posts from accounts you chose. It does not receive your name, your login or your messages. It processes posts under ${maker}'s business terms, which say customer data is not used for training by default.`;
}

export function agentCta(provider: AiProvider): string {
  if (provider === 'on_device') return 'Use the on-phone agent';
  return `Use ${AGENTS.find((a) => a.provider === provider)!.name}`;
}
