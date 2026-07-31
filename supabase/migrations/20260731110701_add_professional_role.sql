-- Add the Services professional role to the existing single-role model.
-- Organizer remains domain-scoped to Activities; professional is scoped to Services.
-- This migration only expands accepted role values. Existing RLS permissions remain unchanged.

begin;

alter table public.user_roles
  drop constraint if exists user_roles_role_check;

alter table public.user_roles
  add constraint user_roles_role_check
  check (role in ('user', 'organizer', 'professional', 'moderator', 'admin'));

comment on column public.user_roles.role is
  'GO IRL role: user, organizer, professional, moderator, or admin. Assignment is admin-controlled.';

commit;
