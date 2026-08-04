-- BEAUTY013: additive professional content, portfolio, Instagram and multi-service price list.
-- Repository presence does not apply this migration to production.

alter table public.beauty_professional_profiles
  add column if not exists instagram_url text not null default '',
  add column if not exists experience_i18n jsonb not null default '{}'::jsonb,
  add column if not exists specialization_i18n jsonb not null default '{}'::jsonb,
  add column if not exists hygiene_i18n jsonb not null default '{}'::jsonb,
  add column if not exists materials_i18n jsonb not null default '{}'::jsonb,
  add column if not exists spoken_languages_i18n jsonb not null default '{}'::jsonb,
  add column if not exists certificates_i18n jsonb not null default '{}'::jsonb,
  add column if not exists booking_notes_i18n jsonb not null default '{}'::jsonb,
  add column if not exists portfolio jsonb not null default '[]'::jsonb;

alter table public.beauty_professional_services
  add column if not exists client_key text,
  add column if not exists buffer_minutes integer not null default 0,
  add column if not exists sort_order integer not null default 0,
  add column if not exists archived boolean not null default false;

update public.beauty_professional_services
set client_key = 'legacy-' || id::text
where client_key is null or btrim(client_key) = '';

alter table public.beauty_professional_services
  alter column client_key set not null;

alter table public.beauty_professional_services
  drop constraint if exists beauty_professional_services_profile_id_key;

create unique index if not exists beauty_professional_services_profile_client_key_idx
on public.beauty_professional_services(profile_id, client_key);

create index if not exists beauty_professional_services_profile_order_idx
on public.beauty_professional_services(profile_id, archived, active, sort_order);

do $$
declare
  v_column text;
begin
  foreach v_column in array array[
    'experience_i18n',
    'specialization_i18n',
    'hygiene_i18n',
    'materials_i18n',
    'spoken_languages_i18n',
    'certificates_i18n',
    'booking_notes_i18n'
  ] loop
    if not exists (
      select 1
      from pg_constraint
      where conname = 'beauty_professional_profiles_' || v_column || '_object_check'
    ) then
      execute format(
        'alter table public.beauty_professional_profiles add constraint %I check (jsonb_typeof(%I) = ''object'')',
        'beauty_professional_profiles_' || v_column || '_object_check',
        v_column
      );
    end if;
  end loop;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_profiles_portfolio_array_check'
  ) then
    alter table public.beauty_professional_profiles
      add constraint beauty_professional_profiles_portfolio_array_check
      check (jsonb_typeof(portfolio) = 'array');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_profiles_instagram_url_check'
  ) then
    alter table public.beauty_professional_profiles
      add constraint beauty_professional_profiles_instagram_url_check
      check (
        instagram_url = ''
        or (
          instagram_url = btrim(instagram_url)
          and char_length(instagram_url) <= 300
          and instagram_url ~ '^https://(www\.)?instagram\.com/'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_services_client_key_check'
  ) then
    alter table public.beauty_professional_services
      add constraint beauty_professional_services_client_key_check
      check (
        client_key = btrim(client_key)
        and char_length(client_key) between 3 and 120
        and client_key ~ '^[A-Za-z0-9._:-]+$'
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_services_buffer_check'
  ) then
    alter table public.beauty_professional_services
      add constraint beauty_professional_services_buffer_check
      check (buffer_minutes between 0 and 240);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'beauty_professional_services_sort_order_check'
  ) then
    alter table public.beauty_professional_services
      add constraint beauty_professional_services_sort_order_check
      check (sort_order between 0 and 999);
  end if;
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
  experience_i18n jsonb,
  specialization_i18n jsonb,
  hygiene_i18n jsonb,
  materials_i18n jsonb,
  spoken_languages_i18n jsonb,
  certificates_i18n jsonb,
  booking_notes_i18n jsonb,
  portfolio jsonb,
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
    profile.experience_i18n,
    profile.specialization_i18n,
    profile.hygiene_i18n,
    profile.materials_i18n,
    profile.spoken_languages_i18n,
    profile.certificates_i18n,
    profile.booking_notes_i18n,
    profile.portfolio,
    coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', service.client_key,
          'database_id', service.id,
          'name', service.service_name,
          'name_i18n', service.service_name_i18n,
          'duration_minutes', service.duration_minutes,
          'price_czk', service.price_czk,
          'buffer_minutes', service.buffer_minutes,
          'active', service.active,
          'sort_order', service.sort_order
        ) order by service.sort_order, service.created_at
      )
      from public.beauty_professional_services service
      where service.profile_id = profile.id
        and service.archived = false
    ), '[]'::jsonb),
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
  where profile.owner_user_key = public.go_irl_auth_user_key()
    and public.go_irl_current_user_is_professional()
  limit 1;
$$;
