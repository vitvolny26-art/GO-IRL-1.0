# MVP Documentation Audit

Generated: 2026-07-08
Updated: 2026-07-08

## Scope

This audit records documentation conflicts found during the MVP 1.1 sanitation pass.

Rules:

- Documentation-only audit.
- No code changes.
- No `.env`, secrets, Supabase RLS, auth, or SQL changes.
- Historical documents remain preserved, but must not be used as current implementation truth.
- Bible files are preserved as product history / future vision unless explicitly promoted after audit.

## Sources of truth

| Area | Source of truth | Decision |
|---|---|---|
| Product philosophy | `docs/GO_IRL_CONSTITUTION.md` | Absolute source of truth for philosophy and architecture principles. |
| Market positioning | `docs/MARKET_POSITIONING.md` | Source of truth for current beta market position and MVP feature filter. |
| Competitor signals | `docs/COMPETITOR_WATCH.md` | Source for competitor watchlist; signals do not automatically become MVP scope. |
| Current code scope | `README.md` | Source of truth for what is currently implemented in the app. |
| Release state | `RELEASE_NOTES.md` | Must reflect shipped/beta blockers and not contradict `README.md`. |
| Coach scope | `docs/SPORT_COACH_MVP.md` | Source for Sport Coach 1.1 boundaries after this audit. |
| Documentation registry | `DOCS_INDEX.md` | Source for document status and deprecation warnings. |

## Conflict registry

| ID | Conflict | Files | Status | Resolution |
|---|---|---|---|---|
| DOC-AUTH-001 | Trusted Auth appeared as production path in `README.md` but public blocker in `RELEASE_NOTES.md`. | `README.md`, `RELEASE_NOTES.md`, `PATCH_REPORT.md` | Fixed in docs. | `RELEASE_NOTES.md` now marks Trusted Auth as `[SHIPPED/PRODUCTION PATH]`; remaining items are operational verification. |
| DOC-COACH-001 | Sport Coach doc promised Role Choice and Review Flow as MVP 1.1 while current UI basis is `CoachRequestPanel.tsx`. | `docs/SPORT_COACH_MVP.md`, `src/components/CoachRequestPanel.tsx`, `src/coachFeature.ts` | Fixed in docs. | Added factual UI section; Role Choice and Review Flow moved to `[FUTURE VISION 1.2+]`. |
| DOC-SPRINT0-001 | Sprint 0 status references Netlify as production proof while current beta flow uses Vercel. | `SPRINT0_STATUS.md`, `BETA_CHECKLIST.md`, `DEPLOYMENT.md` | Contained. | `SPRINT0_STATUS.md` marked as historical snapshot / deprecated for code generation. |
| DOC-SETUP-001 | Legacy setup docs contain local Windows paths and desktop helper assumptions. | `SETUP.md`, `SETUP_RU.md`, `CHECKLIST.md` | Contained. | Added historical/deprecated status banners. Current setup is `README.md` + `DOCS_INDEX.md`. |
| DOC-MARKET-001 | Broad roadmap/backlog/future docs could make GO IRL look like event calendar, ticketing platform, sport-only app, dating app, or social feed. | `docs/MARKET_POSITIONING.md`, `docs/COMPETITOR_WATCH.md`, `ROADMAP.md`, `BACKLOG.md`, `RELEASE_NOTES.md` | Fixed in docs. | Added market source-of-truth docs and beta guardrails: Olomouc, Telegram-first micro-meetups, six categories, create -> share -> join -> chat -> real attendance. |
| DOC-BIBLE-001 | Bible archive is structured but not complete; numbering, MVP scope, database design, platform architecture, and future features looked like current implementation truth. | `docs/bible/*`, `DOCS_INDEX.md`, `docs/DOCUMENTATION_AUDIT.md` | Contained. | Added guardrail banners to Bible foundation, principles, platform architecture, database design, modules architecture, PRD, and UX guide; synced Bible audit/roadmap and registry. |
| DOC-CHAT-001 | Activity Chat has current temporary implementation, while future docs imply broader retention/moderation/notification behavior. | `src/components/ActivityChatPanel.tsx`, `src/activityChatFeature.ts`, `docs/EventLifecycle.md` | Contained / needs code audit. | Added Activity Chat MVP boundary and safe wording for the unresolved 24-hour expiry rule. |
| DOC-DEMO-001 | Browser Demo Mode is critical for beta, but boundaries are not centralized. | `README.md`, `BETA_TESTING.md`, `docs/MISSING_SECTIONS.md` | Fixed in docs. | Demo Mode boundaries documented: fake user, demo events, no production writes, demo save message. |
| DOC-TMA-001 | Telegram Mini App constraints are spread across docs and code. | `README.md`, `docs/MISSING_SECTIONS.md` | Fixed in docs. | Mini App constraints documented: initData, trusted auth path, explicit close, no background polling. |
| DOC-WEATHER-001 | Weather widget behavior exists but boundaries are not centralized. | `src/weather.ts`, `src/verticals/SportVertical.tsx`, `docs/MVP_STABILIZATION_PLAN.md` | Fixed in docs. | Weather boundary documented: Open-Meteo without keys, forecast range limits, summary/details scope. |
| DOC-VERCEL-001 | Latest Vercel status can show FAILURE because of build-rate-limit rather than app/docs regression. | GitHub commit status, Vercel target URL | Operational / not code regression. | Status target includes `upgradeToPro=build-rate-limit`; treat as deployment quota issue until a new Vercel build can run. Do not change app code for this. |

## Current implementation boundaries

### Market positioning

Current beta scope:

- Olomouc first.
- Telegram-first local meetup layer.
- Six beta categories: Volleyball, Running, Walking, Coffee meetup, Board games, Language exchange.
- Main loop: create event -> share -> join -> chat -> real attendance.

Not current beta scope:

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

### Trusted Auth

Status: `[SHIPPED/PRODUCTION PATH]` in documentation.

Remaining release work is operational verification, not a reason to list Trusted Auth as an unshipped public blocker.

### Sport Coach

Current UI basis:

```text
src/components/CoachRequestPanel.tsx
src/coachFeature.ts
```

Future-only scope:

```text
Role Choice bottom sheet
Review Flow
Universal Event Roles
Verified coach badge
Payments / marketplace
```

### Activity Chat

Current MVP boundary:

- Temporary activity coordination chat.
- Not a general messenger.
- Not a feed, channel, or engagement loop.
- Exact close/archive timing needs code and migration audit before public release wording.

### Browser Demo Mode

Current boundary:

- Browser without Telegram should open the app.
- Fake user: `999999` / `Vit_Test`.
- Demo writes must not touch production Supabase.
- Canonical demo events: Volleyball, Board games, Running, Walking, Coffee meetup, Language exchange.

### Telegram Mini App

Current boundary:

- Telegram `initData` is verified through `verifyTelegramInitData` before production writes.
- Explicit user-triggered close only.
- No surprise close.
- No background polling.

### Weather Widget

Current boundary:

- Open-Meteo without API keys.
- No fake weather outside forecast range.
- Event beyond forecast range: `Прогноз будет за 7 дней`.
- Compact summary: icon, temperature, condition.
- Details can include temperature graph, wind, rain probability.

### Vercel build-rate-limit

Current latest observed status:

```text
Vercel: FAILURE
Reason URL marker: upgradeToPro=build-rate-limit
```

Decision:

- This is an operational quota/deployment limit.
- Do not treat it as a code or documentation regression.
- Do not change app code to fix it.
- Resume Vercel verification when build quota is available again.

## Next actions

1. Clarify Share / Join flow in `README.md` and `BETA_TESTING.md`.
2. Audit `DEPLOYMENT.md` for Vercel-first wording.
3. Audit `docs/Database.md` against Supabase schema and migrations.
4. Refresh `project-audit/GO_IRL_PROJECT_AUDIT.md` after documentation cleanup.
