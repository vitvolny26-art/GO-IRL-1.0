# Backlog

Confirmed work is ordered by priority.

All major product and architecture decisions must follow [docs/GO_IRL_CONSTITUTION.md](docs/GO_IRL_CONSTITUTION.md).

Market positioning and MVP feature filters must follow [docs/MARKET_POSITIONING.md](docs/MARKET_POSITIONING.md).

Competitor-driven product signals are tracked in [docs/COMPETITOR_WATCH.md](docs/COMPETITOR_WATCH.md).

## Backlog filter for Olomouc beta

Before adding any backlog item to current beta scope, apply this test:

> Does this help users create, join, coordinate, and attend a real-life meetup faster than a normal Telegram chat?

If no, the item must stay future scope.

Current beta must stay focused on:

- six beta categories: Volleyball, Running, Walking, Coffee meetup, Board games, Language exchange;
- event card clarity;
- event creation in 30-60 seconds;
- Telegram share;
- one-tap Join;
- participant count and capacity;
- event chat;
- organizer/host trust;
- browser demo/mock mode.

Do not move these into beta implementation:

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

## Strategic Priority Order

1. Closed Beta Loop Stability
   - Browser demo/mock mode without Telegram.
   - Stable event cards and time rendering.
   - Join state, participant count, capacity, event chat, and Telegram share.
   - Profile basics and organizer/host trust.
   - Six canonical beta categories only.
2. Infrastructure Hardening
   - Supabase production readiness.
   - Migrations.
   - RLS.
   - Roles.
   - Database verification.
   - Remove dependency on local fallback where possible after production migration is verified.
3. Performance
   - Lazy loading.
   - Code splitting.
   - Bundle optimization.
   - Telegram Mini App startup performance.
4. n8n Notifications
   - Server-side notification workflow.
   - Evening digest.
   - Working hours.
   - Quiet hours.
   - No Mini App background work.
5. AI Event Discovery
   - External sources.
   - Event collection.
   - AI normalization.
   - Duplicate detection.
   - Confidence scoring.
   - Save discovered events to the database.
6. Friends Vertical
   - Deferred until database and notification foundation is stable.
7. Travel Vertical
   - Deferred until Friends and source discovery architecture are stable.
8. Dating Vertical
   - Deferred until privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection are ready.

## Current blockers

### Build Blocker

- None confirmed.
- Latest local quality gates are pending after the newest commits.

### Typecheck Blocker

- None confirmed.
- Verify with `pnpm run build` in the source repo.

### Lint Blocker

- None confirmed.
- Verify with `pnpm run lint` in the source repo.

### Test Blocker

- None confirmed.
- Verify with `pnpm run test` in the source repo.
- Add deeper tests for activity creation, join/leave, waiting list, private pending requests, organizer approvals, and edit permissions.

### Runtime Bug

- Verify deployed Vercel environment variables match `.env.example`.
- Verify Supabase realtime is enabled for `activities` and `activity_members` in production.
- Verify Telegram `startapp` links open the exact shared activity from a second account.
- Verify `Telegram.WebApp.close()` behavior on iOS, Android, and Telegram Desktop.

### Security / Release Gate

Trusted Telegram auth is implemented as the production path, but live release still needs verification:

- Supabase Edge Function `verifyTelegramInitData` deployed.
- Edge Function secrets configured.
- Trusted auth migration applied and verified.
- RLS behavior checked with at least two Telegram accounts.
- Public frontend admin allowlist not used as production moderation security.

## Sprint 2 - Infrastructure Hardening

- Production Supabase readiness.
- Safe migrations and verification SQL.
- RLS hardening.
- Roles and permission enforcement.
- Server-side admin role enforcement before public moderation tools.
- Optional Activity Chat architecture with participant-only access.
- Activity settings design for participant chat.
- User interests and favorite activity persistence after core loop stability.
- Keep Sport vertical stable as the reference implementation; do not start Friends, Travel, or Dating.

## Sprint 3 - Performance and n8n Notifications

- Activity Chat MVP with participant-only access.
- Chat auto-archive policy after code/migration audit.
- Event Details design for participant chat locked/archived states.
- Lazy loading for heavy screens and vertical modules.
- Code splitting for Dashboard, Discover, Create Event, Event Details, Profile, Organizer Dashboard, and Sport vertical.
- Bundle optimization and Vite chunk review.
- Telegram Mini App startup performance checks.
- Server-side n8n notifications for join requests and event updates.
- Notification preferences, evening digest, quiet hours, and working hours.

## Sprint 4 - AI Event Discovery

Future only until enough real usage data exists:

- External source coverage.
- AI event normalization.
- AI duplicate detection.
- Confidence scoring.
- Store discovered events in the database before digest selection.
- Source management admin panel.

## Later - Friends Vertical

- Friends invite/request flow.
- Friends group social matching.
- Friends notification templates.
- Start only after database and notification foundation is stable.

## Later - Travel Vertical

- Travel activity model.
- Travel source discovery integration.
- Start only after Friends and source discovery architecture are stable.

## Last - Dating Vertical

Start last, after privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection are ready.

## Optional Activity Chat

- Chat exists only around one Activity.
- Chat is not a permanent messenger.
- Chat opens only for allowed participants.
- Exact close/archive timing must be verified against current code and Supabase migrations before public release wording.

## Privacy / Security Future Work

- Data minimization policy.
- Delete account.
- Export user data.
- Notification opt-in.
- Quiet hours.
- Report user.
- Block user.
- Admin moderation.
- AI privacy guardrails.
- n8n notification privacy.
- Rate limiting and abuse protection.
