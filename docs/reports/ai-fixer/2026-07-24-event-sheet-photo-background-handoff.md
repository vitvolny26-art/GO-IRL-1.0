---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-07-25
---

# Agent Report

## Task

Prepare a complete successor handoff for the event-details visual task after owner review rejected the universal event-details redesign.

The latest product decision is authoritative for this task:

1. Keep the existing event-details interface exactly as it is on current `main`.
2. Change only the event sheet background.
3. Use the same event-specific 3:4 artwork that is already used by event cards.
4. The background must cover the whole visible event sheet and stay visually static while only the sheet content scrolls.
5. Do not commit implementation code before the owner validates the visual result from a phone-only test.

## Role

AI Fixer

## Sources inspected

- GitHub `main` at `cf81ac8ab2e9da70bea88c670bd637ead44ab592`.
- Current generic event sheet in `src/App.tsx`.
- Current sport event sheet in `src/verticals/SportVertical.tsx`.
- Existing event artwork resolver in `src/components/EventCardArtwork.tsx`.
- Existing 3:4 asset registry in `src/eventBackgrounds.ts`.
- Current event sheet and mobile layout rules in `src/styles.css`, `src/generic-sheet-fixes.css`, and related CSS layers.
- Draft PR #347 `feat: apply universal event details template`.
- Owner-provided Android screenshot showing the current sport event sheet and the explicitly rejected redesign direction.
- Owner statement that only a phone is currently available and Termius has access to a runner.

## Files inspected

- `src/App.tsx`
- `src/verticals/SportVertical.tsx`
- `src/components/EventCardArtwork.tsx`
- `src/eventBackgrounds.ts`
- `src/styles.css`
- `src/generic-sheet-fixes.css`
- `src/main.tsx`
- `src/components/OrganizerEventDetailsPortal.tsx`
- PR #347 changed-file set and current status

## Current verified state

### GitHub main

- Current `main`: `cf81ac8ab2e9da70bea88c670bd637ead44ab592`.
- Latest merged functional work: PR #344, legacy runtime map actions routed to Mapy.com.
- The production/beta UI shown in the owner screenshot is based on `cf81ac8`.

### PR #347

- URL: `https://github.com/vitvolny26-art/GO-IRL-1.0/pull/347`
- Branch: `feat/event-details-sheet-v2`
- Head at last inspection: `840081f0b0c489aab43c2c19d65271993b1da452`
- State: open Draft
- CI #980: test, typecheck, lint, build all passed.
- Vercel Preview was blocked by `api-deployments-free-per-day`, not by an application build error.
- Product decision: the UX produced by PR #347 is rejected.
- Do not merge PR #347.
- Do not continue building on PR #347 for the current background task.
- Closing PR #347 is recommended, but should be done only after explicit owner approval.

## Findings

### Existing artwork pipeline is sufficient

`src/components/EventCardArtwork.tsx` already resolves the artwork code from event icon/activity/title through `resolveEventArtworkCode`, then obtains the asset URL through `getEventBackground`.

`src/eventBackgrounds.ts` already prefers:

`src/assets/event-backgrounds/card-3x4/*.webp`

over legacy artwork when the same filename exists.

Therefore:

- no new image generation is needed;
- no new asset upload is needed;
- no new mapping table is needed;
- the sheet should reuse the same resolver contract as the card.

### Existing interface must not be refactored

The current sport sheet is rendered by `SportActivitySheet` in `src/verticals/SportVertical.tsx`.

The current generic sheet is rendered by `GenericActivitySheet` in `src/App.tsx`.

The owner explicitly requires keeping these structures unchanged. The implementation must not:

- add a new universal details portal;
- replace the existing hero;
- reorder detail cells;
- remove or rename current labels;
- move chat or participants;
- add a map preview;
- alter organizer/profile behavior;
- alter share behavior;
- alter join/edit/delete actions;
- alter category-specific fields.

Only the sheet background is in scope.

### Latest decision supersedes earlier visual redesign instructions

Earlier discussion included removing sport labels, merging city/address rows, moving chat/participants, adding map-provider buttons, unread-chat indicators, and changing the organizer block. Those items are not part of the current active task because the owner later explicitly required the old interface to remain unchanged.

Treat the following as separate future tasks unless the owner reconfirms them:

- Facebook/Messenger share redesign;
- unread event-chat indicator on cards;
- chat/participants reordering;
- map-provider choice modal;
- full organizer profile behavior;
- sport detail-cell simplification.

## Approved implementation direction

### Scope

A minimal patch against current `main`:

1. Resolve the event artwork URL with the same logic as event cards.
2. Pass that URL to the existing generic and sport `<article className="activity-sheet">` elements through a CSS custom property or inline style.
3. Add a single opt-in class, for example `event-sheet-photo-background`.
4. Add a layered background:
   - dark readability gradient;
   - event image;
   - `cover` sizing;
   - centered/top positioning;
   - no repeat.
5. Preserve the existing background when no artwork resolves.
6. Do not change any child markup or action logic.

### Preferred helper

Create a small pure helper, for example:

`src/eventSheetBackground.ts`

Responsibilities:

- accept `icon`, `activity`, and `title`;
- call `resolveEventArtworkCode`;
- call `getEventBackground`;
- return `string | null`.

This avoids duplicating resolver logic in `App.tsx` and `SportVertical.tsx`.

Equivalent logic may be placed directly in the two sheets only if duplication remains trivial and testable.

### Preferred React integration

For the generic sheet:

- resolve the same activity avatar/icon already available in `GenericActivitySheet`;
- compute the background URL;
- add the opt-in class only when the URL exists;
- expose the URL through a typed CSS variable.

For the sport sheet:

- reuse the existing `avatar` and localized activity/title strings;
- apply the same class and variable to the existing sport sheet article.

Conceptual shape only:

```tsx
<article
  className={`activity-sheet${backgroundUrl ? " event-sheet-photo-background" : ""}`}
  style={backgroundUrl
    ? ({ "--event-sheet-background": `url("${backgroundUrl}")` } as React.CSSProperties)
    : undefined}
>
```

Do not copy this blindly without checking the existing imports and TypeScript style contract.

### Preferred CSS behavior

The background should be attached to the existing scrolling sheet element, not to every child block.

Conceptual shape:

```css
.activity-sheet.event-sheet-photo-background,
.activity-sheet.sport-sheet.event-sheet-photo-background {
  background-color: #0b0e11 !important;
  background-image:
    linear-gradient(
      180deg,
      rgba(7, 9, 12, .62) 0%,
      rgba(7, 9, 12, .74) 28%,
      rgba(7, 9, 12, .88) 62%,
      rgba(7, 9, 12, .96) 100%
    ),
    var(--event-sheet-background) !important;
  background-repeat: no-repeat !important;
  background-size: cover !important;
  background-position: center top !important;
  background-attachment: scroll !important;
}
```

Exact opacity is a QA variable. Start conservative because the existing white/gray text must remain readable.

The current requirement says the background should look static while content scrolls. On the existing scroll container, a normal element background should remain anchored to the sheet viewport while descendants scroll. Verify this physically on Android. Do not use `background-attachment: fixed` before testing because mobile WebView support is inconsistent and fixed backgrounds can jump when the keyboard opens.

### Fallback

When no artwork URL resolves:

- do not add the class;
- do not set the variable;
- preserve the current generic or sport gradient exactly.

## Explicit non-goals

- No PR #347 UI reuse.
- No architecture rewrite.
- No new portal.
- No image generation.
- No Supabase changes.
- No auth/RLS/SQL/migrations.
- No production data changes.
- No Telegram bot changes.
- No Meta/Facebook changes.
- No map logic changes.
- No commits during the first visual experiment.
- No production deployment.

## Phone-only test environment

The owner currently has:

- Android phone;
- Termius;
- SSH access to a runner;
- no PC.

The correct first gate is an isolated, uncommitted runner worktree served through Vite and opened on the phone through Termius local port forwarding.

### Runner isolation requirements

- Do not edit the runner's primary checkout.
- Create a detached worktree from refreshed `origin/main`.
- Apply edits only inside that worktree.
- Do not create a branch for the experiment.
- Do not commit.
- Do not push.
- Run required checks only after visual approval.
- Remove the worktree after the experiment if rejected.

### Suggested runner setup

Use a temporary path such as:

- repository checkout: `~/GO-IRL-1.0`
- test worktree: `~/goirl-sheet-bg-test`
- Vite log: `/tmp/goirl-sheet-bg-vite.log`
- tmux session: `goirl-sheet-bg`

Suggested preparation:

```bash
cd ~/GO-IRL-1.0 && git fetch origin main && git worktree remove --force ~/goirl-sheet-bg-test 2>/dev/null || true; git worktree add --detach ~/goirl-sheet-bg-test origin/main
```

After manually creating the uncommitted patch in the worktree:

```bash
cd ~/goirl-sheet-bg-test && pnpm install --frozen-lockfile && tmux new-session -d -s goirl-sheet-bg "cd ~/goirl-sheet-bg-test && pnpm dev --host 127.0.0.1 --port 5173 > /tmp/goirl-sheet-bg-vite.log 2>&1"
```

Only one short command block should be presented to the owner at a time in the successor chat.

### Termius Local Port Forwarding

Create a Local rule on the same host:

- Local port: `5173`
- Destination host: `127.0.0.1`
- Destination port: `5173`

Keep Termius active in the background. On Android, battery optimization for Termius should be disabled or set to unrestricted so the tunnel is not killed when switching to Chrome.

Open in mobile Chrome:

- `http://127.0.0.1:5173`
- fallback: `http://localhost:5173`

This is a real React/CSS test, but not a complete Telegram Mini App test. Final safe-area, Telegram Back Button, and WebView behavior require a later HTTPS Preview after the visual design is approved.

## Visual QA matrix

### Interface preservation

- Existing sport sheet structure is unchanged.
- Existing generic sheet structure is unchanged.
- No new hero appears.
- No universal details portal appears.
- All current rows, labels, chips, buttons, chat, participants, edit, delete, and more-menu remain in their current positions.
- Only the sheet background differs from `main`.

### Artwork correctness

Test at least:

- volleyball;
- coffee or dinner;
- walk/nature;
- an event with unknown or missing artwork mapping.

For each event:

- correct category-specific image is used;
- 3:4 asset is preferred;
- previous event image does not remain after switching events;
- image does not tile;
- image is not stretched;
- central subject is not unacceptably cropped;
- fallback retains the old gradient.

### Readability

- title remains readable;
- gray descriptions remain readable;
- detail values remain readable;
- cyan address link remains readable;
- lime labels/icons remain readable;
- destructive buttons remain visible;
- chat text remains readable;
- no region becomes excessively bright.

### Scroll behavior

- content scrolls to the bottom;
- background appears static relative to the sheet viewport;
- no black gap appears after long scrolling;
- no background jump occurs when opening the chat keyboard;
- no flicker occurs around sticky close/delete/actions;
- closing and reopening resets scroll and background correctly.

### Mobile behavior

- portrait Android Chrome;
- rotate landscape and back;
- open/close keyboard in event chat;
- background survives app switching;
- no horizontal scroll;
- Android navigation bar does not cover actions.

## Required evidence from owner

Before any implementation commit:

1. Screenshot of the top of the sport sheet.
2. Screenshot of the same sheet after scrolling to the middle or bottom.
3. Screenshot of a non-sport sheet.
4. A one-line verdict:
   - background correct;
   - too dark;
   - too light;
   - wrong crop;
   - background scrolls;
   - old layout changed.

## Checks

No implementation checks have been run for this new background-only direction because no implementation code has been committed or pushed.

Previous PR #347 CI results do not validate this new task and must not be reused as evidence.

After visual approval, run on the same final code state:

1. `pnpm run test`
2. `pnpm run typecheck`
3. `pnpm run lint`
4. `pnpm run build`

Stop at the first red gate.

## GitHub

- Source base: `main` at `cf81ac8ab2e9da70bea88c670bd637ead44ab592`.
- Rejected UX implementation: Draft PR #347.
- Background-only implementation branch: not created.
- Background-only implementation commit: none.
- Background-only implementation PR: none.
- This report is documentation-only and does not authorize merge or deployment.

## ClickUp

A continuation task should record:

- keep old event-details UI;
- background-only scope;
- reuse card 3:4 artwork;
- phone-only Termius runner test before commits;
- PR #347 must not be merged;
- evidence required before implementation commit.

Do not mark the task complete until physical Android QA and the four code gates are green.

## Google Drive

Create a non-authoritative mirror under:

`AI Reports / AI Fixer / 2026-07-24/`

The mirror should include this report and the companion roadmap. GitHub main remains authoritative after merge; while this documentation PR is unmerged, both documents are handoff material only.

## Blockers

- Owner currently has no PC.
- No background-only code implementation exists yet.
- The previously generated chat attachment patch is not durable project state and should not be assumed available in a new chat.
- PR #347 is still open and may confuse a successor unless this report is read first.
- Vercel free-plan deployment limit was exhausted during PR #347 work; avoid unnecessary pushes and Preview builds.

## Next step

In the successor chat:

1. Refresh GitHub main and open PR state.
2. Continue as AI Fixer after role confirmation.
3. Read this report and the companion roadmap.
4. Do not use PR #347 code.
5. Prepare the minimal background-only patch inside an isolated runner worktree without committing.
6. Start Vite through tmux.
7. Help the owner open it through Termius Local Port Forwarding.
8. Collect the required screenshots and verdict.
9. Only after visual approval, create one implementation branch, run all four gates, push one logical commit, and create a Draft PR.
