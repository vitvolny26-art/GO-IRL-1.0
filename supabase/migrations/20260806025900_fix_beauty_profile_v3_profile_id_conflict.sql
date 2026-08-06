-- Fix save_my_beauty_profile_v3 runtime failure:
--   column reference "profile_id" is ambiguous
--
-- The function returns an OUT column named profile_id and also uses the
-- beauty_professional_services.profile_id column in an ON CONFLICT target.
-- Resolve PL/pgSQL name conflicts in favor of table columns without changing
-- the function body, signature, grants, RLS policies, auth protocol or data.

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
set plpgsql.variable_conflict = 'use_column';

notify pgrst, 'reload schema';
