import * as AppleAuthentication from 'expo-apple-authentication';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { OnboardingScreen, Stack, StepHeader, Toggle } from '@/components/onboarding';
import { Text } from '@/components/text';
import { TextField } from '@/components/text-field';
import { updateProfile } from '@/features/auth/profile';
import {
  isAppleSignInAvailable,
  isGoogleSignInConfigured,
  isValidEmail,
  sendEmailCode,
  signInWithApple,
  signInWithGoogle,
  parseEmailLink,
  verifyEmailCode,
  verifyEmailLink,
  type SignInResult,
} from '@/features/auth/sign-in';
import { hasActiveEntitlement } from '@/features/billing/purchases';
import { nextStep } from '@/features/flow';
import { supabase } from '@/lib/supabase';
import { radius, space, useTheme } from '@/theme';

// 02b · Sign in (new screen, spec §20). Comes after the price is explained and before Subscribe,
// so the subscription is tied to an account from the start.
export default function SignIn() {
  const { colors } = useTheme();
  const [ageOk, setAgeOk] = useState(false);
  const [apple, setApple] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    isAppleSignInAvailable().then(setApple, () => setApple(false));
  }, []);

  async function finish(result: SignInResult) {
    if (!result.ok) {
      if (!result.cancelled) setMessage(result.message);
      return;
    }
    const { data } = await supabase.auth.getUser();
    const user = data.user;
    if (!user) return setMessage('Signed in, but the account could not be loaded.');
    const profile = await updateProfile(user.id, {
      age_confirmed_at: new Date().toISOString(),
    }).catch(() => null);
    const entitled = await hasActiveEntitlement().catch(() => false);
    router.replace(nextStep({ signedIn: true, entitled, onboarded: !!profile?.onboarded_at }));
  }

  async function run(fn: () => Promise<SignInResult>) {
    setBusy(true);
    setMessage(null);
    try {
      await finish(await fn());
    } finally {
      setBusy(false);
    }
  }

  async function sendCode() {
    setBusy(true);
    setMessage(null);
    const r = await sendEmailCode(email);
    setBusy(false);
    if (r.ok) setCodeSent(true);
    else if (!r.cancelled) setMessage(r.message);
  }

  const locked = !ageOk || busy;
  const isLink = /^https?:\/\//i.test(code);

  return (
    <OnboardingScreen>
      <StepHeader
        eyebrow="Before you subscribe"
        title="Sign in to Retainer"
        body="Your subscription and your list of people belong to this account. Retainer never posts or messages with it."
      />

      <View style={[styles.age, { borderColor: colors.hairline, backgroundColor: colors.deep }]}>
        <View style={styles.flex}>
          <Text>I&apos;m 13 or older</Text>
          <Text variant="caption" tone="dim">
            Retainer is not for children under 13.
          </Text>
        </View>
        <Toggle value={ageOk} onValueChange={setAgeOk} accessibilityLabel="I'm 13 or older" />
      </View>

      <Stack gap={2}>
        {apple ? (
          <View style={{ opacity: locked ? 0.4 : 1 }} pointerEvents={locked ? 'none' : 'auto'}>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={radius.panel}
              style={styles.apple}
              onPress={() => run(signInWithApple)}
            />
          </View>
        ) : null}
        {isGoogleSignInConfigured() ? (
          <Button
            label="Continue with Google"
            block
            disabled={locked}
            onPress={() => run(signInWithGoogle)}
          />
        ) : null}
      </Stack>

      <Stack gap={3}>
        <Text variant="micro" tone="dim">
          {apple || isGoogleSignInConfigured() ? 'Or use your email' : 'Use your email'}
        </Text>
        {!codeSent ? (
          <>
            <TextField
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              textContentType="emailAddress"
              accessibilityLabel="Email"
              editable={!busy}
            />
            <Button
              label="Email me a code"
              disabled={locked || !isValidEmail(email)}
              onPress={sendCode}
            />
          </>
        ) : (
          <>
            <Text variant="caption" tone="dim">
              A sign-in email was sent to {email.trim()}. Enter its 6-digit code, or paste its link.
            </Text>
            <TextField
              mono={!isLink}
              value={code}
              // A pasted link is kept whole; anything else is treated as the code.
              onChangeText={(t) =>
                setCode(/^\s*https?:\/\//i.test(t) ? t.trim() : t.replace(/\D/g, '').slice(0, 6))
              }
              placeholder="000000"
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              accessibilityLabel="Code"
              editable={!busy}
            />
            <Button
              label="Sign in"
              kind="fill"
              disabled={locked || (isLink ? !parseEmailLink(code) : code.length !== 6)}
              onPress={() =>
                run(() => (isLink ? verifyEmailLink(code) : verifyEmailCode(email, code)))
              }
            />
            <Button
              label="Use a different email"
              kind="quiet"
              onPress={() => {
                setCodeSent(false);
                setCode('');
              }}
            />
          </>
        )}
      </Stack>

      {message ? (
        <Text variant="caption" tone="dim" accessibilityLiveRegion="polite">
          {message}
        </Text>
      ) : null}
    </OnboardingScreen>
  );
}

const styles = StyleSheet.create({
  age: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    borderWidth: 1,
    borderRadius: radius.panel,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
  },
  flex: { flex: 1 },
  apple: { height: 52 },
});
