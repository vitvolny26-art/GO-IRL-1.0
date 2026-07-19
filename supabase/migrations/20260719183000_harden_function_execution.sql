-- Harden GO IRL function execution privileges without changing RLS policy logic.
-- Apply to a non-production project first. Production rollout requires separate approval.

begin;

-- Functions previously reported with mutable/unset search_path.
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

-- Remove default/public direct