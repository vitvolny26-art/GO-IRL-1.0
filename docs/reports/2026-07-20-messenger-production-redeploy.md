---
title: Messenger Production Redeploy Report
owner: Chief Archivist / Technical Lead
status: Final
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-07-27
---

# Agent Report

## Task

Restore the Android Messenger sharing fix to production.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShare.test.ts`
- Vercel deployment history

## Findings

- `main` contains merge commit `f817c2be0da3266d5d54104ba6c452ac00eced93` with Android `ACTION_SEND` routing to `com.facebook.orca`.
- Production was manually promoted from commit `6c1937ef4c00ac4887b9e19c52e22ee977b15714` on `feat/profile-005-participant-chat-identity`.
- That branch diverged before the Messenger fix, so production reopened the unsupported Meta Send Dialog and returned API error 4202 on Android.

## Changes made

- No code changes.
- This report commit triggers a fresh production deployment from the canonical `main` branch.

## Checks

The Messenger patch previously passed test, typecheck, lint, and build in PR #248.

## Next step

Confirm the new Vercel production deployment contains this report commit and smoke-test Messenger sharing on Android.
