-- Allow a worker to claim only providers with active delivery adapters.

begin;

create or replace function public.go_irl_claim_due_event_reminders(
  p_limit integer,
  p_lease_seconds integer,
  p_providers text[]
)
returns setof public.event_reminders
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 200 then
    raise exception 'invalid_claim_limit';
  end if;
  if p_lease_seconds < 30 or p_lease_seconds > 1800 then
    raise exception 'invalid_lease_seconds';
  end if;
  if coalesce(cardinality(p_providers), 0) < 1
    or not (p_providers <@ array['telegram', 'whatsapp', 'instagram', 'messenger']::text[]) then
    raise exception 'invalid_claim_providers';
  end if;

  return query
  with due as (
    select reminder.id
    from public.event_reminders reminder
    where reminder.provider = any(p_providers)
      and (
        (
          reminder.status in ('scheduled', 'failed')
          and coalesce(reminder.next_attempt_at, reminder.scheduled_for) <= now()
        ) or (
          reminder.status = 'sending'
          and reminder.leased_at <= now() - make_interval(secs => p_lease_seconds)
        )
      )
    order by coalesce(reminder.next_attempt_at, reminder.scheduled_for), reminder.id
    for update skip locked
    limit p_limit
  )
  update public.event_reminders reminder
  set
    status = 'sending',
    attempt_count = reminder.attempt_count + 1,
    leased_at = now(),
    updated_at = now()
  from due
  where reminder.id = due.id
  returning reminder.*;
end;
$$;

revoke all on function public.go_irl_claim_due_event_reminders(integer, integer, text[]) from public, anon, authenticated;
grant execute on function public.go_irl_claim_due_event_reminders(integer, integer, text[]) to service_role;

notify pgrst, 'reload schema';

commit;
