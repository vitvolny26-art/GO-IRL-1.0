-- BEAUTY007-C: narrow booking RPC and RLS boundary.
-- Repository presence does not apply this migration to production.
-- Apply only after 20260804175500_beauty007_booking_foundation.sql.
-- Frontend wiring, Telegram notifications, rescheduling, manual bookings,
-- retention jobs and production rollout remain out of scope.

create or replace function public.go_irl_can_access_beauty_booking(p_booking_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.beauty_bookings booking
    where booking.id = p_booking_id
      and (
        booking.client_user_key = public.go_irl_auth_user_key()
        or public.go_irl_owns_beauty_profile(booking.profile_id)
      )
  );
$$;

create or replace function public.go_irl_list_public_beauty_availability(
  p_profile_id uuid,
  p_service_id uuid,
  p_from_date date,
  p_to_date date
)
returns table (
  profile_id uuid,
  service_id uuid,
  slot_start timestamptz,
  service_end timestamptz,
  reserved_until timestamptz,
  timezone text,
  duration_minutes integer,
  buffer_minutes integer
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if p_profile_id is null or p_service_id is null
    or p_from_date is null or p_to_date is null then
    raise exception 'profile, service and date range are required' using errcode = '22023';
  end if;

  if p_to_date < p_from_date or p_to_date - p_from_date > 31 then
    raise exception 'Beauty availability range must be between 0 and 31 days' using errcode = '22023';
  end if;

  return query
  with selected_service as (
    select
      profile.id as profile_id,
      service.id as service_id,
      service.duration_minutes,
      service.buffer_minutes
    from public.beauty_professional_profiles profile
    join public.beauty_professional_services service
      on service.profile_id = profile.id
    where profile.id = p_profile_id
      and profile.publication_state = 'published'
      and profile.city_id = 'olomouc'
      and service.id = p_service_id
      and service.active = true
      and coalesce(service.archived, false) = false
  ),
  candidate_slots as (
    select
      service.profile_id,
      service.service_id,
      slot.slot_start,
      slot.slot_start + make_interval(mins => service.duration_minutes) as service_end,
      slot.slot_start + make_interval(mins => service.duration_minutes + service.buffer_minutes) as reserved_until,
      rule.timezone,
      service.duration_minutes,
      service.buffer_minutes
    from selected_service service
    join lateral generate_series(0, p_to_date - p_from_date) as day_offset on true
    join public.beauty_availability_rules rule
      on rule.profile_id = service.profile_id
      and rule.active = true
      and rule.weekday = extract(isodow from (p_from_date + day_offset))::smallint
    join lateral generate_series(
      ((p_from_date + day_offset)::date + rule.start_time) at time zone rule.timezone,
      (((p_from_date + day_offset)::date + rule.end_time) at time zone rule.timezone)
        - make_interval(mins => service.duration_minutes + service.buffer_minutes),
      make_interval(mins => rule.slot_interval_minutes)
    ) as slot(slot_start) on true
  )
  select
    candidate.profile_id,
    candidate.service_id,
    candidate.slot_start,
    candidate.service_end,
    candidate.reserved_until,
    candidate.timezone,
    candidate.duration_minutes,
    candidate.buffer_minutes
  from candidate_slots candidate
  where candidate.slot_start > now()
    and not exists (
      select 1
      from public.beauty_time_blocks time_block
      where time_block.profile_id = candidate.profile_id
        and time_block.blocked_range && tstzrange(candidate.slot_start, candidate.reserved_until, '[)')
    )
    and not exists (
      select 1
      from public.beauty_bookings booking
      where booking.profile_id = candidate.profile_id
        and booking.status in ('pending', 'confirmed')
        and booking.reserved_range && tstzrange(candidate.slot_start, candidate.reserved_until, '[)')
    )
  order by candidate.slot_start;
end;
$$;

create or replace function public.go_irl_create_beauty_booking(
  p_profile_id uuid,
  p_service_id uuid,
  p_starts_at timestamptz,
  p_client_name text,
  p_client_contact text,
  p_idempotency_key text
)
returns table (
  result text,
  booking_id uuid,
  booking_status text,
  starts_at timestamptz,
  service_ends_at timestamptz,
  reserved_until timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_client_name text := btrim(coalesce(p_client_name, ''));
  v_client_contact text := btrim(coalesce(p_client_contact, ''));
  v_idempotency_key text := btrim(coalesce(p_idempotency_key, ''));
  v_profile record;
  v_existing public.beauty_bookings%rowtype;
  v_booking public.beauty_bookings%rowtype;
  v_service_ends_at timestamptz;
  v_reserved_until timestamptz;
  v_local_start timestamp without time zone;
  v_local_reserved timestamp without time zone;
  v_allowed boolean;
begin
  if v_user_key is null then
    raise exception 'trusted authenticated user required' using errcode = '42501';
  end if;

  if not exists (
    select 1 from public.app_users app_user
    where app_user.user_key = v_user_key
      and app_user.status = 'active'
  ) then
    raise exception 'active GO IRL user required' using errcode = '42501';
  end if;

  if p_profile_id is null or p_service_id is null or p_starts_at is null then
    raise exception 'profile, service and start time are required' using errcode = '22023';
  end if;

  if char_length(v_client_name) not between 1 and 120
    or char_length(v_client_contact) not between 1 and 200 then
    raise exception 'valid client name and contact are required' using errcode = '22023';
  end if;

  if char_length(v_idempotency_key) not between 16 and 160
    or v_idempotency_key !~ '^[A-Za-z0-9._:-]+$' then
    raise exception 'invalid Beauty booking idempotency key' using errcode = '22023';
  end if;

  select *
  into v_existing
  from public.beauty_bookings booking
  where booking.client_user_key = v_user_key
    and booking.idempotency_key = v_idempotency_key;

  if found then
    if v_existing.profile_id <> p_profile_id
      or v_existing.service_id <> p_service_id
      or v_existing.starts_at <> p_starts_at then
      raise exception 'idempotency key reused with different booking parameters' using errcode = '22023';
    end if;

    return query
    select
      'existing'::text,
      v_existing.id,
      v_existing.status,
      v_existing.starts_at,
      v_existing.service_ends_at,
      v_existing.reserved_until,
      v_existing.updated_at;
    return;
  end if;

  select
    profile.id as profile_id,
    profile.public_location,
    profile.exact_address,
    service.id as service_id,
    service.service_name,
    service.service_name_i18n,
    service.duration_minutes,
    service.buffer_minutes,
    service.price_czk,
    service.currency
  into v_profile
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service
    on service.profile_id = profile.id
  where profile.id = p_profile_id
    and profile.publication_state = 'published'
    and profile.city_id = 'olomouc'
    and service.id = p_service_id
    and service.active = true
    and coalesce(service.archived, false) = false;

  if not found then
    return query
    select 'service_unavailable'::text, null::uuid, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::timestamptz;
    return;
  end if;

  if p_starts_at <= now() then
    return query
    select 'slot_unavailable'::text, null::uuid, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::timestamptz;
    return;
  end if;

  v_service_ends_at := p_starts_at + make_interval(mins => v_profile.duration_minutes);
  v_reserved_until := v_service_ends_at + make_interval(mins => v_profile.buffer_minutes);
  v_local_start := p_starts_at at time zone 'Europe/Prague';
  v_local_reserved := v_reserved_until at time zone 'Europe/Prague';

  select exists (
    select 1
    from public.beauty_availability_rules rule
    where rule.profile_id = p_profile_id
      and rule.active = true
      and rule.timezone = 'Europe/Prague'
      and rule.weekday = extract(isodow from v_local_start)::smallint
      and v_local_start::date = v_local_reserved::date
      and v_local_start::time >= rule.start_time
      and v_local_reserved::time <= rule.end_time
      and mod(
        extract(epoch from (v_local_start::time - rule.start_time))::bigint,
        rule.slot_interval_minutes::bigint * 60
      ) = 0
  ) into v_allowed;

  if not v_allowed then
    return query
    select 'slot_unavailable'::text, null::uuid, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::timestamptz;
    return;
  end if;

  if exists (
    select 1
    from public.beauty_time_blocks time_block
    where time_block.profile_id = p_profile_id
      and time_block.blocked_range && tstzrange(p_starts_at, v_reserved_until, '[)')
  ) then
    return query
    select 'slot_blocked'::text, null::uuid, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::timestamptz;
    return;
  end if;

  begin
    insert into public.beauty_bookings (
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
    )
    values (
      p_profile_id,
      p_service_id,
      v_user_key,
      'pending',
      p_starts_at,
      v_service_ends_at,
      v_reserved_until,
      v_client_name,
      v_client_contact,
      case
        when jsonb_typeof(v_profile.service_name_i18n) = 'object' then v_profile.service_name_i18n
        else jsonb_build_object('en', v_profile.service_name)
      end,
      v_profile.duration_minutes,
      v_profile.buffer_minutes,
      v_profile.price_czk,
      v_profile.currency,
      v_profile.public_location,
      v_profile.exact_address,
      v_idempotency_key
    )
    returning * into v_booking;
  exception
    when exclusion_violation then
      return query
      select 'slot_taken'::text, null::uuid, null::text, null::timestamptz, null::timestamptz, null::timestamptz, null::timestamptz;
      return;
    when unique_violation then
      select *
      into v_existing
      from public.beauty_bookings booking
      where booking.client_user_key = v_user_key
        and booking.idempotency_key = v_idempotency_key;

      if found
        and v_existing.profile_id = p_profile_id
        and v_existing.service_id = p_service_id
        and v_existing.starts_at = p_starts_at then
        return query
        select
          'existing'::text,
          v_existing.id,
          v_existing.status,
          v_existing.starts_at,
          v_existing.service_ends_at,
          v_existing.reserved_until,
          v_existing.updated_at;
        return;
      end if;

      raise;
  end;

  insert into public.beauty_booking_events (
    booking_id,
    event_type,
    actor_user_key,
    from_status,
    to_status,
    payload,
    deduplication_key
  )
  values (
    v_booking.id,
    'booking_created',
    v_user_key,
    null,
    'pending',
    jsonb_build_object('source', 'client_rpc'),
    'beauty-booking:' || v_booking.id::text || ':created'
  );

  return query
  select
    'created'::text,
    v_booking.id,
    v_booking.status,
    v_booking.starts_at,
    v_booking.service_ends_at,
    v_booking.reserved_until,
    v_booking.updated_at;
end;
$$;

create or replace function public.go_irl_list_my_beauty_bookings(p_limit integer default 50)
returns table (
  booking_id uuid,
  profile_id uuid,
  service_id uuid,
  booking_status text,
  starts_at timestamptz,
  service_ends_at timestamptz,
  reserved_until timestamptz,
  service_name jsonb,
  duration_minutes integer,
  buffer_minutes integer,
  price_czk integer,
  currency text,
  public_location text,
  exact_address text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_limit integer := least(greatest(coalesce(p_limit, 50), 1), 100);
begin
  if v_user_key is null then
    raise exception 'trusted authenticated user required' using errcode = '42501';
  end if;

  return query
  select
    booking.id,
    booking.profile_id,
    booking.service_id,
    booking.status,
    booking.starts_at,
    booking.service_ends_at,
    booking.reserved_until,
    booking.service_name_snapshot,
    booking.duration_minutes_snapshot,
    booking.buffer_minutes_snapshot,
    booking.price_czk_snapshot,
    booking.currency,
    booking.public_location_snapshot,
    case when booking.status in ('confirmed', 'completed') then booking.exact_address_snapshot else null end,
    booking.created_at,
    booking.updated_at
  from public.beauty_bookings booking
  where booking.client_user_key = v_user_key
  order by booking.starts_at desc, booking.created_at desc
  limit v_limit;
end;
$$;

create or replace function public.go_irl_cancel_my_beauty_booking(
  p_booking_id uuid,
  p_expected_updated_at timestamptz
)
returns table (
  result text,
  booking_id uuid,
  booking_status text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_booking public.beauty_bookings%rowtype;
begin
  if v_user_key is null then
    raise exception 'trusted authenticated user required' using errcode = '42501';
  end if;

  select * into v_booking
  from public.beauty_bookings booking
  where booking.id = p_booking_id
    and booking.client_user_key = v_user_key
  for update;

  if not found then
    return query select 'not_found'::text, null::uuid, null::text, null::timestamptz;
    return;
  end if;

  if p_expected_updated_at is distinct from v_booking.updated_at then
    return query select 'stale'::text, v_booking.id, v_booking.status, v_booking.updated_at;
    return;
  end if;

  if v_booking.status <> 'pending' then
    return query select 'policy_required'::text, v_booking.id, v_booking.status, v_booking.updated_at;
    return;
  end if;

  update public.beauty_bookings booking
  set status = 'cancelled', cancelled_at = now()
  where booking.id = v_booking.id
  returning * into v_booking;

  insert into public.beauty_booking_events (
    booking_id,
    event_type,
    actor_user_key,
    from_status,
    to_status,
    payload,
    deduplication_key
  )
  values (
    v_booking.id,
    'booking_cancelled',
    v_user_key,
    'pending',
    'cancelled',
    jsonb_build_object('source', 'client_rpc'),
    'beauty-booking:' || v_booking.id::text || ':pending:cancelled:' || extract(epoch from p_expected_updated_at)::bigint::text
  );

  return query select 'cancelled'::text, v_booking.id, v_booking.status, v_booking.updated_at;
end;
$$;

create or replace function public.go_irl_list_my_beauty_professional_bookings(
  p_profile_id uuid,
  p_limit integer default 100
)
returns table (
  booking_id uuid,
  profile_id uuid,
  service_id uuid,
  client_user_key text,
  client_name text,
  client_contact text,
  booking_status text,
  starts_at timestamptz,
  service_ends_at timestamptz,
  reserved_until timestamptz,
  service_name jsonb,
  duration_minutes integer,
  buffer_minutes integer,
  price_czk integer,
  currency text,
  public_location text,
  exact_address text,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
declare
  v_limit integer := least(greatest(coalesce(p_limit, 100), 1), 200);
begin
  if not public.go_irl_owns_beauty_profile(p_profile_id) then
    raise exception 'current professional profile ownership required' using errcode = '42501';
  end if;

  return query
  select
    booking.id,
    booking.profile_id,
    booking.service_id,
    booking.client_user_key,
    booking.client_name_snapshot,
    booking.client_contact_snapshot,
    booking.status,
    booking.starts_at,
    booking.service_ends_at,
    booking.reserved_until,
    booking.service_name_snapshot,
    booking.duration_minutes_snapshot,
    booking.buffer_minutes_snapshot,
    booking.price_czk_snapshot,
    booking.currency,
    booking.public_location_snapshot,
    booking.exact_address_snapshot,
    booking.created_at,
    booking.updated_at
  from public.beauty_bookings booking
  where booking.profile_id = p_profile_id
  order by booking.starts_at desc, booking.created_at desc
  limit v_limit;
end;
$$;

create or replace function public.go_irl_transition_beauty_booking(
  p_booking_id uuid,
  p_expected_status text,
  p_expected_updated_at timestamptz,
  p_target_status text
)
returns table (
  result text,
  booking_id uuid,
  booking_status text,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_booking public.beauty_bookings%rowtype;
  v_actor text := public.go_irl_auth_user_key();
  v_allowed boolean := false;
  v_event_type text := 'status_changed';
begin
  if v_actor is null then
    raise exception 'trusted authenticated user required' using errcode = '42501';
  end if;

  select * into v_booking
  from public.beauty_bookings booking
  where booking.id = p_booking_id
  for update;

  if not found then
    return query select 'not_found'::text, null::uuid, null::text, null::timestamptz;
    return;
  end if;

  if not public.go_irl_owns_beauty_profile(v_booking.profile_id) then
    raise exception 'current professional profile ownership required' using errcode = '42501';
  end if;

  if p_expected_status is distinct from v_booking.status
    or p_expected_updated_at is distinct from v_booking.updated_at then
    return query select 'stale'::text, v_booking.id, v_booking.status, v_booking.updated_at;
    return;
  end if;

  v_allowed :=
    (v_booking.status = 'pending' and p_target_status in ('confirmed', 'declined'))
    or (v_booking.status = 'confirmed' and p_target_status in ('cancelled', 'completed', 'no_show'));

  if not v_allowed then
    return query select 'invalid_transition'::text, v_booking.id, v_booking.status, v_booking.updated_at;
    return;
  end if;

  if p_target_status = 'cancelled' then
    v_event_type := 'booking_cancelled';
  end if;

  update public.beauty_bookings booking
  set
    status = p_target_status,
    confirmed_at = case when p_target_status = 'confirmed' then now() else booking.confirmed_at end,
    cancelled_at = case when p_target_status = 'cancelled' then now() else booking.cancelled_at end,
    completed_at = case when p_target_status = 'completed' then now() else booking.completed_at end
  where booking.id = v_booking.id
  returning * into v_booking;

  insert into public.beauty_booking_events (
    booking_id,
    event_type,
    actor_user_key,
    from_status,
    to_status,
    payload,
    deduplication_key
  )
  values (
    v_booking.id,
    v_event_type,
    v_actor,
    p_expected_status,
    p_target_status,
    jsonb_build_object('source', 'professional_rpc'),
    'beauty-booking:' || v_booking.id::text || ':' || p_expected_status || ':' || p_target_status || ':' || extract(epoch from p_expected_updated_at)::bigint::text
  );

  return query select 'changed'::text, v_booking.id, v_booking.status, v_booking.updated_at;
end;
$$;

create or replace function public.go_irl_replace_my_beauty_availability(
  p_profile_id uuid,
  p_rules jsonb
)
returns table (
  result text,
  saved_count integer
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_item jsonb;
  v_weekday integer;
  v_start time without time zone;
  v_end time without time zone;
  v_interval integer;
  v_count integer := 0;
begin
  if not public.go_irl_owns_beauty_profile(p_profile_id) then
    raise exception 'current professional profile ownership required' using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_rules, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_rules, '[]'::jsonb)) > 21 then
    raise exception 'Beauty availability rules must be an array with at most 21 rows' using errcode = '22023';
  end if;

  delete from public.beauty_availability_rules rule
  where rule.profile_id = p_profile_id;

  for v_item in
    select value from jsonb_array_elements(coalesce(p_rules, '[]'::jsonb))
  loop
    v_weekday := (v_item ->> 'weekday')::integer;
    v_start := (v_item ->> 'start_time')::time;
    v_end := (v_item ->> 'end_time')::time;
    v_interval := coalesce((v_item ->> 'slot_interval_minutes')::integer, 30);

    if v_weekday not between 1 and 7
      or v_start >= v_end
      or v_interval not between 5 and 240 then
      raise exception 'invalid Beauty availability rule' using errcode = '22023';
    end if;

    insert into public.beauty_availability_rules (
      profile_id,
      weekday,
      start_time,
      end_time,
      timezone,
      slot_interval_minutes,
      active
    )
    values (
      p_profile_id,
      v_weekday,
      v_start,
      v_end,
      'Europe/Prague',
      v_interval,
      true
    );

    v_count := v_count + 1;
  end loop;

  return query select 'saved'::text, v_count;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'beauty_time_blocks_no_overlap'
      and conrelid = 'public.beauty_time_blocks'::regclass
  ) then
    alter table public.beauty_time_blocks
      add constraint beauty_time_blocks_no_overlap
      exclude using gist (
        profile_id with =,
        blocked_range with &&
      );
  end if;
end;
$$;

create or replace function public.go_irl_create_beauty_time_block(
  p_profile_id uuid,
  p_starts_at timestamptz,
  p_ends_at timestamptz,
  p_private_label text default null
)
returns table (
  result text,
  time_block_id uuid,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_label text := nullif(btrim(coalesce(p_private_label, '')), '');
  v_block public.beauty_time_blocks%rowtype;
begin
  if not public.go_irl_owns_beauty_profile(p_profile_id) then
    raise exception 'current professional profile ownership required' using errcode = '42501';
  end if;

  if p_starts_at is null or p_ends_at is null or p_starts_at >= p_ends_at then
    raise exception 'valid time-block range required' using errcode = '22023';
  end if;

  if v_label is not null and char_length(v_label) > 160 then
    raise exception 'time-block label is too long' using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.beauty_bookings booking
    where booking.profile_id = p_profile_id
      and booking.status in ('pending', 'confirmed')
      and booking.reserved_range && tstzrange(p_starts_at, p_ends_at, '[)')
  ) then
    return query select 'booking_conflict'::text, null::uuid, null::timestamptz;
    return;
  end if;

  begin
    insert into public.beauty_time_blocks (
      profile_id,
      starts_at,
      ends_at,
      private_label,
      created_by_user_key
    )
    values (
      p_profile_id,
      p_starts_at,
      p_ends_at,
      v_label,
      public.go_irl_auth_user_key()
    )
    returning * into v_block;
  exception
    when exclusion_violation then
      return query select 'block_conflict'::text, null::uuid, null::timestamptz;
      return;
  end;

  return query select 'created'::text, v_block.id, v_block.updated_at;
end;
$$;

create or replace function public.go_irl_delete_beauty_time_block(p_time_block_id uuid)
returns table (
  result text,
  time_block_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_profile_id uuid;
begin
  select time_block.profile_id
  into v_profile_id
  from public.beauty_time_blocks time_block
  where time_block.id = p_time_block_id;

  if not found then
    return query select 'not_found'::text, null::uuid;
    return;
  end if;

  if not public.go_irl_owns_beauty_profile(v_profile_id) then
    raise exception 'current professional profile ownership required' using errcode = '42501';
  end if;

  delete from public.beauty_time_blocks time_block
  where time_block.id = p_time_block_id;

  return query select 'deleted'::text, p_time_block_id;
end;
$$;

-- Defense-in-depth RLS policies. Direct table privileges remain revoked;
-- approved clients use the narrow RPC surface above.

drop policy if exists "beauty availability owner read" on public.beauty_availability_rules;
create policy "beauty availability owner read"
on public.beauty_availability_rules for select to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty availability owner write" on public.beauty_availability_rules;
create policy "beauty availability owner write"
on public.beauty_availability_rules for all to authenticated
using (public.go_irl_owns_beauty_profile(profile_id))
with check (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty time blocks owner read" on public.beauty_time_blocks;
create policy "beauty time blocks owner read"
on public.beauty_time_blocks for select to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty time blocks owner write" on public.beauty_time_blocks;
create policy "beauty time blocks owner write"
on public.beauty_time_blocks for all to authenticated
using (public.go_irl_owns_beauty_profile(profile_id))
with check (
  public.go_irl_owns_beauty_profile(profile_id)
  and created_by_user_key = public.go_irl_auth_user_key()
);

drop policy if exists "beauty bookings participant read" on public.beauty_bookings;
create policy "beauty bookings participant read"
on public.beauty_bookings for select to authenticated
using (
  client_user_key = public.go_irl_auth_user_key()
  or public.go_irl_owns_beauty_profile(profile_id)
);

drop policy if exists "beauty booking events participant read" on public.beauty_booking_events;
create policy "beauty booking events participant read"
on public.beauty_booking_events for select to authenticated
using (public.go_irl_can_access_beauty_booking(booking_id));

revoke all on function public.go_irl_can_access_beauty_booking(uuid) from public;
revoke all on function public.go_irl_can_access_beauty_booking(uuid) from anon;
revoke all on function public.go_irl_list_public_beauty_availability(uuid, uuid, date, date) from public;
revoke all on function public.go_irl_create_beauty_booking(uuid, uuid, timestamptz, text, text, text) from public;
revoke all on function public.go_irl_create_beauty_booking(uuid, uuid, timestamptz, text, text, text) from anon;
revoke all on function public.go_irl_list_my_beauty_bookings(integer) from public;
revoke all on function public.go_irl_list_my_beauty_bookings(integer) from anon;
revoke all on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz) from public;
revoke all on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz) from anon;
revoke all on function public.go_irl_list_my_beauty_professional_bookings(uuid, integer) from public;
revoke all on function public.go_irl_list_my_beauty_professional_bookings(uuid, integer) from anon;
revoke all on function public.go_irl_transition_beauty_booking(uuid, text, timestamptz, text) from public;
revoke all on function public.go_irl_transition_beauty_booking(uuid, text, timestamptz, text) from anon;
revoke all on function public.go_irl_replace_my_beauty_availability(uuid, jsonb) from public;
revoke all on function public.go_irl_replace_my_beauty_availability(uuid, jsonb) from anon;
revoke all on function public.go_irl_create_beauty_time_block(uuid, timestamptz, timestamptz, text) from public;
revoke all on function public.go_irl_create_beauty_time_block(uuid, timestamptz, timestamptz, text) from anon;
revoke all on function public.go_irl_delete_beauty_time_block(uuid) from public;
revoke all on function public.go_irl_delete_beauty_time_block(uuid) from anon;

grant execute on function public.go_irl_can_access_beauty_booking(uuid) to authenticated;
grant execute on function public.go_irl_list_public_beauty_availability(uuid, uuid, date, date) to anon, authenticated;
grant execute on function public.go_irl_create_beauty_booking(uuid, uuid, timestamptz, text, text, text) to authenticated;
grant execute on function public.go_irl_list_my_beauty_bookings(integer) to authenticated;
grant execute on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz) to authenticated;
grant execute on function public.go_irl_list_my_beauty_professional_bookings(uuid, integer) to authenticated;
grant execute on function public.go_irl_transition_beauty_booking(uuid, text, timestamptz, text) to authenticated;
grant execute on function public.go_irl_replace_my_beauty_availability(uuid, jsonb) to authenticated;
grant execute on function public.go_irl_create_beauty_time_block(uuid, timestamptz, timestamptz, text) to authenticated;
grant execute on function public.go_irl_delete_beauty_time_block(uuid) to authenticated;

comment on function public.go_irl_create_beauty_booking(uuid, uuid, timestamptz, text, text, text) is
  'Beauty007 transactional client booking creation with server snapshots, idempotency and overlap protection.';
comment on function public.go_irl_transition_beauty_booking(uuid, text, timestamptz, text) is
  'Beauty007 professional-only status transition with ownership and stale-write checks.';

notify pgrst, 'reload schema';
