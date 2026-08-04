-- BEAUTY007-C1 advisor-hardening verification.
-- Run after 20260805002500_beauty007_advisor_hardening.sql.
-- This verification is read-only and transactional.

begin;

do $$
declare
  v_select_policy_count integer;
  v_mutation_policy_count integer;
begin
  if to_regclass('public.beauty_bookings_service_profile_idx') is null then
    raise exception 'Beauty007 service/profile covering index is missing';
  end if;

  if to_regclass('public.beauty_time_blocks_created_by_user_idx') is null then
    raise exception 'Beauty007 time-block creator index is missing';
  end if;

  if to_regclass('public.beauty_time_blocks_range_idx') is not null then
    raise exception 'duplicate Beauty007 time-block GiST index still exists';
  end if;

  if to_regprocedure('public.go_irl_can_access_beauty_booking(uuid)') is not null then
    raise exception 'internal Beauty007 booking-access helper is still publicly exposed';
  end if;

  select count(*)
  into v_select_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename in ('beauty_availability_rules', 'beauty_time_blocks')
    and cmd = 'SELECT';

  if v_select_policy_count <> 2 then
    raise exception 'Beauty007 availability/time-block SELECT policy count is unsafe: %', v_select_policy_count;
  end if;

  if exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename in ('beauty_availability_rules', 'beauty_time_blocks')
      and cmd = 'ALL'
  ) then
    raise exception 'Beauty007 mutation policy still uses ALL and overlaps SELECT';
  end if;

  select count(*)
  into v_mutation_policy_count
  from pg_policies
  where schemaname = 'public'
    and policyname in (
      'beauty availability owner write',
      'beauty availability owner update',
      'beauty availability owner delete',
      'beauty time blocks owner write',
      'beauty time blocks owner update',
      'beauty time blocks owner delete'
    )
    and cmd in ('INSERT', 'UPDATE', 'DELETE');

  if v_mutation_policy_count <> 6 then
    raise exception 'Beauty007 command-specific mutation policy set is incomplete: %', v_mutation_policy_count;
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'beauty_booking_events'
      and policyname = 'beauty booking events participant read'
      and cmd = 'SELECT'
      and qual like '%beauty_bookings%'
  ) then
    raise exception 'Beauty007 booking-event ownership policy was not inlined';
  end if;

  if to_regrole('authenticated') is not null and (
    has_table_privilege('authenticated', 'public.beauty_bookings', 'select')
    or has_table_privilege('authenticated', 'public.beauty_bookings', 'insert')
    or has_table_privilege('authenticated', 'public.beauty_bookings', 'update')
    or has_table_privilege('authenticated', 'public.beauty_booking_events', 'select')
  ) then
    raise exception 'Beauty007 direct table privileges were reopened';
  end if;
end;
$$;

rollback;
