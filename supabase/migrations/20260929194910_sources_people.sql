-- M2: where the user's people post (spec §6, §9). Phase 1 platforms are read from public data,
-- so no platform credentials are stored.

create type public.source_platform as enum ('bluesky', 'mastodon', 'rss', 'youtube');

-- The user's own account on a platform, used to import who they follow.
create table public.connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  platform public.source_platform not null,
  external_id text not null,
  handle text not null,
  display_name text,
  created_at timestamptz not null default now(),
  unique (user_id, platform)
);

-- A human on the user's list.
create table public.people (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now()
);

-- An account, feed or channel Retainer reads, belonging to one person.
create table public.source_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  person_id uuid not null references public.people (id) on delete cascade,
  platform public.source_platform not null,
  external_id text not null,
  handle text not null,
  display_name text not null,
  avatar_url text,
  feed_url text,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, platform, external_id)
);

create index people_user_idx on public.people (user_id);
create index source_accounts_person_idx on public.source_accounts (person_id);

alter table public.connections enable row level security;
alter table public.people enable row level security;
alter table public.source_accounts enable row level security;

create policy "connections: own" on public.connections
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "people: own" on public.people
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- An account may only point at one of the user's own people.
create policy "source_accounts: own" on public.source_accounts
  for all to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (select 1 from public.people p where p.id = person_id and p.user_id = (select auth.uid()))
  );

-- Replaces the user's list in one transaction (onboarding and, later, Settings).
-- people: [{ "display_name": text, "accounts": [{ platform, external_id, handle, display_name, avatar_url, feed_url }] }]
create function public.replace_people(people jsonb) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  uid uuid := auth.uid();
  person jsonb;
  account jsonb;
  pid uuid;
  n integer := 0;
begin
  if uid is null then raise exception 'not signed in'; end if;
  if jsonb_typeof(people) <> 'array' or jsonb_array_length(people) > 500 then
    raise exception 'people must be an array of at most 500';
  end if;
  delete from public.people where user_id = uid;
  for person in select * from jsonb_array_elements(people) loop
    insert into public.people (user_id, display_name)
      values (uid, left(person->>'display_name', 200))
      returning id into pid;
    for account in select * from jsonb_array_elements(person->'accounts') loop
      insert into public.source_accounts
        (user_id, person_id, platform, external_id, handle, display_name, avatar_url, feed_url)
      values (
        uid, pid,
        (account->>'platform')::public.source_platform,
        left(account->>'external_id', 500),
        left(account->>'handle', 200),
        left(account->>'display_name', 200),
        left(account->>'avatar_url', 1000),
        left(account->>'feed_url', 1000)
      );
    end loop;
    n := n + 1;
  end loop;
  return n;
end;
$$;

revoke execute on function public.replace_people(jsonb) from public, anon;
grant execute on function public.replace_people(jsonb) to authenticated;
