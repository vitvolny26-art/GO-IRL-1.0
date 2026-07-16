-- GO IRL negative RLS verification
--
-- Run manually in the Supabase SQL Editor after migrations v2, v4, and v8.
-- The script creates temporary fixture rows, exercises the real authenticated
-- RLS policies with four JWT identities, and rolls back every change.

begin;

insert into public.activities (
  id, category_id, activity_ru, activity_cs, title_ru, title_cs,
  description_ru, description_cs, event_date, event_time, city_id,
  address, activity_type, metadata, price, capacity, organizer,
  organizer_key, visibility
) values (
  '00000000-0000-4000-8000-000000000101',
  'social', 'RLS verification', 'RLS verification',
  'RLS verification', 'RLS verification', '', '',
  current_date + 1, '18:00', 'olomouc', 'RLS verification',
  'custom', '{}'::jsonb, 0, 8, 'RLS Organizer',
  'telegram:rls-organizer', 'private'
);

insert into public.activity_members (
  activity_id, user_key, display_name, status
) values
  ('00000000-0000-4000-8000-000000000101', 'telegram:rls-joined', 'RLS Joined', 'joined'),
  ('00000000-0000-4000-8000-000000000101', 'telegram:rls-pending', 'RLS Pending', 'pending');

insert into public.activity_chats (
  id, activity_id, created_by_user_key, status, expires_at
) values (
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000101',
  'telegram:rls-organizer', 'active', now() + interval '24 hours'
);

insert into public.activity_chat_messages (
  id, chat_id, activity_id, sender_user_key, sender_display_name, body, status
) values (
  '00000000-0000-4000-8000-000000000103',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000101',
  'telegram:rls-organizer', 'RLS Organizer', 'RLS verification', 'visible'
);

-- Organizer: private Activity, chat, and message must be visible.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"go_irl_user_key":"telegram:rls-organizer","go_irl_role":"user"}',
  true
);
do $$
begin
  if (select count(*) from public.activities where id = '00000000-0000-4000-8000-000000000101') <> 1 then
    raise exception 'organizer_activity_read_failed';
  end if;
  if (select count(*) from public.activity_chats where id = '00000000-0000-4000-8000-000000000102') <> 1 then
    raise exception 'organizer_chat_read_failed';
  end if;
  if (select count(*) from public.activity_chat_messages where id = '00000000-0000-4000-8000-000000000103') <> 1 then
    raise exception 'organizer_message_read_failed';
  end if;
  raise notice 'organizer access: PASS';
end $$;
reset role;

-- Joined participant: private Activity, chat, and message must be visible.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"go_irl_user_key":"telegram:rls-joined","go_irl_role":"user"}',
  true
);
do $$
begin
  if (select count(*) from public.activities where id = '00000000-0000-4000-8000-000000000101') <> 1 then
    raise exception 'joined_activity_read_failed';
  end if;
  if (select count(*) from public.activity_chats where id = '00000000-0000-4000-8000-000000000102') <> 1 then
    raise exception 'joined_chat_read_failed';
  end if;
  if (select count(*) from public.activity_chat_messages where id = '00000000-0000-4000-8000-000000000103') <> 1 then
    raise exception 'joined_message_read_failed';
  end if;
  raise notice 'joined access: PASS';
end $$;
reset role;

-- Pending participant: private Activity, chat, and message must stay hidden.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"go_irl_user_key":"telegram:rls-pending","go_irl_role":"user"}',
  true
);
do $$
begin
  if (select count(*) from public.activities where id = '00000000-0000-4000-8000-000000000101') <> 0 then
    raise exception 'pending_activity_leak';
  end if;
  if (select count(*) from public.activity_chats where id = '00000000-0000-4000-8000-000000000102') <> 0 then
    raise exception 'pending_chat_leak';
  end if;
  if (select count(*) from public.activity_chat_messages where id = '00000000-0000-4000-8000-000000000103') <> 0 then
    raise exception 'pending_message_leak';
  end if;
  raise notice 'pending isolation: PASS';
end $$;
reset role;

-- Unrelated user: private Activity, chat, and message must stay hidden.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"go_irl_user_key":"telegram:rls-unrelated","go_irl_role":"user"}',
  true
);
do $$
begin
  if (select count(*) from public.activities where id = '00000000-0000-4000-8000-000000000101') <> 0 then
    raise exception 'unrelated_activity_leak';
  end if;
  if (select count(*) from public.activity_chats where id = '00000000-0000-4000-8000-000000000102') <> 0 then
    raise exception 'unrelated_chat_leak';
  end if;
  if (select count(*) from public.activity_chat_messages where id = '00000000-0000-4000-8000-000000000103') <> 0 then
    raise exception 'unrelated_message_leak';
  end if;
  raise notice 'unrelated isolation: PASS';
end $$;
reset role;

rollback;
