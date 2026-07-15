---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-14
next_review: 2026-07-21
---

# Agent Report

## Task

Formalize the approved Telegram-first but not Telegram-dependent cross-platform entry strategy as a documentation-only Architecture Decision Record.

## Files inspected

- `DOCS_INDEX.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- PR #86 native Telegram event-card report and implementation summary

## Findings

- The Constitution already supports responsive web, API-first architecture, backend-owned business rules, and one shared database for all clients.
- Market positioning remains Telegram-first for the Olomouc beta, but this does not require Telegram to be the first-contact surface for every shared event.
- User-Agent routing is unsuitable as the canonical routing or authorization mechanism.
- A canonical web entry reduces acquisition friction while preserving Telegram as the preferred full experience.
- Confirmed web participation requires a verified identity and therefore future Auth/RLS review.
- Native Telegram prepared sharing should remain an enhancement over the canonical web link, not a separate source of truth.

## Changes made

- Added `docs/architecture/ADR-WEB-FIRST-CROSS-PLATFORM-JOIN.md`.
- Defined `/join/<share-token>` as the long-term canonical event entry contract.
- Defined opaque, revocable, server-resolved share tokens.
- Defined a provider-neutral Join Service and one shared membership model.
- Defined anonymous preview versus verified Join identity boundaries.
- Defined Telegram as an explicit optional handoff for chat and the full Mini App experience.
- Defined staged rollout, migration, failure states, security rules, and acceptance criteria.

## Checks

- Documentation-only scope confirmed.
- No application code, Auth, RLS, SQL, migrations, secrets, or deployment files changed.
- ADR aligned with the Constitution and current market-positioning boundary.
- Application lint/build/test/typecheck not required for this documentation-only change.

## Next step

Review and approve the ADR. Runtime work remains blocked until separate explicit approval defines the Auth/RLS/schema impact of verified web Join. PR #86 should be reconciled as a Telegram enhancement layer that points to the canonical web entry contract.