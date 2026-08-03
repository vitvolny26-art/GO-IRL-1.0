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
- Issue #622 and the Beauty012 production handoff

## Findings

The current workspace schema stores one service. The public RPC and repository already support one directory row per service, but the database enforces a unique `profile_id` on `beauty_professional_services`. Profile trust content, Instagram and portfolio do not have server fields.

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
- Added versioned v3 workspace/public RPCs and an additive migration that preserves the existing service, adds stable client keys and archives omitted services instead of deleting rows.

## Checks

Pending GitHub Actions on the exact PR head.

## Safety

- No auth or role changes.
- No secrets or environment changes.
- No production migration application.
- Existing service rows are preserved and receive a stable client key.
- Removed services are archived, not deleted, to preserve booking references.

## Next step

Run exact-head CI, review the additive SQL and UI in the Draft PR, then obtain separate approval before applying the migration, merging or deploying.
