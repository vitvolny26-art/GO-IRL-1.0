-- BEAUTY013: additive professional content, portfolio URLs, Instagram and multiple services.
-- Repository presence does not apply this migration to production.

alter table public.beauty_professional_profiles
  add column if not exists instagram_url text,
  add column if not exists trust_content_i18n jsonb not null default '{}'::jsonb,
  add column if not exists portfolio_urls jsonb not null default '[]'::jsonb;

alter table public.beauty_professional_services
  add column if not exists buffer_minutes integer not null default 0,
  add column if not exists sort_order integer not null default 0;

alter table public.beauty_professional_services
  drop constraint if exists beauty_professional_services_profile_id_key;

create index if not exists beauty_professional_services_profile_sort_idx
  on public.beauty_professional_services(profile_id, sort_order, created_at);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'beauty_profiles_trust_content_object_check'
  ) then
    alter table public.beauty_professional_profiles
      add constraint beauty_profiles_trust_content_object_check
      check (jsonb_typeof(trust_content_i18n) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_profiles_portfolio_array_check'
  ) then
    alter table public.beauty_professional_profiles
      add constraint beauty_profiles_portfolio_array_check
      check (jsonb_typeof(portfolio_urls) = 'array' and jsonb_array_length(portfolio_urls) <= 20);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_services_buffer_check'
  ) then
    alter table public.beauty_professional_services
      add constraint beauty_services_buffer_check check (buffer_minutes between 0 and 240);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_services_sort_order_check'
  ) then
    alter table public.beauty_professional_services
      add constraint beauty_services_sort_order_check check (sort_order between 0 and 999);
  end if;
end;
$$;

create or replace function public.go_irl_beauty_normalize_instagram(p_value text)
returns text
language plpgsql
immutable
set search_path = pg_catalog, public
as $$
declare
  v_value text := nullif(btrim(coalesce(p_value, '')), '');
begin
  if v_value is null then return null; end if;
  if v_value !~ '^https://(www\.)?instagram\.com/[A-Za-z0-9._-]+/?$' then
    raise exception 'invalid Instagram URL' using errcode = '22023';
  end if;
  return left(v_value, 240);
end;
$$;

create or replace function public.get_my_beauty_profile_v3()
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
  instagram_url text,
  trust_content_i18n jsonb,
  portfolio_urls jsonb,
  services jsonb,
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
    profile.instagram_url,
    profile.trust_content_i18n,
    profile.portfolio_urls,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', service.id,
        'nameByLanguage', service.service_name_i18n,
        'durationMinutes', service.duration_minutes,
        'priceCzk', service.price_czk,
        'bufferMinutes', service.buffer_minutes,
        'active', service.active,
        'sortOrder', service.sort_order
      ) order by service.sort_order, service.created_at)
      from public.beauty_professional_services service
      where service.profile_id = profile.id
    ), '[]'::jsonb),
    greatest(profile.updated_at, coalesce((
      select max(service.updated_at) from public.beauty_professional_services service where service.profile_id = profile.id
    ), profile.updated_at))
  from public.beauty_professional_profiles profile
  where profile.owner_user_key = public.go_irl_auth_user_key()
    and public.go_irl_current_user_is_professional()
  limit 1;
$$;

create or replace function public.save_my_beauty_profile_v3(
  p_display_name text,
  p_public_location text,
  p_contact text,
  p_exact_address text,
  p_description_i18n jsonb,
  p_instagram_url text,
  p_trust_content_i18n jsonb,
  p_portfolio_urls jsonb,
  p_services jsonb,
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
  v_profile public.beauty_professional_profiles%rowtype;
  v_existing_updated_at timestamptz;
  v_service jsonb;
  v_index integer := 0;
  v_name_i18n jsonb;
  v_name text;
begin
  if v_user_key is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;
  if jsonb_typeof(coalesce(p_description_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_trust_content_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_portfolio_urls, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_services, '[]'::jsonb)) <> 'array' then
    raise exception 'invalid Beauty013 JSON payload' using errcode = '22023';
  end if;
  if jsonb_array_length(coalesce(p_services, '[]'::jsonb)) < 1 then
    raise exception 'at least one service is required' using errcode = '22023';
  end if;

  select greatest(profile.updated_at, coalesce((
    select max(service.updated_at) from public.beauty_professional_services service where service.profile_id = profile.id
  ), profile.updated_at))
  into v_existing_updated_at
  from public.beauty_professional_profiles profile
  where profile.owner_user_key = v_user_key;

  if found and p_expected_updated_at is distinct from v_existing_updated_at then
    return query select 'conflict'::text, profile.id, profile.slug, profile.publication_state, v_existing_updated_at
    from public.beauty_professional_profiles profile where profile.owner_user_key = v_user_key;
    return;
  end if;

  insert into public.beauty_professional_profiles (
    owner_user_key, slug, city_id, display_name, public_location, contact, exact_address,
    publication_state, description_i18n, instagram_url, trust_content_i18n, portfolio_urls
  ) values (
    v_user_key,
    'beauty-' || substring(encode(digest(v_user_key, 'sha256'), 'hex') from 1 for 16),
    'olomouc', btrim(p_display_name), btrim(p_public_location), btrim(p_contact), btrim(p_exact_address),
    p_publication_state, coalesce(p_description_i18n, '{}'::jsonb),
    public.go_irl_beauty_normalize_instagram(p_instagram_url),
    coalesce(p_trust_content_i18n, '{}'::jsonb),
    (select coalesce(jsonb_agg(left(btrim(value), 500)), '[]'::jsonb)
      from jsonb_array_elements_text(coalesce(p_portfolio_urls, '[]'::jsonb)) as item(value)
      where btrim(value) ~ '^https://')
  )
  on conflict (owner_user_key) do update set
    display_name = excluded.display_name,
    public_location = excluded.public_location,
    contact = excluded.contact,
    exact_address = excluded.exact_address,
    publication_state = excluded.publication_state,
    description_i18n = excluded.description_i18n,
    instagram_url = excluded.instagram_url,
    trust_content_i18n = excluded.trust_content_i18n,
    portfolio_urls = excluded.portfolio_urls
  returning * into v_profile;

  delete from public.beauty_professional_services where profile_id = v_profile.id;
  for v_service in select value from jsonb_array_elements(p_services) loop
    v_name_i18n := coalesce(v_service -> 'nameByLanguage', '{}'::jsonb);
    v_name := public.go_irl_beauty_i18n_pick(v_name_i18n, 'en', '');
    if char_length(v_name) < 2 then
      raise exception 'service name is required' using errcode = '22023';
    end if;
    insert into public.beauty_professional_services (
      profile_id, service_name, service_name_i18n, duration_minutes, price_czk,
      currency, active, buffer_minutes, sort_order
    ) values (
      v_profile.id, v_name, v_name_i18n,
      (v_service ->> 'durationMinutes')::integer,
      (v_service ->> 'priceCzk')::integer,
      'CZK', coalesce((v_service ->> 'active')::boolean, true),
      coalesce((v_service ->> 'bufferMinutes')::integer, 0), v_index
    );
    v_index := v_index + 1;
  end loop;

  return query select 'saved'::text, v_profile.id, v_profile.slug, v_profile.publication_state,
    greatest(v_profile.updated_at, coalesce((select max(updated_at) from public.beauty_professional_services where profile_id = v_profile.id), v_profile.updated_at));
end;
$$;

create or replace function public.go_irl_list_public_beauty_professionals_v3(
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
  instagram_url text,
  trust_content jsonb,
  portfolio_urls jsonb,
  service_id uuid,
  service_name text,
  duration_minutes integer,
  price_czk integer,
  buffer_minutes integer,
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
    profile.id, profile.slug, profile.display_name, profile.city_id, profile.public_location,
    public.go_irl_beauty_i18n_pick(profile.description_i18n, p_language, ''),
    profile.instagram_url,
    jsonb_strip_nulls(jsonb_build_object(
      'experience', public.go_irl_beauty_i18n_pick(profile.trust_content_i18n -> 'experience', p_language, ''),
      'hygiene', public.go_irl_beauty_i18n_pick(profile.trust_content_i18n -> 'hygiene', p_language, ''),
      'materials', public.go_irl_beauty_i18n_pick(profile.trust_content_i18n -> 'materials', p_language, ''),
      'languages', public.go_irl_beauty_i18n_pick(profile.trust_content_i18n -> 'languages', p_language, ''),
      'certificates', public.go_irl_beauty_i18n_pick(profile.trust_content_i18n -> 'certificates', p_language, ''),
      'bookingNotes', public.go_irl_beauty_i18n_pick(profile.trust_content_i18n -> 'bookingNotes', p_language, '')
    )),
    profile.portfolio_urls,
    service.id,
    public.go_irl_beauty_i18n_pick(service.service_name_i18n, p_language, service.service_name),
    service.duration_minutes, service.price_czk, service.buffer_minutes, service.currency,
    '/beauty/' || profile.slug,
    greatest(profile.updated_at, service.updated_at)
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where p_requested_city_id = 'olomouc'
    and profile.city_id = p_requested_city_id
    and profile.publication_state = 'published'
    and service.active = true
  order by profile.display_name, service.sort_order, service.created_at;
$$;

revoke all on function public.go_irl_beauty_normalize_instagram(text) from public, anon;
revoke all on function public.get_my_beauty_profile_v3() from public, anon;
revoke all on function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, text, timestamptz) from public, anon;
revoke all on function public.go_irl_list_public_beauty_professionals_v3(text, text) from public;

grant execute on function public.go_irl_beauty_normalize_instagram(text) to authenticated;
grant execute on function public.get_my_beauty_profile_v3() to authenticated;
grant execute on function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, text, timestamptz) to authenticated;
grant execute on function public.go_irl_list_public_beauty_professionals_v3(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
