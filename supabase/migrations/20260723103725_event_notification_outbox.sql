begin;

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

create or replace function public.go_irl_event_snapshot(p_activity public.activities)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select jsonb_build_object(
    'eventId', p_activity.id,
    'title', jsonb_build_object('ru', p_activity.title_ru, 'cs', p_activity.title_cs),
    'activity', jsonb_build_object('ru', p_activity.activity_ru, 'cs', p_activity.activity_cs),
    'date', p_activity.event_date,
    'time', p_activity.event_time,
    'address', p_activity.address,
    'locationUrl', p_activity.location_url,
    'cityId', p_activity.city_id
  );
$$;

revoke execute on function public.go_irl_event_snapshot(public.activities)
from public, anon, authenticated;

create or replace function public.go_irl_queue_member_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_kind text;
begin
  if tg_op = 'UPDATE' and new.status is not distinct from old.status then
    return new;
  end if;

  select activity.* into v_activity
  from public.activities activity
  where activity.id = new.activity_id;

  if not found then
    return new;
  end if;

  v_kind := case
    when tg_op = 'UPDATE' and old.status = 'pending' and new.status = 'joined'
      then 'request_approved'
    when new.status = 'joined' then 'join_confirmed'
    when new.status = 'pending' then 'join_pending'
    when new.status = 'waiting' then 'join_waitlisted'
    else null
  end;

  if v_kind is null then
    return new;
  end if;

  insert into public.event_notifications (
    user_key, activity_id, kind, payload, delivery_key
  ) values (
    new.user_key,
    new.activity_id,
    v_kind,
    public.go_irl_event_snapshot(v_activity)
      || jsonb_build_object('memberStatus', new.status),
    'member:' || new.activity_id::text || ':' || new.user_key || ':'
      || v_kind || ':' || txid_current()::text
  )
  on conflict (delivery_key) do nothing;

  return new;
end;
$$;

revoke execute on function public.go_irl_queue_member_notification()
from public, anon, authenticated;

drop trigger if exists activity_members_queue_notification on public.activity_members;
create trigger activity_members_queue_notification
after insert or update of status on public.activity_members
for each row execute function public.go_irl_queue_member_notification();

create or replace function public.go_irl_review_join_request(
  p_activity_id uuid,
  p_member_user_key text,
  p_approved boolean
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_activity public.activities%rowtype;
  v_status text;
begin
  select activity.* into v_activity
  from public.activities activity
  where activity.id = p_activity_id
  for update;

  if not found then raise exception 'event_not_found'; end if;
  if v_activity.organizer_key <> public.go_irl_auth_user_key() then
    raise exception 'organizer_required';
  end if;
  if not exists (
    select 1 from public.activity_members member
    where member.activity_id = p_activity_id
      and member.user_key = p_member_user_key
      and member.status = 'pending'
  ) then
    raise exception 'pending_request_not_found';
  end if;

  if p_approved then
    v_status := case when (
      select count(*) from public.activity_members member
      where member.activity_id = p_activity_id and member.status = 'joined'
    ) >= v_activity.capacity then 'waiting' else 'joined' end;
    update public.activity_members
    set status = v_status
    where activity_id = p_activity_id and user_key = p_member_user_key;
    return v_status;
  end if;

  insert into public.event_notifications (
    user_key, activity_id, kind, payload, delivery_key
  ) values (
    p_member_user_key,
    p_activity_id,
    'request_rejected',
    public.go_irl_event_snapshot(v_activity),
    'member:' || p_activity_id::text || ':' || p_member_user_key
      || ':request_rejected:' || txid_current()::text
  )
  on conflict (delivery_key) do nothing;

  delete from public.activity_members
  where activity_id = p_activity_id and user_key = p_member_user_key;
  return 'rejected';
end;
$$;

revoke all on function public.go_irl_review_join_request(uuid, text, boolean)
from public, anon;
grant execute on function public.go_irl_review_join_request(uuid, text, boolean)
to authenticated;

create or replace function public.go_irl_queue_activity_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_member record;
  v_kind text;
  v_snapshot jsonb;
  v_changed jsonb := '[]'::jsonb;
begin
  if tg_op = 'UPDATE' then
    if new.event_date is not distinct from old.event_date
      and new.event_time is not distinct from old.event_time
      and new.address is not distinct from old.address
      and new.location_url is not distinct from old.location_url
      and new.title_ru is not distinct from old.title_ru
      and new.title_cs is not distinct from old.title_cs then
      return new;
    end if;
    v_kind := 'event_changed';
    v_snapshot := public.go_irl_event_snapshot(new);
    if new.event_date is distinct from old.event_date then v_changed := v_changed || '"date"'::jsonb; end if;
    if new.event_time is distinct from old.event_time then v_changed := v_changed || '"time"'::jsonb; end if;
    if new.address is distinct from old.address or new.location_url is distinct from old.location_url
      then v_changed := v_changed || '"location"'::jsonb; end if;
    if new.title_ru is distinct from old.title_ru or new.title_cs is distinct from old.title_cs
      then v_changed := v_changed || '"title"'::jsonb; end if;
    v_snapshot := v_snapshot || jsonb_build_object('changedFields', v_changed);
  else
    v_kind := 'event_cancelled';
    v_snapshot := public.go_irl_event_snapshot(old);
  end if;

  for v_member in
    select member.user_key
    from public.activity_members member
    where member.activity_id = coalesce(new.id, old.id)
      and member.status in ('joined', 'waiting', 'pending')
  loop
    insert into public.event_notifications (
      user_key, activity_id, kind, payload, delivery_key
    ) values (
      v_member.user_key,
      coalesce(new.id, old.id),
      v_kind,
      v_snapshot,
      'activity:' || coalesce(new.id, old.id)::text || ':' || v_member.user_key
        || ':' || v_kind || ':' || txid_current()::text
    )
    on conflict (delivery_key) do nothing;
  end loop;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke execute on function public.go_irl_queue_activity_notification()
from public, anon, authenticated;

drop trigger if exists activities_queue_changed_notification on public.activities;
create trigger activities_queue_changed_notification
after update of event_date, event_time, address, location_url, title_ru, title_cs
on public.activities
for each row execute function public.go_irl_queue_activity_notification();

drop trigger if exists activities_queue_cancelled_notification on public.activities;
create trigger activities_queue_cancelled_notification
before delete on public.activities
for each row execute function public.go_irl_queue_activity_notification();

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
        linked.last_inbound_at desc nulls last,
        linked.created_at asc
      limit 1
    ) identity on true
    where (
      notification.status in ('scheduled', 'failed')
      and coalesce(notification.next_attempt_at, notification.created_at) <= now()
    ) or (
      notification.status = 'sending'
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

revoke all on function public.go_irl_claim_event_notifications(text[], integer, integer)
from public, anon, authenticated;
grant execute on function public.go_irl_claim_event_notifications(text[], integer, integer)
to service_role;

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
