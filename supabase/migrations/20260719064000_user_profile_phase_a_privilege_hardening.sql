-- GO IRL Phase A privilege hardening.
-- Restrict authenticated access to the exact table privileges required by the profile contract.

revoke all on table public.user_profiles from authenticated;
revoke all on table public.user_profile_interests from authenticated;

grant select, insert, update on table public.user_profiles to authenticated;
grant select, insert, delete on table public.user_profile_interests to authenticated;

notify pgrst, 'reload schema';
