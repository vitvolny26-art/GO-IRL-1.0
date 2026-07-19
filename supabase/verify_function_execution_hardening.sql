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

-- Expected direct external RPC surface after migration:
-- authenticated: go_irl_ensure_activity_chat(uuid)
-- service_role: go_irl_provider_join(uuid, text, text) and maintenance/internal functions
-- anon: no SECURITY DEFINER function execute privileges
