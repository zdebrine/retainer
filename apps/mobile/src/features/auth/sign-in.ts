import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';

import { env } from '@/lib/env';
import { supabase } from '@/lib/supabase';

/** Result of a sign-in attempt. `cancelled` means the user backed out; show nothing. */
export type SignInResult =
  { ok: true } | { ok: false; cancelled: true } | { ok: false; cancelled: false; message: string };

const cancelled: SignInResult = { ok: false, cancelled: true };
const failed = (message: string): SignInResult => ({ ok: false, cancelled: false, message });

// ─── Email one-time code ─────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email: string): boolean {
  return EMAIL_RE.test(email.trim());
}

/** Sends a 6-digit code. The Supabase email template must include {{ .Token }}. */
export async function sendEmailCode(email: string): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithOtp({
    email: email.trim(),
    options: { shouldCreateUser: true },
  });
  return error ? failed(error.message) : { ok: true };
}

export async function verifyEmailCode(email: string, code: string): Promise<SignInResult> {
  const { error } = await supabase.auth.verifyOtp({
    email: email.trim(),
    token: code.trim(),
    type: 'email',
  });
  return error ? failed('That code did not work. Check it, or send a new one.') : { ok: true };
}

// ─── Sign in with Apple (iOS) ────────────────────────────────────────────────

export async function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return false;
  return AppleAuthentication.isAvailableAsync();
}

export async function signInWithApple(): Promise<SignInResult> {
  // Apple receives the SHA-256 of the nonce; Supabase checks the raw value against it.
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) return failed('Apple did not return a sign-in token.');
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });
    return error ? failed(error.message) : { ok: true };
  } catch (e) {
    if (e instanceof Error && 'code' in e && e.code === 'ERR_REQUEST_CANCELED') return cancelled;
    return failed('Sign in with Apple did not complete.');
  }
}

// ─── Sign in with Google ─────────────────────────────────────────────────────

export function isGoogleSignInConfigured(): boolean {
  if (Platform.OS === 'web') return false;
  return !!env.googleWebClientId && (Platform.OS !== 'ios' || !!env.googleIosClientId);
}

export async function signInWithGoogle(): Promise<SignInResult> {
  // Loaded lazily so builds without Google configured never touch the native module.
  const { GoogleSignin, isErrorWithCode, statusCodes } =
    await import('@react-native-google-signin/google-signin');
  GoogleSignin.configure({
    webClientId: env.googleWebClientId,
    iosClientId: env.googleIosClientId || undefined,
  });
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response.type !== 'success') return cancelled;
    const token = response.data.idToken;
    if (!token) return failed('Google did not return a sign-in token.');
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
    return error ? failed(error.message) : { ok: true };
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return cancelled;
    if (isErrorWithCode(e) && e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return failed('Google Play services are needed to sign in with Google.');
    }
    return failed('Sign in with Google did not complete.');
  }
}
