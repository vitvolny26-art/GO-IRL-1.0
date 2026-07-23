-- Rollback-only verifier. It does not create a Vault secret or a cron job.

begin;

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'pg_cron') then
    raise exception 'pg_cron extension missing';
  end if;
  if not exists (select 1 from pg_extension where extname = 'pg_net') then
    raise exception 'pg_net extension missing';
  end if;
  if has_function_privilege(
    'authenticated',
    'public.go_irl_configure_reminder_worker_schedule()',
    'execute'
  ) then
    raise exception 'authenticated role can configure reminder schedule';
  end if;
  if has_function_privilege(
    'service_role',
    'public.go_irl_configure_reminder_worker_schedule()',
    'execute'
  ) then
    raise exception 'service role can configure reminder schedule';
  end if;
end
$$;

rollback;
