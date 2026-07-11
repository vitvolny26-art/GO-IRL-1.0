---
title: Backlog
owner: Product Lead
status: Draft
source_of_truth: false
last_review: 2026-07-09
next_review: 2026-08-09
---

# Backlog

Confirmed work is ordered by priority.

All major product and architecture decisions must follow [docs/GO_IRL_CONSTITUTION.md](docs/GO_IRL_CONSTITUTION.md).

Market positioning and MVP feature filters must follow [docs/MARKET_POSITIONING.md](docs/MARKET_POSITIONING.md).

Competitor-driven product signals are tracked in [docs/COMPETITOR_WATCH.md](docs/COMPETITOR_WATCH.md).

## Sync note

This backlog is reconciled from the source project `vitvolny26-art/GO-IRL`.

Resolved historical security wording from the source backlog must not be reintroduced as current truth. Trusted Telegram auth is implemented as the production path, but live release still requires environment, RLS, and smoke verification.

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
3. Sport Coach MVP 1.1
   - Keep Coach sport-only.
   - Stabilize coach request flow for sport events.
   - Add demo confirmed coach for browser mock mode.
   - Add coach detail block and sport card badge.
   - Measure show-up rate and beginner comfort.
4. Performance
   - Lazy loading.
   - Code splitting.
   - Bundle optimization.
   - Telegram Mini App startup performance.
5. n8n Notifications
   - Server-side notification workflow.
   - Evening digest.
   - Working hours.
   - Quiet hours.
   - No Mini App background work.
6. AI Event Discovery
   - External sources.
   - Event collection.
   - AI normalization.
   - Duplicate detection.
   - Confidence scoring.
   - Save discovered events to the database.
7. Event Roles Foundation
   - Start only after Sport Coach improves show-up rate or beginner comfort.
   - Future roles are not called Coach.
   - Board games can use Game Master.
   - Language events can use Language Buddy or Conversation Mentor.
   - City walks can use Guide.
   - Social meetups can use Host or Icebreaker.
8. Friends Vertical
   - Deferred until database and notification foundation is stable.
9. Travel Vertical
   - Deferred until Friends and source discovery architecture are stable.
10. Dating Vertical
   - Deferred until privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection are ready.

## Current blockers

### Build Blocker

- None confirmed.
- Latest local quality gates passed on `main` commit `34d1829` on 2026-07-11: typecheck, lint, build, and 63 tests.

### Typecheck Blocker

- None confirmed.
- `pnpm run typecheck`: PASS on `main` commit `34d1829` (2026-07-11).
- `pnpm run build`: PASS on `main` commit `34d1829` (2026-07-11).

### Lint Blocker

- None confirmed.
- `pnpm run lint`: PASS on `main` commit `34d1829` (2026-07-11).

### Test Blocker

- None confirmed.
- `pnpm run test`: PASS on `main` commit `34d1829` (12 files, 63 tests; 2026-07-11).
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

## Sport Coach MVP 1.1

Coach is a sport-only role in MVP 1.1.

### Backlog items

- Keep the existing `coach_profiles`, `coach_requests`, and `coach_reviews` model.
- Keep `user_key`, `activity_id`, and `coach_profile_id` compatibility in MVP 1.1.
- Do not replace with `user_id`, `event_id`, or `coach_id` without a schema/RLS review.
- Browser/no Telegram demo uses Alex, Sport Coach, Olomouc.
- Demo request becomes confirmed immediately.
- Demo writes never touch production Supabase.
- Sport event detail shows confirmed coach.
- Chat link stays close to coach block.
- Sport cards show confirmed coach badge only for confirmed coach.
- Add minimal review later: 1-5 rating, short comment, beginner comfort marker.

### Not now

- Payments.
- Marketplace.
- Universal event roles.
- Referee.
- City guide.
- Language buddy.
- Tutor.
- Social host.
- Game master.
- Verified coach badge.
- Availability calendar.

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

## Sprint 5 - Privacy Review

- Activity Chat privacy review.
- Activity Chat retention policies.
- Optional encrypted chat research.
- Report/block review.
- Moderation hold review.
- No messages after chat archive.

## Sprint 6 - Reputation and Life Map

- REP-010 Life Map.
- REP-011 Achievements.
- REP-012 Reward program preparation.
- REP-013 RLI ledger audit/export.
- REP-014 Reputation appeal flow.
- REP-015 Attendance geolocation confirmation research.

Reputation non-goals for MVP:

- no crypto;
- no token;
- no tokenomics;
- no financial reward promise;
- no leaderboard;
- no public Trust Score.

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

Dating backlog:

- Dating vertical architecture.
- Dating profile.
- Like/pass flow.
- Mutual match.
- Anonymous dating chat.
- Mutual identity reveal.
- Report/block.
- Rate limiting.
- Admin moderation.
- Audit logs.

## Optional Activity Chat

- Chat exists only around one Activity.
- Chat is not a permanent messenger.
- Chat opens only for allowed participants.
- Exact close/archive timing must be verified against current code and Supabase migrations before public release wording.

UX copy to localize later:

- RU: "Создать чат для участников", "Чат участников", "Чат откроется после подтверждения участия", "Чат будет удалён через 24 часа после события", "Чат архивирован".
- UA: "Створити чат для учасників", "Чат учасників", "Чат відкриється після підтвердження участі", "Чат буде видалено через 24 години після події", "Чат архівовано".
- CS: "Vytvořit chat pro účastníky", "Chat účastníků", "Chat se otevře po potvrzení účasti", "Chat bude smazán 24 hodin po události", "Chat archivován".
- EN: "Create chat for participants", "Participant chat", "Chat opens after participation is confirmed", "Chat will be deleted 24 hours after the event", "Chat archived".

## Database + AI Discovery + Evening Digest

- DB-001 Add `users` and `user_profiles`.
- DB-002 Add `interests`, `event_categories`, and `user_interests`.
- DB-003 Add canonical `events` table only after current `activities` compatibility is resolved.
- DB-004 Add external source tracking.
- DB-005 Add `discovered_events` and source linkage.
- AI-001 Build n8n discovery schedule, 3 runs per day.
- AI-002 Add AI normalization prompt and parser.
- AI-003 Add confidence scoring and rejection rules.
- AI-004 Add duplicate detection.
- DIGEST-001 Add digest preference UI.
- DIGEST-002 Build evening digest selection.
- DIGEST-003 Add `notification_digest_log` duplicate-send guard.
- DIGEST-004 Add Telegram delivery through server/n8n.
- SRC-001 Add `external_sources` source policy fields and health checks.
- SRC-002 Add user-submitted event suggestions.
- SRC-003 Add manual moderation queue for `pending_review`.
- SRC-004 Document and enforce no Facebook credential storage.

## Architecture Documentation

- ARCH-001 GO IRL Constitution.
- ARCH-002 Database architecture.
- ARCH-003 RLS design.
- ARCH-004 Admin architecture.
- ARCH-005 Moderation architecture.
- ARCH-006 Notification platform architecture.
- ARCH-007 AI platform and event discovery architecture.
- ARCH-008 Recommendation Engine v2 design.
- ARCH-009 Event lifecycle.
- ARCH-010 User lifecycle.
- ARCH-011 Reputation system.

## Calendar

- CAL-001 Save Activity to Google Calendar through a template URL without OAuth.
- CAL-002 Future native calendar integration.
- CAL-003 Future Google OAuth calendar sync.

## Vertical Experiences

- VERT-001 Vertical Experience Architecture.
- VERT-002 ActivityRendererRegistry.
- VERT-003 Vertical-specific create forms.
- VERT-004 Vertical-specific details screens.
- VERT-005 Vertical-specific filters.
- VERT-006 Sport vertical MVP.
- VERT-007 Sport skill matching.
- VERT-008 Dating vertical architecture.
- VERT-009 Dating profile.
- VERT-010 Like/pass flow.
- VERT-011 Mutual match.
- VERT-012 Anonymous dating chat.
- VERT-013 Mutual identity reveal.
- VERT-014 Dating safety: report/block.
- VERT-015 Friends vertical.
- VERT-016 Food vertical.
- VERT-017 AI recommendations per vertical.
- VERT-018 ActivityRendererRegistry production wiring.
- VERT-019 Sport Activity Card.
- VERT-020 Sport Details screen.
- VERT-021 Sport Create Flow.
- VERT-022 SportRecommendationEngine.
- VERT-023 Travel vertical placeholder.

Deferred vertical rule:

- Friends is not started until database and notification foundation is stable.
- Travel is not started until Friends and source discovery architecture is stable.
- Dating is last and requires privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection first.

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
