---
title: GO IRL Telegram Mini App
owner: Tech Lead
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-07-27
---

# GO IRL Telegram Mini App

![GO IRL logo](public/brand/logo-wide.png)

GO IRL is a Telegram-first product for creating, sharing, joining, and coordinating small real-life activities.

**Less scrolling. More living.**

## Current phase

GO IRL 1.0 is in **Release Preparation**.

- Previous completed phase: **Public Beta**.
- Current geographic focus: **Olomouc-first**.
- Core loop: `create -> share -> join/request -> event chat -> attend IRL`.
- Release readiness remains evidence-based and must not be claimed until the current-main quality, deployment, Telegram, Supabase, and security gates are verified.

The six categories proven during Public Beta remain the initial launch baseline:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

They are no longer a permanent hard release restriction. Additional categories require product review and must support the core real-life attendance loop without expanding into unrelated platform scope.

Canonical lifecycle status: [docs/release/RELEASE_PREPARATION_STATUS.md](docs/release/RELEASE_PREPARATION_STATUS.md).

Before implementing new features, read:

1. [DOCS_INDEX.md](DOCS_INDEX.md)
2. [docs/GO_IRL_CONSTITUTION.md](docs/GO_IRL_CONSTITUTION.md)
3. [docs/MARKET_POSITIONING.md](docs/MARKET_POSITIONING.md)
4. [ROADMAP.md](ROADMAP.md)
5. [BACKLOG.md](BACKLOG.md)
6. [docs/release/RELEASE_PREPARATION_STATUS.md](docs/release/RELEASE_PREPARATION_STATUS.md)
7. [docs/SPORT_COACH_MVP.md](docs/SPORT_COACH_MVP.md)

## Product boundaries

GO IRL is not an event calendar, ticketing platform, dating app, social feed, or club CRM.

For version 1.1, **Coach means Sport Coach only**. Guides, language buddies, game masters, hosts, referees, and paid role marketplaces remain separate future Event Roles work.

Any new feature must pass this test:

> Does this make it easier for people to leave the chat and meet in real life?

## Current stack

- React, TypeScript, Vite
- pnpm
- Zustand client state
- Supabase activities, participants, private join requests, and realtime
- Telegram Mini App bootstrap
- Trusted Telegram `initData` verification through Supabase Edge Functions
- Vercel deployment
- Vitest and ESLint quality gates

## Setup

```bash
pnpm install
pnpm run dev
```

Create `.env.local` from `.env.example` and fill the documented values.

Security boundaries:

- Never put secrets or production admin identifiers into `VITE_*` values.
- Production identity comes from Telegram `WebApp.initData`, verified through `verifyTelegramInitData`.
- Browser fallback identity is demo-only and must not write to production Supabase.
- Do not modify auth, RLS, migrations, SQL, secrets, or production data without explicit approval.

## Telegram runtime boundaries

- Telegram Mini App is the primary runtime; browser demo is secondary.
- `initDataUnsafe` is not trusted production identity.
- Mini App close behavior must be user-triggered.
- Hidden background polling is not allowed.
- Browser demo writes remain local-only.
- Production writes require trusted auth.

## Share and join flow

Primary flow:

```text
create event -> share -> join/request -> event chat -> attend IRL
```

- Telegram sharing uses Mini App `startapp` deep links.
- Browser fallback uses `/join/:id`.
- Public events allow direct join when capacity is available.
- Private events use request/approval rules.
- Full events use the supported waiting state.
- Share behavior must be verified on Android, iOS, and browser fallback before release claims.

## Implemented foundation

- Public and private activities
- Organizer edit flow
- Join requests with approve/reject
- Participant count, capacity, joined/waiting/pending states
- Activity creation and category selection
- Telegram sharing and `/join/:id` fallback
- Activity Chat
- Browser demo mode with local-only writes
- Olomouc-first city architecture
- Russian, Ukrainian, Czech, and English localization
- Sport Vertical and Sport Coach scope
- Organizer public profiles
- Trusted Telegram auth path
- Supabase schema and RLS documentation
- Vercel deployment configuration

## Verification

Run on the exact reviewed commit:

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test
```

Then verify:

- GitHub Actions
- Vercel production commit and aliases
- Telegram two-account flow
- Android and iOS behavior
- Supabase trusted auth and negative RLS matrix
- Browser demo isolation

Do not claim release-ready from historical beta evidence alone.

## Key documents

- `DOCS_INDEX.md` — documentation authority and status registry
- `ROADMAP.md` — current product and engineering order
- `BACKLOG.md` — controlled work queue
- `docs/release/RELEASE_PREPARATION_STATUS.md` — current lifecycle phase
- `docs/MARKET_POSITIONING.md` — positioning and feature filter
- `RELEASE_NOTES.md` — release status
- `DEPLOYMENT.md` — deployment process
- `docs/audit/KNOWLEDGE_DEBT.md` — active knowledge debt
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md` — successor rules
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md` — project workspace setup
