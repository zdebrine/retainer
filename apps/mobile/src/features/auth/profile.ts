import { supabase } from '@/lib/supabase';

export type AiProvider = 'anthropic' | 'openai' | 'google' | 'on_device';
export type WindowMode = 'once' | 'twice' | 'on_open';
export type DailyLimit = 10 | 20 | 30 | 45;

export type Profile = {
  user_id: string;
  tz: string;
  ai_provider: AiProvider;
  daily_limit_min: DailyLimit;
  window_mode: WindowMode;
  onboarded_at: string | null;
  age_confirmed_at: string | null;
};

const columns =
  'user_id, tz, ai_provider, daily_limit_min, window_mode, onboarded_at, age_confirmed_at';

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select(columns)
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data as Profile | null;
}

export async function updateProfile(
  userId: string,
  patch: Partial<Omit<Profile, 'user_id'>>,
): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('user_id', userId)
    .select(columns)
    .single();
  if (error) throw error;
  return data as Profile;
}
