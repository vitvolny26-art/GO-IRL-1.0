-- GO IRL target schema plan for User Interests + AI Event Discovery + Evening Digest.
-- Do not apply directly to the current Sprint 1 database without review.

create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_provider text not null default 'telegram' check (auth_provider in ('telegram', 'email', 'anonymous')),
  provider_user_id_hash text not null,
  default_city_id text not null default 'olomouc',
  language text not null default 'ru' check (language in ('ru', 'uk', 'cs', 'en')),
  status text not null default 'active' check (status in ('active', 'blocked', 'deleted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (auth_provider, provider_user_id_hash)
);

create table if not exists public.user_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 80),
  public_bio text not null default '' check (char_length(public_bio) <= 500),
  avatar_code text not null default 'GI',
  is_public boolean not null default false,
  anonymous_mode boolean not null default true,
  public_city_id text not null default 'olomouc',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name_ru text not null,
  name_cs text not null,
  name_en text not null default '',
  emoji text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.interests (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category_slug text not null,
  name_ru text not null,
  name_cs text not null,
  name_en text not null default '',
  emoji text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_interests (
  user_id uuid not null references public.users(id) on delete cascade,
  interest_id uuid not null references public.interests(id) on delete cascade,
  weight smallint not null default 3 check (weight between 1 and 5),
  created_at timestamptz not null default now(),
  primary key (user_id, interest_id)
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.event_categories(id),
  organizer_user_id uuid references public.users(id),
  source_type text not null default 'user' check (source_type in ('user', 'discovered', 'admin')),
  title text not null check (char_length(title) between 1 and 180),
  description text not null default '',
  city_id text not null default 'olomouc',
  location_name text,
  address text,
  location_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price integer not null default 0 check (price between 0 and 100000),
  capacity integer check (capacity between 2 and 1000),
  visibility text not null default 'public' check (visibility in ('public', 'invite', 'private')),
  status text not null default 'published' check (status in ('draft', 'published', 'cancelled', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.external_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null check (source_type in ('website', 'facebook_group', 'telegram_channel', 'city_board', 'sports_site', 'other')),
  name text not null,
  base_url text not null,
  city_id text not null default 'olomouc',
  category_hint text,
  crawl_frequency text not null default '3x_daily',
  is_active boolean not null default true,
  last_checked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.discovered_events (
  id uuid primary key default gen_random_uuid(),
  external_source_id uuid references public.external_sources(id) on delete set null,
  source_url text not null,
  source_record_id text,
  raw_payload jsonb,
  normalized_payload jsonb,
  title text not null,
  description text not null default '',
  category_id uuid references public.event_categories(id),
  city_id text not null,
  location_name text,
  address text,
  starts_at timestamptz,
  ends_at timestamptz,
  price integer check (price between 0 and 100000),
  confidence_score numeric(4,3) check (confidence_score between 0 and 1),
  duplicate_of uuid references public.discovered_events(id),
  review_status text not null default 'new' check (review_status in ('new', 'auto_approved', 'needs_review', 'rejected', 'promoted', 'duplicate')),
  rejection_reason text,
  promoted_event_id uuid references public.events(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_sources (
  event_id uuid not null references public.events(id) on delete cascade,
  external_source_id uuid not null references public.external_sources(id) on delete cascade,
  source_url text not null,
  source_record_id text,
  created_at timestamptz not null default now(),
  primary key (event_id, external_source_id)
);

create table if not exists public.ai_event_review_log (
  id uuid primary key default gen_random_uuid(),
  discovered_event_id uuid not null references public.discovered_events(id) on delete cascade,
  model_name text not null,
  decision text not null check (decision in ('accept', 'reject', 'duplicate', 'needs_review')),
  confidence_score numeric(4,3) check (confidence_score between 0 and 1),
  reason text,
  input_hash text not null,
  output_summary jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notification_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  evening_digest_enabled boolean not null default false,
  notification_channel text not null default 'telegram' check (notification_channel in ('telegram', 'email', 'viber', 'whatsapp')),
  email_hash text,
  telegram_chat_id_encrypted text,
  preferred_days smallint[] not null default array[1,2,3,4,5,6,7],
  preferred_time_start time,
  preferred_time_end time,
  quiet_hours_start time not null default '22:00',
  quiet_hours_end time not null default '08:00',
  max_price integer not null default 100000 check (max_price between 0 and 100000),
  radius_km integer check (radius_km between 1 and 100),
  district text,
  ai_recommendations_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.notification_digest_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  digest_date date not null,
  channel text not null check (channel in ('telegram', 'email', 'viber', 'whatsapp')),
  event_ids uuid[] not null default array[]::uuid[],
  status text not null default 'queued' check (status in ('queued', 'sent', 'failed', 'skipped')),
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, digest_date, channel)
);

create index if not exists users_city_status_idx on public.users(default_city_id, status);
create index if not exists user_profiles_city_public_idx on public.user_profiles(public_city_id, is_public);
create index if not exists interests_category_active_idx on public.interests(category_slug, is_active);
create index if not exists events_city_starts_idx on public.events(city_id, starts_at);
create index if not exists events_category_starts_idx on public.events(category_id, starts_at);
create index if not exists events_organizer_starts_idx on public.events(organizer_user_id, starts_at);
create index if not exists external_sources_city_active_idx on public.external_sources(city_id, is_active);
create index if not exists discovered_events_city_review_idx on public.discovered_events(city_id, starts_at, review_status);
create index if not exists discovered_events_duplicate_idx on public.discovered_events(duplicate_of);
create unique index if not exists discovered_events_source_record_uidx on public.discovered_events(external_source_id, source_record_id) where source_record_id is not null;
create unique index if not exists event_sources_record_uidx on public.event_sources(external_source_id, source_record_id) where source_record_id is not null;
create index if not exists ai_event_review_log_event_created_idx on public.ai_event_review_log(discovered_event_id, created_at);
create index if not exists notification_preferences_digest_idx on public.notification_preferences(evening_digest_enabled, notification_channel);
create index if not exists notification_digest_log_date_status_idx on public.notification_digest_log(digest_date, status);

alter table public.users enable row level security;
alter table public.user_profiles enable row level security;
alter table public.user_interests enable row level security;
alter table public.interests enable row level security;
alter table public.events enable row level security;
alter table public.event_sources enable row level security;
alter table public.discovered_events enable row level security;
alter table public.event_categories enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.notification_digest_log enable row level security;
alter table public.external_sources enable row level security;
alter table public.ai_event_review_log enable row level security;
