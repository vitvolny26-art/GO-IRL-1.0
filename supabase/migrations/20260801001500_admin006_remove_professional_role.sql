begin;

create or replace function public.go_irl_remove_professional_role(
  p_target_user_key text,
  p_actor_user_key text
)
returns table(status text, previous_role text, current_role text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_previous_role text;
begin
  if p_target_user_key is null
    or p_target_user_key !~ '^telegram:[0-9]+$'
    or p_actor_user_key is null
    or p_actor_user_key !~ '^telegram:[0-9]+$'
  then
    return query select 'invalid'::text, null::text, null::text;
    return;
  end if;

  select role
  into v_previous_role
  from public.user_roles
  where user_key = p_target_user_key
  for update;

  if not found then
    return query select 'not_found'::text, null::text, null::text;
    return;
  end if;

  if v_previous_role <> 'professional' then
    return query select 'role_conflict'::text, v_previous_role, v_previous_role;
    return;
  end if;

  update public.user_roles
  set role = 'user',
      note = 'Professional role removed through admin panel',
      updated_at = now()
  where user_key = p_target_user_key
    and role = 'professional';

  if not found then
    return query select 'role_conflict'::text, v_previous_role, v_previous_role;
    return;
  end if;

  insert into public.audit_log (
    actor_user_key,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    p_actor_user_key,
    'user_role.professional_removed',
    'user_role',
    p_target_user_key,
    jsonb_build_object(
      'previous_role', 'professional',
      'current_role', 'user'
    )
  );

  return query select 'updated'::text, 'professional'::text, 'user'::text;
end;
$$;

revoke execute on function public.go_irl_remove_professional_role(text, text)
from public, anon, authenticated;
grant execute on function public.go_irl_remove_professional_role(text, text)
to service_role;

notify pgrst, 'reload schema';

commit;
