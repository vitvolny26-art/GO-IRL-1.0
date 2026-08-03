-- BEAUTY: editable public slug for professional Mini App links.
-- Additive data-safe change. Existing slugs remain valid and unique.

alter table public.beauty_professional_profiles
  drop constraint if exists beauty_professional_profiles_slug_check;

alter table public.beauty_professional_profiles
  add constraint beauty_professional_profiles_slug_check
  check (
    char_length(slug) between 10 and 48
    and slug = lower(slug)
    and slug ~ '^beauty-[a-z0-9]+(-[a-z0-9]+)*$'
  );

create or replace function public.update_my_beauty_slug(p_slug text)
returns table (
  status text,
  public_slug text,
  updated_at timestamptz
)
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  v_slug text := lower(btrim(coalesce(p_slug, '')));
  v_updated_at timestamptz;
begin
  if public.go_irl_auth_user_key() is null or not public.go_irl_current_user_is_professional() then
    raise exception 'current professional role required' using errcode = '42501';
  end if;

  if char_length(v_slug) not between 10 and 48
    or v_slug !~ '^beauty-[a-z0-9]+(-[a-z0-9]+)*$' then
    return query select 'invalid_slug'::text, v_slug, null::timestamptz;
    return;
  end if;

  begin
    update public.beauty_professional_profiles profile
    set slug = v_slug
    where profile.owner_user_key = public.go_irl_auth_user_key()
    returning profile.updated_at into v_updated_at;
  exception when unique_violation then
    return query select 'slug_taken'::text, v_slug, null::timestamptz;
    return;
  end;

  if not found then
    return query select 'profile_missing'::text, v_slug, null::timestamptz;
    return;
  end if;

  return query select 'saved'::text, v_slug, v_updated_at;
end;
$$;

revoke all on function public.update_my_beauty_slug(text) from public;
revoke all on function public.update_my_beauty_slug(text) from anon;
grant execute on function public.update_my_beauty_slug(text) to authenticated;

notify pgrst, 'reload schema';
