-- SHARE004-A: persistent Beauty sharing-card contract.
-- Repository-only migration. Do not apply to production without a separate approval and rollback window.
-- This migration stores card configuration/status in Postgres and card artwork in dedicated Storage buckets.

create table if not exists public.beauty_share_cards (
  profile_id uuid primary key references public.beauty_professional_profiles(id) on delete cascade,
  template_version integer not null default 1,
  status text not null default 'deleted',
  background_object_path text,
  logo_object_path text,
  generated_object_path text,
  background_position_y smallint not null default 50,
  service_ids uuid[] not null default '{}'::uuid[],
  source_fingerprint text not null default '',
  error_message text not null default '',
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beauty_share_cards_template_version_check
    check (template_version between 1 and 1000),
  constraint beauty_share_cards_status_check
    check (status in ('ready', 'updating', 'error', 'deleted')),
  constraint beauty_share_cards_background_position_check
    check (background_position_y between 0 and 100),
  constraint beauty_share_cards_service_count_check
    check (cardinality(service_ids) <= 3),
  constraint beauty_share_cards_background_path_check
    check (
      background_object_path is null
      or (
        char_length(background_object_path) between 3 and 500
        and background_object_path !~ '(^/|\.\.)'
      )
    ),
  constraint beauty_share_cards_logo_path_check
    check (
      logo_object_path is null
      or (
        char_length(logo_object_path) between 3 and 500
        and logo_object_path !~ '(^/|\.\.)'
      )
    ),
  constraint beauty_share_cards_generated_path_check
    check (
      generated_object_path is null
      or (
        char_length(generated_object_path) between 3 and 500
        and generated_object_path !~ '(^/|\.\.)'
      )
    ),
  constraint beauty_share_cards_fingerprint_check
    check (char_length(source_fingerprint) <= 200),
  constraint beauty_share_cards_error_message_check
    check (char_length(error_message) <= 1000),
  constraint beauty_share_cards_ready_check
    check (
      status <> 'ready'
      or (
        generated_object_path is not null
        and generated_at is not null
        and source_fingerprint <> ''
      )
    )
);

create index if not exists beauty_share_cards_status_updated_idx
on public.beauty_share_cards(status, updated_at desc);

drop trigger if exists beauty_share_cards_touch_updated_at on public.beauty_share_cards;
create trigger beauty_share_cards_touch_updated_at
before update on public.beauty_share_cards
for each row
execute function public.go_irl_touch_updated_at();

alter table public.beauty_share_cards enable row level security;

create or replace function public.go_irl_current_user_has_any_role(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select exists (
    select 1
    from public.user_roles role_assignment
    where role_assignment.user_key = public.go_irl_auth_user_key()
      and role_assignment.role = any(coalesce(p_roles, '{}'::text[]))
  );
$$;

revoke all on function public.go_irl_current_user_has_any_role(text[]) from public;
revoke all on function public.go_irl_current_user_has_any_role(text[]) from anon;
grant execute on function public.go_irl_current_user_has_any_role(text[]) to authenticated;

drop policy if exists "beauty share cards owner read" on public.beauty_share_cards;
create policy "beauty share cards owner read"
on public.beauty_share_cards for select to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty share cards owner insert" on public.beauty_share_cards;
create policy "beauty share cards owner insert"
on public.beauty_share_cards for insert to authenticated
with check (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty share cards owner update" on public.beauty_share_cards;
create policy "beauty share cards owner update"
on public.beauty_share_cards for update to authenticated
using (public.go_irl_owns_beauty_profile(profile_id))
with check (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty share cards owner delete" on public.beauty_share_cards;
create policy "beauty share cards owner delete"
on public.beauty_share_cards for delete to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty share cards admin read" on public.beauty_share_cards;
create policy "beauty share cards admin read"
on public.beauty_share_cards for select to authenticated
using (public.go_irl_current_user_has_any_role(array['admin']::text[]));

revoke all on table public.beauty_share_cards from public;
revoke all on table public.beauty_share_cards from anon;
grant select, insert, update, delete on table public.beauty_share_cards to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values
  (
    'beauty-share-assets',
    'beauty-share-assets',
    false,
    8388608,
    array['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'beauty-share-cards',
    'beauty-share-cards',
    true,
    5242880,
    array['image/jpeg']::text[]
  )
on conflict (id) do update
set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "beauty share objects owner insert" on storage.objects;
create policy "beauty share objects owner insert"
on storage.objects for insert to authenticated
with check (
  bucket_id in ('beauty-share-assets', 'beauty-share-cards')
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
);

drop policy if exists "beauty share objects owner select" on storage.objects;
create policy "beauty share objects owner select"
on storage.objects for select to authenticated
using (
  bucket_id in ('beauty-share-assets', 'beauty-share-cards')
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
);

drop policy if exists "beauty share objects owner update" on storage.objects;
create policy "beauty share objects owner update"
on storage.objects for update to authenticated
using (
  bucket_id in ('beauty-share-assets', 'beauty-share-cards')
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
)
with check (
  bucket_id in ('beauty-share-assets', 'beauty-share-cards')
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
);

drop policy if exists "beauty share objects owner delete" on storage.objects;
create policy "beauty share objects owner delete"
on storage.objects for delete to authenticated
using (
  bucket_id in ('beauty-share-assets', 'beauty-share-cards')
  and (storage.foldername(name))[1] = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
);

create or replace function public.get_my_beauty_share_card()
returns table (
  profile_id uuid,
  template_version integer,
  card_status text,
  background_object_path text,
  logo_object_path text,
  generated_object_path text,
  background_position_y integer,
  service_ids uuid[],
  source_fingerprint text,
  error_message text,
  generated_at timestamptz,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    card.profile_id,
    card.template_version,
    card.status,
    card.background_object_path,
    card.logo_object_path,
    card.generated_object_path,
    card.background_position_y::integer,
    card.service_ids,
    card.source_fingerprint,
    card.error_message,
    card.generated_at,
    card.updated_at
  from public.beauty_share_cards card
  where public.go_irl_owns_beauty_profile(card.profile_id)
  limit 1;
$$;

create or replace function public.save_my_beauty_share_card(
  p_template_version integer,
  p_status text,
  p_background_object_path text default null,
  p_logo_object_path text default null,
  p_generated_object_path text default null,
  p_background_position_y integer default 50,
  p_service_ids jsonb default '[]'::jsonb,
  p_source_fingerprint text default '',
  p_error_message text default '',
  p_generated_at timestamptz default null,
  p_expected_updated_at timestamptz default null
)
returns table (
  save_status text,
  profile_id uuid,
  card_status text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_profile_id uuid;
  v_existing_updated_at timestamptz;
  v_service_id_text text;
  v_service_id uuid;
  v_service_ids uuid[] := '{}'::uuid[];
  v_prefix text;
  v_background_object_path text := nullif(btrim(coalesce(p_background_object_path, '')), '');
  v_logo_object_path text := nullif(btrim(coalesce(p_logo_object_path, '')), '');
  v_generated_object_path text := nullif(btrim(coalesce(p_generated_object_path, '')), '');
  v_source_fingerprint text := left(btrim(coalesce(p_source_fingerprint, '')), 200);
  v_error_message text := left(btrim(coalesce(p_error_message, '')), 1000);
begin
  if v_user_key is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;

  select profile.id
  into v_profile_id
  from public.beauty_professional_profiles profile
  where profile.owner_user_key = v_user_key;

  if v_profile_id is null then
    raise exception 'Beauty profile required before card creation' using errcode = '23503';
  end if;

  if p_template_version not between 1 and 1000
    or p_status not in ('ready', 'updating', 'error', 'deleted')
    or p_background_position_y not between 0 and 100 then
    raise exception 'invalid Beauty share card template, status or background position' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_service_ids, '[]'::jsonb)) <> 'array'
    or jsonb_array_length(coalesce(p_service_ids, '[]'::jsonb)) > 3 then
    raise exception 'Beauty share card accepts at most three service IDs' using errcode = '22023';
  end if;

  for v_service_id_text in
    select value
    from jsonb_array_elements_text(coalesce(p_service_ids, '[]'::jsonb))
  loop
    if v_service_id_text !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
      raise exception 'Beauty share card service ID must be UUID' using errcode = '22023';
    end if;
    v_service_id := v_service_id_text::uuid;
    if not exists (
      select 1
      from public.beauty_professional_services service
      where service.id = v_service_id
        and service.profile_id = v_profile_id
        and service.active = true
        and service.archived = false
    ) then
      raise exception 'Beauty share card service must be active and owned by the profile' using errcode = '22023';
    end if;
    if not v_service_id = any(v_service_ids) then
      v_service_ids := array_append(v_service_ids, v_service_id);
    end if;
  end loop;

  v_prefix := v_user_key || '/beauty-share-card/';
  if v_background_object_path is not null
    and left(v_background_object_path, char_length(v_prefix || 'background/')) <> v_prefix || 'background/' then
    raise exception 'Beauty share card background path must use the owner background prefix' using errcode = '22023';
  end if;
  if v_logo_object_path is not null
    and left(v_logo_object_path, char_length(v_prefix || 'logo/')) <> v_prefix || 'logo/' then
    raise exception 'Beauty share card logo path must use the owner logo prefix' using errcode = '22023';
  end if;
  if v_generated_object_path is not null
    and left(v_generated_object_path, char_length(v_prefix || 'generated/')) <> v_prefix || 'generated/' then
    raise exception 'Beauty share card image path must use the owner generated prefix' using errcode = '22023';
  end if;

  if p_status = 'ready'
    and (v_generated_object_path is null or p_generated_at is null or v_source_fingerprint = '') then
    raise exception 'ready Beauty share card requires image, timestamp and fingerprint' using errcode = '22023';
  end if;

  select card.updated_at
  into v_existing_updated_at
  from public.beauty_share_cards card
  where card.profile_id = v_profile_id;

  if found and p_expected_updated_at is distinct from v_existing_updated_at then
    return query
    select 'conflict'::text, card.profile_id, card.status, card.updated_at
    from public.beauty_share_cards card
    where card.profile_id = v_profile_id;
    return;
  end if;

  insert into public.beauty_share_cards (
    profile_id,
    template_version,
    status,
    background_object_path,
    logo_object_path,
    generated_object_path,
    background_position_y,
    service_ids,
    source_fingerprint,
    error_message,
    generated_at
  )
  values (
    v_profile_id,
    p_template_version,
    p_status,
    v_background_object_path,
    v_logo_object_path,
    case when p_status = 'deleted' then null else v_generated_object_path end,
    p_background_position_y,
    v_service_ids,
    case when p_status = 'deleted' then '' else v_source_fingerprint end,
    v_error_message,
    case when p_status = 'deleted' then null else p_generated_at end
  )
  on conflict (profile_id) do update
  set
    template_version = excluded.template_version,
    status = excluded.status,
    background_object_path = excluded.background_object_path,
    logo_object_path = excluded.logo_object_path,
    generated_object_path = excluded.generated_object_path,
    background_position_y = excluded.background_position_y,
    service_ids = excluded.service_ids,
    source_fingerprint = excluded.source_fingerprint,
    error_message = excluded.error_message,
    generated_at = excluded.generated_at;

  return query
  select 'saved'::text, card.profile_id, card.status, card.updated_at
  from public.beauty_share_cards card
  where card.profile_id = v_profile_id;
end;
$$;

create or replace function public.delete_my_beauty_share_card(
  p_expected_updated_at timestamptz default null
)
returns table (
  save_status text,
  profile_id uuid,
  card_status text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_profile_id uuid;
  v_existing_updated_at timestamptz;
begin
  select profile.id
  into v_profile_id
  from public.beauty_professional_profiles profile
  where profile.owner_user_key = public.go_irl_auth_user_key()
    and public.go_irl_current_user_is_professional();

  if v_profile_id is null then
    raise exception 'current professional Beauty profile required' using errcode = '42501';
  end if;

  select card.updated_at
  into v_existing_updated_at
  from public.beauty_share_cards card
  where card.profile_id = v_profile_id;

  if not found then
    return;
  end if;

  if p_expected_updated_at is distinct from v_existing_updated_at then
    return query
    select 'conflict'::text, card.profile_id, card.status, card.updated_at
    from public.beauty_share_cards card
    where card.profile_id = v_profile_id;
    return;
  end if;

  update public.beauty_share_cards
  set
    status = 'deleted',
    generated_object_path = null,
    source_fingerprint = '',
    error_message = '',
    generated_at = null
  where beauty_share_cards.profile_id = v_profile_id;

  return query
  select 'saved'::text, card.profile_id, card.status, card.updated_at
  from public.beauty_share_cards card
  where card.profile_id = v_profile_id;
end;
$$;

create or replace function public.go_irl_get_beauty_share_card_status(p_profile_id uuid)
returns table (
  profile_id uuid,
  card_status text,
  template_version integer,
  has_generated_image boolean,
  generated_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path = pg_catalog, public
as $$
begin
  if public.go_irl_auth_user_key() is null then
    raise exception 'authenticated user required' using errcode = '42501';
  end if;

  if not public.go_irl_owns_beauty_profile(p_profile_id)
    and not public.go_irl_current_user_has_any_role(array['admin', 'organizer']::text[]) then
    raise exception 'Beauty share card status access denied' using errcode = '42501';
  end if;

  return query
  select
    card.profile_id,
    card.status,
    card.template_version,
    card.generated_object_path is not null,
    card.generated_at,
    card.updated_at
  from public.beauty_share_cards card
  where card.profile_id = p_profile_id;
end;
$$;

revoke all on function public.get_my_beauty_share_card() from public;
revoke all on function public.get_my_beauty_share_card() from anon;
revoke all on function public.save_my_beauty_share_card(integer, text, text, text, text, integer, jsonb, text, text, timestamptz, timestamptz) from public;
revoke all on function public.save_my_beauty_share_card(integer, text, text, text, text, integer, jsonb, text, text, timestamptz, timestamptz) from anon;
revoke all on function public.delete_my_beauty_share_card(timestamptz) from public;
revoke all on function public.delete_my_beauty_share_card(timestamptz) from anon;
revoke all on function public.go_irl_get_beauty_share_card_status(uuid) from public;
revoke all on function public.go_irl_get_beauty_share_card_status(uuid) from anon;

grant execute on function public.get_my_beauty_share_card() to authenticated;
grant execute on function public.save_my_beauty_share_card(integer, text, text, text, text, integer, jsonb, text, text, timestamptz, timestamptz) to authenticated;
grant execute on function public.delete_my_beauty_share_card(timestamptz) to authenticated;
grant execute on function public.go_irl_get_beauty_share_card_status(uuid) to authenticated;

notify pgrst, 'reload schema';
