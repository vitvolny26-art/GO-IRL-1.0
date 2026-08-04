---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Implement Beauty013 workspace content management: optional public profile blocks, Instagram, editable portfolio, and a multilingual multi-service price list.

## Files inspected

- `src/beauty/beautySetupModel.ts`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/services/servicesProfessionalDirectory.ts`
- Beauty005 and Beauty012 Supabase migrations
- Beauty013 migration parts 01-05
- Issue #622 and PRs #624/#625

## Findings

The previous workspace schema stored one service. The public RPC and repository already supported one directory row per service, but the database enforced a unique `profile_id` on `beauty_professional_services`. Profile trust content, Instagram and portfolio had no server fields.

During SQL review, a duplicate normalized service `client_key` could make the RPC active-service counter differ from the final upserted rows. A deferred database invariant was added so a published profile cannot finish a transaction without at least one active, non-archived service.

## Changes made

- Bumped the local Beauty workspace schema to v4 with backward upgrade from v3.
- Preserved `workspace.service` as the primary-service compatibility view while adding ordered `workspace.services`.
- Added required-field validation for identity, contact/address, at least one valid active service and availability.
- Added optional multilingual fields for description, experience, specialization, hygiene, materials, spoken languages, certificates and booking notes.
- Added an editable portfolio collection and Instagram URL.
- Added a full profile/portfolio/price-list editor inside the professional workspace.
- Added `Добавить услугу`, active state, reordering and removal from the current price list.
- Added public-profile conditional rendering: empty optional fields and empty portfolio do not render.
- Added tap-to-open portfolio lightbox and a localized Instagram link below the portfolio.
- Added versioned v3 workspace/public RPCs and additive migrations that preserve the existing service, add stable client keys and archive omitted services instead of deleting rows.
- Added deferred publication triggers requiring at least one active, non-archived service for every published profile.

## Checks

Original exact-head CI run `30867105610` on `f2140dc8df134fe31057f935ba16ae3d309a1c12` passed install, repository check, diff check, tests, typecheck, lint, build and bundle budget. Local runner reported 141 test files / 665 tests and Staff OS PASS.

A new exact-head CI run is required after the publication-invariant migration and this report update.

## Safety

- No auth or role changes.
- No secrets or environment changes.
- No production migration application.
- Existing service rows are preserved and receive a stable client key.
- Removed services are archived, not deleted, to preserve booking references.
- PR #624 is superseded by the combined implementation in PR #625.

## Next step

Confirm exact-head CI for PR #625, keep the migration repository-only, and obtain separate approval before applying Supabase migrations, merging or deploying.
