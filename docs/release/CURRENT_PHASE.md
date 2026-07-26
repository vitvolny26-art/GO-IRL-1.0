---
title: Current Project Phase
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-20
---

# Current Project Phase

## Decision

GO IRL 1.0 has completed Closed Beta and is now in Release Preparation.

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

The six categories used during beta remain historical acceptance evidence and a proven Olomouc baseline. They are no longer an active phase restriction.

Adding or exposing new categories and verticals still requires an explicit reviewed product decision. Leaving beta does not authorize automatic scope expansion.

## Source-of-truth rule

This document defines the current lifecycle phase. `DOCS_INDEX.md` remains the documentation registry and must list this file explicitly.

`RELEASE_NOTES.md` remains the source of truth for release implementation status; this file owns only the lifecycle-phase decision.

Historical beta reports, checklists, tests, and acceptance records remain valid historical evidence and should not be rewritten.

GitHub `main` remains the only project source of truth. ClickUp is the operational mirror and task-management layer.
