-- GO IRL schema verification
-- Run this in Supabase SQL Editor after supabase/migration_v1.sql.
-- Expected result: every row has status = 'ok'.

with required_columns(table_name, column_name, expected_type, is_required) as (
  values
    ('activities', 'city_id', 'text', true),
    ('activities', 'metadata', 'jsonb', true),
    ('activities', 'participant_note', 'text', false),
    ('activities', 'activity_type', 'text', true)
),
actual_columns as (
  select
    table_name,
    column_name,
    udt_name,
    is_nullable,
    column_default
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'activities'
)
select
  required.table_name,
  required.column_name,
  required.expected_type,
  coalesce(actual.udt_name, 'missing') as actual_type,
  actual.is_nullable,
  actual.column_default,
  case
    when actual.column_name is null then 'missing'
    when actual.udt_name <> required.expected_type then 'wrong_type'
    when required.is_required and actual.is_nullable <> 'NO' then 'nullable'
    else 'ok'
  end as status
from required_columns required
left join actual_columns actual
  on actual.table_name = required.table_name
 and actual.column_name = required.column_name
order by required.column_name;

