-- GO IRL migration v9: server-only provider join RPC for WhatsApp, Instagram, and Messenger.
-- Apply after migration_v4_trusted_telegram_auth.sql.

alter table public.app_users
drop constraint if exists app_users_auth_provider_check;

alter table public.app_users
add constraint app_users_auth_provider_check
check (auth_provider in ('telegram', 'whatsapp', 'instagram', 'messenger')) not valid;

create index if not exists app_users_provider_lookup_idx
on public.app_users(auth_provider, provider_user_id);

create or replace function public.go_irl_provider_join(
  p_activity_id uuid,
  p_user_key text,
  p_display_name text
)
returns table(status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_activity public.activities%rowtype;
  v_existing_status text;
  v_joined_count integer;
  v_new_status text;
begin
  if p_user_key is null or p_user_key !~ '^user:[0-9a-f-]{36}$' then
    raise exception 'invalid provider user key';
  end if;

  select *
  into v_activity
  from public.activities
  where id = p_activity_id
  for update;

  if not found then
    return query select 'event_not_found'::text;
    return;
  end if;

  if v_activity.event_date < (now() at time zone 'Europe/Prague')::date then
    return query select 'event_closed'::text;
    return;
  end if;

  if v_activity.visibility = 'private' then
    return query select 'not_allowed'::text;
    return;
  end if;

  select member.status
  into v_existing_status
  from public.activity_members member
  where member.activity_id = p_activity_id
    and member.user_key = p_user_key;

  if found then
    return query select case v_existing_status
      when 'joined' then 'already_joined'
      when 'waiting' then 'waitlisted'
      when 'pending' then 'pending'
      else 'already_joined'
    end::text;
    return;
  end if;

  select count(*)::integer
  into v_joined_count
  from public.activity_members member
  where member.activity_id = p_activity_id
    and member.status = 'joined';

  if v_joined_count >= v_activity.capacity then
    v_new_status := 'waiting';
  elsif v_activity.visibility = 'invite' then
    v_new_status := 'pending';
  else
    v_new_status := 'joined';
  end if;

  insert into public.activity_members(activity_id, user_key, display_name, status)
  values (
    p_activity_id,
    p_user_key,
    left(coalesce(nullif(trim(p_display_name), ''), 'GO IRL User'), 120),
    v_new_status
  );

  return query select case v_new_status
    when 'waiting' then 'waitlisted'
    else v_new_status
  end::text;
end;
$$;

revoke all on function public.go_irl_provider_join(uuid, text, text) from public;
revoke all on function public.go_irl_provider_join(uuid, text, text) from anon;
revoke all on function public.go_irl_provider_join(uuid, text, text) from authenticated;
grant execute on function public.go_irl_provider_join(uuid, text, text) to service_role;

notify pgrst, 'reload schema';
