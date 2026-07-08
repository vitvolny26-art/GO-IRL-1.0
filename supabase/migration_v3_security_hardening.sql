-- GO IRL migration v3: security hardening before public release
-- Apply after migration_v2_backend_foundation.sql.
--
-- This migration adds database-level data integrity constraints for user-supplied
-- activity text. Constraints are created as NOT VALID so existing legacy/demo rows
-- do not block deployment, while new inserts and updates are protected.

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'activities_activity_ru_length_check'
  ) then
    alter table public.activities
    add constraint activities_activity_ru_length_check
    check (char_length(btrim(activity_ru)) between 1 and 80)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_activity_cs_length_check'
  ) then
    alter table public.activities
    add constraint activities_activity_cs_length_check
    check (char_length(btrim(activity_cs)) between 1 and 80)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_title_ru_length_check'
  ) then
    alter table public.activities
    add constraint activities_title_ru_length_check
    check (char_length(btrim(title_ru)) between 1 and 120)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_title_cs_length_check'
  ) then
    alter table public.activities
    add constraint activities_title_cs_length_check
    check (char_length(btrim(title_cs)) between 1 and 120)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_description_ru_length_check'
  ) then
    alter table public.activities
    add constraint activities_description_ru_length_check
    check (char_length(description_ru) <= 1000)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_description_cs_length_check'
  ) then
    alter table public.activities
    add constraint activities_description_cs_length_check
    check (char_length(description_cs) <= 1000)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_address_length_check'
  ) then
    alter table public.activities
    add constraint activities_address_length_check
    check (char_length(btrim(address)) between 1 and 240)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_location_url_length_check'
  ) then
    alter table public.activities
    add constraint activities_location_url_length_check
    check (location_url is null or char_length(location_url) <= 500)
    not valid;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'activities_participant_note_length_check'
  ) then
    alter table public.activities
    add constraint activities_participant_note_length_check
    check (participant_note is null or char_length(participant_note) <= 500)
    not valid;
  end if;
end $$;

notify pgrst, 'reload schema';
