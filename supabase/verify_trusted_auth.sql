-- GO IRL trusted Telegram auth verification
-- Run after supabase/migration_v4_trusted_telegram_auth.sql.

with expected_tables(table_name) as (
  values
    ('app_users'),
    ('telegram_auth_replay')
),
table_checks as (
  select
    table_name,
    'table' as object_type,
    exists (
      select 1
      from information_schema.tables
      where table_schema = 'public'
        and table_name = expected_tables.table_name
    ) as exists_ok
  from expected_tables
),
expected_functions(function_name) as (
  values
    ('go_irl_auth_user_key'),
    ('go_irl_request_user_key'),
    ('go_irl_request_invite_activity'),
    ('go_irl_request_role')
),
function_checks as (
  select
    function_name as object_name,
    'function' as object_type,
    exists (
      select 1
      from pg_proc
      join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
      where pg_namespace.nspname = 'public'
        and pg_proc.proname = expected_functions.function_name
    ) as exists_ok
  from expected_functions
),
expected_policies(table_name, policy_name) as (
  values
    ('app_users', 'app users own read'),
    ('app_users', 'app users own update'),
    ('activities', 'public activities create'),
    ('activities', 'organizer activities update'),
    ('activities', 'organizer or admin activities delete'),
    ('activity_members', 'public members create'),
    ('activity_members', 'public members update'),
    ('activity_members', 'public members delete')
),
policy_checks as (
  select
    table_name || '.' || policy_name as object_name,
    'policy' as object_type,
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = expected_policies.table_name
        and policyname = expected_policies.policy_name
    ) as exists_ok
  from expected_policies
)
select object_type, table_name as object_name, case when exists_ok then 'ok' else 'missing' end as status
from table_checks
union all
select object_type, object_name, case when exists_ok then 'ok' else 'missing' end as status
from function_checks
union all
select object_type, object_name, case when exists_ok then 'ok' else 'missing' end as status
from policy_checks
order by object_type, object_name;
