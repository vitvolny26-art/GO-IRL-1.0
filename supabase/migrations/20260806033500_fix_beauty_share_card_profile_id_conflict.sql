-- Fix save_my_beauty_share_card runtime failure:
--   column reference "profile_id" is ambiguous
--
-- The function returns an OUT column named profile_id and also uses profile_id
-- in an ON CONFLICT target. Replace that target with the existing primary-key
-- constraint name, preserving the function signature, body, grants, search_path,
-- RLS policies, authentication protocol and production data.
do $migration$
declare
  v_signature constant regprocedure :=
    'public.save_my_beauty_share_card(integer,text,text,text,text,integer,jsonb,text,text,timestamptz,timestamptz)'::regprocedure;
  v_definition text;
  v_old_target constant text := 'on conflict (profile_id) do update';
  v_new_target constant text := 'on conflict on constraint beauty_share_cards_pkey do update';
begin
  if not exists (
    select 1
    from pg_constraint constraint_row
    join pg_class table_row on table_row.oid = constraint_row.conrelid
    join pg_namespace schema_row on schema_row.oid = table_row.relnamespace
    where schema_row.nspname = 'public'
      and table_row.relname = 'beauty_share_cards'
      and constraint_row.conname = 'beauty_share_cards_pkey'
      and constraint_row.contype = 'p'
  ) then
    raise exception 'beauty_share_cards_pkey primary-key constraint not found';
  end if;

  select pg_get_functiondef(v_signature)
  into v_definition;

  if position(v_new_target in lower(v_definition)) = 0 then
    if position(v_old_target in lower(v_definition)) = 0 then
      raise exception 'save_my_beauty_share_card expected conflict target not found';
    end if;

    v_definition := replace(v_definition, v_old_target, v_new_target);

    if position(v_new_target in lower(v_definition)) = 0 then
      raise exception 'save_my_beauty_share_card conflict target replacement failed';
    end if;

    execute v_definition;
  end if;
end
$migration$;

notify pgrst, 'reload schema';
