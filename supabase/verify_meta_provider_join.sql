-- GO IRL provider join verification. Expected status: ok for every row.

select
  'function' as object_type,
  'go_irl_provider_join' as object_name,
  case when exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'go_irl_provider_join'
  ) then 'ok' else 'missing' end as status
union all
select
  'constraint',
  'app_users_auth_provider_check',
  case when exists (
    select 1
    from pg_constraint
    where conname = 'app_users_auth_provider_check'
      and conrelid = 'public.app_users'::regclass
  ) then 'ok' else 'missing' end
union all
select
  'service_role_execute',
  'go_irl_provider_join',
  case when has_function_privilege('service_role', 'public.go_irl_provider_join(uuid,text,text)', 'EXECUTE')
    then 'ok' else 'missing' end
union all
select
  'anon_execute_revoked',
  'go_irl_provider_join',
  case when not has_function_privilege('anon', 'public.go_irl_provider_join(uuid,text,text)', 'EXECUTE')
    then 'ok' else 'unsafe' end
order by object_type;
