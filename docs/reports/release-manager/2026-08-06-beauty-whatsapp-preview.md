---
title: Beauty WhatsApp preview
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-13
---

# Agent Report

## Task

Restore an in-app Beauty card preview before opening WhatsApp.

## Files inspected

- `src/components/CardShareAction.tsx`
- `src/components/CardShareAction.whatsapp.ux.test.ts`
- `src/cardShare.ts`
- `docs/reports/release-manager/2026-08-05-beauty-share-canonical.md`
- stale Draft PR #628
- current `main` commit `70180a89bde4b09c381582c99857b506a616a653`

## Findings

- Beauty WhatsApp clicks intentionally bypassed the prepared-card modal and opened `wa.me` immediately.
- The bypass prevented the user from reviewing the generated JPEG before choosing WhatsApp.
- The existing prepared-card modal and canonical Beauty renderer were already sufficient; no renderer or API change was required.
- Draft PR #628 is stale, conflicted, and contains a much larger 13-file implementation line.

## Changes made

- routed every WhatsApp channel click through the existing prepared-card preview;
- marked Beauty shares as direct-send so the WhatsApp action is enabled without a manual JPEG download;
- kept the existing manual download gate for Activity cards;
- changed localized primary action copy from opening to sending in WhatsApp;
- retained the canonical Beauty `wa.me` target and versioned preview URL;
- updated focused source-contract regression tests;
- made no Telegram, renderer, API, auth, RLS, SQL, migration, secret, environment, production-data, merge, or deployment change.

## Checks

- base `main`: `70180a89bde4b09c381582c99857b506a616a653`;
- branch: `fix/beauty-whatsapp-preview-20260806`;
- implementation head before this report: `6dd0564a46d7f06f109d1c642e7a18f3fc1b6570`;
- compare against base: 2 modified source/test files, 53 additions and 39 deletions before report;
- GitHub Actions exact-head CI: pending.

## Rollback

Close the PR without merging. Production remains unchanged.

## Next step

Open a Draft PR, verify exact-head GitHub Actions, then mark ready only if all required gates pass. Merge and deployment require explicit approval.
