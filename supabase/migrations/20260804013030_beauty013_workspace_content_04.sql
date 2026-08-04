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
    and service.archived = false
  order by profile.display_name, profile.id, service.sort_order, service.id;
$$;

create or replace function public.go_irl_list_public_beauty_professionals(
  p_requested_city_id text default 'olomouc'
)
returns table (
  profile_id uuid,
  slug text,
  display_name text,
  city_id text,
  public_location text,
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
    service.service_name,
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
    and service.archived = false
  order by profile.display_name, profile.id, service.sort_order, service.id;
$$;

create or replace function public.go_irl_list_public_beauty_professionals_v3(
  p_requested_city_id text default 'olomouc',
  p_language text default 'en'
)
returns table (
  profile_id uuid,
  service_id uuid,
  slug text,
  display_name text,
  city_id text,
  public_location text,
  description text,
  instagram_url text,
  experience text,
  specialization text,
  hygiene text,
  materials text,
  spoken_languages text,
  certificates text,
  booking_notes text,
  portfolio jsonb,
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
    profile.id,
    service.id,
    profile.slug,
    profile.display_name,
    profile.city_id,
    profile.public_location,
    public.go_irl_beauty_i18n_pick(profile.description_i18n, p_language, ''),
    profile.instagram_url,
    public.go_irl_beauty_i18n_pick(profile.experience_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(profile.specialization_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(profile.hygiene_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(profile.materials_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(profile.spoken_languages_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(profile.certificates_i18n, p_language, ''),
    public.go_irl_beauty_i18n_pick(profile.booking_notes_i18n, p_language, ''),
    profile.portfolio,
    public.go_irl_beauty_i18n_pick(service.service_name_i18n, p_language, service.service_name),
    service.duration_minutes,
    service.price_czk,
    service.buffer_minutes,
    service.currency,
    '/beauty/' || profile.slug,
    greatest(profile.updated_at, service.updated_at)
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where p_requested_city_id = 'olomouc'
    and profile.city_id = p_requested_city_id
    and profile.publication_state = 'published'
    and service.active = true
    and service.archived = false
  order by profile.display_name, profile.id, service.sort_order, service.id;
$$;

revoke all on function public.go_irl_save_beauty_profile_compat(text, text, text, text, jsonb, jsonb, text, integer, integer, text, timestamptz) from public;
revoke all on function public.go_irl_save_beauty_profile_compat(text, text, text, text, jsonb, jsonb, text, integer, integer, text, timestamptz) from anon;
grant execute on function public.go_irl_save_beauty_profile_compat(text, text, text, text, jsonb, jsonb, text, integer, integer, text, timestamptz) to authenticated;

revoke all on function public.get_my_beauty_profile_v3() from public;
revoke all on function public.get_my_beauty_profile_v3() from anon;
revoke all on function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, timestamptz) from public;
revoke all on function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, timestamptz) from anon;
revoke all on function public.go_irl_list_public_beauty_professionals_v3(text, text) from public;

grant execute on function public.get_my_beauty_profile_v3() to authenticated;
grant execute on function public.save_my_beauty_profile_v3(text, text, text, text, jsonb, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb, text, timestamptz) to authenticated;
grant execute on function public.go_irl_list_public_beauty_professionals_v3(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
