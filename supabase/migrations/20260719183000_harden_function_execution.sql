-- Conservative GO IRL function hardening.
-- This migration does not change RLS policies or function bodies.
-- Validated on the free GO IRL Phase A Test project on 2026-07-19.

begin;

-- Fix mutable or unset search_path warnings.
alter function public.go_irl_auth_user_key()
  set search_path = pg_catalog, public;
alter function public.go_irl_request_invite_activity()
  set search_path = pg_catalog, public;
alter function public.go_irl_request_user_id()
  set search_path = pg_catalog, public;
alter function public.go_irl_request_user_key()
  set search_path = pg_catalog, public;
alter function public.go_irl_touch_updated_at()
  set search_path = pg_catalog, public;

-- Internal trigger functions must not be directly callable through PostgREST RPC.
revoke execute on function public.go_irl_audit_activity_change() from public, anon, authenticated;
revoke execute on function public.go_irl_audit_activity_member_change() from public, anon, authenticated;
revoke execute on function public.go_irl_coach_review_rating_trigger() from public, anon, authenticated;
revoke execute on function public.go_irl_trigger_recalculate_coach_rating() from public, anon, authenticated;
revoke execute on function public.go_irl_touch_updated_at() from public, anon, authenticated;
revoke execute on function public.go_irl_validate_profile_interest_limit() from public, anon, authenticated;

-- Maintenance and internal helper functions are service-only.
revoke execute on function public.go_irl_activity_chat_expires_at(uuid) from public, anon, authenticated;
revoke execute on function public.go_irl_cleanup_expired_activity_chat_messages() from public, anon, authenticated;
revoke execute on function public.go_irl_expire_activity_chats() from public, anon, authenticated;
revoke execute on function public.go_irl_recalculate_coach_rating(uuid) from public, anon, authenticated;
revoke execute on function public.go_irl_write_audit(text, text, text, jsonb) from public, anon, authenticated;

grant execute on function public.go_irl_cleanup_expired_activity_chat_messages() to service_role;
grant execute on function public.go_irl_expire_activity_chats() to service_role;
grant execute on function public.go_irl_recalculate_coach_rating(uuid) to service_role;
grant execute on function public.go_irl_write_audit(text, text, text, jsonb) to service_role;

-- Client-facing RPC remains authenticated-only.
revoke execute on function public.go_irl_ensure_activity_chat(uuid) from public, anon;
grant execute on function public.go_irl_ensure_activity_chat(uuid) to authenticated;

-- Provider join remains server-side only.
revoke execute on function public.go_irl_provider_join(uuid, text, text) from public, anon, authenticated;
grant execute on function public.go_irl_provider_join(uuid, text, text) to service_role;

notify pgrst, 'reload schema';

commit;
