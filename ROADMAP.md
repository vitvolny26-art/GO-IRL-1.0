# Roadmap

GO IRL is being built as a platform, not a one-off Telegram Mini App. New work should stay compatible with future web, Android, and iOS clients.

All major product and architecture decisions must follow [docs/GO_IRL_CONSTITUTION.md](docs/GO_IRL_CONSTITUTION.md).

Market positioning and MVP feature filters must follow [docs/MARKET_POSITIONING.md](docs/MARKET_POSITIONING.md).

Competitor-driven product signals are tracked in [docs/COMPETITOR_WATCH.md](docs/COMPETITOR_WATCH.md).

For the Sport Coach MVP 1.1 scope, see [docs/SPORT_COACH_MVP.md](docs/SPORT_COACH_MVP.md).

For the Coach/Role + Chat trust layer, see [docs/COACH_CHAT_TRUST_LAYER.md](docs/COACH_CHAT_TRUST_LAYER.md).

## Current beta gate

Current stabilization state:

- Browser Mock Mode is patched for non-Telegram browser usage.
- Browser demo writes are local-only and must not touch production Supabase.
- Coach and Event Chat are mounted in sport event details.
- Generic event sheets may temporarily show a Coach/Role bridge next to Activity Chat, but this is not the final Event Roles model.
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
- Supabase production table/RLS verification: pending/manual.
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

1. Closed Beta Loop Stability
   - Browser demo/mock mode works without Telegram.
   - Event cards are stable and readable.
   - Join state, participant count, event chat, and share flow work reliably.
   - Profile basics create enough trust to join an event.
   - The six beta categories stay focused and visible.
2. Coach/Role + Chat Trust Layer
   - Keep role/helper support close to Activity Chat.
   - Use it to increase trust before arrival.
   - Generic usage is a bridge, not the final naming model.
   - Do not duplicate Coach in sport details.
   - Do not show public trust badges for pending requests.
3. Infrastructure Hardening
   - Supabase production readiness.
   - Safe, repeatable migrations.
   - RLS hardening for all user and event data.
   - Roles and permission enforcement.
   - Database verification SQL and release checklist.
   - Remove dependency on legacy local fallback where possible after production migration is applied.
4. Sport Coach MVP 1.1
   - Keep Coach sport-only.
   - Stabilize coach request flow for sport events.
   - Add demo confirmed coach for browser mock mode.
   - Add coach detail block and sport card badge.
   - Measure show-up rate and beginner comfort.
5. Performance
   - Lazy loading.
   - Code splitting.
   - Bundle optimization.
   - Telegram Mini App startup performance.
6. n8n Notifications
   - Server-side notification workflow.
   - Evening digest.
   - Working hours.
   - Quiet hours.
   - No Mini App background work.
7. AI Event Discovery
   - Future only until real usage data exists.
8. Event Roles Foundation
   - Start only after Sport Coach improves show-up rate or beginner comfort.
   - Replace generic Coach naming with native role labels per category.
9. Friends Vertical
   - Deferred until database and notification foundation is stable.
10. Travel Vertical
   - Deferred until Friends and source discovery architecture are stable.
11. Dating Vertical
   - Last, because it requires privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection.

## Coach / Role + Chat Trust Layer

The trust layer is a beta conversion pattern.

It keeps event support and temporary event chat close together so a user can answer:

```text
Who helps this event happen?
Where can I talk to the group before I come?
```

The goal is not to add Coach everywhere.

The goal is to make events feel real, safe, and socially easier before users arrive.

Current rule:

- Sport uses Coach.
- Generic event usage is a temporary bridge.
- Future categories must use native names: Game Master, Language Buddy, Guide, Host, Icebreaker.

## Sport Coach MVP 1.1

Coach is a sport-only role in MVP 1.1.

Coach is not a generic event helper. Guides, tutors, social hosts, game masters, referees, and moderators are future Event Roles work and must not be mixed into the Coach MVP.

Primary metric:

- Show-up Rate: joined users who actually came.

Supporting metrics:

- coach badge open/click rate;
- join -> chat message rate;
- join -> attendance confirmation rate;
- beginner comfort yes/no;
- repeat sport attendance;
- organizer coach-request conversion.

## Phase 1 - Production Foundation

- Trusted Telegram auth is implemented in the repository through Supabase Edge Function verification and verified JWT session flow.
- Production rollout still requires real environment smoke checks and Supabase secrets verification.
- Keep build and TypeScript checks green.
- Preserve the current generic event MVP as the fallback experience.
- Keep Sport as the current reference vertical without expanding into Friends, Travel, or Dating yet.
- Keep Telegram Mini App lifecycle explicit: no surprise close, no background polling, user-triggered close only.

## Phase 2 - Performance and Product Quality

- Keep Sport vertical MVP as the reference vertical.
- Continue improving event cards, create flow, details, profile, and organizer controls only where needed for current MVP quality.
- Improve empty, loading, and error states.
- Lazy-load heavy screens and vertical modules.
