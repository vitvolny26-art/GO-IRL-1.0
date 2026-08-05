-- BEAUTY007-B: additive server-backed booking schema foundation.
-- Repository presence does not apply this migration to production.
-- This slice adds schema and database invariants only.
-- RPCs, usable RLS policies, notifications, client wiring and production rollout are out of scope.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

create unique index if not exists beauty_professional_services_id_profile_idx
on public.beauty_professional_services(id, profile_id);

create table if not exists public.beauty_availability_rules (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.beauty_professional_profiles(id) on delete cascade,
  weekday smallint not null,
  start_time time without time zone not null,
  end_time time without time zone not null,
  timezone text not null default 'Europe/Prague',
  slot_interval_minutes integer not null default 30,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beauty_availability_rules_weekday_check
    check (weekday between 1 and 7),
  constraint beauty_availability_rules_time_check
    check (start_time < end_time),
  constraint beauty_availability_rules_timezone_check
    check (timezone = 'Europe/Prague'),
  constraint beauty_availability_rules_interval_check
    check (slot_interval_minutes between 5 and 240)
);

create unique index if not exists beauty_availability_rules_active_window_idx
on public.beauty_availability_rules(profile_id, weekday, start_time, end_time)
where active = true;

create index if not exists beauty_availability_rules_profile_idx
on public.beauty_availability_rules(profile_id, active, weekday, start_time);

create table if not exists public.beauty_time_blocks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.beauty_professional_profiles(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  blocked_range tstzrange generated always as (tstzrange(starts_at, ends_at, '[)')) stored,
  private_label text,
  created_by_user_key text not null references public.app_users(user_key) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint beauty_time_blocks_time_check
    check (starts_at < ends_at),
  constraint beauty_time_blocks_label_check
    check (
      private_label is null
      or (
        private_label = btrim(private_label)
        and char_length(private_label) between 1 and 160
      )
    )
);

create index if not exists beauty_time_blocks_profile_start_idx
on public.beauty_time_blocks(profile_id, starts_at, ends_at);

create index if not exists beauty_time_blocks_range_idx
on public.beauty_time_blocks using gist(profile_id, blocked_range);

create table if not exists public.beauty_bookings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.beauty_professional_profiles(id) on delete restrict,
  service_id uuid not null,
  client_user_key text not null references public.app_users(user_key) on delete restrict,
  status text not null default 'pending',
  starts_at timestamptz not null,
  service_ends_at timestamptz not null,
  reserved_until timestamptz not null,
  reserved_range tstzrange generated always as (tstzrange(starts_at, reserved_until, '[)')) stored,
  hold_expires_at timestamptz,
  client_name_snapshot text not null,
  client_contact_snapshot text not null,
  service_name_snapshot jsonb not null default '{}'::jsonb,
  duration_minutes_snapshot integer not null,
  buffer_minutes_snapshot integer not null default 0,
  price_czk_snapshot integer not null,
  currency text not null default 'CZK',
  public_location_snapshot text not null,
  exact_address_snapshot text not null,
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  completed_at timestamptz,
  constraint beauty_bookings_service_profile_fk
    foreign key (service_id, profile_id)
    references public.beauty_professional_services(id, profile_id)
    on delete restrict,
  constraint beauty_bookings_status_check
    check (status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed', 'no_show', 'expired')),
  constraint beauty_bookings_time_check
    check (starts_at < service_ends_at and service_ends_at <= reserved_until),
  constraint beauty_bookings_hold_expiry_check
    check (hold_expires_at is null or hold_expires_at > created_at),
  constraint beauty_bookings_client_name_check
    check (
      client_name_snapshot = btrim(client_name_snapshot)
      and char_length(client_name_snapshot) between 1 and 120
    ),
  constraint beauty_bookings_client_contact_check
    check (
      client_contact_snapshot = btrim(client_contact_snapshot)
      and char_length(client_contact_snapshot) between 1 and 200
    ),
  constraint beauty_bookings_service_name_check
    check (jsonb_typeof(service_name_snapshot) = 'object'),
  constraint beauty_bookings_duration_check
    check (duration_minutes_snapshot between 5 and 480),
  constraint beauty_bookings_buffer_check
    check (buffer_minutes_snapshot between 0 and 240),
  constraint beauty_bookings_price_check
    check (price_czk_snapshot between 0 and 100000),
  constraint beauty_bookings_currency_check
    check (currency = 'CZK'),
  constraint beauty_bookings_public_location_check
    check (
      public_location_snapshot = btrim(public_location_snapshot)
      and char_length(public_location_snapshot) between 2 and 120
    ),
  constraint beauty_bookings_exact_address_check
    check (
      exact_address_snapshot = btrim(exact_address_snapshot)
      and char_length(exact_address_snapshot) between 5 and 200
    ),
  constraint beauty_bookings_idempotency_key_check
    check (
      idempotency_key = btrim(idempotency_key)
      and char_length(idempotency_key) between 16 and 160
      and idempotency_key ~ '^[A-Za-z0-9._:-]+$'
    ),
  constraint beauty_bookings_confirmed_at_check
    check (confirmed_at is null or confirmed_at >= created_at),
  constraint beauty_bookings_cancelled_at_check
    check (cancelled_at is null or cancelled_at >= created_at),
  constraint beauty_bookings_completed_at_check
    check (completed_at is null or completed_at >= created_at)
);

create unique index if not exists beauty_bookings_client_idempotency_idx
on public.beauty_bookings(client_user_key, idempotency_key);

create index if not exists beauty_bookings_client_created_idx
on public.beauty_bookings(client_user_key, created_at desc);

create index if not exists beauty_bookings_profile_start_idx
on public.beauty_bookings(profile_id, starts_at, status);

create index if not exists beauty_bookings_service_start_idx
on public.beauty_bookings(service_id, starts_at, status);

create index if not exists beauty_bookings_hold_expiry_idx
on public.beauty_bookings(hold_expires_at)
where status = 'pending' and hold_expires_at is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'beauty_bookings_no_active_overlap'
      and conrelid = 'public.beauty_bookings'::regclass
  ) then
    alter table public.beauty_bookings
      add constraint beauty_bookings_no_active_overlap
      exclude using gist (
        profile_id with =,
        reserved_range with &&
      )
      where (status in ('pending', 'confirmed'));
  end if;
end;
$$;

create table if not exists public.beauty_booking_events (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.beauty_bookings(id) on delete cascade,
  event_type text not null,
  actor_user_key text references public.app_users(user_key) on delete set null,
  from_status text,
  to_status text,
  payload jsonb not null default '{}'::jsonb,
  deduplication_key text not null,
  created_at timestamptz not null default now(),
  constraint beauty_booking_events_type_check
    check (event_type in (
      'booking_created',
      'status_changed',
      'booking_cancelled',
      'booking_expired',
      'notification_enqueued'
    )),
  constraint beauty_booking_events_from_status_check
    check (
      from_status is null
      or from_status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed', 'no_show', 'expired')
    ),
  constraint beauty_booking_events_to_status_check
    check (
      to_status is null
      or to_status in ('pending', 'confirmed', 'declined', 'cancelled', 'completed', 'no_show', 'expired')
    ),
  constraint beauty_booking_events_payload_check
    check (jsonb_typeof(payload) = 'object'),
  constraint beauty_booking_events_deduplication_key_check
    check (
      deduplication_key = btrim(deduplication_key)
      and char_length(deduplication_key) between 16 and 240
    ),
  constraint beauty_booking_events_deduplication_key_unique
    unique (deduplication_key)
);

create index if not exists beauty_booking_events_booking_created_idx
on public.beauty_booking_events(booking_id, created_at);

create index if not exists beauty_booking_events_actor_created_idx
on public.beauty_booking_events(actor_user_key, created_at desc)
where actor_user_key is not null;

drop trigger if exists beauty_availability_rules_touch_updated_at on public.beauty_availability_rules;
create trigger beauty_availability_rules_touch_updated_at
before update on public.beauty_availability_rules
for each row
execute function public.go_irl_touch_updated_at();

drop trigger if exists beauty_time_blocks_touch_updated_at on public.beauty_time_blocks;
create trigger beauty_time_blocks_touch_updated_at
before update on public.beauty_time_blocks
for each row
execute function public.go_irl_touch_updated_at();

drop trigger if exists beauty_bookings_touch_updated_at on public.beauty_bookings;
create trigger beauty_bookings_touch_updated_at
before update on public.beauty_bookings
for each row
execute function public.go_irl_touch_updated_at();

alter table public.beauty_availability_rules enable row level security;
alter table public.beauty_time_blocks enable row level security;
alter table public.beauty_bookings enable row level security;
alter table public.beauty_booking_events enable row level security;

revoke all on table public.beauty_availability_rules from public;
revoke all on table public.beauty_availability_rules from anon;
revoke all on table public.beauty_availability_rules from authenticated;
revoke all on table public.beauty_time_blocks from public;
revoke all on table public.beauty_time_blocks from anon;
revoke all on table public.beauty_time_blocks from authenticated;
revoke all on table public.beauty_bookings from public;
revoke all on table public.beauty_bookings from anon;
revoke all on table public.beauty_bookings from authenticated;
revoke all on table public.beauty_booking_events from public;
revoke all on table public.beauty_booking_events from anon;
revoke all on table public.beauty_booking_events from authenticated;

comment on table public.beauty_availability_rules is
  'Beauty007 recurring availability. Locked until reviewed RPC and RLS work is approved.';
comment on table public.beauty_time_blocks is
  'Beauty007 private professional time blocks. Private labels must never appear in public projections.';
comment on table public.beauty_bookings is
  'Beauty007 canonical booking records. Direct client table access is intentionally revoked.';
comment on table public.beauty_booking_events is
  'Beauty007 append-only lifecycle audit. RPC/event producer implementation is deferred.';

notify pgrst, 'reload schema';
