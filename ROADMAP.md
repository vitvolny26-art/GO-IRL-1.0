---
title: Roadmap
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-19
next_review: 2026-07-26
---

# Roadmap

GO IRL is being built as a platform, not a one-off Telegram Mini App. New work should stay compatible with future web, Android, and iOS clients.

All major product and architecture decisions must follow [docs/GO_IRL_CONSTITUTION.md](docs/GO_IRL_CONSTITUTION.md).

Market positioning and MVP feature filters must follow [docs/MARKET_POSITIONING.md](docs/MARKET_POSITIONING.md).

Competitor-driven product signals are tracked in [docs/COMPETITOR_WATCH.md](docs/COMPETITOR_WATCH.md).

For the Sport Coach MVP 1.1 scope, see [docs/SPORT_COACH_MVP.md](docs/SPORT_COACH_MVP.md).

## Current beta gate

Current stabilization state:

- Browser Mock Mode is patched for non-Telegram browser usage.
- Browser demo writes are local-only and must not touch production Supabase.
- Coach and Event Chat are mounted in sport event details.
- Sport card time rendering is patched.
- Bug report opens support instead of copying share text.
- Weather uses Open-Meteo in sport details.
- Share links use Telegram Mini App `startapp` deep links.
- Static beta/dev marker was removed from `index.html`.

Current release gate:

- `pnpm run lint`: pending after latest commits.
- `pnpm run build`: pending after latest commits.
- `pnpm run test`: pending after latest commits.
- Real Telegram smoke test: pending.
- Supabase production table/RLS verification: Coach read-only inventory completed on 2026-07-19; corrective design pending manual approval.
- Vercel may fail because of build-rate-limit; this is operational, not automatically a code failure.

Do not claim beta-ready until the latest `main` passes local quality gates and manual smoke tests.

## Market guardrail for beta

Closed beta is not a generic event calendar, ticketing platform, sport-only app, dating product, or social feed.

Closed beta validates one focused market thesis:

> GO IRL is a Telegram-first local meetup layer for small real-life activities in Olomouc.

Beta product scope must stay centered on:

- create event in 30-60 seconds;
- share through Telegram;
- one-tap Join;
- participant count and capacity;
- event chat;
- organizer/host trust;
- people showing up in real life.

Canonical beta categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

Before adding any feature, apply this test:

> Does this make it easier for people to leave the chat and meet in real life?

If not, it is future scope.

## Explicit beta non-goals

Do not build before beta:

- ticketing or payments;
- club CRM;
- subscriptions or premium plans;
- AI recommendations;
- photo albums or post-event social feed;
- public ratings/reviews;
- direct messages;
- full recurring engine;
- big multi-city catalog;
- complex profiles;
- dating, friends, travel, or lifestyle verticals.

These may be revisited after Olomouc proves event creation, join rate, chat activation, and real attendance.

## Strategic Development Order

The current product priority is foundation and infrastructure. Friends, Travel, Dating, ticketing, and broad social features are intentionally deferred until the Olomouc beta loop is stable.

Before new vertical expansion, Closed Beta must validate the Sport Coach hypothesis in Olomouc:

> Sport events with a confirmed coach should have a higher show-up rate and higher beginner comfort than sport events without a coach.

1. Closed Beta Loop Stability
   - Browser demo/mock mode works without Telegram.
   - Event cards are stable and readable.
   - Join state, participant count, event chat, and share flow work reliably.
   - Profile basics create enough trust to join an event.
   - The six beta categories stay focused and visible.
2. Infrastructure Hardening
   - Supabase production readiness.
   - Safe, repeatable migrations.
   - RLS hardening for all user and event data.
   - Roles and permission enforcement.
   - Database verification SQL and release checklist.
   - Remove dependency on legacy local fallback where possible after production migration is applied.
3. Sport Coach MVP 1.1
   - Keep Coach sport-only.
   - Stabilize organizer Coach request and joined-participant interest.
   - Keep organizer note in the existing `goal` field.
   - Add the manual assignment and assigned-Coach acceptance foundation only after approved RLS/backend design.
   - Keep the browser demo local-only with Alex as the confirmed mock Coach.
   - Show Coach details and the sport card badge only for a safely projected confirmed assignment.
   - Keep Activity Chat close to the Coach block.
   - Defer Role Choice and the full Review Flow to Sport Roles 1.2+.
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
   - Start only after database and notification foundation is stable.
9. Travel Vertical
   - Start only after Friends and source discovery architecture are stable.
10. Dating Vertical
   - Last, because it requires privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection.

## Sport Coach MVP 1.1

Coach is a sport-only role in MVP 1.1.

Coach is not a generic event helper. Guides, tutors, social hosts, game masters, referees, and moderators are future Event Roles work and must not be mixed into the Coach MVP.

### Product goal

Reduce the fear of joining sport events and improve real-life attendance.

The coach helps with:

- warm-up;
- rules;
- beginner support;
- team flow;
- safety;
- helping users feel comfortable when arriving alone.

### MVP patches

1. Coach model compatibility
   - Keep the existing `coach_profiles`, `coach_requests`, and `coach_reviews` model.
   - Keep `user_key`, `activity_id`, and `coach_profile_id`.
   - Do not replace with `user_id`, `event_id`, or `coach_id` in MVP 1.1.
2. Demo Sport Coach
   - Browser/no Telegram demo uses Alex, Sport Coach, Olomouc.
   - Demo request becomes confirmed immediately.
   - Demo writes never touch production Supabase.
3. Sport Coach Request Panel
   - Button: "Need a coach" / "Нужен тренер".
   - Organizer note uses the existing `goal` field.
   - Joined participants may express `participant_interest`.
   - Request states remain compatible with `pending`, `matched`, `confirmed`, and terminal states.
   - Role Choice, Beginner Helper, and Team Captain selection are future Sport Roles 1.2+.
4. Sport Coach Assignment
   - Staff manual matching and assigned-Coach accept/reject require an approved backend/RLS design.
   - A Coach becomes publicly confirmed only after assigned-Coach acceptance.
   - The current production RLS does not yet support Coach inbox or public confirmed assignment reads.
5. Sport Coach Event Block
   - Event detail shows only a safely projected confirmed Coach.
   - Chat link stays close to the Coach block.
   - Copy explains that the Coach helps beginners and event flow.
6. Sport Coach Badge
   - Sport cards show "✨ Есть тренер" only for a safely projected confirmed Coach.
   - Pending and matched requests must not show the confirmed badge.
7. Feedback boundary
   - The beginner-comfort question remains a beta metric definition.
   - Attendance-linked feedback implementation and the full Review Flow are future Sport Roles 1.2+ work requiring separate schema approval.
   - Public ratings/reviews remain out of beta scope.

### Beta metrics

Primary:

- Show-up Rate: joined users who actually came.

Supporting:

- coach badge open/click rate;
- join -> chat message rate;
- join -> attendance confirmation rate;
- beginner comfort yes/no;
- repeat sport attendance;
- organizer coach-request conversion.

Metrics requiring actual attendance must not be claimed as implemented until an approved attendance model exists.

### Production security gate

A read-only production inventory completed on 2026-07-19 found overlapping Coach policy families and no public-safe confirmed assignment projection or assigned-Coach request permission.

Before matching, confirmation, Coach inbox, public Coach badge/profile, or Review Flow production work:

- reconcile the duplicate production policy families;
- approve backend-authoritative state transitions;
- approve a public-safe batch Coach summary;
- protect verification and rating aggregate fields;
- verify organizer, participant, assigned Coach, outsider, and moderator/admin identities;
- approve and test rollback before applying any migration.

See `docs/reports/2026-07-19-coach-production-rls-inventory.md`.

### Not now

- Payments.
- Marketplace.
- Universal event roles.
- Role Choice.
- Full Review Flow.
- Referee.
- City guide.
- Language buddy.
- Tutor.
- Social host.
- Game master.
- Verified coach badge.
- Availability calendar.

## Event Roles Vision

Future Event Roles are the scalable pattern after Sport Coach is validated.

The product rule:

> For every event type, use the role name that is clear in one second.

Examples:

| Vertical | Future role |
|---|---|
| Sport | Coach, Referee, Captain, Safety Lead |
| Board games | Game Master |
| Language | Language Buddy, Conversation Mentor |
| City walks | Guide, Route Leader |
| Social meetups | Host, Icebreaker |

Future normalized tables may include:

- `event_role_profiles`
- `event_role_requests`
- `event_role_assignments`
- `event_role_reviews`

Do not build these before Sport Coach proves value.

## Phase 1 - Production Foundation

- Trusted Telegram auth is implemented in the repository through Supabase Edge Function verification and verified JWT session flow.
- Production rollout still requires real environment smoke checks and Supabase secrets verification.
- Keep build and TypeScript checks green.
- Preserve the current generic event MVP as the fallback experience.
- Sprint 2 architecture docs are prepared: Constitution, Database, RLS, Admin, Security, Notifications, AI, EventLifecycle, UserLifecycle, RecommendationEngine, Moderation.
- Keep Sport as the current reference vertical without expanding into Friends, Travel, or Dating yet.
- Harden Supabase RLS and document every policy.
- Apply backend foundation migration v2 for `user_roles`, moderator/admin helpers, audit log, and verification SQL only through the approved Supabase release process.
- Apply security hardening migration v3 for DB-level text length constraints only through the approved Supabase release process.
- Use verified auth context for production writes.
- Remove public frontend admin allowlist from the production security model before public moderation tools launch.
- Chat data model for optional, temporary Activity Chat.
- Chat RLS design with participant-only access.
- Chat toggle in Activity settings as an architecture item, not runtime UI yet.
- Apply and verify migrations for `city_id`, `metadata`, `participant_note`, and `activity_type`.
- Add database verification SQL to release flow.
- Keep Telegram Mini App lifecycle explicit: no surprise close, no background polling, user-triggered close only.
- Privacy settings placeholder.
- No background tracking policy.
- User notification opt-in design.

## Phase 2 - Performance and Product Quality

- Keep Sport vertical MVP as the reference vertical.
- CAL-001 Save Activity to Google Calendar through a template URL without OAuth.
- Maintain ActivityRendererRegistry with Sport and Generic registrations.
- Continue improving event cards, create flow, details, profile, and organizer controls only where needed for current MVP quality.
- Add Discover / For You screen with search, quick filters, and simple matching by city, interests, date, and free spots.
- Add favorite activity selection to the user profile.
- Improve empty, loading, and error states.
- Add city expansion for Prague, Brno, Ostrava, and future cities through configuration.
- Lazy-load heavy screens and vertical modules.
