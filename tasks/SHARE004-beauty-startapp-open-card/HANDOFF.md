---
title: SHARE004 Handoff
owner: Chief Archivist
status: Verification pending
last_review: 2026-08-04
next_review: 2026-08-11
---

# SHARE004 Handoff

## Handoff target

QA Engineer or Release Manager for one bounded Telegram runtime verification.

## Task

`SHARE004 — Beauty startapp opens professional card`

## Current verified state

- implementation PR #607 is merged;
- implementation merge SHA: `e3fd56624ccee6d0a441037b844d8d280b48b503`;
- the implementation and regression tests remain present on current `main` commit `84954a666a41c6d72aa3773dd11f31ff6fcdca2c`;
- the historical release report recorded successful CI and deployment evidence on 2026-08-03;
- GitHub task workspace and Draft PR #630 now exist;
- Google Drive report, Roadmap and Handoff mirrors were written and read back;
- no current physical evidence proves the exact card opens after the Telegram Mini App link is selected.

## Required smoke

1. Use a published Beauty profile with a known slug, preferably `beauty-test` only if it still exists publicly.
2. Open `https://t.me/GOirl_bot?startapp=beauty-test` from a fresh Telegram context.
3. Confirm GO IRL opens the Services catalog automatically.
4. Confirm the exact matching professional card opens without manual search or tap on another card.
5. Confirm the user is not left on the generic Services landing page.
6. Confirm the consumed `beauty` query parameter is removed after the card opens.
7. Save PII-free evidence with device, Telegram client, local time, URL/slug and PASS/FAIL.

## Pass classification

PASS only when the intended professional card is visibly open after the Mini App launch and the result can be tied to the tested slug.

## Fail classification

FAIL if the flow stops on Services home/catalog, opens the wrong professional, requires manual search, or loops/reloads. Record exact observed behavior; do not change code inside the evidence step.

## Source files

- `src/components/AppHeader.tsx`
- `src/services/ServicesClientViews.tsx`
- `src/services/beautyDeepLink.ts`
- `src/services/beautyDeepLink.test.ts`

## Successor boundary

WhatsApp Beauty preview rendering is not SHARE004. It belongs to `BEAUTY014`.

Current GitHub state contains:

- issue #626, referenced by Draft PR #628;
- later duplicate issue #629 with nearly identical scope.

Do not resolve or implement that duplication while executing SHARE004. Route it to the active BEAUTY014 owner.

## ClickUp

No verified SHARE004 task was found on 2026-08-04. Do not create a duplicate without coordination.

## Google Drive

- task folder: `1E-K42aikstPkxIu4Q2wSi2Lq89r6sjuV`;
- historical release report: `1QZJaT5l8RW3vTMIiv1cwHMJVDOvg9CHby9VcwIWVqBc`;
- Roadmap: `1CYBIM9Br1ebJ_bHXgNQ6H7XAVToPAhnTxHtl85-uBOY`;
- Handoff: `1KYSSbwtcXpS-cqr3OxnwfrfHudugL4VNMOPbDVq_0Pw`;
- Chief Archivist report: `1v9e48RVdHy3_DP_pdZQnKJGqECivRfm3RrNMU2-RNbg`.

## Safety

- no merge, deployment or production configuration change for this handoff;
- no auth, RLS, SQL, migration, secret or production-data change;
- do not store screenshots containing account names, chat names or personal data.

## GitHub references

- implementation PR: #607;
- documentation PR: #630;
- initial documentation commit: `4027154b21e362c13ac126422b25b4d88759dfa2`;
- final synchronization commit: current head of Draft PR #630.

## Next verified step

Complete the single Telegram smoke and update SHARE004 evidence, `STATUS.md`, `ROADMAP.md`, report and Drive mirrors.
