---
title: Agent Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Agent Report

## Task

Audit active templates and screens for duplicate control icons, keep the existing icon library, and unify duplicates with minimal UI-only changes.

## Files inspected

- `src/App.tsx`
- `src/components/*.tsx`
- `src/verticals/*.tsx`
- `src/*.css`
- `src/card-actions-enhancer.ts`
- `src/card-action-sheets.ts`
- `public/icons/*.svg`
- `package.json`

## Findings

- `lucide-react` is the canonical and only React icon library.
- Share actions in generic and Sport cards already render `Share2`, but cascading CSS hid it and replaced it with both a text glyph (`⤴`) and a custom data-URI SVG mask with a different stroke width.
- Card icon contracts used conflicting `stroke-width` values (`2`, `2.25`, and `2.4`) and share icon sizes (`20px` and `24px`).
- The details overflow menu used the text glyph `⋯` in both generic and Sport sheets instead of the current icon library.
- Messenger brand SVG files are intentionally separate brand marks, not duplicate application controls.

## Changes made

- Kept `lucide-react`; added no dependency.
- Made Lucide `Share2` the canonical share icon in generic and Sport cards.
- Removed the CSS text-glyph and inline-SVG share replacements.
- Standardized active card control icons to `20px` with `stroke-width: 2`.
- Replaced both details-menu `⋯` glyphs with Lucide `Ellipsis`.

## Checks

- `pnpm run lint` — PASS
- `pnpm run typecheck` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (18 files, 131 tests)
- Mobile browser smoke check at 390×844 — PASS for card action icon rendering and horizontal overflow: active top actions were `20×20`, stroke `2`, and no horizontal overflow was detected.
- Details-sheet visual smoke check — BLOCKED by the in-app browser tab closing during navigation; component compilation, lint, typecheck, and production build passed.

## Risks

- `src/card-actions-enhancer.ts` contains legacy text-glyph share/close icons, but the enhancer is not imported or invoked by the application. It was left unchanged to avoid expanding this UI task into deletion or reactivation of dead legacy behavior.
- Emoji used for event categories, activity types, and weather are content/data symbols whose exact meaning depends on the category or weather code. They were not converted to control icons.

## Not touched

- Business logic, routing, state, layout structure, auth, Supabase, RLS, SQL, migrations, and dependencies.
- `Bell` versus `CalendarDays`/`CalendarPlus`: visually related time controls have distinct meanings (notifications, date display, and add-to-calendar).
- `CircleUserRound`, `UserRoundCheck`, and `UsersRound`: related silhouettes represent profile, confirmed participant, and participant group.
- `Check` and `UserRoundCheck`: approval action versus joined-state identity.
- `X` and `XCircle`: close/reject controls versus a negative status illustration.
- `Sparkles`, `Star`, and `Zap`: discovery/category decoration, rating/created metric, and urgent/active status.
- Messenger brand icons (`Telegram`, `WhatsApp`, `Messenger`, `Viber`) and brand logos.

## Next step

Optionally remove the unreferenced `card-actions-enhancer.ts` in a separate dead-code cleanup after confirming it is not loaded outside the repository build.
