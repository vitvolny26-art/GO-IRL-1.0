-- BEAUTY005: bounded server-backed Beauty pilot for Olomouc.
-- Additive only. No production application is implied by repository presence.
-- Availability, booking, payments, reviews and additional Services verticals are out of scope.

create extension if not exists pgcrypto;

create table if not exists public.beauty_professional_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_user_key text not null unique references public.app_users(user_key),
  slug text not null unique,
  city_id text not null default 'olomouc',
  display_name text not null,
  public_location text not null,
  contact text not null,
  exact_address text not null,
  publication_state text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beauty_professional_profiles_slug_check
    check (slug ~ '^beauty-[a-f0-9]{16}$'),
  constraint beauty_professional_profiles_city_check
    check (city_id = 'olomouc'),
  constraint beauty_professional_profiles_display_name_check
    check (display_name = btrim(display_name) and char_length(display_name) between 2 and 80),
  constraint beauty_professional_profiles_public_location_check
    check (public_location = btrim(public_location) and char_length(public_location) between 2 and 120),
  constraint beauty_professional_profiles_contact_check
    check (contact = btrim(contact) and char_length(contact) between 3 and 160),
  constraint beauty_professional_profiles_exact_address_check
    check (exact_address = btrim(exact_address) and char_length(exact_address) between 5 and 200),
  constraint beauty_professional_profiles_publication_state_check
    check (publication_state in ('draft', 'published', 'hidden'))
);

create table if not exists public.beauty_professional_services (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.beauty_professional_profiles(id) on delete cascade,
  service_name text not null,
  duration_minutes integer not null,
  price_czk integer not null,
  currency text not null default 'CZK',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beauty_professional_services_name_check
    check (service_name = btrim(service_name) and char_length(service_name) between 2 and 120),
  constraint beauty_professional_services_duration_check
    check (duration_minutes between 5 and 480),
  constraint beauty_professional_services_price_check
    check (price_czk between 0 and 100000),
  constraint beauty_professional_services_currency_check
    check (currency = 'CZK')
);

create index if not exists beauty_professional_profiles_public_idx
on public.beauty_professional_profiles(city_id, publication_state, display_name);

create index if not exists beauty_professional_services_public_idx
on public.beauty_professional_services(active, profile_id);

drop trigger if exists beauty_professional_profiles_touch_updated_at on public.beauty_professional_profiles;
create trigger beauty_professional_profiles_touch_updated_at
before update on public.beauty_professional_profiles
for each row
execute function public.go_irl_touch_updated_at();

drop trigger if exists beauty_professional_services_touch_updated_at on public.beauty_professional_services;
create trigger beauty_professional_services_touch_updated_at
before update on public.beauty_professional_services
for each row
execute function public.go_irl_touch_updated_at();

alter table public.beauty_professional_profiles enable row level security;
alter table public.beauty_professional_services enable row level security;

create or replace function public.go_irl_current_user_is_professional()
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
      and role_assignment.role = 'professional'
  );
$$;

create or replace function public.go_irl_owns_beauty_profile(p_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select public.go_irl_current_user_is_professional()
    and exists (
      select 1
      from public.beauty_professional_profiles profile
      where profile.id = p_profile_id
        and profile.owner_user_key = public.go_irl_auth_user_key()
    );
$$;

drop policy if exists "beauty profiles owner read" on public.beauty_professional_profiles;
create policy "beauty profiles owner read"
on public.beauty_professional_profiles for select to authenticated
using (
  owner_user_key = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
);

drop policy if exists "beauty profiles owner insert" on public.beauty_professional_profiles;
create policy "beauty profiles owner insert"
on public.beauty_professional_profiles for insert to authenticated
with check (
  owner_user_key = public.go_irl_auth_user_key()
  and city_id = 'olomouc'
  and public.go_irl_current_user_is_professional()
);

drop policy if exists "beauty profiles owner update" on public.beauty_professional_profiles;
create policy "beauty profiles owner update"
on public.beauty_professional_profiles for update to authenticated
using (
  owner_user_key = public.go_irl_auth_user_key()
  and public.go_irl_current_user_is_professional()
)
with check (
  owner_user_key = public.go_irl_auth_user_key()
  and city_id = 'olomouc'
  and public.go_irl_current_user_is_professional()
);

drop policy if exists "beauty services owner read" on public.beauty_professional_services;
create policy "beauty services owner read"
on public.beauty_professional_services for select to authenticated
using (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty services owner insert" on public.beauty_professional_services;
create policy "beauty services owner insert"
on public.beauty_professional_services for insert to authenticated
with check (public.go_irl_owns_beauty_profile(profile_id));

drop policy if exists "beauty services owner update" on public.beauty_professional_services;
create policy "beauty services owner update"
on public.beauty_professional_services for update to authenticated
using (public.go_irl_owns_beauty_profile(profile_id))
with check (public.go_irl_owns_beauty_profile(profile_id));

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
    profile.updated_at
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where profile.owner_user_key = public.go_irl_auth_user_key()
    and public.go_irl_current_user_is_professional()
  limit 1;
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
language plpgsql
security invoker
set search_path = pg_catalog, public
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
    'beauty-' || substring(encode(digest(v_user_key, 'sha256'), 'hex') from 1 for 16),
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

  return query select 'saved'::text, v_profile.id, v_profile.slug, v_profile.publication_state, v_profile.updated_at;
end;
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
    profile.updated_at
  from public.beauty_professional_profiles profile
  join public.beauty_professional_services service on service.profile_id = profile.id
  where p_requested_city_id = 'olomouc'
    and profile.city_id = p_requested_city_id
    and profile.publication_state = 'published'
    and service.active = true
  order by profile.display_name, profile.id;
$$;

revoke all on table public.beauty_professional_profiles from public;
revoke all on table public.beauty_professional_profiles from anon;
revoke all on table public.beauty_professional_services from public;
revoke all on table public.beauty_professional_services from anon;

revoke all on function public.go_irl_current_user_is_professional() from public;
revoke all on function public.go_irl_current_user_is_professional() from anon;
revoke all on function public.go_irl_owns_beauty_profile(uuid) from public;
revoke all on function public.go_irl_owns_beauty_profile(uuid) from anon;
revoke all on function public.get_my_beauty_profile() from public;
revoke all on function public.get_my_beauty_profile() from anon;
revoke all on function public.save_my_beauty_profile(text, text, text, text, text, integer, integer, text, timestamptz) from public;
revoke all on function public.save_my_beauty_profile(text, text, text, text, text, integer, integer, text, timestamptz) from anon;
revoke all on function public.go_irl_list_public_beauty_professionals(text) from public;

grant select, insert, update on table public.beauty_professional_profiles to authenticated;
grant select, insert, update on table public.beauty_professional_services to authenticated;
grant execute on function public.go_irl_current_user_is_professional() to authenticated;
grant execute on function public.go_irl_owns_beauty_profile(uuid) to authenticated;
grant execute on function public.get_my_beauty_profile() to authenticated;
grant execute on function public.save_my_beauty_profile(text, text, text, text, text, integer, integer, text, timestamptz) to authenticated;
grant execute on function public.go_irl_list_public_beauty_professionals(text) to anon, authenticated;

notify pgrst, 'reload schema';
