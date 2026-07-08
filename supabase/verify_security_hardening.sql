-- GO IRL security hardening verification
-- Run after supabase/migration_v3_security_hardening.sql.

with expected_constraints(conname) as (
  values
    ('activities_activity_ru_length_check'),
    ('activities_activity_cs_length_check'),
    ('activities_title_ru_length_check'),
    ('activities_title_cs_length_check'),
    ('activities_description_ru_length_check'),
    ('activities_description_cs_length_check'),
    ('activities_address_length_check'),
    ('activities_location_url_length_check'),
    ('activities_participant_note_length_check')
)
select
  conname as constraint_name,
  case when pg_constraint.conname is null then 'missing' else 'ok' end as status,
  case
    when pg_constraint.conname is null then null
    when pg_constraint.convalidated then 'validated'
    else 'not_valid_enforced_for_new_writes'
  end as validation_state
from expected_constraints
left join pg_constraint on pg_constraint.conname = expected_constraints.conname
order by constraint_name;
