-- GO IRL negative RLS verification
--
-- Purpose:
-- - prove that organizer and joined users can access a private Activity chat;
-- - prove that pending and unrelated users cannot access the private Activity,
--   chat, or messages;
-- - leave no persistent rows or policy changes.
--
-- Run manually in the Supabase SQL Editor after migrations v2, v4, and v8.
-- A successful run finishes with notices and ROLLBACK.

begin;

insert into public.activities (
  id,
  category_id,
  activity_ru,
  activity_cs,
  title_ru,
  title_cs,
  description_ru,
  description_cs,
  event_date,
  event_time,
  city_id,
  address,
  activity_type,
  metadata,
  price,
  capacity,
  organizer,
  organizer_key,
  visibility
) values (
  '00000000-0000-4000-8000-000000000101',
  'social',
  'RLS verification',
  'RLS verification',