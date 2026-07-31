begin;

create table public.role_invitations (
  id uuid primary key default gen_random_uuid(),
  token_hash text not null unique,
  target_role text not null,
  created_by_user_key text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours'),
  consumed_at timestamptz,
  consumed_by_user_key text,
  constraint role_invitations_token_hash_check
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint role_invitations_target_role_check
    check (target_role in ('organizer', 'professional')),
  constraint role_invitations_expiry_check
    check (expires_at > created_at and expires_at <= created_at + interval '24 hours'),
  constraint role_invitations_consumption_check
    check (
      (consumed_at is null and consumed_by_user_key is null)
      or (consumed_at is not null and consumed_by_user_key is not null)
    )
);

comment on table public.role_invitations is
  'Single-use, 24-hour bearer invitations for admin-approved organizer or professional role promotion. Raw tokens are never stored.';

create index role_invitations_active_expiry_idx
on public.role_invitations(expires_at)
where consumed_at is null;

alter table public.role_invitations enable row level security;

revoke all on table public.role_invitations from public, anon, authenticated, service_role;

create or replace function public.go_irl_create_role_invitation(
  p_token_hash text,
  p_target_role text,
  p_created_by_user_key text,
  p_expires_at timestamptz
)
returns table(id uuid, expires_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_invitation_id uuid;
  v_expires_at timestamptz;
begin
  if p_token_hash is null
    or p_token_hash !~ '^[0-9a-f]{64}$'
    or p_target_role is null
    or p_target_role not in ('organizer', 'professional')
    or p_created_by_user_key is null
    or p_created_by_user_key !~ '^telegram:[0-9]+$'
    or p_expires_at is null
    or p_expires_at <= now()
    or p_expires_at > now() + interval '24 hours'
  then
    raise exception 'invalid_role_invitation_request';
  end if;

  insert into public.role_invitations (
    token_hash,
    target_role,
    created_by_user_key,
    expires_at
  ) values (
    p_token_hash,
    p_target_role,
    p_created_by_user_key,
    p_expires_at
  )
  returning role_invitations.id, role_invitations.expires_at
  into v_invitation_id, v_expires_at;

  insert into public.audit_log (
    actor_user_key,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    p_created_by_user_key,
    'role_invitation.created',
    'role_invitation',
    v_invitation_id::text,
    jsonb_build_object(
      'target_role', p_target_role,
      'expires_at', v_expires_at
    )
  );

  return query select v_invitation_id, v_expires_at;
end;
$$;

revoke execute on function public.go_irl_create_role_invitation(text, text, text, timestamptz)
from public, anon, authenticated;
grant execute on function public.go_irl_create_role_invitation(text, text, text, timestamptz)
to service_role;

create or replace function public.go_irl_redeem_role_invitation(
  p_token_hash text,
  p_user_key text
)
returns table(status text, target_role text)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_invitation public.role_invitations%rowtype;
  v_assigned_role text;
begin
  if p_token_hash is null
    or p_token_hash !~ '^[0-9a-f]{64}$'
    or p_user_key is null
    or p_user_key !~ '^telegram:[0-9]+$'
  then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  select invitation.*
  into v_invitation
  from public.role_invitations invitation
  where invitation.token_hash = p_token_hash
  for update;

  if not found
    or v_invitation.consumed_at is not null
    or v_invitation.expires_at <= now()
  then
    return query select 'invalid'::text, null::text;
    return;
  end if;

  insert into public.user_roles (user_key, role, note)
  values (
    p_user_key,
    v_invitation.target_role,
    'Assigned through a single-use admin role invitation'
  )
  on conflict (user_key) do update
  set role = excluded.role,
      updated_at = now()
  where public.user_roles.role = 'user'
  returning role into v_assigned_role;

  if v_assigned_role is null then
    return query select 'role_conflict'::text, null::text;
    return;
  end if;

  update public.role_invitations
  set consumed_at = now(),
      consumed_by_user_key = p_user_key
  where id = v_invitation.id;

  insert into public.audit_log (
    actor_user_key,
    action,
    entity_type,
    entity_id,
    metadata
  ) values (
    p_user_key,
    'role_invitation.redeemed',
    'role_invitation',
    v_invitation.id::text,
    jsonb_build_object('target_role', v_invitation.target_role)
  );

  return query select 'accepted'::text, v_assigned_role;
end;
$$;

revoke execute on function public.go_irl_redeem_role_invitation(text, text)
from public, anon, authenticated;
grant execute on function public.go_irl_redeem_role_invitation(text, text)
to service_role;

notify pgrst, 'reload schema';

commit;
