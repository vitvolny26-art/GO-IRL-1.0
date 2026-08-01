-- BEAUTY005 Olomouc pilot verification.
-- Run only in an approved test database after the migration. All rows roll back.

begin;

insert into public.app_users (auth_provider, provider_user_id, user_key, telegram_id, first_name)
values
  ('telegram', 'beauty005-owner-a', 'telegram:991000001', 991000001, 'Beauty Owner A'),
  ('telegram', 'beauty005-owner-b', 'telegram:991000002', 991000002, 'Beauty Owner B'),
  ('telegram', 'beauty005-user', 'telegram:991000003', 991000003, 'Beauty User');

insert into public.user_roles (user_key, role)
values
  ('telegram:991000001', 'professional'),
  ('telegram:991000002', 'professional'),
  ('telegram:991000003', 'user');

set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:991000001","go_irl_role":"professional"}', true);

select public.save_my_beauty_profile(
  'Studio Verify A',
  'Centrum, Olomouc',
  '+420 777 111 222',
  'Horní náměstí 1, Olomouc',
  'Gel manicure',
  75,
  890,
  'published',
  null
);

do $$
begin
  if (select count(*) from public.get_my_beauty_profile()) <> 1 then
    raise exception 'owner private profile read failed';
  end if;
  if (select contact from public.get_my_beauty_profile()) <> '+420 777 111 222' then
    raise exception 'owner private contact read failed';
  end if;
  if (select count(*) from public.go_irl_list_public_beauty_professionals('olomouc')) <> 1 then
    raise exception 'published projection read failed';
  end if;
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'pg_catalog'
      and table_name = 'go_irl_list_public_beauty_professionals'
      and column_name in ('contact', 'exact_address', 'owner_user_key')
  ) then
    raise exception 'private public-projection field detected';
  end if;
end;
$$;

select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:991000002","go_irl_role":"professional"}', true);

do $$
declare
  v_rows integer;
begin
  if (select count(*) from public.beauty_professional_profiles) <> 0 then
    raise exception 'cross-professional private read allowed';
  end if;

  update public.beauty_professional_profiles
  set display_name = 'Compromised'
  where owner_user_key = 'telegram:991000001';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'cross-professional update allowed'; end if;
end;
$$;

select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:991000003","go_irl_role":"user"}', true);

do $$
begin
  begin
    perform public.save_my_beauty_profile(
      'Unauthorized Studio', 'Olomouc', 'private', 'private address',
      'Service', 60, 500, 'published', null
    );
    raise exception 'ordinary user created professional profile';
  exception when sqlstate '42501' then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:991000001","go_irl_role":"professional"}', true);
select public.save_my_beauty_profile(
  'Studio Verify A', 'Centrum, Olomouc', '+420 777 111 222',
  'Horní náměstí 1, Olomouc', 'Gel manicure', 75, 890, 'hidden',
  (select updated_at from public.get_my_beauty_profile())
);

do $$
begin
  if (select count(*) from public.go_irl_list_public_beauty_professionals('olomouc')) <> 0 then
    raise exception 'hidden profile remained public';
  end if;
  if (select count(*) from public.go_irl_list_public_beauty_professionals('praha')) <> 0 then
    raise exception 'non-pilot city returned public profiles';
  end if;
end;
$$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  begin
    perform count(*) from public.beauty_professional_profiles;
    raise exception 'anon private-table read allowed';
  exception when sqlstate '42501' then null;
  end;
end;
$$;

rollback;
