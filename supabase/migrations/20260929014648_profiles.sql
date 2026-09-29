-- One row per user. Created automatically when an auth user is created.
-- See docs/TECH_SPEC.md §9. Briefing windows are fixed at 6:00 am / 6:00 pm local,
-- so only the mode and the time zone are stored.

create type public.ai_provider as enum ('anthropic', 'openai', 'google', 'on_device');
create type public.window_mode as enum ('once', 'twice', 'on_open');

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tz text not null default 'America/New_York',
  ai_provider public.ai_provider not null default 'anthropic',
  daily_limit_min smallint not null default 20 check (daily_limit_min in (10, 20, 30, 45)),
  window_mode public.window_mode not null default 'twice',
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = user_id);

create policy "profiles: update own" on public.profiles
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Inserts and deletes happen only through the trigger below and account deletion (service role).

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Trigger functions are not part of the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
