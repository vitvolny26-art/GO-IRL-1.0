-- Allow several reminder lead times for one user and event without changing auth or RLS.
begin;

alter table public.event_reminders
  drop constraint if exists event_reminders_user_key_activity_id_key;

create unique index if not exists event_reminders_user_activity_provider_lead_uidx
  on public.event_reminders(user_key, activity_id, provider, lead_minutes);

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
  if v_user_key is null then raise exception 'authentication_required'; end if;
  if p_provider not in ('telegram', 'whatsapp', 'instagram', 'messenger') then raise exception 'unsupported_reminder_provider'; end if;
  if p_lead_minutes not in (15, 60, 180, 1440) then raise exception 'unsupported_reminder_lead'; end if;

  select activity.* into v_activity
  from public.activities activity
  where activity.id = p_activity_id
    and private.go_irl_can_read_activity(activity.id, activity.visibility, activity.organizer_key);
  if not found then raise exception 'event_not_found_or_not_allowed'; end if;

  if not exists (
    select 1 from public.user_provider_identities identity
    where identity.user_key = v_user_key
      and identity.provider = p_provider
      and identity.status = 'active'
  ) then raise exception 'provider_not_linked'; end if;

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
  if v_scheduled_for <= now() then raise exception 'reminder_time_passed'; end if;

  update public.user_provider_identities
  set consented_at = coalesce(consented_at, now()), updated_at = now()
  where user_key = v_user_key and provider = p_provider;

  insert into public.event_reminders (
    user_key, activity_id, provider, lead_minutes, event_starts_at, scheduled_for,
    status, attempt_count, next_attempt_at, leased_at, sent_at, last_error_code,
    delivery_key, updated_at
  ) values (
    v_user_key, p_activity_id, p_provider, p_lead_minutes, v_event_starts_at, v_scheduled_for,
    'scheduled', 0, null, null, null, null,
    'reminder:' || v_user_key || ':' || p_activity_id::text || ':' || p_provider || ':' || p_lead_minutes::text,
    now()
  )
  on conflict (user_key, activity_id, provider, lead_minutes) do update
  set event_starts_at = excluded.event_starts_at,
      scheduled_for = excluded.scheduled_for,
      status = 'scheduled', attempt_count = 0, next_attempt_at = null,
      leased_at = null, sent_at = null, last_error_code = null,
      delivery_key = excluded.delivery_key, updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.go_irl_replace_event_reminders(
  p_activity_id uuid,
  p_provider text,
  p_lead_minutes smallint[]
)
returns setof public.event_reminders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_lead smallint;
begin
  if v_user_key is null then raise exception 'authentication_required'; end if;
  if p_provider not in ('telegram', 'whatsapp', 'instagram', 'messenger') then raise exception 'unsupported_reminder_provider'; end if;
  if p_lead_minutes is null or cardinality(p_lead_minutes) = 0 then raise exception 'reminder_lead_required'; end if;
  if exists (select 1 from unnest(p_lead_minutes) lead where lead not in (15, 60, 180, 1440)) then raise exception 'unsupported_reminder_lead'; end if;

  delete from public.event_reminders
  where user_key = v_user_key and activity_id = p_activity_id;

  foreach v_lead in array (select array_agg(distinct lead order by lead) from unnest(p_lead_minutes) lead)
  loop
    return next public.go_irl_upsert_event_reminder(p_activity_id, p_provider, v_lead);
  end loop;
  return;
end;
$$;

revoke all on function public.go_irl_replace_event_reminders(uuid, text, smallint[]) from public, anon;
grant execute on function public.go_irl_replace_event_reminders(uuid, text, smallint[]) to authenticated;

notify pgrst, 'reload schema';
commit;
