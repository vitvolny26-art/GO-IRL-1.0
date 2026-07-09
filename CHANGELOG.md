# Changelog

All notable confirmed changes to GO IRL are tracked here.

## Unreleased

### Added

- Added `docs/MARKET_POSITIONING.md` as the market positioning source of truth for GO IRL beta.
- Added `docs/COMPETITOR_WATCH.md` to track competitor signals and product mechanics worth borrowing.
- Added `docs/SPORT_COACH_MVP.md` with scope, UX guardrails, beta metrics, roadmap, and Event Roles boundaries.
- Added `docs/COACH_CHAT_TRUST_LAYER.md` to document the Coach/Role + Activity Chat trust-layer concept, current implementation status, generic bridge guardrails, event-helper copy rule, and confirmed-only badge rule.
- Added Browser Mock Mode reports and beta checklist coverage for non-Telegram browser testing.
- Added MVP documentation audit and missing sections registry.

### Changed

- Aligned `README.md`, `DOCS_INDEX.md`, `ROADMAP.md`, and `BACKLOG.md` with the Telegram-first local meetup positioning.
- Added beta guardrails that block ticketing, payments, club CRM, AI recommendations, dating, broad social feed, complex profiles, and multi-city expansion before the Olomouc loop is stable.
- Clarified the canonical beta categories: Volleyball, Running, Walking, Coffee meetup, Board games, and Language exchange.
- Clarified that Coach means sport-only in MVP 1.1.
- Clarified that guides, tutors, language buddies, game masters, hosts, referees, and paid role marketplace work belong to future Event Roles phases.
- Clarified that generic Coach/Role placement near Activity Chat is a temporary trust-layer bridge, not a universal Coach model.
- Changed generic non-sport event trust-layer copy from Coach language to Event Helper language: `Помощник события`, `Нужен помощник`, `Хочу помощника`, `Помощник запрошен`.
- Sport cards now show `Есть тренер` only when there is a confirmed organizer coach request.
- Demo organizer coach requests now become `confirmed`; participant interest requests remain `pending`.
- Browser without Telegram `initData` now uses `Vit_Test` / `telegram:999999` and keeps store, Coach, and Activity Chat writes local-only.
- Updated roadmap priority to validate Sport Coach through show-up rate and beginner comfort before universal role expansion.
- Sport cards now show event start time consistently instead of sport duration.
- Static beta/dev marker and debug panel were removed from `index.html`.
- `BETA_CHECKLIST.md` now matches the current local demo-write behavior.

### Verification

Latest code quality gates:

- Event-helper copy patch: GitHub Actions CI PASS
- Confirmed coach badge patch: GitHub Actions CI PASS
- Browser demo safe-writes patch: GitHub Actions CI PASS
- `pnpm run test`: PASS in CI
- `pnpm run lint`: PASS in CI
- `pnpm run build`: PASS in CI

Latest local quality gates are still required before a beta-ready claim:

- `pnpm run lint`: pending locally
- `pnpm run build`: pending locally
- `pnpm run test`: pending locally

Do not claim beta-ready until local quality gates and real Telegram/Supabase smoke checks pass on the latest `main`.

## 0.1.0 - 2026-07-03

### Added

- Sprint delivery plan covering Sprint 0 through Sprint 5.
- Telegram Mini App MVP for GO IRL.
- Supabase-backed activities and participants.
- Public/private activity visibility.
- Organizer editing for activities.
- Private activity join requests with approve/reject review.
- Participant states: joined, waiting, pending.
- Share links using the Telegram `startapp` parameter.
- Safe-area aware fixed header with city selector, language selector, and notification entry point.
- City configuration architecture with Olomouc as the first supported city.
- Russian and Czech localization architecture.
- Supabase RLS helper functions and policies that hide non-public activities from unrelated users.
- Vercel deployment configuration.
- GO IRL brand logo assets, favicon, and Open Graph preview.
- Sport Vertical MVP with ActivityRendererRegistry, SportActivityCard, Sport details, Sport create fields, sport demo data, and SportRecommendationEngine.
- GO IRL Constitution as the product and architecture source of truth.
- Google Calendar save action for activities using a template link without Google OAuth.
- Optional Activity Chat architecture with temporary participant-only chat, auto-archive policy, n8n cleanup, and privacy/safety rules.
- Trusted Telegram auth implementation with Supabase Edge Function, HMAC validation, app user upsert, verified JWT sessions, frontend `accessToken` integration, and RLS migration v4.

### Changed

- Documentation now reflects the Supabase-backed runtime instead of local-only storage.
- Event cards now show clearer activity, date, time, location, participants, price, organizer RLI placeholder, and direct join/request action.
- Legacy `x-go-irl-user-key` auth is restricted to explicit dev/demo mode; production auth uses verified Telegram `initData`.

### Known Gaps

- Public beta still requires latest local quality gates and real Telegram/Supabase smoke verification.
