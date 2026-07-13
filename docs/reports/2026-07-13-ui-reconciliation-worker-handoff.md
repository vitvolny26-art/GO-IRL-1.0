---
title: GO IRL 1.0 UI Reconciliation Worker Handoff
owner: Technical Archivist / Tech Lead
status: Review
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# GO IRL 1.0 UI Reconciliation Worker Handoff

## Task

Reconcile the locally deployed UI package with Draft PR #77, remove duplicate implementations, restore GitHub as source of truth, and prepare one clean validated UI patch.

## Current state

- Production currently contains UI changes deployed directly from an uncommitted local working tree.
- GitHub `main` does not yet contain that complete UI package.
- Local commit `498a09e` must not be bundled blindly with the UI patch.
- Draft PR #77 contains overlapping fixes for activity icons, emoji cleanup, and detail-sheet controls.
- PR #77 currently uses a global `MutationObserver` DOM-polish layer through `eventVisualPolish.ts`.
- This DOM post-processing approach is not accepted as the canonical implementation.

## Technical decision

Use the local React-level implementation as the canonical direction.

Keep:

- `src/activityIcon.ts`
- direct React-level activity icon resolution
- direct React-level emoji cleanup
- direct avatar crop flow
- local event-location helpers
- client-side share helpers
- Telegram, WhatsApp, Messenger, Instagram channel set

Do not keep:

- `src/eventVisualPolish.ts`
- `src/eventVisualPolish.test.ts`
- `enableEventVisualPolish()` in `src/main.tsx`
- global `MutationObserver` DOM mutation for card/detail correction
- duplicate icon and text-cleanup logic

Potentially retain from PR #77 after visual review:

- close-button position CSS
- lower-right floating delete-action CSS

## Product decisions

- Instagram clipboard + open-Direct fallback is allowed for closed beta.
- A dedicated “link copied” toast is deferred as a separate P2 patch.
- Avatar persistence remains local; Supabase Storage/RLS work is out of scope.
- Physical-device QA is mandatory before merge.

## Protected scope

Do not change:

- `.env` or secrets
- Supabase RLS
- auth
- SQL or migrations
- production messaging credentials
- Join contracts
- webhook activation

# Worker 1 — AI Fixer / Implementation

## Mission

Build one clean UI reconciliation patch from the local implementation and the small non-duplicate CSS portion of PR #77.

## Required actions

1. Create a dedicated branch from current `origin/main`.
2. Preserve local commit `498a09e` separately; do not include it in the UI commit unless a later review explicitly approves it.
3. Port the local UI package into the branch.
4. Remove all duplicate PR #77 DOM-polish code.
5. Use `activityIcon.ts` as the single activity-icon resolver.
6. Keep avatar crop inside the direct React profile flow.
7. Keep `eventLocations.ts` and `cardShare.ts` as focused modules.
8. Retain only visually useful, non-duplicate CSS from PR #77.
9. Produce one focused commit:

`fix: polish event cards avatar crop and sharing`

## Files expected in scope

Tracked changes may include:

- `src/App.tsx`
- `src/avatar-cropper.css`
- `src/avatarCropper.ts`
- `src/card-share-action.css`
- `src/components/CardShareAction.tsx`
- `src/main.tsx`
- `src/unified-card-actions.css`
- `src/verticals/SportVertical.tsx`

New files may include:

- `public/icons/instagram.svg`
- `src/activityIcon.ts`
- `src/activityIcon.test.ts`
- `src/cardShare.ts`
- `src/cardShare.test.ts`
- `src/eventLocations.ts`
- `src/eventLocations.test.ts`

## Implementation acceptance

- no `MutationObserver` UI patching
- no duplicate icon resolver
- no duplicate emoji cleaner
- no Viber share action
- Instagram fallback documented in code
- native button semantics preserved for date/address actions
- manual location URL is never overwritten
- saved locations remain capped at 8

## Required checks

- `pnpm run lint`
- `pnpm run build`
- `pnpm run test`
- `pnpm run typecheck`
- `git diff --check`

Do not commit unless all checks pass.

# Worker 2 — QA Agent / Verification

## Mission

Verify the reconciled branch against the current production behavior and confirm that the final Git-backed implementation matches the intended UI package.

## Desktop/browser checklist

- app loads without console-breaking errors
- share menu contains Telegram, WhatsApp, Messenger, Instagram
- Viber is absent
- share menu closes on second click
- share menu closes on outside click
- share menu closes on Escape
- generated share text includes event name, date/time, address, and event deep link
- Mapy.cz link is generated when appropriate
- user-entered location URL remains unchanged
- stored locations are restored correctly
- card title wraps safely within two lines
- long words do not overflow
- pressed-state is visible on date, address, and channel buttons
- detail text contains no duplicated leading emoji
- activity icon matches the specific activity, including inline skating

## Physical-device checklist

Test on at least one real mobile device and inside Telegram Mini App WebView where possible:

- choose avatar image from gallery
- drag crop with one finger
- pinch zoom with two fingers
- apply crop
- save profile
- reload and confirm persistence
- open share menu
- verify Telegram share
- verify WhatsApp share
- verify Messenger fallback behavior
- verify Instagram clipboard + Direct fallback
- verify close and delete controls in the event detail sheet

## QA stop conditions

Stop and return only the red evidence block when:

- avatar file selection does not update React state
- crop gestures fail
- saved avatar disappears after reload
- event link is missing from share payload
- activity icon is wrong after create/update
- detail text still duplicates emoji
- Git-backed preview differs materially from current production

## QA output

Create a short report under:

`docs/reports/2026-07-13-ui-reconciliation-qa.md`

Required result format:

- PASS
- PASS WITH P2 FOLLOW-UP
- FAIL

# Merge and release gate

Merge only when:

- implementation checks are green
- physical-device QA is complete
- GitHub CI is green
- Git-backed Vercel Preview is ready
- final diff contains no duplicate PR #77 implementation
- production and Git source of truth are aligned

After parity is confirmed:

- close PR #77 as superseded, or reduce it to a CSS-only patch if still needed
- deploy from the Git-backed branch/main path
- record the final parity result in a durable agent report

## Next step

Worker 1 prepares the reconciled branch and one clean commit. Worker 2 validates only that branch and returns the QA verdict.