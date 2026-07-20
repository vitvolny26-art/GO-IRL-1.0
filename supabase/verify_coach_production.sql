-- GO IRL Sport Coach production inventory (read-only)
-- Run manually in Supabase SQL Editor.
-- SELECT-only: no schema, data, RLS, grant, or migration changes.

-- 1. Coach tables and RLS flags
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('coach_profiles', 'coach_requests', 'coach_reviews')
order by c.relname;

-- 2. Exact deployed Coach policies
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('coach_profiles', 'coach_requests', 'coach_reviews')
order by tablename, cmd, policyname;

-- 3. Coach constraints
select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('coach_profiles', 'coach_requests', 'coach_reviews')
order by c.relname, con.conname;

-- 4. Coach-related functions and exact definitions
select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  p.prosecdef as security_definer,
  pg_get_userbyid(p.proowner) as owner_name,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and (
    p.proname like '%coach%'
    or p.proname in (
      'go_irl_request_user_key',
      'go_irl_request_role',
      'go_irl_request_is_admin',
      'go_irl_request_can_moderate',
      'go_irl_can_manage_activity'
    )
  )
order by p.proname, identity_arguments;

-- 5. Function execution grants
select
  routine_schema,
  routine_name,
  grantee,
  privilege_type
from information_schema.routine_privileges
where routine_schema = 'public'
  and (
    routine_name like '%coach%'
    or routine_name in (
      'go_irl_request_user_key',
      'go_irl_request_role',
      'go_irl_request_is_admin',
      'go_irl_request_can_moderate',
      'go_irl_can_manage_activity'
    )
  )
order by routine_name, grantee, privilege_type;

-- 6. Table grants
select
  table_schema,
  table_name,
  grantee,
  privilege_type
from information_schema.role_table_grants
where table_schema = 'public'
  and table_name in ('coach_profiles', 'coach_requests', 'coach_reviews')
order by table_name, grantee, privilege_type;

-- 7. Supabase migration history, when available
select
  version,
  name,
  statements
from supabase_migrations.schema_migrations
where name ilike '%coach%'
   or statements::text ilike '%coach_%'
order by version;
