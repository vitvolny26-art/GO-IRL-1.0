-- GO IRL v8 temporary activity chat

begin;

create table if not exists public.activity_chats (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null unique references public.activities(id) on delete cascade,
  created_by_user_key text not null,
  status text not null default 'active',
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint activity_chats_status_check check (
    status in ('active', 'expired', 'archived', 'deleted')
  )
);

create table if not exists public.activity_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.activity_chats(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  sender_user_key text not null,
  sender_display_name text,
  body text not null,
  status text not null default 'visible',
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  deleted_at timestamptz,

  constraint activity_chat_messages_body_check check (
    length(trim(body)) between 1 and 1000
  ),
  constraint activity_chat_messages_status_check check (
    status in ('visible', 'deleted', 'hidden_by_moderator')
  )
);

create index if not exists idx_activity_chats_activity_id
on public.activity_chats(activity_id);

create index if not exists idx_activity_chats_expires_at
on public.activity_chats(expires_at);

create index if not exists idx_activity_chat_messages_chat_created
on public.activity_chat_messages(chat_id, created_at);

create index if not exists idx_activity_chat_messages_activity_created
on public.activity_chat_messages(activity_id, created_at);

create index if not exists idx_activity_chat_messages_sender
on public.activity_chat_messages(sender_user_key);

alter table public.activity_chats enable row level security;
alter table public.activity_chat_messages enable row level security;

create or replace function public.go_irl_activity_chat_expires_at(p_activity_id uuid)
returns timestamptz
language sql
stable
security definer
set search_path to 'public'
as $$
  select now() + interval '24 hours';
$$;

create or replace function public.go_irl_can_access_activity_chat(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    public.go_irl_request_can_moderate()
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and activity.organizer_key = public.go_irl_request_user_key()
    )
    or exists (
      select 1
      from public.activity_members member
      where member.activity_id = p_activity_id
        and member.user_key = public.go_irl_request_user_key()
        and member.status = 'joined'
    );
$$;

create or replace function public.go_irl_can_write_activity_chat(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    public.go_irl_can_access_activity_chat(p_activity_id)
    and exists (
      select 1
      from public.activity_chats chat
      where chat.activity_id = p_activity_id
        and chat.status = 'active'
        and chat.expires_at > now()
    );
$$;

create or replace function public.go_irl_ensure_activity_chat(p_activity_id uuid)
returns uuid
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  existing_chat_id uuid;
  created_chat_id uuid;
begin
  if not public.go_irl_can_access_activity_chat(p_activity_id) then
    raise exception 'activity_chat_access_denied';
  end if;

  select id
  into existing_chat_id
  from public.activity_chats
  where activity_id = p_activity_id
  limit 1;

  if existing_chat_id is not null then
    return existing_chat_id;
  end if;

  insert into public.activity_chats (
    activity_id,
    created_by_user_key,
    expires_at
  )
  values (
    p_activity_id,
    public.go_irl_request_user_key(),
    public.go_irl_activity_chat_expires_at(p_activity_id)
  )
  returning id into created_chat_id;

  return created_chat_id;
end;
$$;

create or replace function public.go_irl_expire_activity_chats()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  affected integer;
begin
  update public.activity_chats
  set
    status = 'expired',
    updated_at = now()
  where status = 'active'
    and expires_at <= now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

create or replace function public.go_irl_cleanup_expired_activity_chat_messages()
returns integer
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  affected integer;
begin
  delete from public.activity_chat_messages message
  using public.activity_chats chat
  where chat.id = message.chat_id
    and chat.status in ('expired', 'archived', 'deleted')
    and chat.expires_at <= now();

  get diagnostics affected = row_count;
  return affected;
end;
$$;

drop policy if exists "activity chats read" on public.activity_chats;
create policy "activity chats read"
on public.activity_chats
for select
to authenticated
using (
  public.go_irl_request_can_moderate()
  or (
    status = 'active'
    and expires_at > now()
    and public.go_irl_can_access_activity_chat(activity_id)
  )
);

drop policy if exists "activity chats insert own" on public.activity_chats;
create policy "activity chats insert own"
on public.activity_chats
for insert
to authenticated
with check (
  created_by_user_key = public.go_irl_request_user_key()
  and public.go_irl_can_access_activity_chat(activity_id)
);

drop policy if exists "activity chats update moderator" on public.activity_chats;
create policy "activity chats update moderator"
on public.activity_chats
for update
to authenticated
using (
  public.go_irl_request_can_moderate()
)
with check (
  public.go_irl_request_can_moderate()
);

drop policy if exists "activity chat messages read" on public.activity_chat_messages;
create policy "activity chat messages read"
on public.activity_chat_messages
for select
to authenticated
using (
  status = 'visible'
  and (
    public.go_irl_request_can_moderate()
    or exists (
      select 1
      from public.activity_chats chat
      where chat.id = activity_chat_messages.chat_id
        and chat.activity_id = activity_chat_messages.activity_id
        and chat.status = 'active'
        and chat.expires_at > now()
        and public.go_irl_can_access_activity_chat(chat.activity_id)
    )
  )
);

drop policy if exists "activity chat messages insert" on public.activity_chat_messages;
create policy "activity chat messages insert"
on public.activity_chat_messages
for insert
to authenticated
with check (
  sender_user_key = public.go_irl_request_user_key()
  and status = 'visible'
  and public.go_irl_can_write_activity_chat(activity_id)
  and exists (
    select 1
    from public.activity_chats chat
    where chat.id = activity_chat_messages.chat_id
      and chat.activity_id = activity_chat_messages.activity_id
  )
);

drop policy if exists "activity chat messages update own or moderator" on public.activity_chat_messages;
create policy "activity chat messages update own or moderator"
on public.activity_chat_messages
for update
to authenticated
using (
  sender_user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
)
with check (
  sender_user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

notify pgrst, 'reload schema';

commit;
