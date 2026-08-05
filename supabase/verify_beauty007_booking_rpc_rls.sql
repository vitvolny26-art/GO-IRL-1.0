-- BEAUTY007-C repository verification.
-- Run only after applying the Beauty007-B and Beauty007-C migrations
-- to a disposable or separately approved environment.
-- All fixtures are transactional and rolled back.

begin;

do $$
declare
  v_function text;
  v_policy_count integer;
begin
  foreach v_function in array array[
    'public.go_irl_list_public_beauty_availability(uuid,uuid,date,date)',
    'public.go_irl_create_beauty_booking(uuid,uuid,timestamp with time zone,text,text,text)',
    'public.go_irl_list_my_beauty_bookings(integer)',
    'public.go_irl_cancel_my_beauty_booking(uuid,timestamp with time zone)',
    'public.go_irl_list_my_beauty_professional_bookings(uuid,integer)',
    'public.go_irl_transition_beauty_booking(uuid,text,timestamp with time zone,text)',
    'public.go_irl_replace_my_beauty_availability(uuid,jsonb)',
    'public.go_irl_create_beauty_time_block(uuid,timestamp with time zone,timestamp with time zone,text)',
    'public.go_irl_delete_beauty_time_block(uuid)'
  ] loop
    if to_regprocedure(v_function) is null then
      raise exception 'missing Beauty007-C function: %', v_function;
    end if;
  end loop;

  select count(*)
  into v_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in (
      'beauty_availability_rules',
      'beauty_time_blocks',
      'beauty_bookings',
      'beauty_booking_events'
    )
    and policyname in (
      'beauty availability owner read',
      'beauty availability owner write',
      'beauty time blocks owner read',
      'beauty time blocks owner write',
      'beauty bookings participant read',
      'beauty booking events participant read'
    );

  if v_policy_count <> 6 then
    raise exception 'Beauty007-C RLS policy set is incomplete: %', v_policy_count;
  end if;

  if to_regrole('authenticated') is not null and (
    not has_function_privilege('authenticated', 'public.go_irl_create_beauty_booking(uuid,uuid,timestamp with time zone,text,text,text)', 'execute')
    or not has_function_privilege('authenticated', 'public.go_irl_transition_beauty_booking(uuid,text,timestamp with time zone,text)', 'execute')
    or not has_function_privilege('authenticated', 'public.go_irl_replace_my_beauty_availability(uuid,jsonb)', 'execute')
  ) then
    raise exception 'authenticated Beauty007-C execute grants are incomplete';
  end if;

  if to_regrole('anon') is not null and (
    not has_function_privilege('anon', 'public.go_irl_list_public_beauty_availability(uuid,uuid,date,date)', 'execute')
    or has_function_privilege('anon', 'public.go_irl_create_beauty_booking(uuid,uuid,timestamp with time zone,text,text,text)', 'execute')
  ) then
    raise exception 'Beauty007-C anon grants are unsafe';
  end if;

  if to_regrole('authenticated') is not null and (
    has_table_privilege('authenticated', 'public.beauty_bookings', 'select')
    or has_table_privilege('authenticated', 'public.beauty_bookings', 'insert')
    or has_table_privilege('authenticated', 'public.beauty_bookings', 'update')
    or has_table_privilege('authenticated', 'public.beauty_booking_events', 'select')
  ) then
    raise exception 'authenticated still has direct Beauty007 table privileges';
  end if;
end;
$$;

create temporary table beauty007_c_verify_context (
  professional_user_key text not null,
  client_a_user_key text not null,
  client_b_user_key text not null,
  profile_id uuid not null,
  service_id uuid not null,
  slot_start timestamptz not null,
  booking_id uuid,
  booking_updated_at timestamptz
) on commit drop;

create temporary table beauty007_c_verify_results (
  label text not null,
  result text,
  booking_id uuid,
  booking_status text,
  updated_at timestamptz,
  row_count integer,
  exact_address text
) on commit drop;

grant select, update on beauty007_c_verify_context to authenticated;
grant select, insert on beauty007_c_verify_results to authenticated;

do $$
declare
  v_suffix text := replace(gen_random_uuid()::text, '-', '');
  v_professional text := 'beauty007c-pro-' || v_suffix;
  v_client_a text := 'beauty007c-client-a-' || v_suffix;
  v_client_b text := 'beauty007c-client-b-' || v_suffix;
  v_profile uuid := gen_random_uuid();
  v_service uuid := gen_random_uuid();
  v_slot timestamptz := ((current_date + 14)::timestamp + time '10:00') at time zone 'Europe/Prague';
begin
  insert into public.app_users (
    id, auth_provider, provider_user_id, user_key, first_name, status
  ) values
    (gen_random_uuid(), 'beauty007c_verify', 'pro-' || v_suffix, v_professional, 'Beauty Pro', 'active'),
    (gen_random_uuid(), 'beauty007c_verify', 'client-a-' || v_suffix, v_client_a, 'Client A', 'active'),
    (gen_random_uuid(), 'beauty007c_verify', 'client-b-' || v_suffix, v_client_b, 'Client B', 'active');

  insert into public.user_roles (user_key, role, note)
  values (v_professional, 'professional', 'Beauty007-C verification')
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
    'Beauty007 C Verify',
    'Olomouc centrum',
    '@beauty007c_verify',
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
    'beauty007c-service',
    'Beauty007 C service',
    jsonb_build_object('en', 'Beauty007 C service'),
    60,
    1200,
    15,
    'CZK',
    true,
    0,
    false
  );

  insert into beauty007_c_verify_context (
    professional_user_key,
    client_a_user_key,
    client_b_user_key,
    profile_id,
    service_id,
    slot_start
  ) values (
    v_professional,
    v_client_a,
    v_client_b,
    v_profile,
    v_service,
    v_slot
  );
end;
$$;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'go_irl_user_key', (select professional_user_key from beauty007_c_verify_context)
  )::text,
  true
);

insert into beauty007_c_verify_results (label, result, row_count)
select 'availability_saved', result, saved_count
from public.go_irl_replace_my_beauty_availability(
  (select profile_id from beauty007_c_verify_context),
  jsonb_build_array(jsonb_build_object(
    'weekday', extract(isodow from ((select slot_start from beauty007_c_verify_context) at time zone 'Europe/Prague'))::integer,
    'start_time', '09:00',
    'end_time', '17:00',
    'slot_interval_minutes', 30
  ))
);

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'go_irl_user_key', (select client_a_user_key from beauty007_c_verify_context)
  )::text,
  true
);

insert into beauty007_c_verify_results (label, result, booking_id, booking_status, updated_at)
select 'client_a_create', result, booking_id, booking_status, updated_at
from public.go_irl_create_beauty_booking(
  (select profile_id from beauty007_c_verify_context),
  (select service_id from beauty007_c_verify_context),
  (select slot_start from beauty007_c_verify_context),
  'Client A',
  '@client_a',
  'beauty007c-client-a-primary'
);

update beauty007_c_verify_context context
set
  booking_id = result.booking_id,
  booking_updated_at = result.updated_at
from beauty007_c_verify_results result
where result.label = 'client_a_create';

insert into beauty007_c_verify_results (label, result, booking_id, booking_status, updated_at)
select 'client_a_retry', result, booking_id, booking_status, updated_at
from public.go_irl_create_beauty_booking(
  (select profile_id from beauty007_c_verify_context),
  (select service_id from beauty007_c_verify_context),
  (select slot_start from beauty007_c_verify_context),
  'Client A',
  '@client_a',
  'beauty007c-client-a-primary'
);

insert into beauty007_c_verify_results (label, row_count, exact_address)
select 'client_a_pending_projection', count(*)::integer, max(exact_address)
from public.go_irl_list_my_beauty_bookings(50)
where booking_id = (select booking_id from beauty007_c_verify_context);

do $$
begin
  begin
    perform 1 from public.beauty_bookings;
    raise exception 'authenticated direct booking read unexpectedly succeeded';
  exception
    when insufficient_privilege then null;
  end;

  begin
    perform *
    from public.go_irl_transition_beauty_booking(
      (select booking_id from beauty007_c_verify_context),
      'pending',
      (select booking_updated_at from beauty007_c_verify_context),
      'confirmed'
    );
    raise exception 'ordinary client unexpectedly used professional transition RPC';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'go_irl_user_key', (select client_b_user_key from beauty007_c_verify_context)
  )::text,
  true
);

insert into beauty007_c_verify_results (label, result, booking_id, booking_status, updated_at)
select 'client_b_overlap', result, booking_id, booking_status, updated_at
from public.go_irl_create_beauty_booking(
  (select profile_id from beauty007_c_verify_context),
  (select service_id from beauty007_c_verify_context),
  (select slot_start from beauty007_c_verify_context),
  'Client B',
  '@client_b',
  'beauty007c-client-b-primary'
);

insert into beauty007_c_verify_results (label, row_count)
select 'client_b_projection', count(*)::integer
from public.go_irl_list_my_beauty_bookings(50);

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'go_irl_user_key', (select professional_user_key from beauty007_c_verify_context)
  )::text,
  true
);

insert into beauty007_c_verify_results (label, row_count)
select 'professional_projection', count(*)::integer
from public.go_irl_list_my_beauty_professional_bookings(
  (select profile_id from beauty007_c_verify_context),
  100
)
where booking_id = (select booking_id from beauty007_c_verify_context);

insert into beauty007_c_verify_results (label, result, booking_id, booking_status, updated_at)
select 'professional_confirm', result, booking_id, booking_status, updated_at
from public.go_irl_transition_beauty_booking(
  (select booking_id from beauty007_c_verify_context),
  'pending',
  (select booking_updated_at from beauty007_c_verify_context),
  'confirmed'
);

update beauty007_c_verify_context context
set booking_updated_at = result.updated_at
from beauty007_c_verify_results result
where result.label = 'professional_confirm';

reset role;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'go_irl_user_key', (select client_a_user_key from beauty007_c_verify_context)
  )::text,
  true
);

insert into beauty007_c_verify_results (label, row_count, exact_address)
select 'client_a_confirmed_projection', count(*)::integer, max(exact_address)
from public.go_irl_list_my_beauty_bookings(50)
where booking_id = (select booking_id from beauty007_c_verify_context);

reset role;

update public.user_roles
set role = 'user'
where user_key = (select professional_user_key from beauty007_c_verify_context);

set local role authenticated;
select set_config(
  'request.jwt.claims',
  json_build_object(
    'role', 'authenticated',
    'go_irl_user_key', (select professional_user_key from beauty007_c_verify_context)
  )::text,
  true
);

do $$
begin
  begin
    perform *
    from public.go_irl_list_my_beauty_professional_bookings(
      (select profile_id from beauty007_c_verify_context),
      100
    );
    raise exception 'removed professional role unexpectedly retained booking access';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

reset role;

do $$
declare
  v_result beauty007_c_verify_results%rowtype;
begin
  select * into v_result from beauty007_c_verify_results where label = 'availability_saved';
  if v_result.result <> 'saved' or v_result.row_count <> 1 then
    raise exception 'availability RPC verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'client_a_create';
  if v_result.result <> 'created' or v_result.booking_id is null or v_result.booking_status <> 'pending' then
    raise exception 'client booking creation verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'client_a_retry';
  if v_result.result <> 'existing'
    or v_result.booking_id <> (select booking_id from beauty007_c_verify_context) then
    raise exception 'idempotent retry verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'client_b_overlap';
  if v_result.result <> 'slot_taken' or v_result.booking_id is not null then
    raise exception 'cross-client overlap verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'client_b_projection';
  if v_result.row_count <> 0 then
    raise exception 'client isolation verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'professional_projection';
  if v_result.row_count <> 1 then
    raise exception 'professional projection verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'professional_confirm';
  if v_result.result <> 'changed' or v_result.booking_status <> 'confirmed' then
    raise exception 'professional transition verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'client_a_pending_projection';
  if v_result.row_count <> 1 or v_result.exact_address is not null then
    raise exception 'pending exact-address privacy verification failed';
  end if;

  select * into v_result from beauty007_c_verify_results where label = 'client_a_confirmed_projection';
  if v_result.row_count <> 1 or v_result.exact_address is null then
    raise exception 'confirmed exact-address projection verification failed';
  end if;
end;
$$;

rollback;
