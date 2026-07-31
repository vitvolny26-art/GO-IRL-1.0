---
title: Beauty Route Guard Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-31
next_review: 2026-08-07
---

# Beauty Route Guard Report

## Task

Protect direct access to `/beauty` so only `professional` and `admin` roles can render the local Beauty workspace.

## Files inspected

- `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `BACKLOG.md`, and required onboarding/governance documents.
- `src/main.tsx`, `src/App.tsx`, `src/store.ts`, `src/authSession.ts`, `src/domainHomeCategories.ts`.
- All files under `src/beauty/`.
- Base commit: `a6460b4e04eaa3de496bc2b8738a0e178889b987`.

## Findings

- `/beauty` was rendered directly from `src/main.tsx`, outside the normal application auth initialization path.
- The direct route had no role check before mounting `BeautySetupPage`.
- No shared frontend route-guard helper existed for this domain.

## Changes made

- Added a minimal Beauty route access policy for `professional` and `admin`.
- Added a route boundary that initializes trusted auth before deciding access and reuses the existing trusted/local role resolution.
- Blocked roles never mount the Beauty workspace; they see a localized access-denied state and are safely redirected to `/services` with history replacement.
- Added tests for `professional`, `admin`, `user`, `organizer`, and `moderator`.
- Preserved the existing domain cabinet rules: organizer access remains visible only on `/activities`.

## Checks

- `pnpm run lint` — PASS with one pre-existing warning in `api/_shared/admin-authorization.ts` and zero errors.
- `pnpm run typecheck` — PASS.
- `pnpm run build` — PASS.
- `pnpm run test` — PASS: 124 test files, 590 tests, and Staff OS checks.

## Risks

- This is a frontend visibility guard only. It does not create a backend authorization boundary, consistent with the requested scope and the local/mock Beauty prototype.

## Not touched

- Auth implementation, Supabase RLS, SQL, migrations, secrets, and `.env`.
- Client bottom navigation.
- Public professional profiles or production Services data.

## Next step

After publication, smoke-test direct `/beauty` navigation with trusted sessions for each role and record the deployed commit SHA.
