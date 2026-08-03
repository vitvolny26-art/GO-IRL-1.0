---
title: Beauty009 — Full-screen transparent professional profile
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-17
---

# Beauty009 — Full-screen transparent professional profile

## Task

Apply the production screenshot feedback to the Beauty invitation landing profile.

## Files inspected

- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/beauty/beauty-professional-profile.css`
- `src/services/serviceArtwork.ts`
- `index.html`
- PR `#610`

## Findings

- The `Professional profile` badge duplicates the page context.
- The profile is presented as a rounded bottom sheet instead of using the full Mini App viewport.
- The saved manicure image is limited to the hero while the remaining page uses an opaque gradient.
- The hero statistics and top action row duplicate service data and the sticky bottom actions.
- Several action and service buttons use opaque or filled backgrounds.

## Changes made

- Added a dedicated Beauty009 override stylesheet loaded from `index.html`.
- Removed the visible professional-profile badge.
- Removed the duplicated hero statistics and top action row from presentation.
- Made the profile full-height and square to the Mini App viewport.
- Reused the saved manicure sheet artwork as the background for the entire scrolling profile.
- Made profile buttons transparent with gold borders and text.
- Kept the sticky bottom price-list and booking controls over the background.
- Preserved the existing deep-link, price-list, booking, localization, rating, and review behavior.

## Checks

- Exact-head GitHub Actions required before merge.
- No auth, RLS, SQL, migrations, secrets, or production configuration changed.

## Next step

Open the Beauty009 pull request, inspect exact-head CI, and merge only after all gates pass.
