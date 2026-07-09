---
title: Sprint 0 - Foundation
owner: Sprint Planner
status: Archived
source_of_truth: false
last_review: 2026-07-09
next_review: 2026-10-09
---

# Sprint 0 - Foundation

## Status

Complete / Historical.

This file preserves Sprint 0 as an execution record. It is not the current release source of truth.

Use current release truth from:

- `RELEASE_NOTES.md`
- `DEPLOYMENT.md`
- `README.md`
- `DOCS_INDEX.md`

## Goal

Make the project safe to develop and release.

## Scope

- GitHub repository connected.
- Build and TypeScript checks configured.
- Lint and tests configured.
- CI runs test, lint, and build.
- Supabase schema and RLS documented.
- Deployment checklist exists.
- No secrets committed.

## Historical completion notes

- Latest `supabase/schema.sql` was applied in production Supabase.
- Production RLS hides unrelated private activities.
- Invite/startapp access to a specific private activity was verified.
- GitHub Actions CI passed on `main` at the time.
- Netlify production URL responded successfully at the time.

## Current caution

Netlify references are historical only. Vercel is the current beta deployment target.

Do not claim beta-ready from this file. Latest quality gates and smoke tests must be checked from current release docs.
