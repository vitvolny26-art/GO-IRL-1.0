-- BEAUTY007-B repository verification.
-- Run only after applying 20260804175500_beauty007_booking_foundation.sql to a disposable or approved environment.
-- The script rolls back all fixture rows.

begin;

do $$
begin
  if to_regclass('public.beauty_availability_rules') is null
    or to_regclass('public.beauty_time_blocks') is null
    or to_regclass('public.beauty_bookings') is null
    or to_regclass('public.beauty_booking_events') is null then
    raise exception 'Beauty007 tables are missing';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'beauty_bookings_no_active_overlap'
      and conrelid = 'public.beauty_bookings'::regclass
      and contype = 'x'
  ) then
    raise exception 'Beauty007 active booking overlap exclusion constraint is missing';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and tablename = 'beauty_bookings'
      and indexname = 'beauty_bookings_client_idempotency_idx'
  ) then
    raise exception 'Beauty007 idempotency index is missing';
  end if;

  if exists (
    select 1
    from pg_class relation
    join pg_namespace namespace on namespace.oid = relation.relnamespace
    where namespace.nspname = 'public'
      and relation.relname in (
        'beauty_availability_rules',
        'beauty_time_blocks',
        'beauty_bookings',
        'beauty_booking_events'
      )
      and relation.relrowsecurity = false
  ) then
    raise exception 'Beauty007 RLS is not enabled on every table';
  end if;

  if to_regrole('anon') is not null and (
    has_table_privilege('anon', 'public.beauty_availability_rules', 'select')
    or has_table_privilege('anon', 'public.beauty_time_blocks', 'select')
    or has_table_privilege('anon', 'public.beauty_bookings', 'select')
    or has_table_privilege('anon', 'public.beauty_booking_events', 'select')
  ) then
    raise exception 'anon unexpectedly has direct Beauty007 table access';
  end if;

  if to_regrole('authenticated') is not null and (
    has_table_privilege('authenticated', 'public.beauty_availability_rules', 'select')
    or has_table_privilege('authenticated', 'public.beauty_time_blocks', 'select')
    or has_table_privilege('authenticated', 'public.beauty_bookings', 'select')
    or has_table_privilege('authenticated', 'public.beauty_booking_events', 'select')
  ) then
    raise exception 'authenticated unexpectedly has direct Beauty007 table access';
  end if;
end;
$$;

do $$
declare
  v_suffix text := replace(gen_random_uuid()::text, '-', '');
  v_user_key text := 'beauty007-verify-' || replace(gen_random_uuid()::text, '-', '');
  v_profile_id uuid := gen_random_uuid();
  v_service_id uuid := gen_random_uuid();
  v_booking_id uuid := gen_random_uuid();
  v_overlap_blocked boolean := false;
  v_duplicate_blocked boolean := false;
begin
  insert into public.app_users (
    id,
    auth_provider,
    provider_user_id,
    user_key,
    first_name,
    status
  )
  values (
    gen_random_uuid(),
    'beauty007_verify',
    v_suffix,
    v_user_key,
    'Beauty007 Verify',
    'active'
  );

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
  )
  values (
    v_profile_id,
    v_user_key,
    'beauty-' || substring(md5(v_user_key) from 1 for 16),
    'olomouc',
    'Beauty007 Verify',
    'Olomouc centrum',
    '@beauty007_verify',
    'Horní náměstí 1, Olomouc',
    'draft'
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
  )
  values (
    v_service_id,
    v_profile_id,
    'beauty007-verify-service',
    'Beauty007 service',
    jsonb_build_object('en', 'Beauty007 service'),
    60,
    1000,
    15,
    'CZK',
    true,
    0,
    false
  );

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
    v_profile_id,
    1,
    '09:00',
    '17:00',
    'Europe/Prague',
    30,
    true
  );

  insert into public.beauty_time_blocks (
    profile_id,
    starts_at,
    ends_at,
    private_label,
    created_by_user_key
  )
  values (
    v_profile_id,
    '2030-01-07 12:00:00+01',
    '2030-01-07 13:00:00+01',
    'Private verification block',
    v_user_key
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
  )
  values (
    v_booking_id,
    v_profile_id,
    v_service_id,
    v_user_key,
    'pending',
    '2030-01-07 09:00:00+01',
    '2030-01-07 10:00:00+01',
    '2030-01-07 10:15:00+01',
    'Beauty007 Client',
    '@beauty007_client',
    jsonb_build_object('en', 'Beauty007 service'),
    60,
    15,
    1000,
    'CZK',
    'Olomouc centrum',
    'Horní náměstí 1, Olomouc',
    'beauty007-idempotency-primary'
  );

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
      v_profile_id,
      v_service_id,
      v_user_key,
      'pending',
      '2030-01-07 09:30:00+01',
      '2030-01-07 10:30:00+01',
      '2030-01-07 10:45:00+01',
      'Beauty007 Client',
      '@beauty007_client',
      jsonb_build_object('en', 'Beauty007 service'),
      60,
      15,
      1000,
      'CZK',
      'Olomouc centrum',
      'Horní náměstí 1, Olomouc',
      'beauty007-idempotency-overlap'
    );
  exception
    when exclusion_violation then
      v_overlap_blocked := true;
  end;

  if not v_overlap_blocked then
    raise exception 'Beauty007 overlapping active booking was not rejected';
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
      v_profile_id,
      v_service_id,
      v_user_key,
      'pending',
      '2030-01-07 14:00:00+01',
      '2030-01-07 15:00:00+01',
      '2030-01-07 15:15:00+01',
      'Beauty007 Client',
      '@beauty007_client',
      jsonb_build_object('en', 'Beauty007 service'),
      60,
      15,
      1000,
      'CZK',
      'Olomouc centrum',
      'Horní náměstí 1, Olomouc',
      'beauty007-idempotency-primary'
    );
  exception
    when unique_violation then
      v_duplicate_blocked := true;
  end;

  if not v_duplicate_blocked then
    raise exception 'Beauty007 duplicate idempotency key was not rejected';
  end if;

  update public.beauty_bookings
  set status = 'cancelled', cancelled_at = now()
  where id = v_booking_id;

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
    v_profile_id,
    v_service_id,
    v_user_key,
    'pending',
    '2030-01-07 09:00:00+01',
    '2030-01-07 10:00:00+01',
    '2030-01-07 10:15:00+01',
    'Beauty007 Client',
    '@beauty007_client',
    jsonb_build_object('en', 'Beauty007 service'),
    60,
    15,
    1000,
    'CZK',
    'Olomouc centrum',
    'Horní náměstí 1, Olomouc',
    'beauty007-idempotency-after-release'
  );

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
    v_booking_id,
    'status_changed',
    v_user_key,
    'pending',
    'cancelled',
    jsonb_build_object('source', 'verification'),
    'beauty007-event-' || replace(gen_random_uuid()::text, '-', '')
  );
end;
$$;

rollback;
