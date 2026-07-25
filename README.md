---
title: GO IRL Telegram Mini App
owner: Tech Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# GO IRL Telegram Mini App

![GO IRL logo](public/brand/logo-wide.png)

## Mission

**Less scrolling. More life.**

GO IRL is a Telegram-first platform for local real-life activities. It is not a social network.

## Current phase

- Closed Beta completed: 2026-07-20.
- Active: Release Preparation and focused post-beta stabilization.
- Broad public launch: not claimed.
- Market: Olomouc-first.
- Proven baseline: Volleyball, Running, Walking, Coffee meetup, Board games, Language exchange.

Category or vertical expansion requires an explicit reviewed product decision.

## Current stack

- React, TypeScript, Vite, Zustand, pnpm.
- Supabase PostgreSQL, RLS, Edge Functions, realtime, and protected server operations.
- Telegram Mini App lifecycle and trusted `initData` verification.
- Vercel deployment target.

## Runtime boundaries

Production identity:

```text
Telegram.WebApp.initData
-> verifyTelegramInitData
-> trusted session/JWT
-> Supabase RLS-aware access
```

Browser Demo Mode is local/demo-only and must not write production data.

## Current product capabilities

- Activity create, view, edit, share, join/request, waiting and participant states.
- Telegram `startapp` share links and browser `/join/:id` fallback.
- Sport and Generic experiences.
- Temporary Activity Chat.
- Sport Coach scope for sport activities.
- Weather context.
- Profile basics and preferences for maps, calendars, sharing, and reminders.
- Map provider routing and Google/Apple/Outlook calendar actions.
- Server-authoritative reminder and lifecycle messaging foundation.
- Provider-specific delivery only when its operational release gate is green.
- Category artwork for cards, detail sheets, and sharing where implemented.

## Setup

```bash
pnpm install
pnpm run dev
```

Use `.env.example`; never commit secrets or production identifiers.

## Verification

```bash
pnpm run lint
pnpm run typecheck
pnpm run build
pnpm run test
```

Run required checks on the same code commit. Docs-only changes follow documentation validation instead.

## Core documentation

1. [`DOCS_INDEX.md`](DOCS_INDEX.md)
2. [`docs/release/CURRENT_PHASE.md`](docs/release/CURRENT_PHASE.md)
3. [`docs/GO_IRL_PRODUCT.md`](docs/GO_IRL_PRODUCT.md)
4. [`docs/PRODUCT_PHILOSOPHY.md`](docs/PRODUCT_PHILOSOPHY.md)
5. [`docs/GO_IRL_CONSTITUTION.md`](docs/GO_IRL_CONSTITUTION.md)
6. [`docs/MARKET_POSITIONING.md`](docs/MARKET_POSITIONING.md)
7. [`docs/bible/00-completion-audit.md`](docs/bible/00-completion-audit.md)
8. [`docs/audit/KNOWLEDGE_DEBT.md`](docs/audit/KNOWLEDGE_DEBT.md)

GitHub `main` remains the source of truth. Drive, NotebookLM, ClickUp, n8n, and reports are supporting systems, not runtime authority.
