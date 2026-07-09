---
title: Sprint 5 - Production Growth
owner: Sprint Planner
status: Draft
source_of_truth: false
last_review: 2026-07-09
next_review: 2026-08-09
---

# Sprint 5 - Production Growth

## Status

Draft / future production-growth layer.

This file preserves the Sprint 5 direction. It is not a current beta implementation plan.

## Goal

Prepare for broader public usage after the closed beta loop is stable.

## Planned scope

- Analytics for activation, joins, shares, and completed activities.
- Reporting and moderation.
- Abuse protection.
- Referral loop.
- Web parity with Telegram Mini App behavior.

## Current release boundary

Before production growth, GO IRL must verify:

- latest `pnpm run lint`;
- latest `pnpm run build`;
- latest `pnpm run test`;
- real Telegram smoke test;
- Supabase production table/RLS behavior;
- share/join flow from a second Telegram account;
- no production dependence on demo-only identity.

## Deferred scope

Do not build before public safety review:

- referral incentives;
- public moderation tools;
- analytics-driven growth loops;
- large-scale city expansion;
- paid growth experiments.

## Related docs

- `RELEASE_NOTES.md`
- `DEPLOYMENT.md`
- `BETA_CHECKLIST.md`
- `docs/bible/07-beta-readiness-and-operations.md`
