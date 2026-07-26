-- Run after 20260721000000_event_reminder_foundation.sql.
-- Creates fixtures and rolls every change back.

begin;

insert into public.app_users (
  auth_provider, provider_user_id, user_key, telegram_id, first_name, status
) values
  ('telegram', '990000011', 'telegram:990000011', 990000011, 'Reminder Owner', 'active'),
  ('telegram', '990000012', 'telegram:990000012', 990000012, 'Reminder Stranger', 'active')
on conflict (user_key) do nothing;

insert into public.user_provider_identities (
  user_key, provider, provider_user_id, status
) values
  ('telegram:990000011', 'telegram', '990000011', 'active'),
  ('telegram:990000012', 'telegram', '990000012', 'active')
on conflict (provider, provider_user_id) do nothing;

insert into public.activities (
  id, category_id, activity_ru, activity_cs, title_ru, title_cs,
  description_ru, description_cs, event_date, event_time, city_id,
  address, activity_type, metadata, price, capacity, organizer,
  organizer_key, visibility
) values (
  '00000000-0000-4000-8000-000000000211',
  'social', 'Reminder verification', 'Reminder verification',
  'Reminder verification', 'Reminder verification', '', '',
  current_date + 7, '18:00', 'olomouc', 'Reminder verification',
  'custom', '{}'::jsonb, 0, 8, 'Reminder Owner',
  'telegram:990000011', 'public'
);

set local role authenticated;
select set_config('request.jwt.claims', '{"go_irl_user_key":"telegram:990000011","go_irl_role":"user"}', true);

select public.go_irl_upsert_event_reminder(
  '00000000-0000-4000-8000-000000000211',
  'telegram',
  60::smallint
);

do $$
begin
  if (select count(*) from public.event_reminders where activity_id = '00000000-0000-4000-8000-000000000211') <> 1 then
    raise exception 'owner_reminder_write_or_read_failed';
  end if;
  if (select count(*) from public.user_provider_identities where provider = 'telegram') <> 1 then
    raise exception 'owner_provider_identity_isolation_failed';
  end if;
  raise notice 'owner reminder access: PASS';
end $$;

reset role;
set local role authenticated;
select set_config('request.jwt.claims', '{"go_irl_user_key":"telegram:990000012","go_irl_role":"user"}', true);

do $$
begin
  if (select count(*) from public.event_reminders where activity_id = '00000000-0000-4000-8000-000000000211') <> 0 then
    raise exception 'stranger_reminder_leak';
  end if;
  if (select count(*) from public.user_provider_identities where user_key = 'telegram:990000011') <> 0 then
    raise exception 'stranger_provider_identity_leak';
  end if;
  raise notice 'stranger isolation: PASS';
end $$;

reset role;
set local role service_role;

update public.event_reminders
set scheduled_for = now() - interval '1 minute'
where activity_id = '00000000-0000-4000-8000-000000000211';

do $$
declare
  v_claimed public.event_reminders%rowtype;
begin
  select * into v_claimed
  from public.go_irl_claim_due_event_reminders(10, 300);
  if v_claimed.id is null or v_claimed.status <> 'sending' or v_claimed.attempt_count <> 1 then
    raise exception 'atomic_claim_failed';
  end if;
  perform public.go_irl_finish_event_reminder(v_claimed.id, 'sent', null, null);
  if (select status from public.event_reminders where id = v_claimed.id) <> 'sent' then
    raise exception 'delivery_completion_failed';
  end if;
  raise notice 'service delivery lifecycle: PASS';
end $$;

reset role;

rollback;
