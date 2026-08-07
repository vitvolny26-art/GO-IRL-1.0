-- BEAUTY007-D4 repository verification.
-- Run only after applying 20260807062000_beauty007_canonical_notifications.sql
-- to a disposable or separately approved environment.
-- All fixtures are transactional and rolled back.

begin;

do $$
declare
  v_constraint text;
  v_claim_definition text;
  v_trigger_count integer;
begin
  select pg_get_constraintdef(constraint_row.oid)
  into v_constraint
  from pg_constraint constraint_row
  where constraint_row.conrelid = 'public.event_notifications'::regclass
    and constraint_row.conname = 'event_notifications_kind_check';

  if v_constraint is null
    or position('services.booking_requested' in v_constraint) = 0
    or position('services.booking_confirmed' in v_constraint) = 0
    or position('services.booking_declined' in v_constraint) = 0
    or position('services.booking_cancelled' in v_constraint) = 0 then
    raise exception 'Beauty007-D4 notification kinds are missing from canonical outbox constraint';
  end if;

  if to_regprocedure('public.go_irl_queue_beauty_booking_notification()') is null then
    raise exception 'Beauty007-D4 producer function is missing';
  end if;

  select count(*)
  into v_trigger_count
  from pg_trigger trigger_row
  where trigger_row.tgrelid = 'public.beauty_booking_events'::regclass
    and trigger_row.tgname = 'beauty_booking_events_queue_notification'
    and not trigger_row.tgisinternal;

  if v_trigger_count <> 1 then
    raise exception 'Beauty007-D4 producer trigger count is invalid: %', v_trigger_count;
  end if;

  select pg_get_functiondef('public.go_irl_claim_event_notifications(text[],integer,integer)'::regprocedure)
  into v_claim_definition;

  if position('(notification.provider is null or linked.provider = notification.provider)' in lower(v_claim_definition)) = 0 then
    raise exception 'canonical claim function does not respect a preselected provider';
  end if;

  if to_regrole('authenticated') is not null
    and has_function_privilege(
      'authenticated',
      'public.go_irl_queue_beauty_booking_notification()',
      'execute'
    ) then
    raise exception 'authenticated must not execute the Beauty notification producer directly';
  end if;
end;
$$;

create temporary table beauty007_d4_verify_context (
  professional_user_key text not null,
  client_user_key text not null,
  profile_id uuid not null,
  service_id uuid not null,
  booking_id uuid not null
) on commit drop;

do $$
declare
  v_suffix text := replace(gen_random_uuid()::text, '-', '');
  v_professional text := 'beauty007d4-pro-' || v_suffix;
  v_client text := 'beauty007d4-client-' || v_suffix;
  v_profile uuid := gen_random_uuid();
  v_service uuid := gen_random_uuid();
  v_booking uuid := gen_random_uuid();
  v_starts_at timestamptz := ((current_date + 21)::timestamp + time '10:00') at time zone 'Europe/Prague';
begin
  insert into public.app_users (
    id, auth_provider, provider_user_id, user_key, first_name, status
  ) values
    (gen_random_uuid(), 'telegram', 'pro-' || v_suffix, v_professional, 'Beauty Pro', 'active'),
    (gen_random_uuid(), 'telegram', 'client-' || v_suffix, v_client, 'Beauty Client', 'active');

  insert into public.user_roles (user_key, role, note)
  values (v_professional, 'professional', 'Beauty007-D4 verification')
  on conflict (user_key) do update set role = excluded.role, note = excluded.note;

  insert into public.beauty_professional_profiles (
    id,
    owner_user_key,
    slug,
    city_id,
    display_name,
    public_location,
    contact,
    exact_address,
    publication_state
  ) values (
    v_profile,
    v_professional,
    'beauty-' || substring(md5(v_professional) from 1 for 16),
    'olomouc',
    'Beauty007 D4 Verify',
    'Olomouc centrum',
    '@beauty007d4_verify',
    'Horní náměstí 1, Olomouc',
    'published'
  );

  insert into public.beauty_professional_services (
    id,
    profile_id,
    client_key,
    service_name,
    service_name_i18n,
    duration_minutes,
    price_czk,
    buffer_minutes,
    currency,
    active,
    sort_order,
    archived
  ) values (
    v_service,
    v_profile,
    'beauty007d4-service',
    'Beauty007 D4 service',
    jsonb_build_object('en', 'Beauty007 D4 service', 'cs', 'Beauty007 D4 služba'),
    60,
    1200,
    15,
    'CZK',
    true,
    0,
    false
  );

  insert into public.beauty_bookings (
    id,
    profile_id,
    service_id,
    client_user_key,
    status,
    starts_at,
    service_ends_at,
    reserved_until,
    client_name_snapshot,
    client_contact_snapshot,
    service_name_snapshot,
    duration_minutes_snapshot,
    buffer_minutes_snapshot,
    price_czk_snapshot,
    currency,
    public_location_snapshot,
    exact_address_snapshot,
    idempotency_key
  ) values (
    v_booking,
    v_profile,
    v_service,
    v_client,
    'pending',
    v_starts_at,
    v_starts_at + interval '60 minutes',
    v_starts_at + interval '75 minutes',
    'Beauty Client',
    '@beauty_client',
    jsonb_build_object('en', 'Beauty007 D4 service', 'cs', 'Beauty007 D4 služba'),
    60,
    15,
    1200,
    'CZK',
    'Olomouc centrum',
    'Horní náměstí 1, Olomouc',
    'beauty007d4-client-primary'
  );

  insert into beauty007_d4_verify_context (
    professional_user_key,
    client_user_key,
    profile_id,
    service_id,
    booking_id
  ) values (
    v_professional,
    v_client,
    v_profile,
    v_service,
    v_booking
  );
end;
$$;

insert into public.beauty_booking_events (
  id, booking_id, event_type, actor_user_key, from_status, to_status, payload, deduplication_key
)
select
  gen_random_uuid(), booking_id, 'booking_created', client_user_key, null, 'pending',
  jsonb_build_object('source', 'beauty007_d4_verify'),
  'beauty007d4:created:' || booking_id::text
from beauty007_d4_verify_context;

insert into public.beauty_booking_events (
  id, booking_id, event_type, actor_user_key, from_status, to_status, payload, deduplication_key
)
select
  gen_random_uuid(), booking_id, 'status_changed', professional_user_key, 'pending', 'confirmed',
  jsonb_build_object('source', 'beauty007_d4_verify'),
  'beauty007d4:confirmed:' || booking_id::text
from beauty007_d4_verify_context;

insert into public.beauty_booking_events (
  id, booking_id, event_type, actor_user_key, from_status, to_status, payload, deduplication_key
)
select
  gen_random_uuid(), booking_id, 'status_changed', professional_user_key, 'pending', 'declined',
  jsonb_build_object('source', 'beauty007_d4_verify'),
  'beauty007d4:declined:' || booking_id::text
from beauty007_d4_verify_context;

insert into public.beauty_booking_events (
  id, booking_id, event_type, actor_user_key, from_status, to_status, payload, deduplication_key
)
select
  gen_random_uuid(), booking_id, 'booking_cancelled', client_user_key, 'pending', 'cancelled',
  jsonb_build_object('source', 'beauty007_d4_verify'),
  'beauty007d4:client-cancelled:' || booking_id::text
from beauty007_d4_verify_context;

insert into public.beauty_booking_events (
  id, booking_id, event_type, actor_user_key, from_status, to_status, payload, deduplication_key
)
select
  gen_random_uuid(), booking_id, 'booking_cancelled', professional_user_key, 'confirmed', 'cancelled',
  jsonb_build_object('source', 'beauty007_d4_verify'),
  'beauty007d4:professional-cancelled:' || booking_id::text
from beauty007_d4_verify_context;

insert into public.beauty_booking_events (
  id, booking_id, event_type, actor_user_key, from_status, to_status, payload, deduplication_key
)
select
  gen_random_uuid(), booking_id, 'status_changed', professional_user_key, 'confirmed', 'completed',
  jsonb_build_object('source', 'beauty007_d4_verify'),
  'beauty007d4:completed:' || booking_id::text
from beauty007_d4_verify_context;

do $$
declare
  v_booking uuid := (select booking_id from beauty007_d4_verify_context);
  v_professional text := (select professional_user_key from beauty007_d4_verify_context);
  v_client text := (select client_user_key from beauty007_d4_verify_context);
  v_count integer;
  v_bad_payload_count integer;
  v_duplicate_count integer;
begin
  select count(*)
  into v_count
  from public.event_notifications notification
  where notification.payload ->> 'bookingId' = v_booking::text
    and notification.kind like 'services.booking_%';

  if v_count <> 5 then
    raise exception 'expected 5 Beauty canonical notifications, found %', v_count;
  end if;

  if not exists (
    select 1 from public.event_notifications notification
    where notification.payload ->> 'bookingId' = v_booking::text
      and notification.kind = 'services.booking_requested'
      and notification.user_key = v_professional
      and notification.provider = 'telegram'
      and notification.activity_id is null
  ) then
    raise exception 'booking request was not routed to the professional through Telegram';
  end if;

  if not exists (
    select 1 from public.event_notifications notification
    where notification.payload ->> 'bookingId' = v_booking::text
      and notification.kind = 'services.booking_confirmed'
      and notification.user_key = v_client
  ) then
    raise exception 'booking confirmation was not routed to the client';
  end if;

  if not exists (
    select 1 from public.event_notifications notification
    where notification.payload ->> 'bookingId' = v_booking::text
      and notification.kind = 'services.booking_declined'
      and notification.user_key = v_client
  ) then
    raise exception 'booking decline was not routed to the client';
  end if;

  if (
    select count(*) from public.event_notifications notification
    where notification.payload ->> 'bookingId' = v_booking::text
      and notification.kind = 'services.booking_cancelled'
  ) <> 2 then
    raise exception 'booking cancellation routing is incomplete';
  end if;

  if exists (
    select 1
    from public.event_notifications notification
    where notification.payload ->> 'bookingId' = v_booking::text
      and notification.payload ->> 'bookingStatus' = 'completed'
  ) then
    raise exception 'completed notification was queued before product policy approval';
  end if;

  select count(*)
  into v_bad_payload_count
  from public.event_notifications notification
  where notification.payload ->> 'bookingId' = v_booking::text
    and (
      notification.payload ->> 'subjectType' <> 'beauty_booking'
      or notification.payload ->> 'openPath' <> '/services'
      or notification.payload ? 'exactAddress'
      or notification.payload::text like '%Horní náměstí 1%'
    );

  if v_bad_payload_count <> 0 then
    raise exception 'Beauty notification payload violates canonical or privacy boundary';
  end if;

  select count(*)
  into v_duplicate_count
  from (
    select notification.delivery_key
    from public.event_notifications notification
    where notification.payload ->> 'bookingId' = v_booking::text
    group by notification.delivery_key
    having count(*) > 1
  ) duplicates;

  if v_duplicate_count <> 0 then
    raise exception 'Beauty notification delivery keys are not unique';
  end if;
end;
$$;

rollback;
