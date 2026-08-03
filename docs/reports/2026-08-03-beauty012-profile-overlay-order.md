---
title: Beauty012 — Profile overlay and section order
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Beauty012 — Profile overlay and section order

## Task

Keep price-list and booking sheets above the Beauty professional profile, enlarge the compact logo, and swap sections 01 and 02.

## Files inspected

- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/beauty/beauty-professional-profile.css`
- `src/beauty/beauty-professional-profile-overrides.css`
- `src/services/ServiceActivityCard.tsx`
- `src/services/service-activity-card.css`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/beautySetupModel.ts`
- `src/beauty/beautyWorkspaceRepository.ts`
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`

## Findings

- The profile action bridge explicitly called `setOpenProfile(null)` before clicking the existing Services action.
- This removed the Beauty profile and exposed the underlying Services/editor surface.
- Existing service picker and booking portals use a lower z-index than the Beauty profile.
- Section 01 was Services and section 02 was About.
- The compact logo was 62px on desktop.
- Multilingual professional descriptions and service text are not represented in the current workspace model or server schema.

## Changes made

- Kept the Beauty profile mounted while opening the existing price-list or booking sheet.
- Added a `beauty-profile-open` body state while the profile is mounted.
- Raised nested Services sheets above the profile only while that body state is active.
- Preserved the profile scroll position when a nested sheet closes.
- Prevented Escape from closing the parent profile while a nested Services overlay is present.
- Enlarged the logo to 92px desktop and 84px mobile.
- Moved About to section 01 and Services and prices to section 02.

## Checks

Exact-head GitHub Actions required before merge:

- repository check;
- diff check;
- tests;
- typecheck;
- lint;
- build;
- bundle budget.

## Next step

After Slice A is green and accepted, implement Beauty012 Slice B as a separate bounded change: RU/UK/CS/EN professional description and price-list text with additive versioned Supabase RPCs. Do not apply the migration to production without a separate explicit migration gate.
