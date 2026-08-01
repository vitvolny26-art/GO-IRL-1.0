-- BEAUTY005 hotfix: Supabase installs pgcrypto in the extensions schema.
-- Recreate the save function with an explicitly qualified digest call.

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
language plpgsql
security invoker
set search_path = pg_catalog, public, extensions
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_existing_updated_at timestamptz;
  v_profile public.beauty_professional_profiles%rowtype;
begin
  if v_user_key is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;

  select profile.updated_at
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
      profile.updated_at
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
    publication_state
  )
  values (
    v_user_key,
    'beauty-' || substring(encode(extensions.digest(v_user_key, 'sha256'), 'hex') from 1 for 16),
    'olomouc',
    btrim(p_display_name),
    btrim(p_public_location),
    btrim(p_contact),
    btrim(p_exact_address),
    p_publication_state
  )
  on conflict (owner_user_key) do update
  set
    display_name = excluded.display_name,
    public_location = excluded.public_location,
    contact = excluded.contact,
    exact_address = excluded.exact_address,
    publication_state = excluded.publication_state
  returning * into v_profile;

  insert into public.beauty_professional_services (
    profile_id,
    service_name,
    duration_minutes,
    price_czk,
    currency,
    active
  )
  values (
    v_profile.id,
    btrim(p_service_name),
    p_duration_minutes,
    p_price_czk,
    'CZK',
    true
  )
  on conflict (profile_id) do update
  set
    service_name = excluded.service_name,
    duration_minutes = excluded.duration_minutes,
    price_czk = excluded.price_czk,
    currency = 'CZK',
    active = true;

  return query
  select 'saved'::text, v_profile.id, v_profile.slug, v_profile.publication_state, v_profile.updated_at;
end;
$$;

revoke all on function public.save_my_beauty_profile(text, text, text, text, text, integer, integer, text, timestamptz) from public;
revoke all on function public.save_my_beauty_profile(text, text, text, text, text, integer, integer, text, timestamptz) from anon;
grant execute on function public.save_my_beauty_profile(text, text, text, text, text, integer, integer, text, timestamptz) to authenticated;

notify pgrst, 'reload schema';
