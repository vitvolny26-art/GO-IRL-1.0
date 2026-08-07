-- Beauty007: allow a client to cancel pending or confirmed bookings until 24 hours before start.

begin;

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
set search_path to 'pg_catalog', 'public'
as $function$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_booking public.beauty_bookings%rowtype;
  v_from_status text;
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

  if v_booking.status not in ('pending', 'confirmed')
    or v_booking.starts_at < now() + interval '24 hours' then
    return query select 'policy_required'::text, v_booking.id, v_booking.status, v_booking.updated_at;
    return;
  end if;

  v_from_status := v_booking.status;

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
  ) values (
    v_booking.id,
    'booking_cancelled',
    v_user_key,
    v_from_status,
    'cancelled',
    jsonb_build_object('source', 'client_rpc', 'policy', 'client_cancel_24h'),
    'beauty-booking:' || v_booking.id::text || ':' || v_from_status || ':cancelled:' || extract(epoch from p_expected_updated_at)::bigint::text
  );

  return query select 'cancelled'::text, v_booking.id, v_booking.status, v_booking.updated_at;
end;
$function$;

revoke all on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz)
from public, anon;
grant execute on function public.go_irl_cancel_my_beauty_booking(uuid, timestamptz)
to authenticated, service_role;

notify pgrst, 'reload schema';

commit;
