---
title: Agent Report — Production Repository Identity
owner: GitHub Operator
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report — Production Repository Identity

## Task

Correct repository and deployment documentation so the Telegram Mini App production path uses `vitvolny26-art/GO-IRL-1.0`.

## Files inspected

- `AGENTS.md`
- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- `docs/bible/00-completion-audit.md`
- `docs/bible/00-bible-roadmap.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/reports/README.md`
- `docs/DEVELOPMENT_PROTOCOL.md`
- `DEPLOYMENT.md`

## Findings

The canonical production repository is `vitvolny26-art/GO-IRL-1.0`, but active instructions still directed Vercel and successor agents to legacy `vitvolny26-art/GO-IRL`. This could make BotFather open a Vercel deployment built from the wrong repository.

## Changes made

- Updated the Vercel production repository and BotFather deployment wording in `DEPLOYMENT.md`.
- Reclassified `GO-IRL-1.0` as the canonical code, documentation, and production repository in successor instructions.
- Marked `GO-IRL` as legacy and not deployable in successor instructions.
- Updated the active stabilization handoff command.
- Recorded the resolved repository identity conflict in `DOCS_INDEX.md`.

## Checks

Checks: NOT RUN — docs-only.

Repository-reference search: PASS — remaining non-report `vitvolny26-art/GO-IRL` references are either the canonical `GO-IRL-1.0` string or explicitly historical/legacy context.

## Risks

The live BotFather Mini App URL and Vercel production-domain assignment still require manual verification. Documentation changes do not modify external Vercel or Telegram configuration.

## Not touched

- runtime code
- dependencies
- `.env` files or secrets
- auth
- Supabase RLS
- SQL or migrations
- Vercel project settings
- Telegram BotFather settings

## Next step

Confirm that the production Vercel project is connected to `vitvolny26-art/GO-IRL-1.0`, then set the BotFather Mini App URL to that project's production domain and run the Telegram smoke test.
