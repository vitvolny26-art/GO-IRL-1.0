-- Fix save_my_beauty_profile_v3 runtime failure:
--   column reference "profile_id" is ambiguous
--
-- The function returns an OUT column named profile_id and also uses the table
-- column profile_id in an ON CONFLICT target. Compile this one function with
-- table-column precedence, preserving its body, signature, grants, search_path,
-- RLS policies, authentication protocol and production data.

do $migration$
declare
  v_signature constant regprocedure :=
    'public.save_my_beauty_profile_v3(text,text,text,text,jsonb,text,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,jsonb,text,timestamptz)'::regprocedure;
  v_definition text;
  v_marker constant text := 'AS $function$';
begin
  select pg_get_functiondef(v_signature)
  into v_definition;

  if position('#variable_conflict use_column' in v_definition) = 0 then
    if position(v_marker in v_definition) = 0 then
      raise exception 'save_my_beauty_profile_v3 body marker not found';
    end if;

    if position('on conflict (profile_id, client_key)' in lower(v_definition)) = 0 then
      raise exception 'save_my_beauty_profile_v3 expected conflict target not found';
    end if;

    v_definition := replace(
      v_definition,
      v_marker,
      v_marker || E'\n#variable_conflict use_column'
    );

    execute v_definition;
  end if;
end
$migration$;

notify pgrst, 'reload schema';
