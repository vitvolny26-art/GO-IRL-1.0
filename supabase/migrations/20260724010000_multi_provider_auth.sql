-- GO IRL multi-provider auth foundation.
-- Adds Facebook as a verified identity provider and auth-only verification metadata
-- without changing notification consent semantics for WhatsApp/Instagram identities.

begin;

alter table public.app_users
  drop constraint if exists app_users_auth_provider_check;

alter table public.app_users
  add constraint app_users_auth_provider_check
  check (auth_provider in ('telegram', 'facebook', 'whatsapp', 'instagram', 'messenger')) not valid;

alter table public.user_provider_identities
  drop constraint if exists user_provider_identities_provider_check;

alter table public.user_provider_identities
  add constraint user_provider_identities_provider_check
  check (provider in ('telegram', 'facebook', 'whatsapp', 'instagram', 'messenger')) not valid;

alter table public.user_provider_identities
  add column if not exists auth_enabled boolean not null default false;

alter table public.user_provider_identities
  add column if not exists auth_verified_at timestamptz;

update public.user_provider_identities
set auth_enabled = true,
    auth_verified_at = coalesce(auth_verified_at, last_inbound_at, created_at)
where provider = 'telegram';

create index if not exists user_provider_identities_auth_lookup_idx
on public.user_provider_identities(provider, provider_user_id, auth_enabled);

create table if not exists public.provider_auth_challenges (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider = 'whatsapp'),
  provider_user_id text not null,
  code_hash text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  attempt_count smallint not null default 0 check (attempt_count between 0 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id)
);

create index if not exists provider_auth_challenges_expiry_idx
on public.provider_auth_challenges(expires_at)
where consumed_at is null;

alter table public.provider_auth_challenges enable row level security;
revoke all on public.provider_auth_challenges from public, anon, authenticated;
grant select, insert, update, delete on public.provider_auth_challenges to service_role;

notify pgrst, 'reload schema';

commit;
