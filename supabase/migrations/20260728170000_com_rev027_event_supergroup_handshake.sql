begin;

alter table public.activity_external_telegram_chats
  add column if not exists telegram_chat_id bigint,
  add column if not exists telegram_chat_type text,
  add column if not exists telegram_chat_title text,
  add column if not exists bound_at timestamptz;

alter table public.activity_external_telegram_chats
  drop constraint if exists activity_external_telegram_chats_chat_type_check;

alter table public.activity_external_telegram_chats
  add constraint activity_external_telegram_chats_chat_type_check
  check (telegram_chat_type is null or telegram_chat_type in ('group', 'supergroup'));

create unique index if not exists activity_external_telegram_chats_chat_id_uidx
  on public.activity_external_telegram_chats (telegram_chat_id)
  where telegram_chat_id is not null;

create table if not exists public.activity_telegram_chat_bindings (
  token_hash text primary key,
  activity_id uuid not null references public.activities(id) on delete cascade,
  requested_by_user_key text not null,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint activity_telegram_chat_bindings_token_hash_check
    check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint activity_telegram_chat_bindings_expiry_check
    check (expires_at > created_at)
);

create index if not exists activity_telegram_chat_bindings_activity_idx
  on public.activity_telegram_chat_bindings (activity_id, created_at desc);

create index if not exists activity_telegram_chat_bindings_expiry_idx
  on public.activity_telegram_chat_bindings (expires_at)
  where consumed_at is null;

alter table public.activity_telegram_chat_bindings enable row level security;

revoke all on table public.activity_telegram_chat_bindings from public, anon, authenticated;
grant all on table public.activity_telegram_chat_bindings to service_role;

comment on table public.activity_telegram_chat_bindings is
  'Short-lived server-only tokens that bind one organizer-owned activity to one Telegram group or supergroup.';

comment on column public.activity_external_telegram_chats.telegram_chat_id is
  'Telegram Bot API chat identifier. Server-managed; never accepted from the browser.';

commit;
