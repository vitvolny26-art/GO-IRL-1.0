select cron.alter_job(
  job_id := (
    select jobid
    from cron.job
    where jobname = 'go-irl-reminder-worker'
  ),
  schedule := '*/15 * * * *'
);
