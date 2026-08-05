-- BEAUTY007-C1: advisor hardening for the booking RPC/RLS boundary.
-- Repository presence does not apply this migration to production.
-- Apply only after 20260804203000_beauty007_booking_rpc_rls.sql.

create index if not exists beauty_bookings_service_profile_idx
on public.beauty_bookings(service_id, profile_id);

create index if not exists beauty_time_blocks_created_by_user_idx
on public.beauty_time_blocks(created_by_user_key);

-- The exclusion constraint already owns an equivalent GiST index.
drop index if exists public.beauty_time_blocks_range_idx;

-- Keep one SELECT policy per table. Mutation policies are command-specific.
drop policy if exists "beauty availability owner write" on public.beauty_availability_rules;
create policy "beauty availability owner write"
on public.beauty_availability_rules for insert to authenticated
with check (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty availability owner update" on public.beauty_availability_rules;
create policy "beauty availability owner update"
on public.beauty_availability_rules for update to authenticated
using (public.go_irl_owns_beauty_profile(profile_id))
with check (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty availability owner delete" on public.beauty_availability_rules;
create policy "beauty availability owner delete"
on public.beauty_availability_rules for delete to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty time blocks owner write" on public.beauty_time_blocks;
create policy "beauty time blocks owner write"
on public.beauty_time_blocks for insert to authenticated
with check (
  public.go_irl_owns_beauty_profile(profile_id)
  and created_by_user_key = public.go_irl_auth_user_key()
);

drop policy if exists "beauty time blocks owner update" on public.beauty_time_blocks;
create policy "beauty time blocks owner update"
on public.beauty_time_blocks for update to authenticated
using (public.go_irl_owns_beauty_profile(profile_id))
with check (
  public.go_irl_owns_beauty_profile(profile_id)
  and created_by_user_key = public.go_irl_auth_user_key()
);

drop policy if exists "beauty time blocks owner delete" on public.beauty_time_blocks;
create policy "beauty time blocks owner delete"
on public.beauty_time_blocks for delete to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

-- Inline the booking-event ownership predicate so the internal helper is not
-- exposed as a callable public RPC.
drop policy if exists "beauty booking events participant read" on public.beauty_booking_events;
create policy "beauty booking events participant read"
on public.beauty_booking_events for select to authenticated
using (
  exists (
    select 1
    from public.beauty_bookings booking
    where booking.id = beauty_booking_events.booking_id
      and (
        booking.client_user_key = public.go_irl_auth_user_key()
        or public.go_irl_owns_beauty_profile(booking.profile_id)
      )
  )
);

drop function if exists public.go_irl_can_access_beauty_booking(uuid);

comment on policy "beauty availability owner write" on public.beauty_availability_rules is
  'Beauty007 owner-only INSERT policy; UPDATE and DELETE use separate policies.';
comment on policy "beauty time blocks owner write" on public.beauty_time_blocks is
  'Beauty007 owner-only INSERT policy; UPDATE and DELETE use separate policies.';

notify pgrst, 'reload schema';
