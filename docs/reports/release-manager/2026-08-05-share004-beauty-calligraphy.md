---
title: SHARE004 Beauty Calligraphy
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Refine the server-rendered Beauty sharing card: use a calligraphic business-name font, remove the left dark overlay, remove the address icon, and allow three description lines.

## Files inspected

- `api/_shared/beauty-share-card-svg.ts`
- `api/_shared/beauty-share-card-svg.test.ts`
- `api/_shared/telegram-share-card-image.ts`
- `src/beauty/beautyShareCardModel.ts`
- `src/beauty/beautyShareCardRepository.ts`
- `docs/THIRD_PARTY_NOTICES.md`

## Findings

The premium v2 SVG used DejaVu Serif and a left-to-right dark gradient. The address used a pin path and descriptions were capped at two lines. The browser Canvas preview remains a separate renderer and is outside this bounded server-template patch.

## Changes made

- Added Great Vibes runtime font loading with temporary caching and DejaVu fallback.
- Switched the premium title to the calligraphic font family.
- Removed the left shade overlay and location pin.
- Increased description capacity to three lines.
- Bumped template version to 3 and fingerprint version to 4.
- Added tests and third-party font notice.

## Checks

GitHub Actions pending for the exact branch head.

## Next step

Review exact-head CI. Merge and deploy only after explicit approval and green checks.