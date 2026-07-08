# Database Architecture

This document describes the target database model for GO IRL after Sprint 1. It is an architecture plan, not a mandatory migration for the current MVP tables.

## Principles

- Keep current Sprint 1 tables stable.
- Separate public profile data, private notification data, event data, external-source data, and AI review logs.
- Model GO IRL as vertical experience modules, not one universal event flow.
- Use RLS on every user-facing table.
- Use service-role access only for n8n/server jobs.
- Store only data required for event discovery, matching, notifications, safety, and account control.

## Target Tables

### users

Purpose: stable application identity mapped from Telegram or future auth providers.

Fields:
- `id uuid primary key`
- `auth_provider text`
- `provider_user_id_hash text`
- `default_city_id text`
- `language text`
- `status text`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints and indexes:
- unique `(auth_provider, provider_user_id_hash)`
- check language in supported languages
- check status in `active`, `blocked`, `deleted`
- index `(default_city_id, status)`

RLS:
- user can select/update own row.
- n8n/server can read active users for digest with service role.

### user_profiles

Purpose: public and private profile split.

Fields:
- `user_id uuid primary key references users(id) on delete cascade`
- `display_name text`
- `public_bio text`
- `avatar_code text`
- `is_public boolean`
- `anonymous_mode boolean`
- `public_city_id text`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints and indexes:
- check display name length
- index `(public_city_id, is_public)`

RLS:
- public profiles are readable when `is_public = true`.
- owner can read/update full profile.

### interests

Purpose: canonical interest taxonomy.

Fields:
- `id uuid primary key`
- `slug text unique`
- `category_slug text`
- `name_ru text`
- `name_cs text`
- `name_en text`
- `emoji text`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Indexes:
- unique `slug`
- index `(category_slug, is_active)`

RLS:
- readable by all app users.
- writable only by service/admin.

### user_interests

Purpose: user preference matrix for discovery and digest.

Fields:
- `user_id uuid references users(id) on delete cascade`
- `interest_id uuid references interests(id) on delete cascade`
- `weight smallint default 3`
- `created_at timestamptz`
- primary key `(user_id, interest_id)`

Constraints:
- check weight between 1 and 5

RLS:
- owner can read/write own interests.
- service role can read for digest matching.

### event_categories

Purpose: database-level event categories aligned with frontend taxonomy.

Fields:
- `id uuid primary key`
- `slug text unique`
- `name_ru text`
- `name_cs text`
- `name_en text`
- `emoji text`
- `is_active boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

RLS:
- readable by all.
- writable only by service/admin.

### events

Purpose: canonical user-created and validated external events. This is the future replacement/extension of `activities`.

Fields:
- `id uuid primary key`
- `activity_type text`
- `category_id uuid references event_categories(id)`
- `organizer_user_id uuid references users(id)`
- `source_type text`
- `title text`
- `description text`
- `city_id text`
- `location_name text`
- `address text`
- `location_url text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `price integer`
- `capacity integer`
- `visibility text`
- `status text`
- `metadata jsonb`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints and indexes:
- check activity_type in `sport`, `dating`, `friends`, `food`, `culture`, `local`, `custom`
- check price between 0 and 100000
- check capacity between 2 and 1000 when present
- check visibility in `public`, `invite`, `private`
- check status in `draft`, `published`, `cancelled`, `archived`
- index `(city_id, starts_at)`
- index `(activity_type, city_id, starts_at)`
- index `(category_id, starts_at)`
- index `(organizer_user_id, starts_at)`

RLS:
- public published events are readable by all.
- invite/private events require organizer, participant, invite token, or approved access.
- owner can insert/update own events.
- service role can insert validated discovered events.

Vertical metadata:
- early-stage vertical fields may live in `metadata`
- example keys: `sport_meta`, `friends_meta`, `food_meta`, `custom_meta`
- dating should not be launched as a normal event join flow; it needs a separate dating profile/match model before production
- when a vertical stabilizes, move query-heavy metadata into normalized vertical tables

### sport_event_meta

Future normalized table for sport-specific data.

Fields:
- `event_id uuid primary key references events(id) on delete cascade`
- `sport_type text`
- `skill_level text`
- `format text`
- `equipment text[]`
- `weather_dependent boolean`
- `team_size integer`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints:
- check skill_level in `beginner`, `intermediate`, `advanced`
- check format in `casual`, `training`, `competition`

### activity_chats

Purpose: optional, temporary chat around one Activity/Event. Chat exists only to help people meet offline.

Fields:
- `id uuid primary key`
- `activity_id uuid not null references events(id) on delete cascade`
- `enabled boolean not null default false`
- `status text not null default 'active'`
- `auto_delete_enabled boolean not null default true`
- `auto_delete_at timestamptz`
- `created_at timestamptz`
- `archived_at timestamptz`
- `deleted_at timestamptz`

Constraints and indexes:
- unique `(activity_id)`
- check status in `active`, `archived`, `deleted`
- index `(status, auto_delete_at)`
- index `(activity_id, status)`

RLS:
- organizer can read chat for their Activity.
- confirmed chat members can read active chat.
- admin/moderator can read through separate moderation permission.
- guests, pending users, rejected users, and blocked users cannot read chat.
- service role/n8n can archive chats through the cleanup workflow.

Retention:
- default MVP behavior is archive 24 hours after Activity end.
- `status = archived` hides messages from normal UI.
- hard delete is allowed only after privacy review.

### activity_chat_members

Purpose: explicit access list for Activity Chat.

Fields:
- `id uuid primary key`
- `chat_id uuid not null references activity_chats(id) on delete cascade`
- `user_id uuid not null references users(id) on delete cascade`
- `role text not null`
- `joined_at timestamptz`
- `muted_until timestamptz`
- `left_at timestamptz`

Constraints and indexes:
- unique `(chat_id, user_id)`
- check role in `organizer`, `participant`, `moderator`
- index `(user_id, left_at)`
- index `(chat_id, role)`

RLS:
- user can read their own chat membership.
- active members can read the member list for chats they belong to.
- admin/moderator can read for moderation.
- pending Activity requests do not create chat membership.

### activity_chat_messages

Purpose: messages inside optional Activity Chat.

Fields:
- `id uuid primary key`
- `chat_id uuid not null references activity_chats(id) on delete cascade`
- `sender_user_id uuid not null references users(id) on delete restrict`
- `body text not null`
- `created_at timestamptz`
- `edited_at timestamptz`
- `deleted_at timestamptz`
- `moderation_status text not null default 'visible'`

Constraints and indexes:
- check body length
- check moderation_status in `visible`, `reported`, `hidden`, `removed`
- index `(chat_id, created_at)`
- index `(sender_user_id, created_at)`
- index `(moderation_status, created_at)`

RLS:
- user can read visible messages only for active chats where they are an active member.
- archived chat messages are hidden from normal UI.
- sender can soft-delete own message if chat is active.
- admin/moderator can hide/remove messages.
- service role can archive/hide messages during cleanup.

Moderation:
- reported messages can place the chat on moderation hold.
- moderation/audit metadata may be retained for a limited period after archive.
- chat content is not sent to AI without explicit consent.

### rli_ledger

Purpose: transparent historical ledger for Real Life Index changes.

Fields:
- `id uuid primary key`
- `user_id uuid references users(id) on delete cascade`
- `activity_id uuid references events(id) on delete set null`
- `delta integer not null`
- `reason text not null`
- `source_type text not null`
- `confidence_level text`
- `created_at timestamptz`
- `created_by_system boolean`
- `metadata jsonb`

Constraints and indexes:
- check `source_type` in `attendance_confirmation`, `organizer_confirmation`, `community_contribution`, `penalty`, `referral`, `moderation`
- check `confidence_level` in `high`, `medium`, `low` when present
- index `(user_id, created_at desc)`
- index `(activity_id)`
- index `(reason, created_at desc)`

RLS:
- user can read own ledger summary when exposed.
- detailed fraud/moderation metadata is admin/moderator only.
- service role writes ledger entries.

### trust_events

Purpose: internal Trust Score signal journal. It is hidden from public UI.

Fields:
- `id uuid primary key`
- `user_id uuid references users(id) on delete cascade`
- `activity_id uuid references events(id) on delete set null`
- `event_type text not null`
- `weight integer not null`
- `confidence_level text`
- `created_at timestamptz`
- `created_by_system boolean`
- `metadata jsonb`

RLS:
- no public read.
- user export/audit can expose a safe summary later.
- service/admin/moderator access only.

### attendance_confirmations

Purpose: store post-Activity confirmation results without storing unnecessary raw location data.

Fields:
- `id uuid primary key`
- `activity_id uuid references events(id) on delete cascade`
- `confirmed_user_id uuid references users(id) on delete cascade`
- `confirmed_by_user_id uuid references users(id) on delete set null`
- `confirmation_type text not null`
- `result text not null`
- `created_at timestamptz`
- `metadata jsonb`

Constraints and indexes:
- check `confirmation_type` in `organizer`, `participant`, `geolocation`
- check `result` in `yes`, `no`, `unknown`
- unique `(activity_id, confirmed_user_id, confirmed_by_user_id, confirmation_type)`
- index `(activity_id, result)`
- index `(confirmed_user_id, created_at desc)`

Privacy:
- raw geolocation is not stored as movement history.
- geolocation confirmation stores only result and coarse metadata needed for audit.

### event_confidence

Purpose: store confidence level of completed Activity participation.

Fields:
- `activity_id uuid primary key references events(id) on delete cascade`
- `confidence_level text not null`
- `organizer_confirmed boolean`
- `majority_confirmed boolean`
- `geo_confirmed_count integer`
- `calculated_at timestamptz`
- `metadata jsonb`

Constraints:
- check `confidence_level` in `high`, `medium`, `low`

Usage:
- low confidence Activities may give reduced RLI.
- confidence should inform ledger writes, not public shaming.

### community_contributions

Purpose: record contribution to local community beyond simple attendance.

Fields:
- `id uuid primary key`
- `user_id uuid references users(id) on delete cascade`
- `activity_id uuid references events(id) on delete set null`
- `contribution_type text not null`
- `weight integer not null`
- `created_at timestamptz`
- `metadata jsonb`

Usage:
- ambassadors
- moderators
- trusted organizers
- community builders

### referral_codes

Purpose: privacy-safe referral attribution.

Fields:
- `id uuid primary key`
- `owner_user_id uuid references users(id) on delete cascade`
- `code_hash text unique not null`
- `status text not null`
- `created_at timestamptz`
- `expires_at timestamptz`

Constraints:
- check `status` in `active`, `disabled`, `expired`

### referral_rewards

Purpose: record referral credit only after meaningful real participation.

Fields:
- `id uuid primary key`
- `referrer_user_id uuid references users(id) on delete cascade`
- `referred_user_id uuid references users(id) on delete cascade`
- `status text not null`
- `confirmed_activity_count integer not null default 0`
- `awarded_at timestamptz`
- `created_at timestamptz`
- `metadata jsonb`

Rule:
- referral reward can be awarded only after referred user completes 3 confirmed Activities.

No crypto, token, or financial reward semantics are part of the MVP.

### dating_profiles

Future table for the Dating vertical. It must not use the generic event join model.

Fields:
- `user_id uuid primary key references users(id) on delete cascade`
- `city_id text`
- `display_name text`
- `bio text`
- `looking_for text`
- `communication_format text`
- `anonymous_mode boolean`
- `visibility text`
- `created_at timestamptz`
- `updated_at timestamptz`

Privacy:
- Telegram username, phone, email, and internal IDs are not public.
- identity reveal requires mutual consent.
- RLS must respect blocks, reports, visibility, and age/safety rules.

### dating_matches

Future table for Dating matching.

Fields:
- `id uuid primary key`
- `user_id uuid references users(id) on delete cascade`
- `target_user_id uuid references users(id) on delete cascade`
- `action text`
- `matched_at timestamptz`
- `reveal_status text`
- `created_at timestamptz`

Constraints:
- check action in `like`, `pass`, `block`, `report`
- unique `(user_id, target_user_id)`

### event_sources

Purpose: connect canonical events to origin records.

Fields:
- `event_id uuid references events(id) on delete cascade`
- `external_source_id uuid references external_sources(id)`
- `source_url text`
- `source_record_id text`
- `created_at timestamptz`
- primary key `(event_id, external_source_id)`

Indexes:
- unique `(external_source_id, source_record_id)` when source_record_id is not null

RLS:
- readable with event access.
- writable only by service/admin.

### external_sources

Purpose: configured sources for n8n discovery.

Fields:
- `id uuid primary key`
- `source_type text`
- `name text`
- `base_url text`
- `city_id text`
- `category_hint text`
- `crawl_frequency text`
- `is_active boolean`
- `last_checked_at timestamptz`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints and indexes:
- check source_type in `rss`, `api`, `website`, `telegram_channel`, `public_calendar`, `manual`, `user_suggestion`, `facebook_future`, `other`
- `facebook_future` is reserved for official API/manual-review integrations only; do not store Facebook credentials or rely on personal-account automation
- index `(city_id, is_active)`

RLS:
- public read can be disabled initially.
- service/admin writes.

### discovered_events

Purpose: AI-normalized raw external event candidates.

Fields:
- `id uuid primary key`
- `external_source_id uuid references external_sources(id)`
- `source_url text`
- `source_record_id text`
- `raw_payload jsonb`
- `normalized_payload jsonb`
- `title text`
- `description text`
- `category_id uuid references event_categories(id)`
- `city_id text`
- `location_name text`
- `address text`
- `starts_at timestamptz`
- `ends_at timestamptz`
- `price integer`
- `confidence_score numeric(4,3)`
- `duplicate_of uuid references discovered_events(id)`
- `review_status text`
- `rejection_reason text`
- `promoted_event_id uuid references events(id)`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints and indexes:
- check confidence between 0 and 1
- check review_status in `new`, `auto_approved`, `needs_review`, `rejected`, `promoted`, `duplicate`
- unique `(external_source_id, source_record_id)` when present
- index `(city_id, starts_at, review_status)`
- index `(duplicate_of)`

RLS:
- not readable by normal users initially.
- service/admin only, because raw payloads can contain noisy third-party data.

### ai_event_review_log

Purpose: auditable AI decisions without user PII.

Fields:
- `id uuid primary key`
- `discovered_event_id uuid references discovered_events(id) on delete cascade`
- `model_name text`
- `decision text`
- `confidence_score numeric(4,3)`
- `reason text`
- `input_hash text`
- `output_summary jsonb`
- `created_at timestamptz`

Constraints and indexes:
- check decision in `accept`, `reject`, `duplicate`, `needs_review`
- index `(discovered_event_id, created_at)`

RLS:
- service/admin only.
- do not store Telegram ID, email, phone, or full private user profile.

### notification_preferences

Purpose: notification and digest preferences.

Fields:
- `user_id uuid primary key references users(id) on delete cascade`
- `evening_digest_enabled boolean`
- `notification_channel text`
- `email_hash text`
- `telegram_chat_id_encrypted text`
- `preferred_days smallint[]`
- `preferred_time_start time`
- `preferred_time_end time`
- `quiet_hours_start time`
- `quiet_hours_end time`
- `max_price integer`
- `radius_km integer`
- `district text`
- `ai_recommendations_enabled boolean`
- `created_at timestamptz`
- `updated_at timestamptz`

Constraints and indexes:
- check channel in `telegram`, `email`, `viber`, `whatsapp`
- check max_price between 0 and 100000
- check radius between 1 and 100
- index `(evening_digest_enabled, notification_channel)`

RLS:
- owner can read/update own preferences.
- service role can read enabled preferences for digest.

### notification_digest_log

Purpose: prevent duplicate sends and support delivery audit.

Fields:
- `id uuid primary key`
- `user_id uuid references users(id) on delete cascade`
- `digest_date date`
- `channel text`
- `event_ids uuid[]`
- `status text`
- `error_message text`
- `sent_at timestamptz`
- `created_at timestamptz`

Constraints and indexes:
- unique `(user_id, digest_date, channel)`
- check status in `queued`, `sent`, `failed`, `skipped`
- index `(digest_date, status)`

RLS:
- owner can read own digest history if exposed.
- service role writes.

## Activity Chat Automation

### n8n chat cleanup workflow

Purpose: archive or delete temporary Activity Chats after their usefulness window ends.

Schedule:
- runs once per hour

Workflow:
1. Select `activity_chats` where `auto_delete_enabled = true`.
2. Filter `auto_delete_at <= now()`.
3. Skip chats with open complaints or moderation hold.
4. Set `status = archived` and `archived_at = now()` for MVP.
5. Hide messages from normal UI.
6. Log the cleanup action for audit.
7. Do not send notifications after archive.

Default policy:
- `auto_delete_at = activity.ends_at + interval '24 hours'`
- archive is preferred over hard delete for MVP.
- hard delete requires privacy review and retention policy approval.

## Migration Strategy

1. Keep `activities` and `activity_members` running for Sprint 1.
2. Add next-generation tables in `schema_next.sql`.
3. Build write path for `users`, `user_profiles`, `notification_preferences`.
4. Introduce `events` as canonical table in Sprint 2/3.
5. Add optional Activity Chat tables only after event/user/RLS foundations are stable.
6. Migrate or map `activities` to `events` only after UI and RLS tests are ready.
