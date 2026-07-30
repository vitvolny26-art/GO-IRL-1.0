create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

alter function public.go_irl_request_role() set schema private;
alter function public.go_irl_request_has_role(text[]) set schema private;
alter function public.go_irl_request_is_admin() set schema private;
alter function public.go_irl_request_can_moderate() set schema private;
alter function public.go_irl_can_access_activity_chat(uuid) set schema private;
alter function public.go_irl_can_insert_activity_member(uuid, text, text) set schema private;
alter function public.go_irl_can_manage_activity(uuid) set schema private;
alter function public.go_irl_can_read_activity(uuid, text, text) set schema private;
alter function public.go_irl_can_read_activity_member(uuid, text) set schema private;
alter function public.go_irl_can_write_activity_chat(uuid) set schema private;

create or replace function private.go_irl_request_role()
returns text
language sql
stable
security definer
set search_path to ''
as $$
  select coalesce(
    (
      select user_role.role
      from public.user_roles user_role
      where user_role.user_key = public.go_irl_request_user_key()
      limit 1
    ),
    'user'
  );
$$;

create or replace function private.go_irl_request_has_role(required_roles text[])
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select private.go_irl_request_role() = any(required_roles);
$$;

create or replace function private.go_irl_request_is_admin()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select private.go_irl_request_has_role(array['admin']);
$$;

create or replace function private.go_irl_request_can_moderate()
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select private.go_irl_request_has_role(array['moderator', 'admin']);
$$;

create or replace function private.go_irl_can_access_activity_chat(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select
    private.go_irl_request_can_moderate()
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and activity.organizer_key = public.go_irl_request_user_key()
    )
    or exists (
      select 1
      from public.activity_members member
      where member.activity_id = p_activity_id
        and member.user_key = public.go_irl_request_user_key()
        and member.status = 'joined'
    );
$$;

create or replace function private.go_irl_can_insert_activity_member(
  p_activity_id uuid,
  p_member_status text,
  p_member_user_key text
)
returns boolean
language sql
stable
security definer
set search_path to ''
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

create or replace function private.go_irl_can_manage_activity(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select
    private.go_irl_request_can_moderate()
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and activity.organizer_key = public.go_irl_request_user_key()
    );
$$;

create or replace function private.go_irl_can_read_activity(
  p_activity_id uuid,
  p_visibility text,
  p_organizer_key text
)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select
    p_visibility = 'public'
    or p_organizer_key = public.go_irl_request_user_key()
    or p_activity_id::text = public.go_irl_request_invite_activity()
    or private.go_irl_request_can_moderate()
    or exists (
      select 1
      from public.activity_members member
      where member.activity_id = p_activity_id
        and member.user_key = public.go_irl_request_user_key()
        and member.status in ('joined', 'waiting')
    );
$$;

create or replace function private.go_irl_can_read_activity_member(
  p_activity_id uuid,
  p_member_user_key text
)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select
    private.go_irl_request_can_moderate()
    or p_member_user_key = public.go_irl_request_user_key()
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and activity.organizer_key = public.go_irl_request_user_key()
    )
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and activity.visibility = 'public'
    );
$$;

create or replace function private.go_irl_can_write_activity_chat(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to ''
as $$
  select
    private.go_irl_can_access_activity_chat(p_activity_id)
    and exists (
      select 1
      from public.activity_chats chat
      where chat.activity_id = p_activity_id
        and chat.status = 'active'
        and chat.expires_at > now()
    );
$$;

revoke all on function private.go_irl_request_role() from public, anon;
revoke all on function private.go_irl_request_has_role(text[]) from public, anon;
revoke all on function private.go_irl_request_is_admin() from public, anon;
revoke all on function private.go_irl_request_can_moderate() from public, anon;
revoke all on function private.go_irl_can_access_activity_chat(uuid) from public, anon;
revoke all on function private.go_irl_can_insert_activity_member(uuid, text, text) from public, anon;
revoke all on function private.go_irl_can_manage_activity(uuid) from public, anon;
revoke all on function private.go_irl_can_read_activity(uuid, text, text) from public, anon;
revoke all on function private.go_irl_can_read_activity_member(uuid, text) from public, anon;
revoke all on function private.go_irl_can_write_activity_chat(uuid) from public, anon;

grant execute on function private.go_irl_request_role() to authenticated, service_role;
grant execute on function private.go_irl_request_has_role(text[]) to authenticated, service_role;
grant execute on function private.go_irl_request_is_admin() to authenticated, service_role;
grant execute on function private.go_irl_request_can_moderate() to authenticated, service_role;
grant execute on function private.go_irl_can_access_activity_chat(uuid) to authenticated, service_role;
grant execute on function private.go_irl_can_insert_activity_member(uuid, text, text) to authenticated, service_role;
grant execute on function private.go_irl_can_manage_activity(uuid) to authenticated, service_role;
grant execute on function private.go_irl_can_read_activity(uuid, text, text) to authenticated, service_role;
grant execute on function private.go_irl_can_read_activity_member(uuid, text) to authenticated, service_role;
grant execute on function private.go_irl_can_write_activity_chat(uuid) to authenticated, service_role;

create or replace function public.go_irl_ensure_activity_chat(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path to ''
as $$
declare
  existing_chat_id uuid;
  created_chat_id uuid;
begin
  if not private.go_irl_can_access_activity_chat(p_activity_id) then
    raise exception 'activity_chat_access_denied';
  end if;

  select chat.id
  into existing_chat_id
  from public.activity_chats chat
  where chat.activity_id = p_activity_id
  limit 1;

  if existing_chat_id is not null then
    return existing_chat_id;
  end if;

  insert into public.activity_chats (
    activity_id,
    created_by_user_key,
    expires_at
  ) values (
    p_activity_id,
    public.go_irl_request_user_key(),
    public.go_irl_activity_chat_expires_at(p_activity_id)
  )
  returning id into created_chat_id;

  return created_chat_id;
end;
$$;

create or replace function public.go_irl_upsert_event_reminder(
  p_activity_id uuid,
  p_provider text,
  p_lead_minutes smallint
)
returns public.event_reminders
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_activity public.activities%rowtype;
  v_event_starts_at timestamptz;
  v_scheduled_for timestamptz;
  v_result public.event_reminders%rowtype;
begin
  if v_user_key is null then
    raise exception 'authentication_required';
  end if;

  if p_provider not in ('telegram', 'whatsapp', 'instagram', 'messenger') then
    raise exception 'unsupported_reminder_provider';
  end if;

  if p_lead_minutes not in (15, 60, 180, 1440) then
    raise exception 'unsupported_reminder_lead';
  end if;

  select activity.*
  into v_activity
  from public.activities activity
  where activity.id = p_activity_id
    and private.go_irl_can_read_activity(
      activity.id,
      activity.visibility,
      activity.organizer_key
    );

  if not found then
    raise exception 'event_not_found_or_not_allowed';
  end if;

  if not exists (
    select 1
    from public.user_provider_identities identity
    where identity.user_key = v_user_key
      and identity.provider = p_provider
      and identity.status = 'active'
  ) then
    raise exception 'provider_not_linked';
  end if;

  v_event_starts_at := make_timestamptz(
    extract(year from v_activity.event_date)::integer,
    extract(month from v_activity.event_date)::integer,
    extract(day from v_activity.event_date)::integer,
    extract(hour from v_activity.event_time)::integer,
    extract(minute from v_activity.event_time)::integer,
    0,
    'Europe/Prague'
  );
  v_scheduled_for := v_event_starts_at - make_interval(mins => p_lead_minutes);

  if v_scheduled_for <= now() then
    raise exception 'reminder_time_passed';
  end if;

  update public.user_provider_identities
  set consented_at = coalesce(consented_at, now()),
      updated_at = now()
  where user_key = v_user_key
    and provider = p_provider;

  insert into public.event_reminders (
    user_key,
    activity_id,
    provider,
    lead_minutes,
    event_starts_at,
    scheduled_for,
    status,
    attempt_count,
    next_attempt_at,
    leased_at,
    sent_at,
    last_error_code,
    delivery_key,
    updated_at
  ) values (
    v_user_key,
    p_activity_id,
    p_provider,
    p_lead_minutes,
    v_event_starts_at,
    v_scheduled_for,
    'scheduled',
    0,
    null,
    null,
    null,
    null,
    'reminder:' || v_user_key || ':' || p_activity_id::text || ':' || extract(epoch from v_scheduled_for)::bigint::text,
    now()
  )
  on conflict (user_key, activity_id) do update
  set provider = excluded.provider,
      lead_minutes = excluded.lead_minutes,
      event_starts_at = excluded.event_starts_at,
      scheduled_for = excluded.scheduled_for,
      status = 'scheduled',
      attempt_count = 0,
      next_attempt_at = null,
      leased_at = null,
      sent_at = null,
      last_error_code = null,
      delivery_key = excluded.delivery_key,
      updated_at = now()
  returning * into v_result;

  return v_result;
end;
$$;

create or replace function private.go_irl_guard_coach_profile_write()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $$
begin
  if current_user = 'postgres' or private.go_irl_request_can_moderate() then
    if tg_op = 'INSERT' then
      new.updated_at := now();
    elsif tg_op = 'UPDATE' then
      new.updated_at := now();
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.user_key is distinct from public.go_irl_request_user_key() then
      raise exception 'coach_profile_owner_required';
    end if;
    new.is_verified := false;
    new.rating_avg := 0;
    new.rating_count := 0;
    new.rating_weighted := 0;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  if new.id is distinct from old.id
    or new.user_key is distinct from old.user_key
    or new.is_verified is distinct from old.is_verified
    or new.rating_avg is distinct from old.rating_avg
    or new.rating_count is distinct from old.rating_count
    or new.rating_weighted is distinct from old.rating_weighted
    or new.created_at is distinct from old.created_at then
    raise exception 'coach_profile_protected_fields_immutable';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.go_irl_guard_coach_request_write()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $$
begin
  if current_user = 'postgres' or private.go_irl_request_can_moderate() then
    new.updated_at := now();
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.requester_user_key is distinct from public.go_irl_request_user_key() then
      raise exception 'coach_request_owner_required';
    end if;
    new.status := 'pending';
    new.admin_note := null;
    new.created_at := now();
    new.updated_at := now();
    return new;
  end if;

  if private.go_irl_can_manage_activity(old.activity_id) then
    new.updated_at := now();
    return new;
  end if;

  if old.requester_user_key is distinct from public.go_irl_request_user_key()
    or old.status <> 'pending'
    or new.status <> 'cancelled' then
    raise exception 'coach_request_transition_not_allowed';
  end if;

  if new.id is distinct from old.id
    or new.activity_id is distinct from old.activity_id
    or new.requester_user_key is distinct from old.requester_user_key
    or new.coach_profile_id is distinct from old.coach_profile_id
    or new.request_type is distinct from old.request_type
    or new.sport_type is distinct from old.sport_type
    or new.goal is distinct from old.goal
    or new.level is distinct from old.level
    or new.budget_min is distinct from old.budget_min
    or new.budget_max is distinct from old.budget_max
    or new.payment_mode is distinct from old.payment_mode
    or new.admin_note is distinct from old.admin_note
    or new.created_at is distinct from old.created_at then
    raise exception 'coach_request_fields_immutable_on_cancel';
  end if;

  new.updated_at := now();
  return new;
end;
$$;

create or replace function private.go_irl_guard_coach_review_write()
returns trigger
language plpgsql
security invoker
set search_path to ''
as $$
begin
  if current_user = 'postgres' or private.go_irl_request_can_moderate() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.reviewer_user_key is distinct from public.go_irl_request_user_key() then
      raise exception 'coach_review_owner_required';
    end if;
    new.created_at := now();
    return new;
  end if;

  if new.id is distinct from old.id
    or new.coach_profile_id is distinct from old.coach_profile_id
    or new.activity_id is distinct from old.activity_id
    or new.reviewer_user_key is distinct from old.reviewer_user_key
    or new.created_at is distinct from old.created_at then
    raise exception 'coach_review_identity_immutable';
  end if;

  return new;
end;
$$;

revoke all on function private.go_irl_guard_coach_profile_write() from public, anon;
revoke all on function private.go_irl_guard_coach_request_write() from public, anon;
revoke all on function private.go_irl_guard_coach_review_write() from public, anon;
grant execute on function private.go_irl_guard_coach_profile_write() to authenticated, service_role;
grant execute on function private.go_irl_guard_coach_request_write() to authenticated, service_role;
grant execute on function private.go_irl_guard_coach_review_write() to authenticated, service_role;

drop trigger if exists coach_profiles_guard_write on public.coach_profiles;
create trigger coach_profiles_guard_write
before insert or update on public.coach_profiles
for each row execute function private.go_irl_guard_coach_profile_write();

drop trigger if exists coach_requests_guard_write on public.coach_requests;
create trigger coach_requests_guard_write
before insert or update on public.coach_requests
for each row execute function private.go_irl_guard_coach_request_write();

drop trigger if exists coach_reviews_guard_write on public.coach_reviews;
create trigger coach_reviews_guard_write
before insert or update on public.coach_reviews
for each row execute function private.go_irl_guard_coach_review_write();

drop policy if exists coach_profiles_insert_own on public.coach_profiles;
drop policy if exists coach_profiles_read_active on public.coach_profiles;
drop policy if exists coach_profiles_update_own on public.coach_profiles;
drop policy if exists coach_requests_insert_own on public.coach_requests;
drop policy if exists coach_requests_read_own on public.coach_requests;
drop policy if exists coach_requests_update_admin on public.coach_requests;
drop policy if exists coach_requests_update_organizer on public.coach_requests;
drop policy if exists coach_requests_update_own_cancel on public.coach_requests;
drop policy if exists coach_reviews_insert_own on public.coach_reviews;
drop policy if exists coach_reviews_read_public on public.coach_reviews;
drop policy if exists coach_reviews_update_own on public.coach_reviews;

drop policy if exists "coach profiles create own" on public.coach_profiles;
create policy "coach profiles create own"
on public.coach_profiles
for insert
to authenticated
with check (
  user_key = public.go_irl_request_user_key()
  and is_verified = false
  and rating_avg = 0
  and rating_count = 0
  and rating_weighted = 0
);

drop policy if exists "coach requests update allowed" on public.coach_requests;
create policy "coach requests update allowed"
on public.coach_requests
for update
to authenticated
using (
  requester_user_key = public.go_irl_request_user_key()
  or private.go_irl_can_manage_activity(activity_id)
)
with check (
  private.go_irl_can_manage_activity(activity_id)
  or (
    requester_user_key = public.go_irl_request_user_key()
    and status = 'cancelled'
  )
);

drop policy if exists "admin users staff read" on public.admin_users;
create policy "admin users staff read"
on public.admin_users
for select
to authenticated
using (private.go_irl_request_is_admin());

drop policy if exists "audit log own insert" on public.audit_log;
drop policy if exists "audit log staff read" on public.audit_log;
create policy "audit log staff read"
on public.audit_log
for select
to authenticated
using (private.go_irl_request_can_moderate());

drop policy if exists "admin user roles insert" on public.user_roles;
drop policy if exists "user roles self or staff read" on public.user_roles;
drop policy if exists "admin user roles update" on public.user_roles;
create policy "admin user roles insert"
on public.user_roles
for insert
to authenticated
with check (private.go_irl_request_is_admin());
create policy "user roles self or staff read"
on public.user_roles
for select
to authenticated
using (
  user_key = public.go_irl_request_user_key()
  or private.go_irl_request_can_moderate()
);
create policy "admin user roles update"
on public.user_roles
for update
to authenticated
using (private.go_irl_request_is_admin())
with check (private.go_irl_request_is_admin());

revoke all privileges on all tables in schema public from anon;
grant select on public.admin_users to authenticated;
grant select on public.audit_log to authenticated;
grant select, insert, update on public.user_roles to authenticated;
grant all privileges on all tables in schema public to service_role;

drop trigger if exists coach_reviews_update_rating on public.coach_reviews;

alter table public.activities validate constraint activities_activity_cs_length_check;
alter table public.activities validate constraint activities_activity_ru_length_check;
alter table public.activities validate constraint activities_address_length_check;
alter table public.activities validate constraint activities_description_cs_length_check;
alter table public.activities validate constraint activities_description_ru_length_check;
alter table public.activities validate constraint activities_location_url_length_check;
alter table public.activities validate constraint activities_participant_note_length_check;
alter table public.activities validate constraint activities_title_cs_length_check;
alter table public.activities validate constraint activities_title_ru_length_check;

create or replace function public.go_irl_configure_reminder_worker_schedule()
returns bigint
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_job_id bigint;
  v_secret_count integer;
begin
  select count(*) into v_secret_count
  from vault.decrypted_secrets secret
  where secret.name = 'go_irl_reminder_worker_secret'
    and length(secret.decrypted_secret) >= 32;

  if v_secret_count <> 1 then
    raise exception 'reminder_worker_secret_missing_or_ambiguous';
  end if;

  perform cron.unschedule(job.jobid)
  from cron.job job
  where job.jobname = 'go-irl-reminder-worker';

  select cron.schedule(
    'go-irl-reminder-worker',
    '*/15 * * * *',
    $job$
      select net.http_post(
        url := 'https://go-irl-1-0.vercel.app/api/reminders/run',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select secret.decrypted_secret
            from vault.decrypted_secrets secret
            where secret.name = 'go_irl_reminder_worker_secret'
          )
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 10000
      ) as request_id;
    $job$
  ) into v_job_id;

  return v_job_id;
end;
$$;
