-- Rollback-only verifier for the Beauty client 24-hour cancellation policy.

begin;

do $$
declare
  definition text;
begin
  select pg_get_functiondef(
    'public.go_irl_cancel_my_beauty_booking(uuid,timestamptz)'::regprocedure
  ) into definition;

  if definition not like '%v_booking.status not in (''pending'', ''confirmed'')%' then
    raise exception 'pending/confirmed client cancellation policy missing';
  end if;

  if definition not like '%interval ''24 hours''%' then
    raise exception '24-hour cancellation cutoff missing';
  end if;

  if definition not like '%v_from_status := v_booking.status%' then
    raise exception 'dynamic cancellation source status missing';
  end if;

  if has_function_privilege(
    'anon',
    'public.go_irl_cancel_my_beauty_booking(uuid,timestamptz)',
    'execute'
  ) then
    raise exception 'anon can cancel Beauty bookings';
  end if;

  if not has_function_privilege(
    'authenticated',
    'public.go_irl_cancel_my_beauty_booking(uuid,timestamptz)',
    'execute'
  ) then
    raise exception 'authenticated client cannot execute Beauty cancellation RPC';
  end if;
end
$$;

rollback;
