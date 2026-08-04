-- BEAUTY013: final publication invariant.
-- A published profile must finish the transaction with at least one active,
-- non-archived service. Deferred constraint triggers allow the v3 save RPC to
-- archive and upsert the service set atomically before this check runs.

create or replace function public.go_irl_beauty_assert_active_service()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_profile_id uuid;
  v_previous_profile_id uuid;
begin
  if tg_table_name = 'beauty_professional_profiles' then
    v_profile_id := case when tg_op = 'DELETE' then old.id else new.id end;
  else
    v_profile_id := case when tg_op = 'DELETE' then old.profile_id else new.profile_id end;
    if tg_op = 'UPDATE' and old.profile_id is distinct from new.profile_id then
      v_previous_profile_id := old.profile_id;
    end if;
  end if;

  if v_profile_id is not null
    and exists (
      select 1
      from public.beauty_professional_profiles profile
      where profile.id = v_profile_id
        and profile.publication_state = 'published'
    )
    and not exists (
      select 1
      from public.beauty_professional_services service
      where service.profile_id = v_profile_id
        and service.active = true
        and service.archived = false
    ) then
    raise exception 'Published Beauty profile requires at least one active service'
      using errcode = '23514';
  end if;

  if v_previous_profile_id is not null
    and exists (
      select 1
      from public.beauty_professional_profiles profile
      where profile.id = v_previous_profile_id
        and profile.publication_state = 'published'
    )
    and not exists (
      select 1
      from public.beauty_professional_services service
      where service.profile_id = v_previous_profile_id
        and service.active = true
        and service.archived = false
    ) then
    raise exception 'Published Beauty profile requires at least one active service'
      using errcode = '23514';
  end if;

  return null;
end;
$$;

drop trigger if exists beauty_profiles_require_active_service
on public.beauty_professional_profiles;
create constraint trigger beauty_profiles_require_active_service
after insert or update
on public.beauty_professional_profiles
deferrable initially deferred
for each row
execute function public.go_irl_beauty_assert_active_service();

drop trigger if exists beauty_services_require_active_service
on public.beauty_professional_services;
create constraint trigger beauty_services_require_active_service
after insert or update or delete
on public.beauty_professional_services
deferrable initially deferred
for each row
execute function public.go_irl_beauty_assert_active_service();

revoke all on function public.go_irl_beauty_assert_active_service() from public;

notify pgrst, 'reload schema';
