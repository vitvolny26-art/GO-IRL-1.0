create or replace function public.save_my_beauty_profile_v3(
  p_display_name text,
  p_public_location text,
  p_contact text,
  p_exact_address text,
  p_description_i18n jsonb,
  p_instagram_url text,
  p_experience_i18n jsonb,
  p_specialization_i18n jsonb,
  p_hygiene_i18n jsonb,
  p_materials_i18n jsonb,
  p_spoken_languages_i18n jsonb,
  p_certificates_i18n jsonb,
  p_booking_notes_i18n jsonb,
  p_portfolio jsonb,
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
  v_existing_updated_at timestamptz;
  v_profile public.beauty_professional_profiles%rowtype;
  v_item jsonb;
  v_index integer;
  v_client_key text;
  v_name_i18n jsonb;
  v_service_name text;
  v_duration integer;
  v_price integer;
  v_buffer integer;
  v_active boolean;
  v_active_count integer := 0;
  v_portfolio jsonb := '[]'::jsonb;
  v_image_url text;
  v_alt_i18n jsonb;
  v_instagram_url text;
  v_description_i18n jsonb;
  v_experience_i18n jsonb;
  v_specialization_i18n jsonb;
  v_hygiene_i18n jsonb;
  v_materials_i18n jsonb;
  v_spoken_languages_i18n jsonb;
  v_certificates_i18n jsonb;
  v_booking_notes_i18n jsonb;
begin
  if v_user_key is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;

  if p_publication_state not in ('draft', 'published', 'hidden') then
    raise exception 'invalid Beauty publication state' using errcode = '22023';
  end if;

  if jsonb_typeof(coalesce(p_description_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_experience_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_specialization_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_hygiene_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_materials_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_spoken_languages_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_certificates_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_booking_notes_i18n, '{}'::jsonb)) <> 'object'
    or jsonb_typeof(coalesce(p_portfolio, '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(p_services, '[]'::jsonb)) <> 'array' then
    raise exception 'Beauty content must use the expected JSON object and array shapes' using errcode = '22023';
  end if;

  if jsonb_array_length(coalesce(p_services, '[]'::jsonb)) < 1
    or jsonb_array_length(coalesce(p_services, '[]'::jsonb)) > 50 then
    raise exception 'between 1 and 50 Beauty services are required' using errcode = '22023';
  end if;

  if jsonb_array_length(coalesce(p_portfolio, '[]'::jsonb)) > 24 then
    raise exception 'Beauty portfolio supports at most 24 items' using errcode = '22023';
  end if;

  v_description_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_description_i18n ->> 'ru', '')), 1200),
    'uk', left(btrim(coalesce(p_description_i18n ->> 'uk', '')), 1200),
    'cs', left(btrim(coalesce(p_description_i18n ->> 'cs', '')), 1200),
    'en', left(btrim(coalesce(p_description_i18n ->> 'en', '')), 1200)
  );
  v_experience_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_experience_i18n ->> 'ru', '')), 700),
    'uk', left(btrim(coalesce(p_experience_i18n ->> 'uk', '')), 700),
    'cs', left(btrim(coalesce(p_experience_i18n ->> 'cs', '')), 700),
    'en', left(btrim(coalesce(p_experience_i18n ->> 'en', '')), 700)
  );
  v_specialization_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_specialization_i18n ->> 'ru', '')), 700),
    'uk', left(btrim(coalesce(p_specialization_i18n ->> 'uk', '')), 700),
    'cs', left(btrim(coalesce(p_specialization_i18n ->> 'cs', '')), 700),
    'en', left(btrim(coalesce(p_specialization_i18n ->> 'en', '')), 700)
  );
  v_hygiene_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_hygiene_i18n ->> 'ru', '')), 700),
    'uk', left(btrim(coalesce(p_hygiene_i18n ->> 'uk', '')), 700),
    'cs', left(btrim(coalesce(p_hygiene_i18n ->> 'cs', '')), 700),
    'en', left(btrim(coalesce(p_hygiene_i18n ->> 'en', '')), 700)
  );
  v_materials_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_materials_i18n ->> 'ru', '')), 700),
    'uk', left(btrim(coalesce(p_materials_i18n ->> 'uk', '')), 700),
    'cs', left(btrim(coalesce(p_materials_i18n ->> 'cs', '')), 700),
    'en', left(btrim(coalesce(p_materials_i18n ->> 'en', '')), 700)
  );
  v_spoken_languages_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_spoken_languages_i18n ->> 'ru', '')), 400),
    'uk', left(btrim(coalesce(p_spoken_languages_i18n ->> 'uk', '')), 400),
    'cs', left(btrim(coalesce(p_spoken_languages_i18n ->> 'cs', '')), 400),
    'en', left(btrim(coalesce(p_spoken_languages_i18n ->> 'en', '')), 400)
  );
  v_certificates_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_certificates_i18n ->> 'ru', '')), 700),
    'uk', left(btrim(coalesce(p_certificates_i18n ->> 'uk', '')), 700),
    'cs', left(btrim(coalesce(p_certificates_i18n ->> 'cs', '')), 700),
    'en', left(btrim(coalesce(p_certificates_i18n ->> 'en', '')), 700)
  );
  v_booking_notes_i18n := jsonb_build_object(
    'ru', left(btrim(coalesce(p_booking_notes_i18n ->> 'ru', '')), 700),
    'uk', left(btrim(coalesce(p_booking_notes_i18n ->> 'uk', '')), 700),
    'cs', left(btrim(coalesce(p_booking_notes_i18n ->> 'cs', '')), 700),
    'en', left(btrim(coalesce(p_booking_notes_i18n ->> 'en', '')), 700)
  );

  v_instagram_url := left(btrim(coalesce(p_instagram_url, '')), 300);
  if v_instagram_url <> '' and v_instagram_url !~ '^https://(www\.)?instagram\.com/' then
    raise exception 'Instagram URL must use https://instagram.com/' using errcode = '22023';
  end if;

  for v_item, v_index in
    select value, ordinality::integer - 1
    from jsonb_array_elements(coalesce(p_portfolio, '[]'::jsonb)) with ordinality
  loop
    v_image_url := left(btrim(coalesce(v_item ->> 'image_url', '')), 1200);
    if v_image_url = '' then
      continue;
    end if;
    if v_image_url !~ '^https://'
      or jsonb_typeof(coalesce(v_item -> 'alt_i18n', '{}'::jsonb)) <> 'object' then
      raise exception 'Portfolio items require an HTTPS image URL and alt_i18n object' using errcode = '22023';
    end if;
    v_alt_i18n := jsonb_build_object(
      'ru', left(btrim(coalesce(v_item -> 'alt_i18n' ->> 'ru', '')), 300),
      'uk', left(btrim(coalesce(v_item -> 'alt_i18n' ->> 'uk', '')), 300),
      'cs', left(btrim(coalesce(v_item -> 'alt_i18n' ->> 'cs', '')), 300),
      'en', left(btrim(coalesce(v_item -> 'alt_i18n' ->> 'en', '')), 300)
    );
    v_portfolio := v_portfolio || jsonb_build_array(jsonb_build_object(
      'id', left(regexp_replace(coalesce(v_item ->> 'id', 'work-' || v_index), '[^A-Za-z0-9._:-]+', '-', 'g'), 120),
      'image_url', v_image_url,
      'alt_i18n', v_alt_i18n,
      'sort_order', v_index
    ));
  end loop;

  select greatest(
    profile.updated_at,
    coalesce((
      select max(service.updated_at)
      from public.beauty_professional_services service
      where service.profile_id = profile.id
        and service.archived = false
    ), profile.updated_at)
  )
  into v_existing_updated_at
  from public.beauty_professional_profiles profile
  where profile.owner_user_key = v_user_key;

  if found and p_expected_updated_at is distinct from v_existing_updated_at then
    return query
    select
      'conflict'::text,
      profile.id,
      profile.slug,
      profile.publication_state,
      greatest(
        profile.updated_at,
        coalesce((
          select max(service.updated_at)
          from public.beauty_professional_services service
          where service.profile_id = profile.id
            and service.archived = false
        ), profile.updated_at)
      )
    from public.beauty_professional_profiles profile
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
    description_i18n,
    instagram_url,
    experience_i18n,
    specialization_i18n,
    hygiene_i18n,
    materials_i18n,
    spoken_languages_i18n,
    certificates_i18n,
    booking_notes_i18n,
    portfolio
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
    v_description_i18n,
    v_instagram_url,
    v_experience_i18n,
    v_specialization_i18n,
    v_hygiene_i18n,
    v_materials_i18n,
    v_spoken_languages_i18n,
    v_certificates_i18n,
    v_booking_notes_i18n,
    v_portfolio
  )
  on conflict (owner_user_key) do update
  set
    display_name = excluded.display_name,
    public_location = excluded.public_location,
    contact = excluded.contact,
    exact_address = excluded.exact_address,
    publication_state = excluded.publication_state,
    description_i18n = excluded.description_i18n,
    instagram_url = excluded.instagram_url,
    experience_i18n = excluded.experience_i18n,
    specialization_i18n = excluded.specialization_i18n,
    hygiene_i18n = excluded.hygiene_i18n,
    materials_i18n = excluded.materials_i18n,
    spoken_languages_i18n = excluded.spoken_languages_i18n,
    certificates_i18n = excluded.certificates_i18n,
    booking_notes_i18n = excluded.booking_notes_i18n,
    portfolio = excluded.portfolio
  returning * into v_profile;

  update public.beauty_professional_services
  set active = false, archived = true
  where profile_id = v_profile.id;

  for v_item, v_index in
    select value, ordinality::integer - 1
    from jsonb_array_elements(p_services) with ordinality
  loop
    if jsonb_typeof(coalesce(v_item -> 'name_i18n', '{}'::jsonb)) <> 'object' then
      raise exception 'Service name_i18n must be a JSON object' using errcode = '22023';
    end if;

    v_client_key := left(regexp_replace(btrim(coalesce(v_item ->> 'id', 'service-' || v_index)), '[^A-Za-z0-9._:-]+', '-', 'g'), 120);
    if char_length(v_client_key) < 3 then
      v_client_key := 'service-' || v_index;
    end if;
    v_name_i18n := jsonb_build_object(
      'ru', left(btrim(coalesce(v_item -> 'name_i18n' ->> 'ru', '')), 120),
      'uk', left(btrim(coalesce(v_item -> 'name_i18n' ->> 'uk', '')), 120),
      'cs', left(btrim(coalesce(v_item -> 'name_i18n' ->> 'cs', '')), 120),
      'en', left(btrim(coalesce(v_item -> 'name_i18n' ->> 'en', '')), 120)
    );
    v_service_name := public.go_irl_beauty_i18n_pick(v_name_i18n, 'en', '');
    v_duration := coalesce((v_item ->> 'duration_minutes')::integer, 0);
    v_price := coalesce((v_item ->> 'price_czk')::integer, -1);
    v_buffer := coalesce((v_item ->> 'buffer_minutes')::integer, 0);
    v_active := coalesce((v_item ->> 'active')::boolean, true);

    if char_length(v_service_name) < 2
      or v_duration not between 5 and 480
      or v_price not between 0 and 100000
      or v_buffer not between 0 and 240 then
      raise exception 'Invalid Beauty service name, duration, price or buffer' using errcode = '22023';
    end if;

    if v_active then
      v_active_count := v_active_count + 1;
    end if;

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
    )
    values (
      v_profile.id,
      v_client_key,
      v_service_name,
      v_name_i18n,
      v_duration,
      v_price,
      v_buffer,
      'CZK',
      v_active,
      v_index,
      false
    )
    on conflict (profile_id, client_key) do update
    set
      service_name = excluded.service_name,
      service_name_i18n = excluded.service_name_i18n,
      duration_minutes = excluded.duration_minutes,
      price_czk = excluded.price_czk,
      buffer_minutes = excluded.buffer_minutes,
      currency = 'CZK',
      active = excluded.active,
      sort_order = excluded.sort_order,
      archived = false;
  end loop;

  if v_active_count < 1 then
    raise exception 'At least one active Beauty service is required' using errcode = '22023';
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

-- Keep the v1/v2 write and read contracts usable after the profile_id uniqueness
-- constraint is removed. Legacy writes update only the first visible service and
-- preserve any additional Beauty013 services.
