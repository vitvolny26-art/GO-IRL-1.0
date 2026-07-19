---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# Agent Report

## Task

Reconcile Sport Coach MVP 1.1 documentation and perform a read-only production Supabase RLS inventory.

## Files inspected

- `ROADMAP.md`
- `docs/SPORT_COACH_MVP.md`
- `docs/reports/2026-07-19-sport-coach-end-to-end-plan.md`
- production Supabase migration history, policies, constraints, indexes, RLS flags, and helper functions for Coach tables

## Findings

- Production has migration `20260704 coach_requests_and_ratings` applied.
- Production contains overlapping `public` and `authenticated` Coach policy families.
- Ordinary participants/viewers have no public-safe confirmed Coach assignment read.
- Assigned Coaches have no explicit request read/accept/reject permission.
- Coach profile owners can update whole rows, including fields intended to be server-owned.
- Production review policies exceed the canonical MVP 1.1 scope.
- Duplicate/overlapping Coach indexes exist.

## Changes made

- Updated `ROADMAP.md` to align MVP 1.1 with `docs/SPORT_COACH_MVP.md`.
- Added `docs/reports/2026-07-19-coach-production-rls-inventory.md`.
- No application code, SQL, RLS, migration, auth, secret, or production data change.

## Checks

- Supabase inspection queries were SELECT-only.
- Branch diff contains documentation only.
- `pnpm run lint`, `pnpm run build`, and `pnpm run test` were not run because code was unchanged.

## Next step

Review and merge the documentation PR. Then prepare a separate proposed backend/RLS correction design with rollback and multi-identity test matrix. Do not apply it without explicit approval.
