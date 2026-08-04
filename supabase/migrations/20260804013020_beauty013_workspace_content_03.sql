create or replace function public.go_irl_save_beauty_profile_compat(
  p_display_name text,
  p_public_location text,
  p_contact text,
  p_exact_address text,
  p_description_i18n jsonb,
  p_service_name_i18n jsonb,
  p_service_name_fallback text,
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
  v_service_id uuid;
  v_description_i18n jsonb;
  v_service_name_i18n jsonb;
  v_service_name text;
begin
  if v_user_key is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;

  if p_publication_state not in ('draft', 'published', 'hidden') then
    raise exception 'invalid Beauty publication state' using errcode = '22023';
  end if;

  if p_description_i18n is not null and jsonb_typeof(p_description_i18n) <> 'object' then
    raise exception 'Beauty description translations must be a JSON object' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(p_service_name_i18n, '{}'::jsonb)) <> 'object' then
    raise exception 'Beauty service translations must be a JSON object' using errcode = '22023';
  end if;

  select profile.*
  into v_profile
  from public.beauty_professional_profiles profile
  where profile.owner_user_key = v_user_key;

  if found then
    select greatest(
      v_profile.updated_at,
      coalesce((
        select max(service.updated_at)
        from public.beauty_professional_services service
        where service.profile_id = v_profile.id
          and service.archived = false
      ), v_profile.updated_at)
    ) into v_existing_updated_at;

    if p_expected_updated_at is distinct from v_existing_updated_at then
      return query select
        'conflict'::text,
        v_profile.id,
        v_profile.slug,
        v_profile.publication_state,
        v_existing_updated_at;
      return;
    end if;
  end if;

  v_description_i18n := case
    when p_description_i18n is null then coalesce(v_profile.description_i18n, '{}'::jsonb)
    else jsonb_build_object(
      'ru', left(btrim(coalesce(p_description_i18n ->> 'ru', '')), 1200),
      'uk', left(btrim(coalesce(p_description_i18n ->> 'uk', '')), 1200),
      'cs', left(btrim(coalesce(p_description_i18n ->> 'cs', '')), 1200),
      'en', left(btrim(coalesce(p_description_i18n ->> 'en', '')), 1200)
    )
  end;
  v_service_name_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_service_name_i18n ->> 'ru', '')), 120),
    'uk', left(btrim(coalesce(p_service_name_i18n ->> 'uk', '')), 120),
    'cs', left(btrim(coalesce(p_service_name_i18n ->> 'cs', '')), 120),
    'en', left(btrim(coalesce(p_service_name_i18n ->> 'en', '')), 120)
  );
  v_service_name := public.go_irl_beauty_i18n_pick(
    v_service_name_i18n,
    'en',
    btrim(coalesce(p_service_name_fallback, ''))
  );

  if char_length(v_service_name) < 2
    or p_duration_minutes not between 5 and 480
    or p_price_czk not between 0 and 100000 then
    raise exception 'Invalid Beauty service name, duration or price' using errcode = '22023';
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

  select service.id
  into v_service_id
  from public.beauty_professional_services service
  where service.profile_id = v_profile.id
    and service.archived = false
  order by service.sort_order, service.created_at, service.id
  limit 1;

  if v_service_id is null then
    insert into public.beauty_professional_services (
      profile_id,
      client_key,
      service_name,
      service_name_i18n,
      duration_minutes,
      price_czk,
      buffer_minutes,
      currency,
      active,
      sort_order,
      archived
    ) values (
      v_profile.id,
      'legacy-' || replace(gen_random_uuid()::text, '-', ''),
      v_service_name,
      v_service_name_i18n,
      p_duration_minutes,
      p_price_czk,
      0,
      'CZK',
      true,
      0,
      false
    ) returning id into v_service_id;
  else
    update public.beauty_professional_services
    set
      service_name = v_service_name,
      service_name_i18n = v_service_name_i18n,
      duration_minutes = p_duration_minutes,
      price_czk = p_price_czk,
      currency = 'CZK',
      active = true,
      archived = false
    where id = v_service_id;
  end if;

  return query
  select
    'saved'::text,
    v_profile.id,
    v_profile.slug,
    v_profile.publication_state,
    greatest(
      v_profile.updated_at,
      coalesce((
        select max(service.updated_at)
        from public.beauty_professional_services service
        where service.profile_id = v_profile.id
          and service.archived = false
      ), v_profile.updated_at)
    );
end;
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
  join lateral (
    select candidate.*
    from public.beauty_professional_services candidate
    where candidate.profile_id = profile.id
      and candidate.archived = false
    order by candidate.sort_order, candidate.created_at, candidate.id
    limit 1
  ) service on true
  where profile.owner_user_key = public.go_irl_auth_user_key()
    and public.go_irl_current_user_is_professional()
  limit 1;
$$;

create or replace function public.get_my_beauty_profile()
returns table (
  profile_id uuid,
  slug text,
  city_id text,
  display_name text,
  public_location text,
  contact text,
  exact_address text,
  publication_state text,
  service_name text,
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
    service.service_name,
    service.duration_minutes,
    service.price_czk,
    service.currency,
    greatest(profile.updated_at, service.updated_at)
  from public.beauty_professional_profiles profile
  join lateral (
    select candidate.*
    from public.beauty_professional_services candidate
    where candidate.profile_id = profile.id
      and candidate.archived = false
    order by candidate.sort_order, candidate.created_at, candidate.id
    limit 1
  ) service on true
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
language sql
security invoker
set search_path = pg_catalog, public
as $$
  select *
  from public.go_irl_save_beauty_profile_compat(
    p_display_name,
    p_public_location,
    p_contact,
    p_exact_address,
    p_description_i18n,
    p_service_name_i18n,
    public.go_irl_beauty_i18n_pick(p_service_name_i18n, 'en', ''),
    p_duration_minutes,
    p_price_czk,
    p_publication_state,
    p_expected_updated_at
  );
$$;

create or replace function public.save_my_beauty_profile(
  p_display_name text,
  p_public_location text,
  p_contact text,
  p_exact_address text,
  p_service_name text,
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
language sql
security invoker
set search_path = pg_catalog, public
as $$
  select *
  from public.go_irl_save_beauty_profile_compat(
    p_display_name,
    p_public_location,
    p_contact,
    p_exact_address,
    null,
    jsonb_build_object('en', btrim(p_service_name)),
    p_service_name,
    p_duration_minutes,
    p_price_czk,
    p_publication_state,
    p_expected_updated_at
  );
$$;
