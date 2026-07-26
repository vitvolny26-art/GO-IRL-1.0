-- GO IRL event reminder foundation.
-- Adds linked provider identities, owner-scoped reminder preferences, and
-- service-only atomic delivery claiming/completion. Does not schedule cron or
-- perform network requests.

begin;

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
for select
to authenticated
using (user_key = (select public.go_irl_auth_user_key()));

grant select on public.user_provider_identities to authenticated;
revoke insert, update, delete on public.user_provider_identities from anon, authenticated;

create table if not exists public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.app_users(user_key) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  provider text not null check (provider in ('telegram', 'whatsapp', 'instagram', 'messenger')),
  lead_minutes smallint not null check (lead_minutes in (15, 60, 180, 1440)),
  event_starts_at timestamptz not null,
  scheduled_for timestamptz not null,
  status text not null default 'scheduled' check (status in ('scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  attempt_count smallint not null default 0 check (attempt_count between 0 and 20),
  next_attempt_at timestamptz,
  leased_at timestamptz,
  sent_at timestamptz,
  last_error_code text,
  delivery_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_key, activity_id),
  unique (delivery_key)
);

create index if not exists event_reminders_due_idx
on public.event_reminders(coalesce(next_attempt_at, scheduled_for), id)
where status in ('scheduled', 'failed');

create index if not exists event_reminders_user_status_idx
on public.event_reminders(user_key, status, scheduled_for);

create index if not exists event_reminders_activity_idx
on public.event_reminders(activity_id);

alter table public.event_reminders enable row level security;

drop policy if exists "event reminders own read" on public.event_reminders;
create policy "event reminders own read"
on public.event_reminders
for select
to authenticated
using (user_key = (select public.go_irl_auth_user_key()));

drop policy if exists "event reminders own delete" on public.event_reminders;
create policy "event reminders own delete"
on public.event_reminders
for delete
to authenticated
using (user_key = (select public.go_irl_auth_user_key()));

grant select, delete on public.event_reminders to authenticated;
revoke insert, update on public.event_reminders from anon, authenticated;

create or replace function public.go_irl_upsert_event_reminder(
  p_activity_id uuid,
  p_provider text,
  p_lead_minutes smallint
)
returns public.event_reminders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_activity public.activities%rowtype;
  v_event_starts_at timestamptz;
  v_scheduled_for timestamptz;
  v_result public.event_reminders%rowtype;
begin
  if v_user_key is null then
    raise exception 'authentication_required';
  end if;

  if p_provider not in ('telegram', 'whatsapp', 'instagram', 'messenger') then
    raise exception 'unsupported_reminder_provider';
  end if;

  if p_lead_minutes not in (15, 60, 180, 1440) then
    raise exception 'unsupported_reminder_lead';
  end if;

  select activity.*
  into v_activity
  from public.activities activity
  where activity.id = p_activity_id
    and public.go_irl_can_read_activity(activity.id, activity.visibility, activity.organizer_key);

  if not found then
    raise exception 'event_not_found_or_not_allowed';
  end if;

  if not exists (
    select 1
    from public.user_provider_identities identity
    where identity.user_key = v_user_key
      and identity.provider = p_provider
      and identity.status = 'active'
  ) then
    raise exception 'provider_not_linked';
  end if;

  v_event_starts_at := make_timestamptz(
    extract(year from v_activity.event_date)::integer,
    extract(month from v_activity.event_date)::integer,
    extract(day from v_activity.event_date)::integer,
    extract(hour from v_activity.event_time)::integer,
    extract(minute from v_activity.event_time)::integer,
    0,
    'Europe/Prague'
  );
  v_scheduled_for := v_event_starts_at - make_interval(mins => p_lead_minutes);

  if v_scheduled_for <= now() then
    raise exception 'reminder_time_passed';
  end if;

  update public.user_provider_identities
  set consented_at = coalesce(consented_at, now()), updated_at = now()
  where user_key = v_user_key and provider = p_provider;

  insert into public.event_reminders (
    user_key,
    activity_id,
    provider,
    lead_minutes,
    event_starts_at,
    scheduled_for,
    status,
    attempt_count,
    next_attempt_at,
    leased_at,
    sent_at,
    last_error_code,
    delivery_key,
    updated_at
  ) values (
    v_user_key,
    p_activity_id,
    p_provider,
    p_lead_minutes,
    v_event_starts_at,
    v_scheduled_for,
    'scheduled',
    0,
    null,
    null,
    null,
    null,
    'reminder:' || v_user_key || ':' || p_activity_id::text || ':' || extract(epoch from v_scheduled_for)::bigint::text,
    now()
  )
  on conflict (user_key, activity_id) do update
  set
    provider = excluded.provider,
    lead_minutes = excluded.lead_minutes,
    event_starts_at = excluded.event_starts_at,
    scheduled_for = excluded.scheduled_for,
    status = 'scheduled',
    attempt_count = 0,
    next_attempt_at = null,
    leased_at = null,
    sent_at = null,
    last_error_code = null,
    delivery_key = excluded.delivery_key,
    updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

revoke all on function public.go_irl_upsert_event_reminder(uuid, text, smallint) from public, anon;
grant execute on function public.go_irl_upsert_event_reminder(uuid, text, smallint) to authenticated;

create or replace function public.go_irl_claim_due_event_reminders(
  p_limit integer default 50,
  p_lease_seconds integer default 300
)
returns setof public.event_reminders
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 200 then
    raise exception 'invalid_claim_limit';
  end if;
  if p_lease_seconds < 30 or p_lease_seconds > 1800 then
    raise exception 'invalid_lease_seconds';
  end if;

  return query
  with due as (
    select reminder.id
    from public.event_reminders reminder
    where (
      reminder.status in ('scheduled', 'failed')
      and coalesce(reminder.next_attempt_at, reminder.scheduled_for) <= now()
    ) or (
      reminder.status = 'sending'
      and reminder.leased_at <= now() - make_interval(secs => p_lease_seconds)
    )
    order by coalesce(reminder.next_attempt_at, reminder.scheduled_for), reminder.id
    for update skip locked
    limit p_limit
  )
  update public.event_reminders reminder
  set
    status = 'sending',
    attempt_count = reminder.attempt_count + 1,
    leased_at = now(),
    updated_at = now()
  from due
  where reminder.id = due.id
  returning reminder.*;
end;
$$;

revoke all on function public.go_irl_claim_due_event_reminders(integer, integer) from public, anon, authenticated;
grant execute on function public.go_irl_claim_due_event_reminders(integer, integer) to service_role;

create or replace function public.go_irl_finish_event_reminder(
  p_reminder_id uuid,
  p_outcome text,
  p_error_code text default null,
  p_retry_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_outcome not in ('sent', 'retry', 'failed', 'cancelled') then
    raise exception 'invalid_reminder_outcome';
  end if;
  if p_outcome = 'retry' and p_retry_at is null then
    raise exception 'retry_time_required';
  end if;

  update public.event_reminders
  set
    status = case p_outcome when 'retry' then 'failed' else p_outcome end,
    next_attempt_at = case when p_outcome = 'retry' then p_retry_at else null end,
    leased_at = null,
    sent_at = case when p_outcome = 'sent' then now() else sent_at end,
    last_error_code = case when p_outcome in ('retry', 'failed') then left(coalesce(p_error_code, 'unknown'), 80) else null end,
    updated_at = now()
  where id = p_reminder_id and status = 'sending';

  if not found then
    raise exception 'reminder_not_claimed';
  end if;
end;
$$;

revoke all on function public.go_irl_finish_event_reminder(uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.go_irl_finish_event_reminder(uuid, text, text, timestamptz) to service_role;

create or replace function public.go_irl_reschedule_event_reminders()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_event_starts_at timestamptz;
begin
  if new.event_date is not distinct from old.event_date
    and new.event_time is not distinct from old.event_time then
    return new;
  end if;

  v_event_starts_at := make_timestamptz(
    extract(year from new.event_date)::integer,
    extract(month from new.event_date)::integer,
    extract(day from new.event_date)::integer,
    extract(hour from new.event_time)::integer,
    extract(minute from new.event_time)::integer,
    0,
    'Europe/Prague'
  );

  update public.event_reminders
  set
    event_starts_at = v_event_starts_at,
    scheduled_for = v_event_starts_at - make_interval(mins => lead_minutes),
    status = case
      when v_event_starts_at - make_interval(mins => lead_minutes) > now() then 'scheduled'
      else 'cancelled'
    end,
    attempt_count = 0,
    next_attempt_at = null,
    leased_at = null,
    sent_at = null,
    last_error_code = null,
    delivery_key = 'reminder:' || user_key || ':' || activity_id::text || ':' || extract(epoch from (v_event_starts_at - make_interval(mins => lead_minutes)))::bigint::text,
    updated_at = now()
  where activity_id = new.id and status in ('scheduled', 'sending', 'failed');

  return new;
end;
$$;

revoke execute on function public.go_irl_reschedule_event_reminders() from public, anon, authenticated;

drop trigger if exists activities_reschedule_event_reminders on public.activities;
create trigger activities_reschedule_event_reminders
after update of event_date, event_time on public.activities
for each row
execute function public.go_irl_reschedule_event_reminders();

notify pgrst, 'reload schema';

commit;
