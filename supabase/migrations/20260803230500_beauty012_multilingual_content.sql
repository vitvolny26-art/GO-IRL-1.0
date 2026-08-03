-- BEAUTY012 Slice B: additive multilingual Beauty profile and price-list content.
-- Repository presence does not apply this migration to production.

alter table public.beauty_professional_profiles
  add column if not exists description_i18n jsonb not null default '{}'::jsonb;

alter table public.beauty_professional_services
  add column if not exists service_name_i18n jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_profiles_description_i18n_object_check'
  ) then
    alter table public.beauty_professional_profiles
      add constraint beauty_professional_profiles_description_i18n_object_check
      check (jsonb_typeof(description_i18n) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_services_name_i18n_object_check'
  ) then
    alter table public.beauty_professional_services
      add constraint beauty_professional_services_name_i18n_object_check
      check (jsonb_typeof(service_name_i18n) = 'object');
  end if;
end;
$$;

create or replace function public.go_irl_beauty_i18n_pick(
  p_values jsonb,
  p_language text,
  p_fallback text default ''
)
returns text
language sql
immutable
set search_path = pg_catalog, public
as $$
  select coalesce(
    nullif(btrim(coalesce(p_values ->> case when p_language in ('ru', 'uk', 'cs', 'en') then p_language else 'en' end, '')), ''),
    nullif(btrim(coalesce(p_values ->> 'en', '')), ''),
    nullif(btrim(coalesce(p_values ->> 'cs', '')), ''),
    nullif(btrim(coalesce(p_values ->> 'ru', '')), ''),
    nullif(btrim(coalesce(p_values ->> 'uk', '')), ''),
    btrim(coalesce(p_fallback, ''))
  );
$$;

create or replace function public.get_my_beauty_profile_v2()
returns table (
  profile_id uuid,
  slug text,
  city_id text,
  display_name text,
  public_location text,
  contact text,
  exact_address text,
  publication_state text,
  description_i18n jsonb,
  service_name text,
  service_name_i18n jsonb,
  duration_minutes integer,
  price_czk integer,
  currency text,
  updated_at timestamptz
)
language sql
stable
security invoker
set search_path = pg_catalog, public
as $$
  select
    profile.id,
    profile.slug,
    profile.city_id,
    profile.display_name,
    profile.public_location,
    profile.contact,
    profile.exact_address,
    profile.publication_state,
    profile.description_i18n,
    service.service_name,
    service.service_name_i18n,
    service.duration_minutes,
    service.price_czk,
    service.currency,
    greatest(profile.updated_at, service.updated_at)
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where profile.owner_user_key = public.go_irl_auth_user_key()
    and public.go_irl_current_user_is_professional()
  limit 1;
$$;

create or replace function public.save_my_beauty_profile_v2(
  p_display_name text,
  p_public_location text,
  p_contact text,
  p_exact_address text,
  p_description_i18n jsonb,
  p_service_name_i18n jsonb,
  p_duration_minutes integer,
  p_price_czk integer,
  p_publication_state text,
  p_expected_updated_at timestamptz default null
)
returns table (
  status text,
  profile_id uuid,
  slug text,
  publication_state text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_existing_updated_at timestamptz;
  v_profile public.beauty_professional_profiles%rowtype;
  v_description_i18n jsonb;
  v_service_name_i18n jsonb;
  v_service_name text;
begin
  if v_user_key is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_description_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_service_name_i18n, '{}'::jsonb)) <> 'object' then
    raise exception 'Beauty translations must be JSON objects' using errcode = '22023';
  end if;

  v_description_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_description_i18n ->> 'ru', '')), 500),
    'uk', left(btrim(coalesce(p_description_i18n ->> 'uk', '')), 500),
    'cs', left(btrim(coalesce(p_description_i18n ->> 'cs', '')), 500),
    'en', left(btrim(coalesce(p_description_i18n ->> 'en', '')), 500)
  );
  v_service_name_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_service_name_i18n ->> 'ru', '')), 120),
    'uk', left(btrim(coalesce(p_service_name_i18n ->> 'uk', '')), 120),
    'cs', left(btrim(coalesce(p_service_name_i18n ->> 'cs', '')), 120),
    'en', left(btrim(coalesce(p_service_name_i18n ->> 'en', '')), 120)
  );
  v_service_name := public.go_irl_beauty_i18n_pick(v_service_name_i18n, 'en', '');
  if char_length(v_service_name) < 2 then
    raise exception 'at least one translated service name is required' using errcode = '22023';
  end if;

  select greatest(profile.updated_at, service.updated_at)
  into v_existing_updated_at
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where profile.owner_user_key = v_user_key;

  if found and p_expected_updated_at is distinct from v_existing_updated_at then
    return query
    select
      'conflict'::text,
      profile.id,
      profile.slug,
      profile.publication_state,
      greatest(profile.updated_at, service.updated_at)
    from public.beauty_professional_profiles profile
    join public.beauty_professional_services service on service.profile_id = profile.id
    where profile.owner_user_key = v_user_key;
    return;
  end if;

  insert into public.beauty_professional_profiles (
    owner_user_key,
    slug,
    city_id,
    display_name,
    public_location,
    contact,
    exact_address,
    publication_state,
    description_i18n
  )
  values (
    v_user_key,
    'beauty-' || substring(encode(digest(v_user_key, 'sha256'), 'hex') from 1 for 16),
    'olomouc',
    btrim(p_display_name),
    btrim(p_public_location),
    btrim(p_contact),
    btrim(p_exact_address),
    p_publication_state,
    v_description_i18n
  )
  on conflict (owner_user_key) do update
  set
    display_name = excluded.display_name,
    public_location = excluded.public_location,
    contact = excluded.contact,
    exact_address = excluded.exact_address,
    publication_state = excluded.publication_state,
    description_i18n = excluded.description_i18n
  returning * into v_profile;

  insert into public.beauty_professional_services (
    profile_id,
    service_name,
    service_name_i18n,
    duration_minutes,
    price_czk,
    currency,
    active
  )
  values (
    v_profile.id,
    v_service_name,
    v_service_name_i18n,
    p_duration_minutes,
    p_price_czk,
    'CZK',
    true
  )
  on conflict (profile_id) do update
  set
    service_name = excluded.service_name,
    service_name_i18n = excluded.service_name_i18n,
    duration_minutes = excluded.duration_minutes,
    price_czk = excluded.price_czk,
    currency = 'CZK',
    active = true;

  return query
  select
    'saved'::text,
    v_profile.id,
    v_profile.slug,
    v_profile.publication_state,
    greatest(v_profile.updated_at, service.updated_at)
  from public.beauty_professional_services service
  where service.profile_id = v_profile.id;
end;
$$;

create or replace function public.go_irl_list_public_beauty_professionals_v2(
  p_requested_city_id text default 'olomouc',
  p_language text default 'en'
)
returns table (
  profile_id uuid,
  slug text,
  display_name text,
  city_id text,
  public_location text,
  description text,
  service_name text,
  duration_minutes integer,
  price_czk integer,
  currency text,
  public_link text,
  updated_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select
    profile.id,
    profile.slug,
    profile.display_name,
    profile.city_id,
    profile.public_location,
    public.go_irl_beauty_i18n_pick(profile.description_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(service.service_name_i18n, p_language, service.service_name),
    service.duration_minutes,
    service.price_czk,
    service.currency,
    '/beauty/' || profile.slug,
    greatest(profile.updated_at, service.updated_at)
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where p_requested_city_id = 'olomouc'
    and profile.city_id = p_requested_city_id
    and profile.publication_state = 'published'
    and service.active = true
  order by profile.display_name, profile.id;
$$;

revoke all on function public.go_irl_beauty_i18n_pick(jsonb, text, text) from public;
revoke all on function public.go_irl_beauty_i18n_pick(jsonb, text, text) from anon;
revoke all on function public.get_my_beauty_profile_v2() from public;
revoke all on function public.get_my_beauty_profile_v2() from anon;
revoke all on function public.save_my_beauty_profile_v2(text, text, text, text, jsonb, jsonb, integer, integer, text, timestamptz) from public;
revoke all on function public.save_my_beauty_profile_v2(text, text, text, text, jsonb, jsonb, integer, integer, text, timestamptz) from anon;
revoke all on function public.go_irl_list_public_beauty_professionals_v2(text, text) from public;

grant execute on function public.go_irl_beauty_i18n_pick(jsonb, text, text) to authenticated;
grant execute on function public.get_my_beauty_profile_v2() to authenticated;
grant execute on function public.save_my_beauty_profile_v2(text, text, text, text, jsonb, jsonb, integer, integer, text, timestamptz) to authenticated;
grant execute on function public.go_irl_list_public_beauty_professionals_v2(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
