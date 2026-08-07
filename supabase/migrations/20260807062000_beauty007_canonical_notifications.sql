-- BEAUTY007-D4: extend the existing canonical event notification outbox for Beauty bookings.
-- Repository presence does not apply this migration to production.
-- No new notification table or parallel delivery worker is introduced.

begin;

alter table public.event_notifications
  drop constraint if exists event_notifications_kind_check;

alter table public.event_notifications
  add constraint event_notifications_kind_check
  check (kind in (
    'join_confirmed',
    'join_pending',
    'join_waitlisted',
    'request_approved',
    'request_rejected',
    'event_changed',
    'event_cancelled',
    'services.booking_requested',
    'services.booking_confirmed',
    'services.booking_declined',
    'services.booking_cancelled'
  ));

create or replace function public.go_irl_queue_beauty_booking_notification()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_booking public.beauty_bookings%rowtype;
  v_profile public.beauty_professional_profiles%rowtype;
  v_kind text;
  v_recipient_user_key text;
  v_counterpart_name text;
  v_delivery_key text;
begin
  if new.event_type = 'notification_enqueued' then
    return new;
  end if;

  select booking.*
  into v_booking
  from public.beauty_bookings booking
  where booking.id = new.booking_id;

  if not found then
    return new;
  end if;

  select profile.*
  into v_profile
  from public.beauty_professional_profiles profile
  where profile.id = v_booking.profile_id;

  if not found then
    return new;
  end if;

  if new.event_type = 'booking_created' then
    v_kind := 'services.booking_requested';
    v_recipient_user_key := v_profile.owner_user_key;
    v_counterpart_name := v_booking.client_name_snapshot;
  elsif new.event_type = 'status_changed'
    and new.from_status = 'pending'
    and new.to_status = 'confirmed' then
    v_kind := 'services.booking_confirmed';
    v_recipient_user_key := v_booking.client_user_key;
    v_counterpart_name := v_profile.display_name;
  elsif new.event_type = 'status_changed'
    and new.from_status = 'pending'
    and new.to_status = 'declined' then
    v_kind := 'services.booking_declined';
    v_recipient_user_key := v_booking.client_user_key;
    v_counterpart_name := v_profile.display_name;
  elsif new.event_type = 'booking_cancelled' then
    v_kind := 'services.booking_cancelled';
    if new.actor_user_key = v_booking.client_user_key then
      v_recipient_user_key := v_profile.owner_user_key;
      v_counterpart_name := v_booking.client_name_snapshot;
    else
      v_recipient_user_key := v_booking.client_user_key;
      v_counterpart_name := v_profile.display_name;
    end if;
  else
    return new;
  end if;

  if v_recipient_user_key is null then
    return new;
  end if;

  v_delivery_key := 'beauty:' || new.id::text || ':' || v_recipient_user_key || ':' || v_kind;

  insert into public.event_notifications (
    user_key,
    activity_id,
    kind,
    payload,
    provider,
    delivery_key
  ) values (
    v_recipient_user_key,
    null,
    v_kind,
    jsonb_build_object(
      'subjectType', 'beauty_booking',
      'bookingId', v_booking.id,
      'title', v_booking.service_name_snapshot,
      'date', to_char(v_booking.starts_at at time zone 'Europe/Prague', 'YYYY-MM-DD'),
      'time', to_char(v_booking.starts_at at time zone 'Europe/Prague', 'HH24:MI:SS'),
      'address', v_booking.public_location_snapshot,
      'counterpartName', v_counterpart_name,
      'bookingStatus', coalesce(new.to_status, v_booking.status),
      'sourceEventId', new.id,
      'openPath', '/services'
    ),
    'telegram',
    v_delivery_key
  )
  on conflict (delivery_key) do nothing;

  return new;
end;
$$;

revoke execute on function public.go_irl_queue_beauty_booking_notification()
from public, anon, authenticated;

drop trigger if exists beauty_booking_events_queue_notification
on public.beauty_booking_events;

create trigger beauty_booking_events_queue_notification
after insert on public.beauty_booking_events
for each row
execute function public.go_irl_queue_beauty_booking_notification();

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
        and (notification.provider is null or linked.provider = notification.provider)
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

notify pgrst, 'reload schema';

commit;
