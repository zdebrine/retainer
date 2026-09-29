import { isValidEmail, sendEmailCode, verifyEmailCode } from '@/features/auth/sign-in';
import { isEntitled, purchasesConfigured } from '@/features/billing/purchases';
import { nextStep } from '@/features/flow';
import { agentCta, agentSees, ruleSummary } from '@/features/onboarding/store';
import { formatClock, formatUntil, nextBriefing, nextMonthlyCharge } from '@/features/schedule';
import { supabase } from '@/lib/supabase';

describe('nextStep', () => {
  it('walks the onboarding gates in order', () => {
    expect(nextStep({ signedIn: false, entitled: false, onboarded: false })).toBe('/');
    expect(nextStep({ signedIn: true, entitled: false, onboarded: false })).toBe('/subscribe');
    expect(nextStep({ signedIn: true, entitled: true, onboarded: false })).toBe('/connect');
    expect(nextStep({ signedIn: true, entitled: true, onboarded: true })).toBe('/home');
  });

  it('never skips the paywall, even for onboarded users', () => {
    expect(nextStep({ signedIn: true, entitled: false, onboarded: true })).toBe('/subscribe');
  });
});

describe('ruleSummary', () => {
  it('matches the wireframe copy', () => {
    expect(ruleSummary(20, 'twice')).toBe(
      'Show me my people for 20 minutes a day, opening at 6:00 am and 6:00 pm.',
    );
    expect(ruleSummary(45, 'once')).toBe(
      'Show me my people for 45 minutes a day, opening at 6:00 pm.',
    );
    expect(ruleSummary(10, 'on_open')).toBe('Show me my people for 10 minutes a day.');
  });
});

describe('agent copy', () => {
  it('names the company that receives posts', () => {
    expect(agentSees('openai')).toMatch(/^OpenAI receives the text/);
    expect(agentCta('anthropic')).toBe('Use Claude');
    expect(agentCta('on_device')).toBe('Use the on-phone agent');
  });

  it('does not claim on-phone keeps posts off every server', () => {
    expect(agentSees('on_device')).toMatch(/servers still collect them/);
  });
});

describe('schedule', () => {
  const at = (h: number, m = 0, day = 29) => new Date(2026, 8, day, h, m);

  it('finds the next 6 am / 6 pm window', () => {
    expect(nextBriefing(at(4), 'twice')).toEqual(at(6));
    expect(nextBriefing(at(9, 41), 'twice')).toEqual(at(18));
    expect(nextBriefing(at(19), 'twice')).toEqual(at(6, 0, 30));
    expect(nextBriefing(at(9), 'once')).toEqual(at(18));
    expect(nextBriefing(at(18), 'once')).toEqual(at(18, 0, 30));
    expect(nextBriefing(at(9), 'on_open')).toBeNull();
  });

  it('formats times like the wireframe', () => {
    expect(formatClock(at(6))).toBe('6:00 am');
    expect(formatClock(at(18))).toBe('6:00 pm');
    expect(formatClock(at(0, 5))).toBe('12:05 am');
    expect(formatUntil(at(9, 41), at(18))).toBe('8 hr 19 min');
    expect(formatUntil(at(17, 30), at(18))).toBe('30 min');
  });

  it('computes the next monthly charge, clamping short months', () => {
    expect(nextMonthlyCharge(new Date(2026, 8, 28))).toBe('Oct 28');
    expect(nextMonthlyCharge(new Date(2026, 0, 31))).toBe('Feb 28');
    expect(nextMonthlyCharge(new Date(2026, 11, 15))).toBe('Jan 15');
  });
});

describe('email sign-in', () => {
  it('validates addresses', () => {
    expect(isValidEmail(' dana@example.com ')).toBe(true);
    expect(isValidEmail('dana@example')).toBe(false);
    expect(isValidEmail('')).toBe(false);
  });

  it('sends a code and verifies it with trimmed input', async () => {
    await expect(sendEmailCode(' dana@example.com ')).resolves.toEqual({ ok: true });
    expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
      email: 'dana@example.com',
      options: { shouldCreateUser: true },
    });
    await expect(verifyEmailCode('dana@example.com', ' 123456 ')).resolves.toEqual({ ok: true });
    expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
      email: 'dana@example.com',
      token: '123456',
      type: 'email',
    });
  });

  it('reports a wrong code without exposing the server message', async () => {
    jest.mocked(supabase.auth.verifyOtp).mockResolvedValueOnce({
      error: { message: 'Token has expired or is invalid' },
    } as never);
    const r = await verifyEmailCode('dana@example.com', '000000');
    expect(r).toEqual({
      ok: false,
      cancelled: false,
      message: expect.stringMatching(/code did not work/),
    });
  });
});

describe('purchases', () => {
  it('is not configured without a RevenueCat key', () => {
    expect(purchasesConfigured()).toBe(false);
  });

  it('checks the retainer entitlement', () => {
    expect(isEntitled({ entitlements: { active: { retainer: {} } } } as never)).toBe(true);
    expect(isEntitled({ entitlements: { active: { other: {} } } } as never)).toBe(false);
  });
});
