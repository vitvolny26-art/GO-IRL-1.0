---
title: Current Project Phase
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
authority_scope: lifecycle_phase
last_review: 2026-07-26
next_review: 2026-08-20
---

# Current Project Phase

## Decision

GO IRL 1.0 has completed Closed Beta and is now in **Release Preparation and focused post-beta stabilization**.

- Previous phase: **Closed Beta** — completed on 2026-07-20.
- Current phase: **Release Preparation and focused post-beta stabilization**.
- Broad public launch: **not yet claimed**.

## Current operating focus

1. Preserve the proven Olomouc event loop.
2. Fix release blockers one task at a time.
3. Keep current quality gates green.
4. Verify Telegram, Vercel, Supabase, support, monitoring, analytics, and moderation readiness before a public-launch decision.
5. Avoid architecture rewrites and uncontrolled scope expansion.

## Taxonomy decision

The six categories used during beta remain historical acceptance evidence and a proven Olomouc baseline. They are no longer an automatic active-phase restriction.

Adding or exposing new categories, modules, cities, or verticals still requires an explicit reviewed product decision. Leaving beta does not authorize scope expansion.

## Authority split

This document owns only the current lifecycle-phase statement.

The canonical Product Roadmap is maintained in Google Drive:

https://docs.google.com/document/d/12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw/edit

Stable Document ID: `12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw`.

The canonical Product Roadmap controls:

- product sequencing;
- phase definitions beyond the current-phase statement;
- product entry and exit gates;
- authorization of future roadmap scope.

GitHub `main` and verified runtime evidence remain authoritative for:

- code and implemented behavior;
- tests and CI results;
- schemas, auth, RLS, and migrations;
- deployment and production configuration;
- durable technical facts.

Root `ROADMAP.md` is a delegating locator only.

`RELEASE_NOTES.md` remains the source of truth for release implementation status.

Historical beta reports, checklists, tests, and acceptance records remain valid historical evidence and must not be rewritten as current runtime proof.