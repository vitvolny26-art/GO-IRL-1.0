-- GO IRL migration v2: backend foundation
-- Apply this in Supabase SQL Editor after migration_v1.sql.
--
-- Goals:
-- - production role model: user / organizer / moderator / admin
-- - RLS helpers that understand roles
-- - audit log for critical activity and membership changes
-- - idempotent and safe to run more than once

create extension if not exists pgcrypto;

create table if not exists public.user_roles (
  user_key text primary key,
  role text not null default 'user',
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_roles_role_check check (role in ('user', 'organizer', 'moderator', 'admin'))
);

insert into public.user_roles (user_key, role, note)
select admin_user.user_key, 'admin', coalesce(admin_user.note, 'Migrated from admin_users')
from public.admin_users admin_user
on conflict (user_key) do update
set role = 'admin',
    note = coalesce(public.user_roles.note, excluded.note),
    updated_at = now();

create index if not exists user_roles_role_idx
on public.user_roles(role, user_key);

alter table public.user_roles enable row level security;

drop trigger if exists user_roles_touch_updated_at on public.user_roles;
create trigger user_roles_touch_updated_at
before update on public.user_roles
for each row
execute function public.go_irl_touch_updated_at();

create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_key text not null default coalesce(public.go_irl_request_user_key(), 'system'),
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint audit_log_action_check check (btrim(action) <> ''),
  constraint audit_log_entity_type_check check (btrim(entity_type) <> '')
);

create index if not exists audit_log_entity_idx
on public.audit_log(entity_type, entity_id, created_at desc);

create index if not exists audit_log_actor_idx
on public.audit_log(actor_user_key, created_at desc);

alter table public.audit_log enable row level security;

create or replace function public.go_irl_request_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select user_role.role
      from public.user_roles user_role
      where user_role.user_key = public.go_irl_request_user_key()
      limit 1
    ),
    (
      select admin_user.role
      from public.admin_users admin_user
      where admin_user.user_key = public.go_irl_request_user_key()
      limit 1
    ),
    'user'
  );
$$;

create or replace function public.go_irl_request_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.go_irl_request_role() = any(required_roles);
$$;

create or replace function public.go_irl_request_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.go_irl_request_has_role(array['admin']);
$$;

create or replace function public.go_irl_request_can_moderate()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.go_irl_request_has_role(array['moderator', 'admin']);
$$;

create or replace function public.go_irl_can_read_activity(
  p_activity_id uuid,
  p_visibility text,
  p_organizer_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_visibility = 'public'
    or p_organizer_key = public.go_irl_request_user_key()
    or p_activity_id::text = public.go_irl_request_invite_activity()
    or public.go_irl_request_can_moderate()
    or exists (
      select 1
      from public.activity_members member
      where member.activity_id = p_activity_id
        and member.user_key = public.go_irl_request_user_key()
        and member.status in ('joined', 'waiting')
    );
$$;

create or replace function public.go_irl_can_insert_activity_member(
  p_activity_id uuid,
  p_member_status text,
  p_member_user_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_member_user_key = public.go_irl_request_user_key()
    and exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and (
          activity.organizer_key = public.go_irl_request_user_key()
          or (activity.visibility = 'public' and p_member_status = 'joined')
          or (activity.visibility = 'invite' and p_member_status = 'pending')
          or (p_member_status = 'waiting' and activity.visibility in ('public', 'invite'))
        )
    );
$$;

create or replace function public.go_irl_write_audit(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (actor_user_key, action, entity_type, entity_id, metadata)
  values (
    coalesce(public.go_irl_request_user_key(), 'system'),
    p_action,
    p_entity_type,
    p_entity_id,
    coalesce(p_metadata, '{}'::jsonb)
  );
end;
$$;

create or replace function public.go_irl_audit_activity_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  perform public.go_irl_write_audit(
    'activity.' || lower(tg_op),
    'activity',
    row_data ->> 'id',
    jsonb_build_object(
      'organizer_key', row_data ->> 'organizer_key',
      'visibility', row_data ->> 'visibility',
      'city_id', row_data ->> 'city_id',
      'activity_type', row_data ->> 'activity_type'
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.go_irl_audit_activity_member_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  row_data jsonb;
begin
  row_data := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;

  perform public.go_irl_write_audit(
    'activity_member.' || lower(tg_op),
    'activity_member',
    (row_data ->> 'activity_id') || ':' || (row_data ->> 'user_key'),
    jsonb_build_object(
      'activity_id', row_data ->> 'activity_id',
      'member_user_key', row_data ->> 'user_key',
      'status', row_data ->> 'status'
    )
  );

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

drop trigger if exists activities_audit_changes on public.activities;
create trigger activities_audit_changes
after insert or update or delete on public.activities
for each row
execute function public.go_irl_audit_activity_change();

drop trigger if exists activity_members_audit_changes on public.activity_members;
create trigger activity_members_audit_changes
after insert or update or delete on public.activity_members
for each row
execute function public.go_irl_audit_activity_member_change();

drop policy if exists "user roles self or staff read" on public.user_roles;
create policy "user roles self or staff read"
on public.user_roles for select to anon using (
  user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "admin user roles insert" on public.user_roles;
create policy "admin user roles insert"
on public.user_roles for insert to anon with check (
  public.go_irl_request_is_admin()
);

drop policy if exists "admin user roles update" on public.user_roles;
create policy "admin user roles update"
on public.user_roles for update to anon
using (
  public.go_irl_request_is_admin()
)
with check (
  public.go_irl_request_is_admin()
);

drop policy if exists "audit log staff read" on public.audit_log;
create policy "audit log staff read"
on public.audit_log for select to anon using (
  public.go_irl_request_can_moderate()
);

drop policy if exists "audit log own insert" on public.audit_log;
create policy "audit log own insert"
on public.audit_log for insert to anon with check (
  actor_user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "admin users staff read" on public.admin_users;
create policy "admin users staff read"
on public.admin_users for select to anon using (
  public.go_irl_request_is_admin()
);

drop policy if exists "organizer activities update" on public.activities;
create policy "organizer activities update"
on public.activities for update to anon
using (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
)
with check (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "organizer or admin activities delete" on public.activities;
create policy "organizer or admin activities delete"
on public.activities for delete to anon using (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
);

drop policy if exists "public members update" on public.activity_members;
create policy "public members update"
on public.activity_members for update to anon
using (
  public.go_irl_request_can_moderate()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_request_user_key()
  )
)
with check (
  public.go_irl_request_can_moderate()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_request_user_key()
  )
);

drop policy if exists "public members delete" on public.activity_members;
create policy "public members delete"
on public.activity_members for delete to anon using (
  user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_request_user_key()
  )
);

grant select, insert, update on public.user_roles to anon;
grant select, insert on public.audit_log to anon;
grant execute on function public.go_irl_request_role() to anon;
grant execute on function public.go_irl_request_has_role(text[]) to anon;
grant execute on function public.go_irl_request_is_admin() to anon;
grant execute on function public.go_irl_request_can_moderate() to anon;
grant execute on function public.go_irl_write_audit(text, text, text, jsonb) to anon;

notify pgrst, 'reload schema';
