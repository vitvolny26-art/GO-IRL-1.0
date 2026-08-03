-- Verify BEAUTY013 additive server contract.

select to_regprocedure('public.get_my_beauty_profile_v3()') is not null as has_owner_read_rpc;
select to_regprocedure('public.save_my_beauty_profile_v3(text,text,text,text,jsonb,text,jsonb,jsonb,jsonb,text,timestamptz)') is not null as has_owner_save_rpc;
select to_regprocedure('public.go_irl_list_public_beauty_professionals_v3(text,text)') is not null as has_public_directory_rpc;

select exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'beauty_professional_profiles' and column_name = 'instagram_url'
) as has_instagram_url;

select exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'beauty_professional_profiles' and column_name = 'trust_content_i18n'
) as has_trust_content;

select exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'beauty_professional_profiles' and column_name = 'portfolio_urls'
) as has_portfolio_urls;

select exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'beauty_professional_services' and column_name = 'buffer_minutes'
) as has_service_buffer;

select exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = 'beauty_professional_services' and column_name = 'sort_order'
) as has_service_sort_order;

select not exists (
  select 1
  from pg_constraint c
  join pg_class t on t.oid = c.conrelid
  join pg_namespace n on n.oid = t.relnamespace
  where n.nspname = 'public'
    and t.relname = 'beauty_professional_services'
    and c.contype = 'u'
    and pg_get_constraintdef(c.oid) = 'UNIQUE (profile_id)'
) as multiple_services_allowed;
