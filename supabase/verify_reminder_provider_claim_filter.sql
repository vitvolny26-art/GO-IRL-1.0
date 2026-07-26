-- Rollback-only verifier for provider-filtered reminder claims.

begin;

do $$
begin
  if has_function_privilege(
    'authenticated',
    'public.go_irl_claim_due_event_reminders(integer,integer,text[])',
    'execute'
  ) then
    raise exception 'authenticated role can claim provider-filtered reminders';
  end if;

  if not has_function_privilege(
    'service_role',
    'public.go_irl_claim_due_event_reminders(integer,integer,text[])',
    'execute'
  ) then
    raise exception 'service role cannot claim provider-filtered reminders';
  end if;
end
$$;

insert into public.app_users (
  auth_provider,
  provider_user_id,
  user_key,
  first_name
) values
  ('telegram', '990000021', 'telegram:990000021', 'Reminder Filter Verify Telegram'),
  ('messenger', '990000022', 'user:990000022', 'Reminder Filter Verify Messenger');

insert into public.activities (
  category_id,
  activity_ru,
  activity_cs,
  title_ru,
  title_cs,
  description_ru,
  description_cs,
  event_date,
  event_time,
  city_id,
  address,
  activity_type,
  capacity,
  organizer,
  organizer_key,
  visibility
) values (
  'sport',
  'Волейбол',
  'Volejbal',
  'Provider filter verifier',
  'Provider filter verifier',
  'Provider filter verifier',
  'Provider filter verifier',
  current_date + 2,
  '18:00',
  'olomouc',
  'Verifier',
  'sport',
  8,
  'Verifier',
  'telegram:990000021',
  'public'
);

insert into public.user_provider_identities (
  user_key,
  provider,
  provider_user_id,
  status,
  consented_at
) values
  ('telegram:990000021', 'telegram', '990000021', 'active', now()),
  ('user:990000022', 'messenger', '990000022', 'active', now());

insert into public.event_reminders (
  user_key,
  activity_id,
  provider,
  lead_minutes,
  event_starts_at,
  scheduled_for,
  delivery_key
)
select
  reminder_user.user_key,
  activity.id,
  reminder_user.provider,
  60,
  now() + interval '1 hour',
  now() - interval '1 minute',
  'verify-provider-filter:' || reminder_user.provider
from public.activities activity
cross join (
  values
    ('telegram:990000021', 'telegram'),
    ('user:990000022', 'messenger')
) as reminder_user(user_key, provider)
where activity.title_ru = 'Provider filter verifier';

do $$
declare
  v_claimed public.event_reminders;
begin
  select *
  into v_claimed
  from public.go_irl_claim_due_event_reminders(
    10,
    300,
    array['telegram']::text[]
  )
  limit 1;

  if v_claimed.provider is distinct from 'telegram' then
    raise exception 'provider filter claimed unexpected provider';
  end if;

  if exists (
    select 1
    from public.event_reminders
    where delivery_key = 'verify-provider-filter:messenger'
      and status <> 'scheduled'
  ) then
    raise exception 'provider filter mutated a disabled provider';
  end if;
end
$$;

rollback;
