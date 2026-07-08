-- GO IRL AI Event Discovery migration plan.
-- This is an architectural scaffold. Review before applying to production.
-- Current Sprint 1 tables remain unchanged.

-- Recommended path:
-- 1. Apply supabase/schema.sql and supabase/migration_v1.sql for Sprint 1.
-- 2. Review docs/Database.md and supabase/schema_next.sql.
-- 3. Create next-generation tables in a staging Supabase project first.
-- 4. Add RLS policies and tests per table before exposing UI.
-- 5. Connect n8n with service role only after secrets are configured outside Git.

-- Tables planned in schema_next.sql:
-- users
-- user_profiles
-- user_interests
-- interests
-- events
-- event_sources
-- discovered_events
-- event_categories
-- notification_preferences
-- notification_digest_log
-- external_sources
-- ai_event_review_log

-- Do not add real Facebook parsing, OpenAI calls, n8n workflow JSON,
-- push notifications, email, Viber, or WhatsApp integrations in this migration.
