-- Read-only verification for GO IRL function execution hardening.

select
  p.proname,
  pg_get_function_identity_arguments(p.oid) as arguments,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname like 'go_irl_%'
order by p.proname;

-- Expected after the conservative migration:
-- 1. anon/authenticated cannot directly execute trigger and maintenance functions.
-- 2. authenticated can execute go_irl_ensure_activity_chat(uuid).
-- 3. service_role can execute provider and maintenance functions.
-- 4. RLS policy helper functions may remain executable by the roles whose policies call them.
-- 5. go_irl_auth_user_key, go_irl_request_invite_activity,
--    go_irl_request_user_id, go_irl_request_user_key, and go_irl_touch_updated_at
--    have an explicit pg_catalog, public search_path.
--
-- Free test validation on 2026-07-19 passed for the privileges above.
-- Full production-equivalent RLS matrix remains separate because the free project
-- was reconstructed from repo modules and is not a production clone.
