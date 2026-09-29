-- M1: age gate and subscription entitlements. See docs/TECH_SPEC.md §11 and §13.

-- The user confirms they are 13 or older on the sign-in screen (COPPA).
alter table public.profiles add column age_confirmed_at timestamptz;

-- Mirror of RevenueCat entitlements, written only by the revenuecat-webhook Edge Function
-- (service role). Passes check this table before running (M3).
create table public.entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  entitlement text not null default 'retainer',
  product_id text,
  store text,
  active boolean not null default false,
  expires_at timestamptz,
  last_event_type text,
  last_event_id text,
  last_event_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.entitlements enable row level security;

create policy "entitlements: read own" on public.entitlements
  for select to authenticated using ((select auth.uid()) = user_id);

create trigger entitlements_touch before update on public.entitlements
  for each row execute function public.touch_updated_at();

-- Webhook deliveries already processed, so RevenueCat retries are idempotent.
create table public.revenuecat_events (
  id text primary key,
  received_at timestamptz not null default now()
);

alter table public.revenuecat_events enable row level security;
-- No policies: service role only.
