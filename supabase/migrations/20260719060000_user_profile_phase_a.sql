-- GO IRL Phase A: minimal production user profile.
-- Additive migration only. Apply after trusted Telegram auth migration v4.
-- This file does not create or change the avatar Storage bucket.

create table if not exists public.user_profiles (
  user_key text primary key references public.app_users(user_key),
  display_name text not null,
  bio text not null default '',
  city_id text not null default 'olomouc',
  avatar_path text,
  avatar_code text,
  is_public boolean not null default true,
  show_favorites boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_profiles_display_name_trimmed_check
    check (display_name = btrim(display_name)),
  constraint user_profiles_display_name_length_check
    check (char_length(display_name) between 2 and 60),
  constraint user_profiles_bio_length_check
    check (char_length(bio) <= 280),
  constraint user_profiles_city_id_check
    check (city_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint user_profiles_avatar_path_check
    check (
      avatar_path is null
      or (
        avatar_path !~ '^[a-z][a-z0-9+.-]*://'
        and avatar_path !~ '^data:'
        and avatar_path ~ '^[A-Za-z0-9:_-]+/[A-Za-z0-9._-]+$'
      )
    ),
  constraint user_profiles_avatar_code_length_check
    check (avatar_code is null or char_length(avatar_code) between 1 and 8),
  constraint user_profiles_avatar_source_check
    check (avatar_path is null or avatar_code is null)
);

create table if not exists public.user_profile_interests (
  user_key text not null references public.user_profiles(user_key) on delete cascade,
  interest_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_key, interest_slug),
  constraint user_profile_interests_slug_length_check
    check (char_length(interest_slug) between 1 and 48),
  constraint user_profile_interests_slug_format_check
    check (interest_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

create index if not exists user_profiles_city_public_idx
on public.user_profiles(city_id, is_public);

create index if not exists user_profile_interests_interest_idx
on public.user_profile_interests(interest_slug, user_key);

drop trigger if exists user_profiles_touch_updated_at on public.user_profiles;
create trigger user_profiles_touch_updated_at
before update on public.user_profiles
for each row
execute function public.go_irl_touch_updated_at();

alter table public.user_profiles enable row level security;
alter table public.user_profile_interests enable row level security;

drop policy if exists "user profiles readable" on public.user_profiles;
create policy "user profiles readable"
on public.user_profiles for select to authenticated
using (
  user_key = public.go_irl_auth_user_key()
  or is_public = true
);

drop policy if exists "user profiles own insert" on public.user_profiles;
create policy "user profiles own insert"
on public.user_profiles for insert to authenticated
with check (
  user_key = public.go_irl_auth_user_key()
);

drop policy if exists "user profiles own update" on public.user_profiles;
create policy "user profiles own update"
on public.user_profiles for update to authenticated
using (
  user_key = public.go_irl_auth_user_key()
)
with check (
  user_key = public.go_irl_auth_user_key()
);

drop policy if exists "user profile interests readable" on public.user_profile_interests;
create policy "user profile interests readable"
on public.user_profile_interests for select to authenticated
using (
  user_key = public.go_irl_auth_user_key()
  or exists (
    select 1
    from public.user_profiles profile
    where profile.user_key = user_profile_interests.user_key
      and profile.is_public = true
      and profile.show_favorites = true
  )
);

drop policy if exists "user profile interests own insert" on public.user_profile_interests;
create policy "user profile interests own insert"
on public.user_profile_interests for insert to authenticated
with check (
  user_key = public.go_irl_auth_user_key()
);

drop policy if exists "user profile interests own delete" on public.user_profile_interests;
create policy "user profile interests own delete"
on public.user_profile_interests for delete to authenticated
using (
  user_key = public.go_irl_auth_user_key()
);

create or replace function public.save_my_profile(
  p_display_name text,
  p_bio text default '',
  p_city_id text default 'olomouc',
  p_avatar_path text default null,
  p_avatar_code text default null,
  p_is_public boolean default true,
  p_show_favorites boolean default true,
  p_interest_slugs text[] default array[]::text[]
)
returns public.user_profiles
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_user_key text := public.go_irl_auth_user_key();
  v_interest_slugs text[] := coalesce(p_interest_slugs, array[]::text[]);
  v_profile public.user_profiles%rowtype;
begin
  if v_user_key is null then
    raise exception 'trusted authentication required' using errcode = '42501';
  end if;

  if cardinality(v_interest_slugs) > 12 then
    raise exception 'maximum 12 profile interests allowed' using errcode = '22023';
  end if;

  if exists (
    select 1
    from unnest(v_interest_slugs) as interest(slug)
    where interest.slug is null
  ) then
    raise exception 'profile interests cannot contain null values' using errcode = '22023';
  end if;

  if cardinality(v_interest_slugs) <> (
    select count(distinct interest.slug)::integer
    from unnest(v_interest_slugs) as interest(slug)
  ) then
    raise exception 'profile interests must be unique' using errcode = '22023';
  end if;

  insert into public.user_profiles (
    user_key,
    display_name,
    bio,
    city_id,
    avatar_path,
    avatar_code,
    is_public,
    show_favorites
  )
  values (
    v_user_key,
    btrim(p_display_name),
    coalesce(p_bio, ''),
    coalesce(p_city_id, 'olomouc'),
    nullif(p_avatar_path, ''),
    nullif(p_avatar_code, ''),
    coalesce(p_is_public, true),
    coalesce(p_show_favorites, true)
  )
  on conflict (user_key) do update
  set
    display_name = excluded.display_name,
    bio = excluded.bio,
    city_id = excluded.city_id,
    avatar_path = excluded.avatar_path,
    avatar_code = excluded.avatar_code,
    is_public = excluded.is_public,
    show_favorites = excluded.show_favorites
  returning * into v_profile;

  delete from public.user_profile_interests
  where user_key = v_user_key;

  insert into public.user_profile_interests (user_key, interest_slug)
  select v_user_key, interest.slug
  from unnest(v_interest_slugs) as interest(slug);

  return v_profile;
end;
$$;

revoke all on table public.user_profiles from public;
revoke all on table public.user_profiles from anon;
revoke all on table public.user_profile_interests from public;
revoke all on table public.user_profile_interests from anon;

grant select, insert, update on table public.user_profiles to authenticated;
grant select, insert, delete on table public.user_profile_interests to authenticated;

revoke all on function public.save_my_profile(text, text, text, text, text, boolean, boolean, text[]) from public;
revoke all on function public.save_my_profile(text, text, text, text, text, boolean, boolean, text[]) from anon;
grant execute on function public.save_my_profile(text, text, text, text, text, boolean, boolean, text[]) to authenticated;

notify pgrst, 'reload schema';
