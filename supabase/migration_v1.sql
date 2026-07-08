-- GO IRL migration v1
-- Apply this in Supabase SQL Editor after the base schema.sql.

create extension if not exists pgcrypto;

alter table public.activities
add column if not exists updated_at timestamptz not null default now();

update public.activities
set updated_at = now()
where updated_at is null;

alter table public.activities
alter column updated_at set default now(),
alter column updated_at set not null;

alter table public.activities
add column if not exists city_id text not null default 'olomouc';

update public.activities
set city_id = 'olomouc'
where city_id is null or btrim(city_id) = '';

alter table public.activities
alter column city_id set default 'olomouc',
alter column city_id set not null;

alter table public.activities
add column if not exists participant_note text;

alter table public.activities
add column if not exists activity_type text not null default 'custom';

update public.activities
set activity_type = 'sport'
where category_id = 'sport';

update public.activities
set activity_type = 'custom'
where activity_type is null or activity_type not in ('sport', 'dating', 'friends', 'food', 'travel', 'culture', 'local', 'custom');

alter table public.activities
alter column activity_type set default 'custom',
alter column activity_type set not null;

alter table public.activities
drop constraint if exists activities_activity_type_check;

alter table public.activities
add constraint activities_activity_type_check check (activity_type in ('sport', 'dating', 'friends', 'food', 'travel', 'culture', 'local', 'custom'));

alter table public.activities
add column if not exists metadata jsonb not null default '{}'::jsonb;

update public.activities
set metadata = '{}'::jsonb
where metadata is null;

alter table public.activities
alter column metadata set default '{}'::jsonb,
alter column metadata set not null;

update public.activities
set price = 0
where price < 0;

update public.activities
set price = 100000
where price > 100000;

alter table public.activities
drop constraint if exists activities_price_check;

alter table public.activities
add constraint activities_price_check check (price between 0 and 100000);

alter table public.activity_members
drop constraint if exists activity_members_status_check;

alter table public.activity_members
add constraint activity_members_status_check check (status in ('joined', 'waiting', 'pending'));

create index if not exists activities_organizer_idx
on public.activities(organizer_key, event_date);

create index if not exists activities_visibility_date_idx
on public.activities(visibility, event_date, event_time);

create index if not exists activities_city_date_idx
on public.activities(city_id, event_date, event_time);

create index if not exists activities_type_city_date_idx
on public.activities(activity_type, city_id, event_date, event_time);

create index if not exists activity_members_user_status_idx
on public.activity_members(user_key, status, activity_id);

create table if not exists public.admin_users (
  user_key text primary key,
  role text not null default 'admin' check (role = 'admin'),
  note text,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

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

drop policy if exists "public members delete" on public.activity_members;
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

grant delete on public.activities to anon;
grant delete on public.activity_members to anon;

alter table public.activities enable row level security;
alter table public.activity_members enable row level security;

-- Ask Supabase PostgREST to refresh its schema cache after adding columns.
notify pgrst, 'reload schema';
