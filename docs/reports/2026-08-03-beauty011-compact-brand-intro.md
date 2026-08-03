---
title: Beauty011 — Compact brand intro for professional profile
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Beauty011 — Compact brand intro for professional profile

## Task

Restore a proper compact opening block after Beauty010 removed the oversized internal hero.

## Files inspected

- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/beauty/beauty-professional-profile.css`
- `src/beauty/beauty-professional-profile-overrides.css`
- `src/services/serviceArtwork.ts`
- `src/services/servicesProfessionalDirectory.ts`

## Findings

- Public Beauty directory data exposes the professional name, main service, and location, but no dedicated logo URL or biography field.
- Beauty010 correctly removed the oversized hero, badge, statistics, and duplicated top actions, but also removed the only visible identity block.
- The existing manicure icon is already a canonical saved asset and can serve as a compact logo-style mark without schema changes.

## Changes made

- Restored the existing profile header as a compact transparent brand introduction.
- Used the saved manicure icon as the circular logo-style mark.
- Kept the salon/professional name, main service subtitle, and location visible.
- Kept the full-page saved manicure background.
- Kept the `Professional profile` badge, statistics, and duplicated top action row hidden.
- Reduced the gap before `Services and prices`.
- Preserved booking, price list, master information, portfolio, rating, reviews, localization, and sticky actions.

## Checks

- Exact-head GitHub Actions required before merge.
- No auth, RLS, SQL, migrations, secrets, or production configuration changed.

## Next step

Open the Beauty011 pull request and merge only after all required checks pass.
