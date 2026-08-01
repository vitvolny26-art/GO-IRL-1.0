begin;

create or replace function public.go_irl_list_elevated_roles()
returns table(
  user_key text,
  telegram_id bigint,
  first_name text,
  last_name text,
  username text,
  role text,
  updated_at timestamptz
)
language sql
security definer
set search_path = pg_catalog, public
as $$
  select
    roles.user_key,
    users.telegram_id,
    users.first_name,
    users.last_name,
    users.username,
    roles.role,
    roles.updated_at
  from public.user_roles roles
  left join public.app_users users on users.user_key = roles.user_key
  where roles.role in ('organizer', 'professional', 'moderator', 'admin')
  order by roles.role, coalesce(users.first_name, ''), roles.user_key
  limit 200;
$$;

revoke execute on function public.go_irl_list_elevated_roles()
from public, anon, authenticated;
grant execute on function public.go_irl_list_elevated_roles()
to service_role;

create or replace function public.go_irl_demote_role(
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

  if v_previous_role not in ('organizer', 'professional', 'moderator') then
    return query select 'role_conflict'::text, v_previous_role, v_previous_role;
    return;
  end if;

  update public.user_roles
  set role = 'user',
      note = 'Elevated role removed through admin panel',
      updated_at = now()
  where user_key = p_target_user_key
    and role = v_previous_role;

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
    'user_role.demoted',
    'user_role',
    p_target_user_key,
    jsonb_build_object(
      'previous_role', v_previous_role,
      'current_role', 'user'
    )
  );

  return query select 'updated'::text, v_previous_role, 'user'::text;
end;
$$;

revoke execute on function public.go_irl_demote_role(text, text)
from public, anon, authenticated;
grant execute on function public.go_irl_demote_role(text, text)
to service_role;

notify pgrst, 'reload schema';

commit;
