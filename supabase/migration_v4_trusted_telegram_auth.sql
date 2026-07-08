-- GO IRL migration v4: trusted Telegram auth foundation
-- Apply after migration_v3_security_hardening.sql and before public release.
--
-- This migration prepares Supabase RLS to use verified JWT claims issued by
-- the verifyTelegramInitData Edge Function. It intentionally removes trust in
-- frontend-controlled x-go-irl-user-key for production policies.

create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  auth_provider text not null,
  provider_user_id text not null,
  user_key text not null unique,
  telegram_id bigint unique,
  first_name text,
  last_name text,
  username text,
  language_code text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_login_at timestamptz,
  constraint app_users_provider_unique unique (auth_provider, provider_user_id),
  constraint app_users_status_check check (status in ('active', 'blocked', 'deleted'))
);

create index if not exists app_users_user_key_idx on public.app_users(user_key);
create index if not exists app_users_telegram_id_idx on public.app_users(telegram_id);
create index if not exists app_users_status_idx on public.app_users(status, last_login_at desc);

alter table public.app_users enable row level security;

drop trigger if exists app_users_touch_updated_at on public.app_users;
create trigger app_users_touch_updated_at
before update on public.app_users
for each row
execute function public.go_irl_touch_updated_at();

create table if not exists public.telegram_auth_replay (
  init_data_hash text primary key,
  telegram_id bigint not null,
  auth_date timestamptz not null,
  used_at timestamptz not null default now(),
  expires_at timestamptz not null
);

create index if not exists telegram_auth_replay_expires_idx
on public.telegram_auth_replay(expires_at);

alter table public.telegram_auth_replay enable row level security;

create or replace function public.go_irl_auth_user_key()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'go_irl_user_key', '');
$$;

create or replace function public.go_irl_request_user_key()
returns text
language sql
stable
as $$
  select public.go_irl_auth_user_key();
$$;

create or replace function public.go_irl_request_invite_activity()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'go_irl_start_param', '');
$$;

create or replace function public.go_irl_request_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'go_irl_role', ''),
    (
      select user_role.role
      from public.user_roles user_role
      where user_role.user_key = public.go_irl_auth_user_key()
      limit 1
    ),
    'user'
  );
$$;

drop policy if exists "app users own read" on public.app_users;
create policy "app users own read"
on public.app_users for select to authenticated using (
  user_key = public.go_irl_auth_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "app users own update" on public.app_users;
create policy "app users own update"
on public.app_users for update to authenticated
using (
  user_key = public.go_irl_auth_user_key()
)
with check (
  user_key = public.go_irl_auth_user_key()
);

drop policy if exists "telegram auth replay locked" on public.telegram_auth_replay;
create policy "telegram auth replay locked"
on public.telegram_auth_replay for select to authenticated using (false);

drop policy if exists "public activities read" on public.activities;
create policy "public activities read"
on public.activities for select to authenticated using (
  public.go_irl_can_read_activity(id, visibility, organizer_key)
);

drop policy if exists "public activities create" on public.activities;
create policy "public activities create"
on public.activities for insert to authenticated with check (
  organizer_key = public.go_irl_auth_user_key()
);

drop policy if exists "organizer activities update" on public.activities;
create policy "organizer activities update"
on public.activities for update to authenticated
using (
  organizer_key = public.go_irl_auth_user_key()
  or public.go_irl_request_can_moderate()
)
with check (
  organizer_key = public.go_irl_auth_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "organizer or admin activities delete" on public.activities;
create policy "organizer or admin activities delete"
on public.activities for delete to authenticated using (
  organizer_key = public.go_irl_auth_user_key()
  or public.go_irl_request_is_admin()
);

drop policy if exists "public members read" on public.activity_members;
create policy "public members read"
on public.activity_members for select to authenticated using (
  public.go_irl_can_read_activity_member(activity_id, user_key)
);

drop policy if exists "public members create" on public.activity_members;
create policy "public members create"
on public.activity_members for insert to authenticated with check (
  public.go_irl_can_insert_activity_member(activity_id, status, user_key)
);

drop policy if exists "public members update" on public.activity_members;
create policy "public members update"
on public.activity_members for update to authenticated
using (
  public.go_irl_request_can_moderate()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_auth_user_key()
  )
)
with check (
  public.go_irl_request_can_moderate()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_auth_user_key()
  )
);

drop policy if exists "public members delete" on public.activity_members;
create policy "public members delete"
on public.activity_members for delete to authenticated using (
  user_key = public.go_irl_auth_user_key()
  or public.go_irl_request_can_moderate()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_auth_user_key()
  )
);

grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.activity_members to authenticated;
grant select, update on public.app_users to authenticated;

notify pgrst, 'reload schema';
