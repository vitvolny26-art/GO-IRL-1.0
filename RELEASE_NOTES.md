# Release Notes

## Unreleased - Beta Stabilization Update

### Product Scope Guardrails

GO IRL has a documented market positioning source of truth for the Olomouc beta:

- `docs/MARKET_POSITIONING.md` defines GO IRL as a Telegram-first local meetup layer, not an event calendar, ticketing platform, sport-only app, dating app, or social feed.
- `docs/COMPETITOR_WATCH.md` tracks competitor signals from sports apps, messenger organizers, community platforms, invite tools, ticketing platforms, and local calendars.
- `ROADMAP.md` and `BACKLOG.md` enforce the beta guardrail: new scope must help users create, join, coordinate, and attend real-life meetups faster than a normal Telegram chat.

Canonical beta categories stay limited to:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

Explicit non-goals before beta:

- ticketing/payments;
- club CRM;
- subscriptions/premium;
- AI recommendations;
- post-event albums/feed;
- public ratings/reviews;
- direct messages;
- complex profiles;
- big multi-city catalog;
- dating, friends, travel, or broad lifestyle verticals.

### Current Stabilization Scope

Patched or verified in the current stabilization pass:

- Browser Mock Mode
  - Browser without Telegram `initData` uses local demo state.
  - Demo writes are local-only and must not touch production Supabase.
  - Demo user: `Vit_Test` / `telegram:999999`.
- Restore Coach + Chat
  - Coach and Event Chat panels are mounted in sport event details.
- Event Card Time Fix
  - Sport cards show event start time consistently.
  - Empty time badge is not rendered.
- Profile Fix
  - Profile edit uses Save and local persistence.
  - Demo avatar upload stores a local data URL.
  - Production Supabase Storage avatar upload is still pending a separate Storage/RLS-safe task.
- Bug Report Fix
  - Bug report opens Telegram support link and does not copy share text.
- Weather Widget
  - Sport event details use Open-Meteo weather without API keys.
- Share Fix
  - Share links use Telegram Mini App `startapp` deep links.
  - Browser `/join/:id` opens the target activity.
  - Open Graph metadata is present with an absolute image URL.
- Beta UI Cleanup
  - Static `BETA` dev marker and debug panel were removed from `index.html`.

### Verification Status

Latest local quality gates are **pending after the newest commits**:

- `pnpm run lint`: pending
- `pnpm run build`: pending
- `pnpm run test`: pending

Do not claim beta-ready until these pass on the latest `main`.

## 0.1.0 - Internal Telegram Mini App MVP

### Production Auth Status

Trusted Telegram auth is **[SHIPPED/PRODUCTION PATH]** in the repository and is the documented production model.

Current production path:

- `verifyTelegramInitData` Supabase Edge Function validates Telegram `initData`.
- Frontend uses the verified `accessToken` flow.
- Write operations are guarded until trusted auth ready.
- Legacy `x-go-irl-user-key` behavior is treated as legacy demo/local compatibility and must not be presented as the public production auth model.

Release verification still requires real-environment smoke checks, but Trusted Auth is no longer listed as a public blocker in these notes.

### Public Release Blockers

Public/beta release still requires operational verification:

- Configure production environment variables on Vercel.
- Confirm Supabase Edge Function secrets are present in production.
- Re-check private activity visibility with an unrelated account before public launch.
- Confirm RLS behavior with at least two Telegram accounts.
- Validate Telegram share links through `@GOirl_bot`.
- Validate explicit Mini App close behavior on real Telegram clients.
- Replace temporary admin allowlist with server-side role enforcement before public moderation tools launch.
- Apply and verify backend/security migrations only through the approved Supabase release process.

GO IRL has a working Telegram Mini App foundation for Olomouc activities.

### Included

- Create, view, share, edit, and join offline activities.
- Public events join immediately when capacity is available.
- Full events put users into a waiting state.
- Private events create pending requests that the organizer can approve or reject.
- Supabase stores activities and participants and broadcasts realtime updates.
- Supabase RLS limits non-public activity visibility to organizers, participants, or invite-link visitors.
- Header is fixed, safe-area aware, and ready for Telegram in-app browser behavior.
- Mini App lifecycle UX includes explicit Done / Back to Telegram actions.
- Realtime subscriptions are cleaned up when the app is hidden or unmounted; no background notification polling is used.
- Russian, Ukrainian, Czech, and English localization options are available.
- GO IRL logo is used in the header, home hero, favicon, app icon, and Open Graph preview.
- Sport Vertical MVP is live with sport-specific cards, details, create fields, skill level, indoor/outdoor, equipment, duration, demo examples, and a dedicated SportRecommendationEngine.
- Activities can be saved to Google Calendar through a template link. No Google OAuth or calendar sync is used in this MVP.
- GO IRL Constitution is the source of truth for product and architecture decisions.
- Trusted Telegram auth implementation is added: HMAC validation, `auth_date` validation, replay table, app user upsert, short-lived JWT, frontend `accessToken` flow, and migration v4 for verified-claim RLS.

### Before Public Release

- Configure production environment variables on Vercel.
- Re-check private activity visibility with an unrelated account before public launch.
- Confirm RLS behavior with at least two Telegram accounts.
- Validate Telegram share links through `@GOirl_bot`.
- Validate explicit Mini App close behavior on real Telegram clients.
- Confirm `verifyTelegramInitData` can issue trusted tokens in production.
- Confirm `supabase/migration_v4_trusted_telegram_auth.sql` is applied and verified in the target Supabase project before broader rollout.
- Replace temporary admin allowlist with server-side role enforcement before public moderation tools launch.
- Apply and verify `supabase/migration_v2_backend_foundation.sql` before enabling public moderation/admin tools.
- Apply and verify `supabase/migration_v3_security_hardening.sql`.
