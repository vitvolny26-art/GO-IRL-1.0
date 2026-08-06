-- Fix save_my_beauty_profile_v3 runtime failure:
--   function digest(text, unknown) does not exist
-- pgcrypto is installed in the extensions schema, while this function was
-- restricted to pg_catalog, public. Keep the function body and privileges
-- unchanged and add the trusted extensions schema to its runtime search_path.

alter function public.save_my_beauty_profile_v3(
  text,
  text,
  text,
  text,
  jsonb,
  text,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  jsonb,
  text,
  timestamptz
)
set search_path = pg_catalog, public, extensions;

notify pgrst, 'reload schema';
