import { render, screen, userEvent, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import Agent from '@/app/agent';
import Welcome from '@/app/index';
import SignIn from '@/app/sign-in';
import Subscribe from '@/app/subscribe';
import Time from '@/app/time';
import { updateProfile } from '@/features/auth/profile';
import { useOnboarding } from '@/features/onboarding/store';
import { supabase } from '@/lib/supabase';
import { ThemeProvider } from '@/theme';

const mockAuth = {
  ready: true,
  session: null as null | { user: { id: string } },
  profile: null,
  refreshProfile: jest.fn(),
  signOut: jest.fn(),
};
const mockBilling = { ready: true, entitled: false, setDevEntitled: jest.fn(), refresh: jest.fn() };

jest.mock('@/features/auth/auth-provider', () => ({ useAuth: () => mockAuth }));
jest.mock('@/features/billing/billing-provider', () => ({ useBilling: () => mockBilling }));
jest.mock('@/features/auth/profile', () => ({
  updateProfile: jest.fn().mockResolvedValue({ onboarded_at: null }),
}));

const wrap = (ui: ReactNode) => <ThemeProvider scheme="dark">{ui}</ThemeProvider>;

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.session = null;
  useOnboarding.setState({ aiProvider: 'anthropic', dailyLimit: 20, windowMode: 'twice' });
});

describe('Welcome', () => {
  it('offers onboarding and sign-in to signed-out users', async () => {
    await render(wrap(<Welcome />));
    expect(screen.getByText('Only the people you choose.')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'Get started' }));
    expect(router.push).toHaveBeenCalledWith('/why');
    await userEvent.setup().press(screen.getByRole('button', { name: 'I have an account' }));
    expect(router.push).toHaveBeenCalledWith('/sign-in');
  });
});

describe('Sign in', () => {
  it('keeps sign-in locked until the age confirmation is on', async () => {
    const user = userEvent.setup();
    await render(wrap(<SignIn />));
    await user.type(screen.getByLabelText('Email'), 'dana@example.com');
    const send = screen.getByRole('button', { name: 'Email me a code' });
    expect(send).toBeDisabled();
    await user.press(screen.getByRole('switch', { name: "I'm 13 or older" }));
    expect(send).toBeEnabled();
  });

  it('signs in with an email code, records the age check, and goes to Subscribe', async () => {
    jest.mocked(supabase.auth.getUser).mockResolvedValue({ data: { user: { id: 'u1' } } } as never);
    const user = userEvent.setup();
    await render(wrap(<SignIn />));
    await user.press(screen.getByRole('switch', { name: "I'm 13 or older" }));
    await user.type(screen.getByLabelText('Email'), 'dana@example.com');
    await user.press(screen.getByRole('button', { name: 'Email me a code' }));
    expect(
      await screen.findByText('A 6-digit code was sent to dana@example.com.'),
    ).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Code'), '12a3456');
    await user.press(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/subscribe'));
    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
      email: 'dana@example.com',
      token: '123456',
      type: 'email',
    });
    expect(updateProfile).toHaveBeenCalledWith('u1', { age_confirmed_at: expect.any(String) });
  });
});

describe('Subscribe', () => {
  it('explains when purchases are not configured and offers the dev skip', async () => {
    await render(wrap(<Subscribe />));
    expect(screen.getByText('Purchases are not set up in this build.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Subscribe for $4.99 a month' })).toBeDisabled();
    await userEvent
      .setup()
      .press(screen.getByRole('button', { name: 'Skip for now (development only)' }));
    expect(mockBilling.setDevEntitled).toHaveBeenCalled();
  });
});

describe('Agent', () => {
  it('updates the disclosure when the agent changes', async () => {
    await render(wrap(<Agent />));
    expect(screen.getByText(/^Anthropic receives the text/)).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('radio', { name: 'Gemini, Google' }));
    expect(screen.getByText(/^Google receives the text/)).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Use Gemini' })).toBeOnTheScreen();
  });
});

describe('Time', () => {
  it('saves every onboarding choice and finishes', async () => {
    mockAuth.session = { user: { id: 'u1' } };
    useOnboarding.setState({ aiProvider: 'google' });
    const user = userEvent.setup();
    await render(wrap(<Time />));
    await user.press(screen.getByRole('radio', { name: '45 min' }));
    await user.press(screen.getByRole('radio', { name: 'Once a day' }));
    expect(
      screen.getByText('Show me my people for 45 minutes a day, opening at 6:00 pm.'),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Finish setup' }));
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/home'));
    expect(updateProfile).toHaveBeenCalledWith('u1', {
      ai_provider: 'google',
      daily_limit_min: 45,
      window_mode: 'once',
      tz: expect.any(String),
      onboarded_at: expect.any(String),
    });
  });
});
