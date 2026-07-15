---
title: Agent Report — Serverless artwork import hotfix
owner: AI Fixer / QA + UX Polish Agent
status: Complete
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Incident

Telegram prepared sharing displayed an empty image and failed to send after merge `fc619cc`.

## Production evidence

- Vercel runtime logs showed repeated HTTP 500 responses from `/api/telegram/event-share-card`.
- Exact error: `ERR_MODULE_NOT_FOUND` for `/var/task/api/_shared/material-event-artwork` imported by `event-artwork.js`.
- `/api/telegram/prepared-event-share` itself continued returning HTTP 200, explaining why Telegram opened the recipient chooser before failing to load/send the image.

## Root cause

The new relative TypeScript import omitted the `.js` extension. Vitest/Vite resolved it locally, while the Node ESM serverless runtime required the emitted `.js` path.

## Fix

- Changed the import to `./material-event-artwork.js`.
- Added a regression test locking the Node ESM-compatible import contract.
- Kept the recognizable 40-event artwork registry unchanged.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (48 files, 248 tests)
- `pnpm run typecheck` — PASS
- `git diff --check` — PASS

## Not touched

- Sharing payloads, Telegram buttons, Meta behavior, auth, Supabase RLS, SQL, migrations, secrets, and environment variables.
