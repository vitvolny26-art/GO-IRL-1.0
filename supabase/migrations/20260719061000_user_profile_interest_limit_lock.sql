-- GO IRL Phase A follow-up: serialize profile-interest writes per user.
-- Apply after 20260719060000_user_profile_phase_a.sql.
-- Additive function replacement only; no data changes.

create or replace function public.go_irl_validate_profile_interest_limit()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Lock the owning profile row so concurrent direct REST/RPC inserts for the
  -- same user cannot both validate against the same interest count.
  perform 1
  from public.user_profiles profile
  where profile.user_key = new.user_key
  for update;

  if not found then
    raise exception 'profile must exist before interests are inserted' using errcode = '23503';
  end if;

  if (
    select count(*)
    from public.user_profile_interests interest
    where interest.user_key = new.user_key
  ) >= 12 then
    raise exception 'maximum 12 profile interests allowed' using errcode = '22023';
  end if;

  return new;
end;
$$;

revoke all on function public.go_irl_validate_profile_interest_limit() from public;
revoke all on function public.go_irl_validate_profile_interest_limit() from anon;
revoke all on function public.go_irl_validate_profile_interest_limit() from authenticated;

notify pgrst, 'reload schema';
