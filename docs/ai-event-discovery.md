# AI Event Discovery

GO IRL will discover relevant offline events on the server side. The Telegram Mini App must not run in the background, scrape private accounts, or automate user sessions.

This is an architecture plan only. It does not implement real scraping, real AI calls, or runnable n8n workflow JSON.

## Safety Position

The MVP must not automate a personal Facebook account.

Not allowed for production:

- logging into Facebook with a personal account
- storing Facebook login/password
- browser automation of private Facebook sessions
- scraping closed groups as the primary discovery mechanism
- bypassing platform access controls

Facebook Groups are a future integration only:

- official API, if access is granted and compliant
- manual source submission by an admin or trusted user
- manual event copy/review when the source permits it

## MVP Source Strategy

Primary MVP sources:

- public event websites
- RSS feeds
- official APIs
- city event boards
- university calendars
- sports club and local venue websites
- public Telegram channels
- public calendars
- manual moderator-added sources
- user-submitted event suggestions

Lower-priority future sources:

- Facebook Events / Groups through official API or manual moderation
- Meetup API or export if available
- Eventbrite API
- Discord community calendars where explicitly public
- Reddit public community posts where terms allow it

## Source Storage: `external_sources`

Each source is configured in `external_sources`.

Recommended fields:

- `id`
- `source_type`: `rss`, `api`, `website`, `telegram_channel`, `public_calendar`, `manual`, `user_suggestion`, `facebook_future`
- `name`
- `base_url`
- `city_id`
- `category_hint`
- `language_hint`
- `fetch_method`: `http`, `rss`, `api`, `telegram_public`, `manual`
- `trust_level`: `low`, `medium`, `high`
- `active`
- `last_checked_at`
- `last_success_at`
- `last_error`
- `created_at`
- `updated_at`

Credentials, if ever needed, are stored in n8n secrets or backend secret storage, never in frontend code and never in Git.

## Discovery Schedule

n8n runs three times per day per target city/timezone:

1. Morning: catch newly published events.
2. Afternoon: refresh fast-moving local sources.
3. Early evening: collect final candidates before digest generation.

The schedule belongs to n8n. The Mini App does not poll sources.

## Raw Discovery: `discovered_events`

For every candidate event, n8n creates or updates a row in `discovered_events`.

Recommended fields:

- `id`
- `external_source_id`
- `source_record_id`
- `source_url`
- `raw_title`
- `raw_description`
- `raw_location`
- `raw_start_at`
- `raw_end_at`
- `raw_price`
- `raw_payload_hash`
- `normalized_title`
- `normalized_description`
- `normalized_category_id`
- `normalized_city_id`
- `normalized_location_name`
- `normalized_address`
- `normalized_start_at`
- `normalized_end_at`
- `normalized_price`
- `confidence_score`
- `duplicate_of`
- `review_status`: `new`, `pending_review`, `approved`, `rejected`, `published`, `expired`
- `rejection_reason`
- `created_at`
- `updated_at`

Store raw payloads carefully. Prefer hashes and extracted text over full raw HTML when possible.

## AI Normalization

AI receives only public candidate event content plus source and city/category hints.

AI normalizes:

- title
- description
- category
- city
- location
- date/time
- price
- source URL
- confidence score

AI rejects:

- spam
- ads without a real offline event
- old events
- online-only events
- vague posts without date/time/place
- private or restricted content
- duplicate candidates

AI decisions are written to `ai_event_review_log` without personal user data.

## Duplicate Detection

Duplicate detection should combine deterministic and fuzzy checks:

- same source URL
- same source record ID
- same title/date/city
- same venue and close start time
- normalized text similarity hash
- AI duplicate confidence

Duplicates remain in `discovered_events` with `duplicate_of` pointing to the canonical candidate.

## Review Flow

Default flow:

1. Candidate is saved as `new`.
2. AI normalizes and scores it.
3. Low confidence or risky candidates become `rejected`.
4. Medium confidence candidates become `pending_review`.
5. Moderator approves or rejects.
6. High-trust/high-confidence candidates may later auto-approve.
7. Approved candidates are promoted to the canonical `events` table.
8. Published candidates get `review_status = published`.

Promotion to `events` requires:

- offline event
- known city
- known date/time
- source URL
- mapped category
- acceptable price
- not duplicate
- not private/restricted source content

## Event Lifecycle

Published events should move through statuses:

- `published`: visible and joinable
- `expired`: date/time passed without confirmed completion
- `completed`: event was confirmed as happened
- `cancelled`: organizer/moderator cancelled

n8n or a backend scheduled job can mark past events as `expired`. Later, organizer/user confirmation can turn eligible events into `completed`.

## Privacy

AI Event Discovery must not use private user data.

Allowed:

- public source text
- public source URL
- city/category hints
- anonymized interest categories for ranking

Not allowed:

- Telegram ID
- Telegram username unless explicitly public and consented
- phone
- email
- private profile fields
- exact user activity history
- notification delivery identifiers

For recommendations, use anonymized interests and city/language preferences. Do not send user identity to AI.

## Vertical Recommendation Engines

GO IRL recommendations should be vertical-aware.

Future engines:

- `SportRecommendationEngine`: sport type, skill level, format, time, city, free spots, equipment, weather.
- `FriendsRecommendationEngine`: shared interests, group size, city, trust, time window.
- `FoodRecommendationEngine`: cuisine, average check, reservation, budget, place, time.
- `DatingMatchingEngine`: consent, safety, privacy, age gate, blocks/reports, mutual likes, reveal state.
- `GenericRecommendationEngine`: fallback for events without a specialized vertical.

Dating matching is not event recommendation and must not use the generic join/request model.

## Why Mini App Does Not Work In Background

Telegram Mini Apps are user-facing UI sessions, not background workers.

Reasons:

- background polling drains battery
- Telegram may suspend or close the WebView
- notifications must work even when the app is closed
- user privacy requires no hidden tracking
- service credentials must never ship to frontend

All discovery, digest, notifications, and source checks run on server-side infrastructure through n8n/backend jobs.

## Not Implemented Now

- Facebook scraping
- personal Facebook account automation
- storing Facebook credentials
- real OpenAI API calls
- real n8n workflow JSON
- automatic publication without moderation
- admin review UI
