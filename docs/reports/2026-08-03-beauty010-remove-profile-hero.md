---
title: Beauty010 — Remove professional profile hero header
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-17
---

# Beauty010 — Remove professional profile hero header

## Task

Remove the large internal hero/header from the Beauty professional profile.

## Files inspected

- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `src/beauty/beauty-professional-profile.css`
- `src/beauty/beauty-professional-profile-overrides.css`

## Findings

- The large hero remained visible after Beauty009 and occupied most of the first viewport.
- The Telegram system header is outside the web application and is not modified.

## Changes made

- Hide the complete internal Beauty hero/header.
- Start the services section at the top of the scrolling profile with room for the close control.
- Preserve the full-page background, price list, booking, master details, rating, reviews, and sticky actions.

## Checks

- Exact-head GitHub Actions required before merge.
- No auth, RLS, SQL, migrations, secrets, or production configuration changed.

## Next step

Merge only after all checks pass, then deploy separately.
