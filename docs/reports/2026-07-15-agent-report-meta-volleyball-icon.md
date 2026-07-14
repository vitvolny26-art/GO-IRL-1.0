---
title: Agent Report — Meta Volleyball Icon Replacement
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Replace the still-unrecognizable hand-drawn volleyball in the Meta invitation card.

## Files inspected

- Server SVG/JPEG invitation renderer and tests.
- Twemoji volleyball SVG source and graphics license.

## Findings

- The second custom seam layout remained visually ambiguous.
- Twemoji provides a stable, recognizable Unicode volleyball asset under CC BY 4.0.

## Changes made

- Replaced custom volleyball geometry with the standard Twemoji `U+1F3D0` path and colors.
- Added third-party attribution and registered the notice in `DOCS_INDEX.md`.
- Updated renderer assertions.

## Checks

- Corrected 1080x900 JPEG: PASS — visually inspected.
- `pnpm run lint`: PASS.
- `pnpm run build`: PASS.
- `pnpm run test`: PASS — 45 files, 235 tests.
- `pnpm run typecheck`: PASS.

## Risks

- Other activity icons still use existing custom artwork or the generic fallback.

## Not touched

- Weather, provider payloads, Join behavior, auth, RLS, SQL, migrations, `.env`, or secrets.

## Next step

Render the card, confirm the icon visually, then run all quality gates.
