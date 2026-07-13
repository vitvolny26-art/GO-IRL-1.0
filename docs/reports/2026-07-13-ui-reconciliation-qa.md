---
title: GO IRL 1.0 UI Reconciliation QA
owner: QA Agent / Verification
status: Review
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# UI Reconciliation QA

## Result

**PASS**

PR #81 passed automated, desktop browser, and user-reported physical-device checks. The branch was rebuilt directly from `origin/main`, so the protected local commit `498a09e` is no longer part of the PR history or diff.

## Scope inspected

- PR #80 handoff and merge/release gate
- Draft PR #81, corrected UI head `783b41b`
- local branch `fix/reconciled-ui-polish`
- GitHub CI and Vercel status
- local production build at `http://127.0.0.1:4173`

## Reconciliation findings

1. Initial QA found protected commit `498a09e` in the PR ancestry.
2. The branch was rebased onto `origin/main`; the focused UI implementation is now commit `783b41b`.
3. `docs/reports/2026-07-13-agent-report-meta-messaging-verification.md` is absent from the corrected PR diff.

## Automated checks

- `pnpm run lint`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS — 30 files, 163 tests
- `pnpm run typecheck`: PASS
- `git diff --check origin/main...HEAD`: PASS
- GitHub CI `verify`: PASS
- Vercel Preview: PASS
- PR mergeability signal: MERGEABLE

## Desktop/browser checks

- app loads without console errors: PASS
- Telegram, WhatsApp, Messenger, Instagram present: PASS
- Viber absent: PASS
- share menu closes on second click: PASS
- share menu closes on Escape: PASS
- share menu closes on outside click: PASS
- share payload helper includes title, date, address, and exact event deep link: PASS by code and unit tests
- Mapy.cz suggestion: PASS
- manual location URL remains unchanged after address editing: PASS
- saved locations parsed, sorted, and capped at 8: PASS by code and unit tests
- event title overflow protection: PASS by computed CSS inspection
- native button semantics for date/address actions: PASS
- detail text has no duplicated leading emoji: PASS
- activity-specific icons including inline skating: PASS by code and unit tests
- close button uses sticky top positioning: PASS
- delete action uses sticky lower-right positioning: PASS

The browser emitted only the known Telegram WebApp warning that `BackButton` is not supported in API version 6.0; no application console errors were observed.

## Physical-device checks

**PASS — reported by the user on 2026-07-13**

- gallery avatar selection
- one-finger crop drag
- two-finger pinch zoom
- apply, save, reload, and persistence
- Telegram share on device
- WhatsApp share on device
- Messenger fallback on device
- Instagram clipboard and Direct fallback on device
- close/delete controls inside Telegram Mini App WebView

## Release gate

The history correction and physical-device gate are complete. After the corrected branch is pushed, GitHub CI and Vercel Preview must rerun successfully before PR #81 leaves Draft.

## Protected scope

No `.env`, secrets, auth, Supabase RLS, migrations, SQL, production credentials, Join contracts, or webhook activation were changed during QA.
