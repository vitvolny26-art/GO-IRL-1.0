---
title: Agent Report — Icon and Create Action Normalization
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report — Icon and Create Action Normalization

## Task

Recheck card icons after the unified-card release and bring the Home `Create event` action into the existing GO IRL lime/dark visual theme.

## Files inspected

- `src/App.tsx`
- `src/verticals/SportVertical.tsx`
- `src/styles.css`
- `src/compact-sport-card.css`
- `src/compact-sport-card-final.css`
- `src/all-event-card-template.css`
- `src/mobile-card-fixes.css`
- `src/sport-avatar-fixes.css`

## Findings

- Sport Share used a CSS mask while generic Share used Lucide `Share2`, producing different stroke weight and geometry.
- Sport status used a CSS-generated text star while generic status used Lucide `Star`.
- Legacy status CSS hid the real Sport status text with `font-size: 0`.
- The Home `Create event` button used a neutral gray surface unrelated to the lime action theme.
- Generic sport-like events could fall back to a trophy instead of their activity-specific icon.

## Changes made

- Standardized card action and metadata icons on one Lucide stroke contract.
- Removed CSS-generated Share and status stars from the final rendering path.
- Added a real Lucide `Star` to the Sport status cell and restored visible status text.
- Extended activity-specific avatars for volleyball, football, basketball, tennis, cycling, swimming, badminton, and yoga.
- Restyled `Create event` as a dark lime-tinted secondary action aligned with the primary GO IRL button.

## Checks

```text
pnpm run typecheck  PASS
pnpm run lint       PASS
pnpm run test       PASS — 13 files, 65 tests
pnpm run build      PASS
git diff --check    PASS
```

Manual browser QA at 390 x 844: PASS.

## Risks

Emoji activity avatars remain platform-rendered and can vary slightly between operating systems. Functional Lucide icons now share the same geometry and stroke rules.

## Not touched

- card behavior or event state
- `.env` files or secrets
- auth
- Supabase schema/RLS
- SQL or migrations

## Next step

Verify the updated production build inside Telegram on the primary mobile client.
