-- Profile011: private organizer favorites.
-- Additive migration. Requires trusted Telegram auth foundation.

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_key text not null references public.app_users(user_key) on delete cascade,
  subject_type text not null,
  subject_id text not null,
  organizer_user_key text references public.app_users(user_key) on delete cascade,
  status text not null default 'active',
  source text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  removed_at timestamptz,
  constraint favorites_subject_type_check check (subject_type in ('activity', 'organizer')),
  constraint favorites_status_check check (status in ('active', 'removed')),
  constraint favorites_source_check check (source in ('activity_card', 'activity_details', 'organizer_profile', 'notification', 'system_import')),
  constraint favorites_subject_identity_check check (
    (subject_type = 'organizer' and organizer_user_key = subject_id)
    or (subject_type = 'activity' and organizer_user_key is null)
  ),
  constraint favorites_user_subject_unique unique (user_key, subject_type, subject_id)
);

create index if not exists favorites_user_status_idx
on public.favorites(user_key, status, updated_at desc);

create index if not exists favorites_organizer_status_idx
on public.favorites(organizer_user_key, status)
where subject_type = 'organizer';

alter table public.favorites enable row level security;

drop trigger if exists favorites_touch_updated_at on public.favorites;
create trigger favorites_touch_updated_at
before update on public.favorites
for each row
execute function public.go_irl_touch_updated_at();

drop policy if exists "favorites own read" on public.favorites;
create policy "favorites own read"
on public.favorites for select to authenticated
using (user_key = public.go_irl_auth_user_key());

drop policy if exists "favorites own insert" on public.favorites;
create policy "favorites own insert"
on public.favorites for insert to authenticated
with check (
  user_key = public.go_irl_auth_user_key()
  and (
    subject_type <> 'organizer'
    or organizer_user_key <> public.go_irl_auth_user_key()
  )
);

drop policy if exists "favorites own update" on public.favorites;
create policy "favorites own update"
on public.favorites for update to authenticated
using (user_key = public.go_irl_auth_user_key())
with check (
  user_key = public.go_irl_auth_user_key()
  and (
    subject_type <> 'organizer'
    or organizer_user_key <> public.go_irl_auth_user_key()
  )
);

revoke all on table public.favorites from public;
revoke all on table public.favorites from anon;
grant select, insert, update on table public.favorites to authenticated;

notify pgrst, 'reload schema';
