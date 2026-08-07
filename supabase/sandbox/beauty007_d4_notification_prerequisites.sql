-- BEAUTY007-D4 sandbox-only prerequisite bootstrap.
--
-- Purpose: give the dedicated Beauty007 sandbox only the canonical notification
-- primitives required by 20260807062000_beauty007_canonical_notifications.sql.
-- This file is intentionally outside supabase/migrations so it is never part of
-- the normal production migration chain.
--
-- It does NOT create activities, activity_members, reminder tables, event
-- notification producers, cron/scheduling, secrets, or network workers.

begin;

do $$
begin
  if to_regclass('public.app_users') is null then
    raise exception 'missing prerequisite: public.app_users';
  end if;
  if to_regprocedure('public.go_irl_auth_user_key()') is null then
    raise exception 'missing prerequisite: public.go_irl_auth_user_key()';
  end if;
  if to_regclass('public.beauty_booking_events') is null then
    raise exception 'missing prerequisite: public.beauty_booking_events';
  end if;
end;
$$;

-- Canonical provider identity shape copied from
-- 20260721000000_event_reminder_foundation.sql, without event reminder tables.
create table if not exists public.user_provider_identities (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.app_users(user_key) on delete cascade,
  provider text not null check (provider in ('telegram', 'whatsapp', 'instagram', 'messenger')),
  provider_user_id text not null,
  status text not null default 'active' check (status in ('active', 'revoked')),
  consented_at timestamptz,
  last_inbound_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, provider_user_id),
  unique (user_key, provider)
);

create index if not exists user_provider_identities_user_status_idx
on public.user_provider_identities(user_key, status, provider);

insert into public.user_provider_identities (
  user_key,
  provider,
  provider_user_id,
  status,
  last_inbound_at
)
select
  app_user.user_key,
  app_user.auth_provider,
  app_user.provider_user_id,
  case when app_user.status = 'active' then 'active' else 'revoked' end,
  app_user.last_login_at
from public.app_users app_user
where app_user.auth_provider in ('telegram', 'whatsapp', 'instagram', 'messenger')
on conflict (provider, provider_user_id) do update
set
  user_key = excluded.user_key,
  status = excluded.status,
  last_inbound_at = greatest(public.user_provider_identities.last_inbound_at, excluded.last_inbound_at),
  updated_at = now();

alter table public.user_provider_identities enable row level security;

drop policy if exists "provider identities own read" on public.user_provider_identities;
create policy "provider identities own read"
on public.user_provider_identities
for select to authenticated
using (user_key = (select public.go_irl_auth_user_key()));

grant select on public.user_provider_identities to authenticated;
revoke insert, update, delete on public.user_provider_identities from anon, authenticated;

-- Canonical outbox shape copied from
-- 20260723103725_event_notification_outbox.sql, without activity producers.
create table if not exists public.event_notifications (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.app_users(user_key) on delete cascade,
  activity_id uuid,
  kind text not null check (kind in (
    'join_confirmed',
    'join_pending',
    'join_waitlisted',
    'request_approved',
    'request_rejected',
    'event_changed',
    'event_cancelled'
  )),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'scheduled' check (status in (
    'scheduled', 'sending', 'sent', 'failed', 'cancelled'
  )),
  attempt_count smallint not null default 0 check (attempt_count between 0 and 20),
  next_attempt_at timestamptz,
  leased_at timestamptz,
  sent_at timestamptz,
  last_error_code text,
  provider text check (provider in ('telegram', 'whatsapp', 'instagram', 'messenger')),
  provider_message_id text,
  delivery_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists event_notifications_due_idx
on public.event_notifications(coalesce(next_attempt_at, created_at), id)
where status in ('scheduled', 'failed');

create index if not exists event_notifications_user_idx
on public.event_notifications(user_key, created_at desc);

alter table public.event_notifications enable row level security;

drop policy if exists "event notifications own read" on public.event_notifications;
create policy "event notifications own read"
on public.event_notifications
for select to authenticated
using (user_key = (select public.go_irl_auth_user_key()));

grant select on public.event_notifications to authenticated;
revoke insert, update, delete on public.event_notifications from anon, authenticated;

-- D4 replaces/creates the claim RPC. The shared worker also requires the
-- canonical completion RPC, so bootstrap only that missing companion function.
create or replace function public.go_irl_finish_event_notification(
  p_notification_id uuid,
  p_outcome text,
  p_error_code text default null,
  p_retry_at timestamptz default null,
  p_provider_message_id text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_outcome not in ('sent', 'retry', 'failed', 'cancelled') then
    raise exception 'invalid_notification_outcome';
  end if;
  if p_outcome = 'retry' and p_retry_at is null then
    raise exception 'retry_time_required';
  end if;

  update public.event_notifications
  set status = case when p_outcome = 'retry' then 'failed' else p_outcome end,
      next_attempt_at = case when p_outcome = 'retry' then p_retry_at else null end,
      leased_at = null,
      sent_at = case when p_outcome = 'sent' then now() else sent_at end,
      last_error_code = case when p_outcome in ('retry', 'failed', 'cancelled')
        then left(coalesce(p_error_code, 'unknown'), 80) else null end,
      provider_message_id = coalesce(p_provider_message_id, provider_message_id),
      updated_at = now()
  where id = p_notification_id and status = 'sending';

  if not found then raise exception 'notification_not_claimed'; end if;
end;
$$;

revoke all on function public.go_irl_finish_event_notification(uuid, text, text, timestamptz, text)
from public, anon, authenticated;
grant execute on function public.go_irl_finish_event_notification(uuid, text, text, timestamptz, text)
to service_role;

notify pgrst, 'reload schema';

commit;
