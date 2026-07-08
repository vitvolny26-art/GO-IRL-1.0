-- GO IRL migration v5: admin delete helper hardening
-- Apply after migration_v4_trusted_telegram_auth.sql.
-- This migration is idempotent and does not delete user data.

create or replace function public.go_irl_auth_user_key()
returns text
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'go_irl_user_key', '');
$$;

create or replace function public.go_irl_request_user_key()
returns text
language sql
stable
as $$
  select public.go_irl_auth_user_key();
$$;

create or replace function public.go_irl_request_user_id()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt() ->> 'sub', '')::uuid;
$$;

create or replace function public.go_irl_request_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'go_irl_role', ''),
    (
      select user_role.role
      from public.user_roles user_role
      where user_role.user_key = public.go_irl_request_user_key()
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

drop policy if exists "organizer or admin activities delete" on public.activities;

create policy "organizer or admin activities delete"
on public.activities
for delete
to authenticated
using (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
);

notify pgrst, 'reload schema';
