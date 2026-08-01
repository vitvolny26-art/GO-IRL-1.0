---
title: BEAUTY005 Olomouc Pilot
owner: Technical Lead / Supabase Steward
status: Draft
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-08
---

# Agent Report

## Task

Implement the explicitly approved Gate F first slice for a bounded server-backed Beauty pilot in Olomouc.

## Files inspected

- `docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md`
- Issue #491 and its inspection design
- trusted Telegram auth and role helpers
- current user-profile migration/RLS conventions
- Beauty setup, workspace storage and route guard
- Services directory and client views

## Findings

- `professional` is already durable in `public.user_roles` and must not be duplicated.
- The production Services directory still used a bundled fixture and local workspace fallback.
- Private contact and exact address require an owner-only table boundary.
- Availability remains local and is explicitly deferred from this slice.
- Admin/support private-profile access is not required for the first pilot.

## Changes made

- Added additive private Beauty profile and service tables for Olomouc only.
- Added owner-only professional RLS using trusted `go_irl_user_key` and the current database role.
- Added an owner load/save RPC with optimistic concurrency.
- Added a narrow published public projection excluding owner key, contact, exact address and availability.
- Routed trusted professional workspace profile/service/publication persistence through Supabase.
- Retained local storage for browser demo, recovery and deferred availability only.
- Removed silent production fixture fallback and added loading, empty and error states.
- Restricted private Beauty workspace access to `professional`; `admin` is blocked.
- Added positive and negative RLS verification SQL.

## Checks

Exact head before this report: `1b64b9976dc99183758d8e1cf57fced102e74642`.

GitHub Actions CI run `1413` passed:

- repository check
- diff check
- tests
- typecheck
- lint
- build
- bundle budget

The report-only follow-up commit requires the normal exact-head CI rerun.

Production migration and runtime RLS verification were not performed.

## Next step

Review Draft PR #511. After a green exact-head CI and explicit command, apply the reviewed migration in the approved Supabase project, run `supabase/verify_beauty005_olomouc_pilot.sql`, and stop on the first red gate. Merge and deployment remain separate approvals.
