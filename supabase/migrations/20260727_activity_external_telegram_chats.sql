-- GO IRL COMM-001 shared external Telegram chat persistence

begin;

create table if not exists public.activity_external_telegram_chats (
  activity_id uuid primary key references public.activities(id) on delete cascade,
  url text not null,
  attached_by_user_key text not null,
  keep_archive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint activity_external_telegram_chats_url_check check (
    url ~ '^https://t\.me/(?:joinchat/[-_A-Za-z0-9]+|\+[-_A-Za-z0-9]+|[A-Za-z0-9_]{5,})(?:/[0-9]+)?$'
  )
);

alter table public.activity_external_telegram_chats enable row level security;

create or replace function public.go_irl_can_access_external_telegram_chat(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    exists (
      select 1
      from public.user_roles role_row
      where role_row.user_key = public.go_irl_request_user_key()
        and role_row.role in ('moderator', 'admin')
    )
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

create or replace function public.go_irl_is_activity_organizer(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.activities activity
    where activity.id = p_activity_id
      and activity.organizer_key = public.go_irl_request_user_key()
  );
$$;

drop policy if exists "external telegram chats read" on public.activity_external_telegram_chats;
create policy "external telegram chats read"
on public.activity_external_telegram_chats
for select
to authenticated
using (public.go_irl_can_access_external_telegram_chat(activity_id));

drop policy if exists "external telegram chats insert organizer" on public.activity_external_telegram_chats;
create policy "external telegram chats insert organizer"
on public.activity_external_telegram_chats
for insert
to authenticated
with check (
  attached_by_user_key = public.go_irl_request_user_key()
  and public.go_irl_is_activity_organizer(activity_id)
);

drop policy if exists "external telegram chats update organizer" on public.activity_external_telegram_chats;
create policy "external telegram chats update organizer"
on public.activity_external_telegram_chats
for update
to authenticated
using (public.go_irl_is_activity_organizer(activity_id))
with check (
  attached_by_user_key = public.go_irl_request_user_key()
  and public.go_irl_is_activity_organizer(activity_id)
);

drop policy if exists "external telegram chats delete organizer" on public.activity_external_telegram_chats;
create policy "external telegram chats delete organizer"
on public.activity_external_telegram_chats
for delete
to authenticated
using (public.go_irl_is_activity_organizer(activity_id));

grant select, insert, update, delete on public.activity_external_telegram_chats to authenticated;
revoke execute on function public.go_irl_can_access_external_telegram_chat(uuid) from public, anon, authenticated;
revoke execute on function public.go_irl_is_activity_organizer(uuid) from public, anon, authenticated;

commit;
