-- Secure minute-level reminder worker scheduling through pg_cron, pg_net, and Vault.
-- The schedule is not created by this migration. A database administrator must
-- first create the `go_irl_reminder_worker_secret` Vault entry and then invoke
-- `public.go_irl_configure_reminder_worker_schedule()`.

begin;

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

create or replace function public.go_irl_configure_reminder_worker_schedule()
returns bigint
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_job_id bigint;
  v_secret_count integer;
begin
  select count(*)
  into v_secret_count
  from vault.decrypted_secrets secret
  where secret.name = 'go_irl_reminder_worker_secret'
    and length(secret.decrypted_secret) >= 32;

  if v_secret_count <> 1 then
    raise exception 'reminder_worker_secret_missing_or_ambiguous';
  end if;

  perform cron.unschedule(job.jobid)
  from cron.job job
  where job.jobname = 'go-irl-reminder-worker';

  select cron.schedule(
    'go-irl-reminder-worker',
    '* * * * *',
    $job$
      select net.http_post(
        url := 'https://go-irl-1-0.vercel.app/api/reminders/run',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer ' || (
            select secret.decrypted_secret
            from vault.decrypted_secrets secret
            where secret.name = 'go_irl_reminder_worker_secret'
          )
        ),
        body := '{}'::jsonb,
        timeout_milliseconds := 10000
      ) as request_id;
    $job$
  )
  into v_job_id;

  return v_job_id;
end;
$function$;

revoke all on function public.go_irl_configure_reminder_worker_schedule() from public, anon, authenticated, service_role;

commit;
