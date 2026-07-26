begin;

alter table public.user_provider_identities
  add column if not exists delivery_confirmed_at timestamptz;

comment on column public.user_provider_identities.delivery_confirmed_at is
  'Last successful outbound provider delivery. Mini App authentication alone must not set this field.';

with delivery_evidence as (
  select user_key, provider, max(sent_at) as confirmed_at
  from (
    select user_key, provider, sent_at
    from public.event_notifications
    where status = 'sent' and provider is not null and sent_at is not null
    union all
    select user_key, provider, sent_at
    from public.event_reminders
    where status = 'sent' and sent_at is not null
  ) evidence
  group by user_key, provider
)
update public.user_provider_identities identity
set delivery_confirmed_at = evidence.confirmed_at,
    updated_at = now()
from delivery_evidence evidence
where identity.user_key = evidence.user_key
  and identity.provider = evidence.provider
  and (identity.delivery_confirmed_at is null or identity.delivery_confirmed_at < evidence.confirmed_at);

update public.event_notifications
set status = 'failed',
    next_attempt_at = null,
    leased_at = null,
    last_error_code = coalesce(last_error_code, 'delivery_attempt_limit_reached'),
    updated_at = now()
where attempt_count >= 5
  and status in ('failed', 'sending');

update public.event_reminders
set status = 'failed',
    next_attempt_at = null,
    leased_at = null,
    last_error_code = coalesce(last_error_code, 'delivery_attempt_limit_reached'),
    updated_at = now()
where attempt_count >= 5
  and status in ('failed', 'sending');

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

  update public.event_reminders
  set status = 'failed',
      next_attempt_at = null,
      leased_at = null,
      last_error_code = coalesce(last_error_code, 'delivery_attempt_limit_reached'),
      updated_at = now()
  where status = 'sending'
    and attempt_count >= 5
    and leased_at <= now() - make_interval(secs => p_lease_seconds);

  return query
  with due as (
    select reminder.id
    from public.event_reminders reminder
    where (
      reminder.status = 'scheduled'
      and reminder.attempt_count < 5
      and coalesce(reminder.next_attempt_at, reminder.scheduled_for) <= now()
    ) or (
      reminder.status = 'failed'
      and reminder.attempt_count < 5
      and reminder.next_attempt_at is not null
      and reminder.next_attempt_at <= now()
    ) or (
      reminder.status = 'sending'
      and reminder.attempt_count < 5
      and reminder.leased_at <= now() - make_interval(secs => p_lease_seconds)
    )
    order by coalesce(reminder.next_attempt_at, reminder.scheduled_for), reminder.id
    for update skip locked
    limit p_limit
  )
  update public.event_reminders reminder
  set status = 'sending',
      attempt_count = reminder.attempt_count + 1,
      leased_at = now(),
      updated_at = now()
  from due
  where reminder.id = due.id
  returning reminder.*;
end;
$$;

create or replace function public.go_irl_claim_due_event_reminders(
  p_limit integer,
  p_lease_seconds integer,
  p_providers text[]
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
  if coalesce(cardinality(p_providers), 0) < 1
    or not (p_providers <@ array['telegram', 'whatsapp', 'instagram', 'messenger']::text[]) then
    raise exception 'invalid_claim_providers';
  end if;

  update public.event_reminders
  set status = 'failed',
      next_attempt_at = null,
      leased_at = null,
      last_error_code = coalesce(last_error_code, 'delivery_attempt_limit_reached'),
      updated_at = now()
  where provider = any(p_providers)
    and status = 'sending'
    and attempt_count >= 5
    and leased_at <= now() - make_interval(secs => p_lease_seconds);

  return query
  with due as (
    select reminder.id
    from public.event_reminders reminder
    where reminder.provider = any(p_providers)
      and (
        (
          reminder.status = 'scheduled'
          and reminder.attempt_count < 5
          and coalesce(reminder.next_attempt_at, reminder.scheduled_for) <= now()
        ) or (
          reminder.status = 'failed'
          and reminder.attempt_count < 5
          and reminder.next_attempt_at is not null
          and reminder.next_attempt_at <= now()
        ) or (
          reminder.status = 'sending'
          and reminder.attempt_count < 5
          and reminder.leased_at <= now() - make_interval(secs => p_lease_seconds)
        )
      )
    order by coalesce(reminder.next_attempt_at, reminder.scheduled_for), reminder.id
    for update skip locked
    limit p_limit
  )
  update public.event_reminders reminder
  set status = 'sending',
      attempt_count = reminder.attempt_count + 1,
      leased_at = now(),
      updated_at = now()
  from due
  where reminder.id = due.id
  returning reminder.*;
end;
$$;

create or replace function public.go_irl_claim_event_notifications(
  p_providers text[],
  p_limit integer default 50,
  p_lease_seconds integer default 300
)
returns table (
  id uuid,
  user_key text,
  activity_id uuid,
  kind text,
  payload jsonb,
  attempt_count smallint,
  provider text,
  provider_user_id text,
  recipient_last_inbound_at timestamptz,
  language_code text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 200 then raise exception 'invalid_claim_limit'; end if;
  if p_lease_seconds < 30 or p_lease_seconds > 1800 then raise exception 'invalid_lease_seconds'; end if;
  if p_providers is null or cardinality(p_providers) = 0
    or (p_providers <@ array['telegram','whatsapp','instagram','messenger']::text[]) is not true then
    raise exception 'invalid_providers';
  end if;

  update public.event_notifications
  set status = 'failed',
      next_attempt_at = null,
      leased_at = null,
      last_error_code = coalesce(last_error_code, 'delivery_attempt_limit_reached'),
      updated_at = now()
  where status = 'sending'
    and attempt_count >= 5
    and leased_at <= now() - make_interval(secs => p_lease_seconds);

  return query
  with due as (
    select notification.id, identity.provider, identity.provider_user_id,
      identity.last_inbound_at, identity.language_code
    from public.event_notifications notification
    join lateral (
      select linked.provider, linked.provider_user_id, linked.last_inbound_at,
        app_user.language_code
      from public.user_provider_identities linked
      left join public.app_users app_user on app_user.user_key = notification.user_key
      where linked.user_key = notification.user_key
        and linked.status = 'active'
        and linked.provider = any(p_providers)
      order by
        (linked.provider = app_user.auth_provider) desc,
        linked.delivery_confirmed_at desc nulls last,
        linked.last_inbound_at desc nulls last,
        linked.created_at asc
      limit 1
    ) identity on true
    where (
      notification.status = 'scheduled'
      and notification.attempt_count < 5
      and coalesce(notification.next_attempt_at, notification.created_at) <= now()
    ) or (
      notification.status = 'failed'
      and notification.attempt_count < 5
      and notification.next_attempt_at is not null
      and notification.next_attempt_at <= now()
    ) or (
      notification.status = 'sending'
      and notification.attempt_count < 5
      and notification.leased_at <= now() - make_interval(secs => p_lease_seconds)
    )
    order by coalesce(notification.next_attempt_at, notification.created_at), notification.id
    for update of notification skip locked
    limit p_limit
  ),
  claimed as (
    update public.event_notifications notification
    set status = 'sending',
        attempt_count = notification.attempt_count + 1,
        leased_at = now(),
        provider = due.provider,
        updated_at = now()
    from due
    where notification.id = due.id
    returning notification.*
  )
  select claimed.id, claimed.user_key, claimed.activity_id, claimed.kind,
    claimed.payload, claimed.attempt_count, due.provider, due.provider_user_id,
    due.last_inbound_at, due.language_code
  from claimed join due on due.id = claimed.id;
end;
$$;

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
declare
  v_user_key text;
  v_provider text;
begin
  if p_outcome not in ('sent', 'retry', 'failed', 'cancelled') then
    raise exception 'invalid_reminder_outcome';
  end if;
  if p_outcome = 'retry' and p_retry_at is null then
    raise exception 'retry_time_required';
  end if;

  update public.event_reminders
  set status = case p_outcome when 'retry' then 'failed' else p_outcome end,
      next_attempt_at = case when p_outcome = 'retry' then p_retry_at else null end,
      leased_at = null,
      sent_at = case when p_outcome = 'sent' then now() else sent_at end,
      last_error_code = case when p_outcome in ('retry', 'failed') then left(coalesce(p_error_code, 'unknown'), 80) else null end,
      updated_at = now()
  where id = p_reminder_id and status = 'sending'
  returning user_key, provider into v_user_key, v_provider;

  if not found then
    raise exception 'reminder_not_claimed';
  end if;

  if p_outcome = 'sent' and v_provider is not null then
    update public.user_provider_identities
    set delivery_confirmed_at = now(), updated_at = now()
    where user_key = v_user_key and provider = v_provider;
  end if;
end;
$$;

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
declare
  v_user_key text;
  v_provider text;
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
  where id = p_notification_id and status = 'sending'
  returning user_key, provider into v_user_key, v_provider;

  if not found then raise exception 'notification_not_claimed'; end if;

  if p_outcome = 'sent' and v_provider is not null then
    update public.user_provider_identities
    set delivery_confirmed_at = now(), updated_at = now()
    where user_key = v_user_key and provider = v_provider;
  end if;
end;
$$;

revoke all on function public.go_irl_claim_due_event_reminders(integer, integer) from public, anon, authenticated;
grant execute on function public.go_irl_claim_due_event_reminders(integer, integer) to service_role;
revoke all on function public.go_irl_claim_due_event_reminders(integer, integer, text[]) from public, anon, authenticated;
grant execute on function public.go_irl_claim_due_event_reminders(integer, integer, text[]) to service_role;
revoke all on function public.go_irl_claim_event_notifications(text[], integer, integer) from public, anon, authenticated;
grant execute on function public.go_irl_claim_event_notifications(text[], integer, integer) to service_role;
revoke all on function public.go_irl_finish_event_reminder(uuid, text, text, timestamptz) from public, anon, authenticated;
grant execute on function public.go_irl_finish_event_reminder(uuid, text, text, timestamptz) to service_role;
revoke all on function public.go_irl_finish_event_notification(uuid, text, text, timestamptz, text) from public, anon, authenticated;
grant execute on function public.go_irl_finish_event_notification(uuid, text, text, timestamptz, text) to service_role;

notify pgrst, 'reload schema';

commit;
