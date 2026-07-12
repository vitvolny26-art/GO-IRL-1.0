---
title: n8n Workflow Architecture
owner: Tech Lead
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# n8n Workflow Architecture

This document defines future n8n workflow responsibilities. It does not include runnable workflow JSON yet.

## Workflow 1: Event Discovery

Schedule: three times per day per city/timezone.

Steps:

1. Read active rows from `external_sources`.
2. Skip sources that are disabled, broken, or outside retry windows.
3. Fetch only allowed public sources:
   - RSS
   - official APIs
   - public websites
   - public Telegram channels
   - public calendars
   - manual/user-submitted sources
4. Do not log in to personal Facebook accounts.
5. Extract candidate event text, date/time, location, price, and source URL.
6. Save raw candidate fields and payload hash to `discovered_events`.
7. Send public candidate content to AI normalization.
8. Save AI decisions in `ai_event_review_log`.
9. Mark duplicates using source URL, record ID, normalized title, city, venue, date/time, and similarity.
10. Move candidates to `pending_review`, `rejected`, or later `approved`.
11. Promote approved candidates to `events`.

Credentials:

- Supabase service role key in n8n only.
- Source API credentials in n8n only.
- AI API key in n8n only.
- No Facebook passwords.
- No frontend exposure.

## Workflow 2: Evening Digest

Schedule: evening, per target city/timezone.

Steps:

1. Read `notification_preferences` where digest is enabled.
2. Skip users inside quiet hours.
3. Respect user working hours and do not send late-night digests.
4. Load city, language, interests, preferred days/time, and price limit.
5. Select matching published events.
6. Exclude expired/completed/cancelled events.
7. Exclude already sent events from `notification_digest_log`.
8. Rank by city, interests, freshness, free spots, source trust, and relevance.
9. Render localized digest.
10. Send through selected channel.
11. Write delivery result to `notification_digest_log`.

The digest uses user preferences but does not send private identifiers to AI.

Digest ranking should be vertical-aware:

- sport digest can mention skill level, missing players, equipment, and weather dependency.
- friends digest can mention group format and approval mode.
- food digest can mention cuisine, average check, reservation, and payment format.
- dating digest must not expose private dating profiles or contacts; dating notifications need a separate consent-first flow.

## Workflow 3: Event Lifecycle

Schedule: hourly or daily.

Steps:

1. Find published events whose end time has passed.
2. Mark them `expired`.
3. Later, if attendance/completion confirmation exists, mark them `completed`.
4. Keep cancelled events excluded from digest and recommendation flows.

## Workflow 4: Source Health

Schedule: daily.

Steps:

1. Check source fetch success/failure.
2. Update `external_sources.last_checked_at`.
3. Update `external_sources.last_success_at` after successful fetch.
4. Store summarized `last_error`.
5. Disable or flag sources after repeated failures.
6. Send source health report to moderators later.

## Workflow 5: Activity Chat Cleanup

Schedule: hourly.

Purpose: keep Activity Chat optional and temporary, so it helps people meet offline without becoming a permanent messenger.

Steps:

1. Read `activity_chats` where `auto_delete_enabled = true`.
2. Filter chats where `auto_delete_at <= now()`.
3. Skip chats with open reports, complaints, or moderation hold.
4. For MVP, set `status = archived` and `archived_at = now()`.
5. Hide archived messages from normal UI.
6. Stop chat notifications after archive.
7. Write a summarized audit log entry.
8. Consider hard delete only after privacy review and retention-policy approval.

Rules:

- Default `auto_delete_at` is 24 hours after Activity end.
- Chat cleanup must not run in the Mini App.
- Service role key stays in n8n/backend only.
- Cleanup logs must avoid storing full chat content unless needed for an active moderation case.

## Facebook Policy

Facebook is not an MVP automated source.

Allowed later:

- official Facebook API integration if approved and compliant
- manual moderator-added Facebook event URLs when allowed
- user-submitted Facebook event links for manual review

Not allowed:

- personal account browser automation
- storing Facebook login/password
- scraping closed/private groups
- bypassing Facebook access controls

## Operational Rules

- Mini App does not poll for notifications.
- Service role key never ships to frontend.
- AI receives public event data only.
- Personal identifiers stay out of AI prompts.
- n8n logs must avoid raw private user data.
- Failed workflow logs should store summarized errors, not full private payloads.

## Future Workflow JSON

Workflow JSON should be committed only after:

- Supabase tables are live.
- secrets are configured outside Git.
- a test n8n instance exists.
- manual dry-run has been completed.
- data retention rules are decided.
