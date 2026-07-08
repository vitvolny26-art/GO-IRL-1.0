-- GO IRL backend foundation verification
-- Run after supabase/migration_v2_backend_foundation.sql.

with expected_tables(table_name) as (
  values
    ('user_roles'),
    ('audit_log')
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
    ('go_irl_request_role'),
    ('go_irl_request_has_role'),
    ('go_irl_request_is_admin'),
    ('go_irl_request_can_moderate'),
    ('go_irl_write_audit'),
    ('go_irl_audit_activity_change'),
    ('go_irl_audit_activity_member_change')
),
function_checks as (
  select
    function_name as table_name,
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
    ('user_roles', 'user roles self or staff read'),
    ('user_roles', 'admin user roles insert'),
    ('user_roles', 'admin user roles update'),
    ('audit_log', 'audit log staff read'),
    ('audit_log', 'audit log own insert'),
    ('activities', 'organizer activities update'),
    ('activities', 'organizer or admin activities delete'),
    ('activity_members', 'public members update'),
    ('activity_members', 'public members delete')
),
policy_checks as (
  select
    table_name || '.' || policy_name as table_name,
    'policy' as object_type,
    exists (
      select 1
      from pg_policies
      where schemaname = 'public'
        and tablename = expected_policies.table_name
        and policyname = expected_policies.policy_name
    ) as exists_ok
  from expected_policies
),
expected_triggers(table_name, trigger_name) as (
  values
    ('activities', 'activities_audit_changes'),
    ('activity_members', 'activity_members_audit_changes'),
    ('user_roles', 'user_roles_touch_updated_at')
),
trigger_checks as (
  select
    table_name || '.' || trigger_name as table_name,
    'trigger' as object_type,
    exists (
      select 1
      from information_schema.triggers
      where event_object_schema = 'public'
        and event_object_table = expected_triggers.table_name
        and trigger_name = expected_triggers.trigger_name
    ) as exists_ok
  from expected_triggers
)
select object_type, table_name as object_name, case when exists_ok then 'ok' else 'missing' end as status
from table_checks
union all
select object_type, table_name as object_name, case when exists_ok then 'ok' else 'missing' end as status
from function_checks
union all
select object_type, table_name as object_name, case when exists_ok then 'ok' else 'missing' end as status
from policy_checks
union all
select object_type, table_name as object_name, case when exists_ok then 'ok' else 'missing' end as status
from trigger_checks
order by object_type, object_name;
