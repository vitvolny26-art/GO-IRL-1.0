-- Fix save_my_beauty_profile_v3 runtime failure:
--   column reference "profile_id" is ambiguous
--
-- The function returns an OUT column named profile_id and also uses the
-- beauty_professional_services.profile_id column in an ON CONFLICT target.
-- Add the PL/pgSQL compiler directive directly to the existing function body.
-- The function definition is otherwise preserved exactly as PostgreSQL stores
-- it, including its signature and runtime search_path. CREATE OR REPLACE keeps
-- the existing grants. RLS policies, auth protocol and production data are not
-- changed.

do $migration$
declare
  v_definition text;
  v_marker constant text := E'AS $function$\n';
  v_position integer;
begin
  select pg_get_functiondef(
    'public.save_my_beauty_profile_v3(text,text,text,text,jsonb,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,text,timestamptz)'::regprocedure
  )
  into v_definition;

  if strpos(v_definition, '#variable_conflict use_column') = 0 then
    v_position := strpos(v_definition, v_marker);
    if v_position = 0 then
      raise exception 'save_my_beauty_profile_v3 function body marker not found';
    end if;

    v_definition := overlay(
      v_definition
      placing v_marker || E'#variable_conflict use_column\n'
      from v_position
      for char_length(v_marker)
    );

    execute v_definition;
  end if;
end;
$migration$;

notify pgrst, 'reload schema';
