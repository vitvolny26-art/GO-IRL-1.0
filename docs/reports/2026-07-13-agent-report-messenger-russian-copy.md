---
title: Messenger Russian Copy Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Messenger Russian Copy Agent Report

## Task

Localize the live Messenger invitation and Join flow without changing Instagram, WhatsApp, persistence, auth, RLS, SQL, migrations, or secrets.

## Files inspected

- `src/meta-messaging/payload-builders.ts`
- `src/meta-messaging/payload-builders.test.ts`
- `src/meta-messaging/types.ts`
- `src/join/types.ts`
- `api/_shared/provider-messages.ts`
- `api/_shared/provider-join-service.ts`

## Findings

Messenger and Instagram shared payload builders, so localization had to branch on the provider to avoid changing Instagram copy.

## Changes made

- Localized Messenger invitation capacity text and quick replies.
- Localized joined, duplicate, pending, waitlist, full, closed, missing, and rejected results.
- Localized calendar and map action labels for Messenger only.
- Preserved existing payload IDs, provider routing, and Instagram copy.
- Added focused unit coverage for the Russian invitation and duplicate-Join response.

## Checks

- `pnpm exec vitest run src/meta-messaging/payload-builders.test.ts` — PASS (5 tests).
- `pnpm run lint` — PASS.
- `pnpm run build` — PASS.
- `pnpm run test` — PASS (35 files, 181 tests).
- `pnpm run typecheck` — PASS.
- `git diff --check` — PASS.

## Next step

Deploy a preview and repeat the Messenger invitation, Details, Join, and duplicate-Join smoke test to confirm the Russian copy in the real conversation.
