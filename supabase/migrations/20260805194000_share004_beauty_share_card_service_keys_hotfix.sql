-- SHARE004-A hotfix: Beauty workspace service identifiers are client_key values, not database UUIDs.
-- Repository-only migration. It follows 20260805193000 and is not applied to production by this PR.

alter table public.beauty_share_cards
  drop constraint if exists beauty_share_cards_service_count_check;

alter table public.beauty_share_cards
  alter column service_ids drop default,
  alter column service_ids type text[] using service_ids::text[],
  alter column service_ids set default '{}'::text[];

alter table public.beauty_share_cards
  add constraint beauty_share_cards_service_count_check
  check (cardinality(service_ids) <= 3);

drop function if exists public.get_my_beauty_share_card();

create function public.get_my_beauty_share_card()
returns table (
  profile_id uuid,
  template_version integer,
  card_status text,
  background_object_path text,
  logo_object_path text,
  generated_object_path text,
  background_position_y integer,
  service_ids text[],
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
  v_service_key text;
  v_service_ids text[] := '{}'::text[];
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
    raise exception 'Beauty share card accepts at most three service keys' using errcode = '22023';
  end if;

  for v_service_key in
    select value
    from jsonb_array_elements_text(coalesce(p_service_ids, '[]'::jsonb))
  loop
    v_service_key := btrim(v_service_key);
    if char_length(v_service_key) not between 3 and 120
      or v_service_key !~ '^[A-Za-z0-9._:-]+$' then
      raise exception 'Beauty share card service key is invalid' using errcode = '22023';
    end if;

    if not exists (
      select 1
      from public.beauty_professional_services service
      where service.client_key = v_service_key
        and service.profile_id = v_profile_id
        and service.active = true
        and service.archived = false
    ) then
      raise exception 'Beauty share card service must be active and owned by the profile' using errcode = '22023';
    end if;

    if not v_service_key = any(v_service_ids) then
      v_service_ids := array_append(v_service_ids, v_service_key);
    end if;
  end loop;

  v_prefix := v_user_key || '/beauty-share-card/';
  if v_background_object_path is not null
    and left(v_background_object_path, char_length(v_prefix || 'background/')) <> (v_prefix || 'background/') then
    raise exception 'Beauty share card background path must use the owner background prefix' using errcode = '22023';
  end if;
  if v_logo_object_path is not null
    and left(v_logo_object_path, char_length(v_prefix || 'logo/')) <> (v_prefix || 'logo/') then
    raise exception 'Beauty share card logo path must use the owner logo prefix' using errcode = '22023';
  end if;
  if v_generated_object_path is not null
    and left(v_generated_object_path, char_length(v_prefix || 'generated/')) <> (v_prefix || 'generated/') then
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

revoke all on function public.get_my_beauty_share_card() from public;
revoke all on function public.get_my_beauty_share_card() from anon;
revoke all on function public.save_my_beauty_share_card(integer, text, text, text, text, integer, jsonb, text, text, timestamptz, timestamptz) from public;
revoke all on function public.save_my_beauty_share_card(integer, text, text, text, text, integer, jsonb, text, text, timestamptz, timestamptz) from anon;

grant execute on function public.get_my_beauty_share_card() to authenticated;
grant execute on function public.save_my_beauty_share_card(integer, text, text, text, text, integer, jsonb, text, text, timestamptz, timestamptz) to authenticated;

notify pgrst, 'reload schema';
