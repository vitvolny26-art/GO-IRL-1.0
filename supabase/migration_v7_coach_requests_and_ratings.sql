-- GO IRL v7 coach requests and ratings

begin;

create table if not exists public.coach_profiles (
  id uuid primary key default gen_random_uuid(),
  user_key text not null unique,
  display_name text not null,
  city text,
  bio text,
  sports text[] not null default '{}',
  languages text[] not null default '{}',
  price_from integer,
  price_currency text not null default 'CZK',
  is_verified boolean not null default false,
  is_active boolean not null default true,
  rating_avg numeric(3,2) not null default 0,
  rating_count integer not null default 0,
  rating_weighted numeric(3,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.coach_requests (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.activities(id) on delete cascade,
  requester_user_key text not null,
  coach_profile_id uuid references public.coach_profiles(id) on delete set null,
  request_type text not null default 'organizer_request',
  sport_type text,
  goal text,
  level text,
  budget_min integer,
  budget_max integer,
  payment_mode text not null default 'split',
  status text not null default 'pending',
  admin_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint coach_requests_request_type_check check (
    request_type in ('organizer_request', 'participant_interest')
  ),
  constraint coach_requests_status_check check (
    status in ('pending', 'matched', 'confirmed', 'cancelled', 'completed', 'rejected')
  ),
  constraint coach_requests_payment_mode_check check (
    payment_mode in ('organizer', 'split', 'free', 'unknown')
  ),
  constraint coach_requests_unique_request unique (
    activity_id,
    requester_user_key,
    request_type
  )
);

create table if not exists public.coach_reviews (
  id uuid primary key default gen_random_uuid(),
  coach_profile_id uuid not null references public.coach_profiles(id) on delete cascade,
  activity_id uuid not null references public.activities(id) on delete cascade,
  reviewer_user_key text not null,
  overall_rating integer not null check (overall_rating between 1 and 5),
  communication_rating integer check (communication_rating between 1 and 5),
  punctuality_rating integer check (punctuality_rating between 1 and 5),
  training_quality_rating integer check (training_quality_rating between 1 and 5),
  beginner_friendliness_rating integer check (beginner_friendliness_rating between 1 and 5),
  tags text[] not null default '{}',
  comment text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),

  constraint coach_reviews_unique_review unique (
    coach_profile_id,
    activity_id,
    reviewer_user_key
  )
);

create index if not exists idx_coach_profiles_user_key on public.coach_profiles(user_key);
create index if not exists idx_coach_profiles_active on public.coach_profiles(is_active);
create index if not exists idx_coach_requests_activity on public.coach_requests(activity_id);
create index if not exists idx_coach_requests_requester on public.coach_requests(requester_user_key);
create index if not exists idx_coach_requests_status on public.coach_requests(status);
create index if not exists idx_coach_reviews_profile on public.coach_reviews(coach_profile_id);
create index if not exists idx_coach_reviews_activity on public.coach_reviews(activity_id);

alter table public.coach_profiles enable row level security;
alter table public.coach_requests enable row level security;
alter table public.coach_reviews enable row level security;

create or replace function public.go_irl_can_manage_activity(p_activity_id uuid)
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
    );
$$;

create or replace function public.go_irl_recalculate_coach_rating(p_coach_profile_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  coach_avg numeric;
  coach_count integer;
  global_avg numeric;
  weighted numeric;
  m numeric := 5;
begin
  select
    coalesce(avg(overall_rating), 0),
    count(*)
  into coach_avg, coach_count
  from public.coach_reviews
  where coach_profile_id = p_coach_profile_id
    and is_public = true;

  select coalesce(avg(overall_rating), 4.5)
  into global_avg
  from public.coach_reviews
  where is_public = true;

  if coach_count = 0 then
    weighted := 0;
  else
    weighted := ((coach_count::numeric / (coach_count::numeric + m)) * coach_avg)
      + ((m / (coach_count::numeric + m)) * global_avg);
  end if;

  update public.coach_profiles
  set
    rating_avg = round(coach_avg, 2),
    rating_count = coach_count,
    rating_weighted = round(weighted, 2),
    updated_at = now()
  where id = p_coach_profile_id;
end;
$$;

create or replace function public.go_irl_coach_review_rating_trigger()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  profile_id uuid;
begin
  profile_id := coalesce(new.coach_profile_id, old.coach_profile_id);
  perform public.go_irl_recalculate_coach_rating(profile_id);
  return coalesce(new, old);
end;
$$;

drop trigger if exists coach_reviews_recalculate_rating on public.coach_reviews;

create trigger coach_reviews_recalculate_rating
after insert or update or delete on public.coach_reviews
for each row
execute function public.go_irl_coach_review_rating_trigger();

drop policy if exists "coach profiles read" on public.coach_profiles;
create policy "coach profiles read"
on public.coach_profiles
for select
to authenticated
using (
  is_active = true
  or user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "coach profiles create own" on public.coach_profiles;
create policy "coach profiles create own"
on public.coach_profiles
for insert
to authenticated
with check (
  user_key = public.go_irl_request_user_key()
  or public.go_irl_request_is_admin()
);

drop policy if exists "coach profiles update own or admin" on public.coach_profiles;
create policy "coach profiles update own or admin"
on public.coach_profiles
for update
to authenticated
using (
  user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
)
with check (
  user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "coach requests read" on public.coach_requests;
create policy "coach requests read"
on public.coach_requests
for select
to authenticated
using (
  requester_user_key = public.go_irl_request_user_key()
  or public.go_irl_can_manage_activity(activity_id)
);

drop policy if exists "coach requests create own" on public.coach_requests;
create policy "coach requests create own"
on public.coach_requests
for insert
to authenticated
with check (
  requester_user_key = public.go_irl_request_user_key()
);

drop policy if exists "coach requests update allowed" on public.coach_requests;
create policy "coach requests update allowed"
on public.coach_requests
for update
to authenticated
using (
  requester_user_key = public.go_irl_request_user_key()
  or public.go_irl_can_manage_activity(activity_id)
)
with check (
  requester_user_key = public.go_irl_request_user_key()
  or public.go_irl_can_manage_activity(activity_id)
);

drop policy if exists "coach reviews read" on public.coach_reviews;
create policy "coach reviews read"
on public.coach_reviews
for select
to authenticated
using (
  is_public = true
  or reviewer_user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

drop policy if exists "coach reviews create own joined" on public.coach_reviews;
create policy "coach reviews create own joined"
on public.coach_reviews
for insert
to authenticated
with check (
  reviewer_user_key = public.go_irl_request_user_key()
  and exists (
    select 1
    from public.activity_members member
    where member.activity_id = coach_reviews.activity_id
      and member.user_key = public.go_irl_request_user_key()
      and member.status = 'joined'
  )
  and exists (
    select 1
    from public.coach_requests request
    where request.activity_id = coach_reviews.activity_id
      and request.coach_profile_id = coach_reviews.coach_profile_id
      and request.status in ('confirmed', 'completed')
  )
);

drop policy if exists "coach reviews update own or admin" on public.coach_reviews;
create policy "coach reviews update own or admin"
on public.coach_reviews
for update
to authenticated
using (
  reviewer_user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
)
with check (
  reviewer_user_key = public.go_irl_request_user_key()
  or public.go_irl_request_can_moderate()
);

notify pgrst, 'reload schema';

commit;
