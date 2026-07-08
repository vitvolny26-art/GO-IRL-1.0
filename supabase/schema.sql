create extension if not exists pgcrypto;

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  category_id text not null,
  activity_ru text not null,
  activity_cs text not null,
  title_ru text not null,
  title_cs text not null,
  description_ru text not null default '',
  description_cs text not null default '',
  event_date date not null,
  event_time time not null,
  city_id text not null default 'olomouc',
  address text not null,
  location_url text,
  participant_note text,
  activity_type text not null default 'custom' check (activity_type in ('sport', 'dating', 'friends', 'food', 'travel', 'culture', 'local', 'custom')),
  metadata jsonb not null default '{}'::jsonb,
  price integer not null default 0 check (price between 0 and 100000),
  capacity integer not null check (capacity between 2 and 100),
  organizer text not null,
  organizer_key text not null,
  visibility text not null default 'public' check (visibility in ('public', 'private', 'invite')),
  urgent boolean not null default false,
  popular boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.activities
add column if not exists location_url text;

alter table public.activities
add column if not exists city_id text not null default 'olomouc';

alter table public.activities
add column if not exists participant_note text;

alter table public.activities
add column if not exists activity_type text not null default 'custom';

alter table public.activities
drop constraint if exists activities_activity_type_check;

alter table public.activities
add constraint activities_activity_type_check check (activity_type in ('sport', 'dating', 'friends', 'food', 'travel', 'culture', 'local', 'custom'));

alter table public.activities
add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.activities
add column if not exists updated_at timestamptz not null default now();

create table if not exists public.activity_members (
  activity_id uuid not null references public.activities(id) on delete cascade,
  user_key text not null,
  display_name text not null default 'GO IRL User',
  status text not null check (status in ('joined', 'waiting')),
  created_at timestamptz not null default now(),
  primary key (activity_id, user_key)
);

create table if not exists public.admin_users (
  user_key text primary key,
  role text not null default 'admin' check (role = 'admin'),
  note text,
  created_at timestamptz not null default now()
);

alter table public.activity_members
add column if not exists display_name text not null default 'GO IRL User';

alter table public.activity_members
drop constraint if exists activity_members_status_check;

alter table public.activity_members
add constraint activity_members_status_check check (status in ('joined', 'waiting', 'pending'));

create index if not exists activities_date_idx on public.activities(event_date, event_time);
create index if not exists activities_organizer_idx on public.activities(organizer_key, event_date);
create index if not exists activities_city_date_idx on public.activities(city_id, event_date, event_time);
create index if not exists activities_type_city_date_idx on public.activities(activity_type, city_id, event_date, event_time);
create index if not exists activities_visibility_date_idx on public.activities(visibility, event_date, event_time);
create index if not exists activity_members_status_idx on public.activity_members(activity_id, status, created_at);
create index if not exists activity_members_user_status_idx on public.activity_members(user_key, status, activity_id);

create or replace function public.go_irl_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists activities_touch_updated_at on public.activities;
create trigger activities_touch_updated_at
before update on public.activities
for each row
execute function public.go_irl_touch_updated_at();

alter table public.activities enable row level security;
alter table public.activity_members enable row level security;
alter table public.admin_users enable row level security;

create or replace function public.go_irl_request_user_key()
returns text
language sql
stable
as $$
  select current_setting('request.headers', true)::json ->> 'x-go-irl-user-key';
$$;

create or replace function public.go_irl_request_invite_activity()
returns text
language sql
stable
as $$
  select current_setting('request.headers', true)::json ->> 'x-go-irl-invite-activity';
$$;

create or replace function public.go_irl_can_read_activity(
  p_activity_id uuid,
  p_visibility text,
  p_organizer_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_visibility = 'public'
    or p_organizer_key = public.go_irl_request_user_key()
    or p_activity_id::text = public.go_irl_request_invite_activity()
    or exists (
      select 1
      from public.activity_members member
      where member.activity_id = p_activity_id
        and member.user_key = public.go_irl_request_user_key()
    );
$$;

create or replace function public.go_irl_can_read_activity_member(
  p_activity_id uuid,
  p_member_user_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_member_user_key = public.go_irl_request_user_key()
    or exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and public.go_irl_can_read_activity(activity.id, activity.visibility, activity.organizer_key)
    );
$$;

create or replace function public.go_irl_can_insert_activity_member(
  p_activity_id uuid,
  p_member_status text,
  p_member_user_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    p_member_user_key = public.go_irl_request_user_key()
    and exists (
      select 1
      from public.activities activity
      where activity.id = p_activity_id
        and (
          activity.organizer_key = public.go_irl_request_user_key()
          or (activity.visibility = 'public' and p_member_status = 'joined')
          or (activity.visibility = 'invite' and p_member_status = 'pending')
          or (p_member_status = 'waiting' and activity.visibility in ('public', 'invite'))
        )
    );
$$;

create or replace function public.go_irl_request_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users admin_user
    where admin_user.user_key = public.go_irl_request_user_key()
      and admin_user.role = 'admin'
  );
$$;

drop policy if exists "public activities read" on public.activities;
drop policy if exists "public activities create" on public.activities;
drop policy if exists "public members read" on public.activity_members;
drop policy if exists "public members create" on public.activity_members;
drop policy if exists "public members update" on public.activity_members;
drop policy if exists "public members delete" on public.activity_members;
drop policy if exists "admin users locked" on public.admin_users;

create policy "public activities read"
on public.activities for select to anon using (
  public.go_irl_can_read_activity(id, visibility, organizer_key)
);

create policy "public activities create"
on public.activities for insert to anon with check (
  organizer_key = public.go_irl_request_user_key()
);

drop policy if exists "organizer activities update" on public.activities;
create policy "organizer activities update"
on public.activities for update to anon
using (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
)
with check (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
);

drop policy if exists "organizer or admin activities delete" on public.activities;
create policy "organizer or admin activities delete"
on public.activities for delete to anon using (
  organizer_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
);

create policy "public members read"
on public.activity_members for select to anon using (
  public.go_irl_can_read_activity_member(activity_id, user_key)
);

create policy "public members create"
on public.activity_members for insert to anon with check (
  public.go_irl_can_insert_activity_member(activity_id, status, user_key)
);

create policy "public members update"
on public.activity_members for update to anon
using (
  exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_request_user_key()
  )
)
with check (
  exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_request_user_key()
  )
);

create policy "public members delete"
on public.activity_members for delete to anon using (
  user_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
  or exists (
    select 1 from public.activities
    where activities.id = activity_members.activity_id
      and activities.organizer_key = public.go_irl_request_user_key()
  )
);

grant select, insert, update, delete on public.activities to anon;
grant select, insert, update, delete on public.activity_members to anon;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activities'
  ) then
    alter publication supabase_realtime add table public.activities;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity_members'
  ) then
    alter publication supabase_realtime add table public.activity_members;
  end if;
end $$;
