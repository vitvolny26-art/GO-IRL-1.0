# Missing Sections Registry

Generated: 2026-07-08
Updated: 2026-07-08

## Purpose

This file lists missing documentation sections that must be filled before GO IRL MVP 1.1 can be considered documentation-clean.

This is not a feature wishlist. It is a boundary file for AI developers so they do not invent behavior or expand scope accidentally.

## Missing / incomplete sections

| Section | Status | Must document | Target docs |
|---|---|---|---|
| Market positioning and beta feature filter | Fixed / keep maintained | GO IRL as Telegram-first local meetup layer; not event calendar, ticketing, sport-only app, dating app, or social feed. | `docs/MARKET_POSITIONING.md`, `ROADMAP.md`, `BACKLOG.md`, `DOCS_INDEX.md` |
| Competitor boundaries | Fixed / keep maintained | Competitor signals are watch inputs only; they must not auto-create MVP scope. | `docs/COMPETITOR_WATCH.md`, `docs/MVP_DOC_AUDIT.md` |
| Bible guardrails | Contained / not complete | Bible files are preserved drafts/future vision; they cannot override current beta scope, code, Supabase schema, auth, or RLS. | `docs/bible/*`, `DOCS_INDEX.md`, `docs/MVP_DOC_AUDIT.md` |
| Telegram Mini App constraints | Fixed / keep maintained | `initData`, trusted auth path, explicit close, no surprise close, no background polling, Telegram client testing. | `README.md` |
| Browser Demo Mode | Fixed / keep maintained | Browser without Telegram, fake user `999999`, `Vit_Test`, Olomouc demo events, no production Supabase writes, demo save message. | `BETA_TESTING.md` |
| Activity Chat MVP boundary | Fixed / needs code audit | Chat opens after join, temporary coordination only, current expiry behavior, no full messenger scope, no advanced moderation claims. | `docs/EventLifecycle.md` |
| Chat 24-hour limit | Contained / needs code audit | Current/future rule for chat expiry: current migration uses chat creation + 24h; product may want event end + 24h. | `docs/EventLifecycle.md`, `docs/DATABASE_SCHEMA_AUDIT.md` |
| Sport Coach actual UI | Fixed / keep maintained | `CoachRequestPanel.tsx` as current v1.1 basis; Role Choice and Review Flow as future. | `docs/SPORT_COACH_MVP.md` |
| Weather Widget boundary | Fixed / keep maintained | Open-Meteo no-key API, forecast available only inside API range, event >7 days message, hourly summary for <=7 days. | `docs/MVP_STABILIZATION_PLAN.md` |
| Share / Join flow | Fixed / keep maintained | Telegram Mini App `startapp`, `/join/:id`, no App Store redirect on iOS, Open Graph behavior. | `README.md`, `BETA_TESTING.md` |
| Release source of truth | Fixed / keep maintained | Vercel-first beta/deploy flow, historical Netlify snapshots not current truth, Vercel build-rate-limit interpretation. | `DEPLOYMENT.md`, `DOCS_INDEX.md`, `docs/MVP_DOC_AUDIT.md` |
| Bible completion | Incomplete | Existing archive is not final; define missing chapters and MVP 1.0/1.1 final Bible plan after product review. | `docs/bible/00-completion-audit.md`, `docs/bible/00-bible-roadmap.md` |
| Supabase schema vs docs | Audited / needs DB decision | Current baseline is `supabase/schema.sql` + migrations. `docs/Database.md` and Bible DB chapter are future vision, not current schema. | `docs/DATABASE_SCHEMA_AUDIT.md`, `docs/Database.md`, `docs/MVP_DOC_AUDIT.md` |

## Hard boundaries for AI developers

Do not generate code from:

- `SETUP.md`
- `SETUP_RU.md`
- `SPRINT0_STATUS.md`
- `CHECKLIST.md`
- `PATCH_REPORT.md`
- `GO_IRL_DOCUMENTATION.md`

These are historical snapshots or deprecated local-development artifacts.

Do not treat future vision as current MVP:

- universal Event Roles;
- coach marketplace;
- payments;
- ticketing;
- club CRM;
- subscriptions or premium plans;
- verified coach badge;
- full review flow;
- public ratings/reviews;
- direct messages;
- complex profiles;
- RLI / Trust Score / achievements;
- AI event discovery;
- AI recommendations;
- full notification automation;
- broad Friends/Travel/Dating vertical expansion;
- big multi-city catalog;
- full module registry;
- REST API / WebSocket / background workers / event bus rewrite.

## MVP 1.1 current working boundary

Current GO IRL MVP 1.1 focus:

```text
Olomouc beta
Telegram Mini App
Create event
Share event
Join event
Event chat
People meet in real life
Sport-first Coach stabilization
Weather and share/join polish
Browser demo mode without production writes
```

Canonical beta categories:

```text
Volleyball
Running
Walking
Coffee meetup
Board games
Language exchange
```

## Next documentation patches

1. Add a warning/link in `docs/Database.md` pointing to `docs/DATABASE_SCHEMA_AUDIT.md`.
2. Refresh project audit after documentation cleanup.
3. Run local quality gates when Codespaces is available.
