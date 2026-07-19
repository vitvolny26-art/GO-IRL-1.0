-- GO IRL Phase A profile verification.
-- Run only in a test database after both Phase A migrations.
-- All test data is rolled back.

begin;

insert into public.app_users (auth_provider, provider_user_id, user_key, telegram_id, first_name)
values
  ('telegram', 'phase-a-verify-a', 'telegram:990000001', 990000001, 'Verify A'),
  ('telegram', 'phase-a-verify-b', 'telegram:990000002', 990000002, 'Verify B');

set local role authenticated;
select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:990000001"}', true);
select public.save_my_profile('Verify User A', 'Profile A', 'olomouc', 'telegram:990000001/a.jpg', null, false, true, array['volleyball','running']::text[]);

select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:990000002"}', true);
select public.save_my_profile('Verify User B', 'Profile B', 'olomouc', null, 'B', true, false, array['walking','coffee-meetup']::text[]);

select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:990000001"}', true);

do $$
declare
  v_rows integer;
begin
  if (select count(*) from public.user_profiles where user_key = 'telegram:990000002') <> 1 then
    raise exception 'public profile visibility failed';
  end if;
  if (select count(*) from public.user_profile_interests where user_key = 'telegram:990000002') <> 0 then
    raise exception 'hidden interests visibility failed';
  end if;

  update public.user_profiles set display_name = 'Compromised' where user_key = 'telegram:990000002';
  get diagnostics v_rows = row_count;
  if v_rows <> 0 then raise exception 'cross-user update allowed'; end if;

  begin
    perform public.save_my_profile('Verify User A', '', 'olomouc', 'telegram:990000002/foreign.jpg', null, false, true, array[]::text[]);
    raise exception 'foreign avatar prefix allowed';
  exception when sqlstate '42501' then null;
  end;

  begin
    perform public.save_my_profile('Verify User A', '', 'olomouc', null, null, false, true, array['running','running']::text[]);
    raise exception 'duplicate interests allowed';
  exception when sqlstate '22023' then null;
  end;
end;
$$;

select public.save_my_profile(
  'Verify User A', '', 'olomouc', null, null, false, true,
  array['i-01','i-02','i-03','i-04','i-05','i-06','i-07','i-08','i-09','i-10','i-11','i-12']::text[]
);

do $$
begin
  begin
    insert into public.user_profile_interests(user_key, interest_slug)
    values ('telegram:990000001', 'i-13');
    raise exception 'thirteenth interest allowed';
  exception when sqlstate '22023' then null;
  end;
end;
$$;

select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:990000002"}', true);
select public.save_my_profile('Verify User B', 'Private', 'olomouc', null, 'B', false, true, array['walking']::text[]);
select set_config('request.jwt.claims', '{"role":"authenticated","go_irl_user_key":"telegram:990000001"}', true);

do $$
begin
  if (select count(*) from public.user_profiles where user_key = 'telegram:990000002') <> 0 then
    raise exception 'private profile visibility failed';
  end if;
end;
$$;

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role":"anon"}', true);

do $$
begin
  begin
    perform count(*) from public.user_profiles;
    raise exception 'anon profile read allowed';
  exception when sqlstate '42501' then null;
  end;
end;
$$;

rollback;
