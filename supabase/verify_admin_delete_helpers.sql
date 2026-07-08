-- GO IRL v5 verification: trusted admin delete helpers

with expected_functions(function_name) as (
  values
    ('go_irl_auth_user_key'),
    ('go_irl_request_user_key'),
    ('go_irl_request_user_id'),
    ('go_irl_request_role'),
    ('go_irl_request_has_role'),
    ('go_irl_request_is_admin'),
    ('go_irl_request_can_moderate')
)
select
  expected_functions.function_name,
  case when pg_proc.oid is not null then 'ok' else 'missing' end as status
from expected_functions
left join pg_proc
  on pg_proc.proname = expected_functions.function_name
left join pg_namespace
  on pg_namespace.oid = pg_proc.pronamespace
 and pg_namespace.nspname = 'public'
order by expected_functions.function_name;

select
  pol.polname as policy_name,
  pol.polcmd as command,
  pg_get_expr(pol.polqual, pol.polrelid) as using_expr,
  case
    when pol.polcmd = 'd'
     and pg_get_expr(pol.polqual, pol.polrelid) ilike '%go_irl_request_is_admin%'
      then 'ok'
    else 'review'
  end as status
from pg_policy pol
join pg_class cls on cls.oid = pol.polrelid
join pg_namespace ns on ns.oid = cls.relnamespace
where ns.nspname = 'public'
  and cls.relname = 'activities'
  and pol.polname = 'organizer or admin activities delete';
