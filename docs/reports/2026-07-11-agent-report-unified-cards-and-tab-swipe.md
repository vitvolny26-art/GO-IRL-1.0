---
title: Agent Report — Unified Event Cards and Tab Swipe
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report — Unified Event Cards and Tab Swipe

## Task

Enable left/right swipe navigation between bottom tabs and rebuild every event-card surface from the Sport card visual template used in the For You flow. Recover the intended card-button behavior from code, PR history, and reports before changing it.

## Files inspected

- `src/App.tsx`
- `src/main.tsx`
- `src/bottom-nav-swipe.ts`
- `src/unified-card-template.ts`
- `src/card-action-sheets.ts`
- `src/verticals/SportVertical.tsx`
- `src/compact-sport-card.css`
- `src/compact-sport-card-final.css`
- `src/all-event-card-template.css`
- `src/unified-card-actions.css`
- `docs/bible/06-ux-interaction-guidelines.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `docs/reports/2026-07-11-ai-fix-report.md`
- `docs/reports/2026-07-11-consolidated-report-pr-1-30.md`
- merged PRs #13, #15, #24, and #28

## Findings

- Swipe navigation already existed but was never enabled from app startup.
- Generic stack cards were rewritten after render by a `MutationObserver`, while horizontal For You cards used a separate compact component. This produced inconsistent markup, styling, and behavior.
- The intended action contract is:
  - bell, duration, and date/time -> reminder picker;
  - share -> Telegram, WhatsApp, Messenger, and Viber with the exact event deep link;
  - participants -> participant preview;
  - address -> Mapy.cz;
  - price and status -> informational;
  - left footer -> Coach for sport, event details for generic events;
  - right footer -> Join/Open/Requested state.
- Share actions work. Reminder channel actions are still placeholders and do not schedule or send anything.

## Changes made

- Enabled bottom-tab swipe navigation from `main.tsx`.
- Added gesture classification tests and ignored short/vertical gestures.
- Prevented tab switching while swiping horizontal event carousels or editing form controls.
- Rebuilt generic cards with the same React structure and CSS classes as Sport cards.
- Reused the unified card in horizontal For You sections instead of the old `discover-card` layout.
- Added participant preview, exact event sharing, reminder entry points, Mapy.cz address action, state-aware join behavior, and event-specific generic avatars.
- Added Mapy.cz activation to the Sport card address cell.
- Removed the obsolete `MutationObserver` card adapter.

## Checks

```text
pnpm run typecheck  PASS
pnpm run lint       PASS
pnpm run test       PASS — 13 files, 65 tests
pnpm run build      PASS
git diff --check    PASS
```

Manual browser QA:

- 390 x 844 mobile viewport: PASS.
- Sport and generic cards share the same layout: PASS.
- Horizontal For You cards use the same template: PASS.
- Bottom navigation remains visible and horizontal carousels remain scrollable: PASS.

## Risks

- Reminder channel buttons remain placeholders. A separate product/backend task must define whether reminders use local calendar, Telegram bot delivery, n8n, or another server-side channel.
- Real touch behavior still needs a Telegram client smoke test because desktop browser automation does not reproduce Telegram WebView touch handling exactly.
- The existing Sport status cell has legacy CSS-generated accessibility text that can duplicate visible status in the accessibility tree; visual rendering remains correct.

## Not touched

- `.env` files or secrets
- auth
- Supabase schema or RLS
- SQL or migrations
- notification backend or n8n
- event detail architecture

## Next step

Test left/right tab swipes and horizontal For You card scrolling in Telegram on iOS or Android. Define the reminder delivery contract before replacing placeholder channel actions.
