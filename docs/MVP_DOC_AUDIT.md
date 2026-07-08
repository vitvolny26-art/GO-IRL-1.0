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
| Current code scope | `README.md` | Source of truth for what is currently implemented in the app. |
| Release/deployment state | `DEPLOYMENT.md` | Vercel-first release flow and live verification gate. |
| Coach scope | `docs/SPORT_COACH_MVP.md` | Source for Sport Coach 1.1 boundaries. |
| Documentation registry | `DOCS_INDEX.md` | Source for document status and deprecation warnings. |

## Conflict registry

| ID | Conflict | Status | Resolution |
|---|---|---|---|
| DOC-AUTH-001 | Trusted Auth appeared as production path in `README.md` but public blocker in `RELEASE_NOTES.md`. | Fixed in docs. | Trusted Auth is `[SHIPPED/PRODUCTION PATH]`; remaining items are operational verification. |
| DOC-COACH-001 | Sport Coach doc promised Role Choice and Review Flow as MVP 1.1 while current UI basis is `CoachRequestPanel.tsx`. | Fixed in docs. | Role Choice and Review Flow moved to future scope. |
| DOC-SPRINT0-001 | Sprint 0 status references Netlify as production proof while current beta flow uses Vercel. | Contained. | Sprint 0 docs are historical snapshots. |
| DOC-SETUP-001 | Legacy setup docs contain local Windows paths and desktop helper assumptions. | Contained. | Current setup is `README.md` + `DOCS_INDEX.md`. |
| DOC-CHAT-001 | Activity Chat docs implied broader retention/moderation behavior. | Contained / needs code audit. | Activity Chat is temporary coordination only; exact 24h rule needs migration/runtime audit. |
| DOC-DEMO-001 | Browser Demo Mode boundaries were not centralized. | Fixed in docs. | Fake user, demo events, no production writes, and demo save message documented. |
| DOC-TMA-001 | Telegram Mini App constraints were scattered. | Fixed in docs. | `initData`, trusted auth path, explicit close, and no background polling documented. |
| DOC-WEATHER-001 | Weather Widget behavior was not centralized. | Fixed in docs. | Open-Meteo no-key boundary and forecast range rules documented. |
| DOC-VERCEL-001 | Vercel can show failure because of build-rate-limit, not app regression. | Operational / not code regression. | `upgradeToPro=build-rate-limit` is a quota issue. Do not change app code for this. |

## Current implementation boundaries

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

Current observed status:

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

1. Audit Supabase schema docs against Supabase schema and migrations.
2. Refresh project audit after documentation cleanup.
3. Run local quality gates in the source repo when Codespaces is available.
