---
title: Event Sheet Photo Background Roadmap
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-07-25
---

# Event Sheet Photo Background Roadmap

## Objective

Apply event-specific 3:4 artwork as the background of the existing event-details sheet while preserving the current interface and behavior exactly.

## Product decision

The active product decision is:

- preserve the current generic and sport event-details layouts;
- change only the background;
- reuse the same event-specific artwork as the event card;
- prefer existing `card-3x4` assets;
- keep the background visually static while sheet content scrolls;
- test visually from the owner's phone through a Termius runner before any implementation commit.

This decision supersedes the universal event-details redesign in Draft PR #347.

## Phase 0 — Reset and guardrails

### Goal

Prevent accidental continuation of the rejected redesign.

### Actions

- Refresh `main` and open PRs.
- Confirm `main` SHA before work.
- Read `2026-07-24-event-sheet-photo-background-handoff.md`.
- Treat PR #347 as rejected UX and non-mergeable for this task.
- Do not cherry-pick files from PR #347.
- Do not edit `main` directly.
- Do not create an implementation branch yet.
- Do not trigger Vercel Preview during visual exploration.

### Exit criteria

- Successor confirms background-only scope.
- No code or repository state changed.

## Phase 1 — Isolated uncommitted prototype

### Goal

Produce a real React/CSS visual test without commits, branches, pushes, or Preview deployments.

### Environment

- Android phone.
- Termius SSH and Local Port Forwarding.
- Remote runner with repository checkout.
- Detached Git worktree from `origin/main`.
- Vite dev server under `tmux`.

### Worktree requirements

- Primary checkout remains untouched.
- Temporary path: `~/goirl-sheet-bg-test`.
- Detached from `origin/main`.
- No branch.
- No commits.
- No pushes.

### Prototype implementation

Minimal touched files expected:

- `src/App.tsx`
- `src/verticals/SportVertical.tsx`
- one small helper such as `src/eventSheetBackground.ts`
- one existing CSS file or one narrowly scoped new CSS file

Preferred implementation:

1. Resolve artwork using the existing `resolveEventArtworkCode` plus `getEventBackground` pipeline.
2. Add one class and one CSS custom property to the existing generic sheet article.
3. Add the same class and property to the existing sport sheet article.
4. Add a dark gradient over the event image.
5. Preserve the old background when no artwork resolves.

### Explicitly forbidden during prototype

- changing sheet markup order;
- adding a universal portal;
- removing existing labels;
- moving chat or participants;
- changing share, map, profile, join, edit, delete, or coach logic;
- committing;
- pushing;
- opening a PR.

### Exit criteria

Owner provides:

- top screenshot of sport sheet;
- scrolled screenshot of the same sheet;
- screenshot of a non-sport sheet;
- visual verdict.

## Phase 2 — Visual tuning

### Goal

Tune only the image crop and overlay opacity.

### Variables allowed

- gradient opacity;
- gradient stop positions;
- `background-position`;
- optional event-type-specific position only when strong evidence shows one shared position is unacceptable.

### Variables not allowed

- component structure;
- typography;
- spacing;
- card grid;
- event actions;
- business logic.

### Acceptance criteria

- correct artwork for each tested event;
- 3:4 source preferred;
- no stale image when switching events;
- no tiling or stretching;
- readable white, gray, cyan, lime, and destructive UI text;
- background visually static while content scrolls;
- no keyboard jump or sticky-control flicker;
- fallback keeps old gradient.

## Phase 3 — Convert prototype into one logical implementation

### Goal

After owner visual approval, turn the accepted prototype into durable code.

### Actions

- Refresh `main` again.
- Create one branch from exact current `main`, suggested name:
  `fix/event-sheet-photo-background`.
- Reapply only the approved minimal patch.
- Remove experimental code and comments.
- Add focused unit tests for the pure background resolver.
- Inspect all usages before finalizing imports or helper placement.

### Commit rule

One complete logical commit only after all four checks are green.

Suggested commit message:

`fix: use event artwork as sheet background`

### Exit criteria

- branch contains only background-related files;
- no PR #347 files or universal portal code;
- diff is minimal and reviewable.

## Phase 4 — Verification gates

Run in this exact order on the same commit:

1. `pnpm run test`
2. `pnpm run typecheck`
3. `pnpm run lint`
4. `pnpm run build`

Stop at the first red gate.

### Required automated coverage

- mapped sport event resolves its 3:4 background;
- mapped non-sport event resolves its 3:4 background;
- unknown event returns `null` or safe fallback;
- resolver uses the same artwork code contract as event cards;
- no browser globals in pure helper tests.

### Exit criteria

All four commands pass on exact head.

## Phase 5 — Draft PR and Preview

### Goal

Obtain a real HTTPS Telegram-compatible Preview only after local visual approval and green code gates.

### Actions

- Push once after all local work is complete.
- Create one Draft PR.
- Include screenshots and the accepted visual evidence.
- Avoid extra pushes because Vercel free-plan daily deployment limits were previously exhausted.
- Confirm Vercel status before pushing.

### PR scope statement

- existing event-details UI preserved;
- background-only change;
- existing 3:4 artwork reused;
- no API, auth, RLS, SQL, migration, secret, production-data, map, share, or profile changes.

### Exit criteria

- CI green on exact PR head;
- Vercel Preview available;
- PR remains Draft.

## Phase 6 — Physical Telegram Mini App QA

### Goal

Validate WebView-specific behavior that Chrome via SSH tunnel cannot prove.

### Required scenarios

- sport event top and bottom;
- generic event top and bottom;
- switch between different categories;
- open and close chat keyboard;
- Telegram Back Button;
- safe-area top and bottom;
- sticky close, action, and delete controls;
- portrait orientation;
- reopen event after closing;
- fallback event without mapped artwork.

### Evidence

- screenshots or short video;
- device and OS;
- Preview URL;
- exact commit SHA;
- explicit PASS/RED statement.

### Exit criteria

Physical QA is green.

## Phase 7 — Ready and merge

### Preconditions

- owner explicitly approves the visual result;
- automated gates green;
- Vercel Preview green;
- Telegram Mini App physical QA green;
- PR head unchanged since verification;
- PR mergeable;
- explicit owner merge command received.

### Actions

- mark PR Ready;
- recheck exact head and statuses;
- squash merge only after explicit approval;
- do not deploy production automatically.

## Cleanup

After prototype rejection or completion:

- stop tmux session `goirl-sheet-bg`;
- remove temporary worktree;
- delete temporary logs and patch files;
- keep no abandoned implementation branches;
- close PR #347 after owner approval to reduce confusion.

## Deferred backlog

The following requests were discussed but are outside this roadmap and must be handled separately:

- Facebook rich-preview correction;
- Messenger rich-card correction;
- unread event-chat indicator on cards;
- chat and participant block reordering;
- city/address merge;
- map-provider choice dialog;
- organizer full-profile navigation;
- sport label simplification.

Do not mix these into the background PR.

## Success definition

The task is complete only when a user opens any existing event and sees the unchanged current event-details interface over the correct event-specific 3:4 image, with readable content, stable scrolling, correct fallback, green automated checks, and green physical Telegram Mini App QA.
