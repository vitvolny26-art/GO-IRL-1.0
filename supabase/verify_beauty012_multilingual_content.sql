-- Run only after applying 20260803230500_beauty012_multilingual_content.sql.
-- Read-only verification; no data is modified.

do $$
begin
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'beauty_professional_profiles'
      and column_name = 'description_i18n'
      and data_type = 'jsonb'
  ) then
    raise exception 'description_i18n column missing';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'beauty_professional_services'
      and column_name = 'service_name_i18n'
      and data_type = 'jsonb'
  ) then
    raise exception 'service_name_i18n column missing';
  end if;

  if to_regprocedure('public.get_my_beauty_profile_v2()') is null then
    raise exception 'get_my_beauty_profile_v2 missing';
  end if;

  if to_regprocedure('public.save_my_beauty_profile_v2(text,text,text,text,jsonb,jsonb,integer,integer,text,timestamp with time zone)') is null then
    raise exception 'save_my_beauty_profile_v2 missing';
  end if;

  if to_regprocedure('public.go_irl_list_public_beauty_professionals_v2(text,text)') is null then
    raise exception 'go_irl_list_public_beauty_professionals_v2 missing';
  end if;

  if public.go_irl_beauty_i18n_pick(
    '{"ru":"","uk":"","cs":"Česky","en":"English"}'::jsonb,
    'ru',
    'Legacy'
  ) <> 'English' then
    raise exception 'deterministic i18n fallback failed';
  end if;
end;
$$;

select 'beauty012 multilingual content verification passed' as result;
