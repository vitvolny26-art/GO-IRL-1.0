---
title: SHARE004 Premium Template V2
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# SHARE004 Premium Template V2

## Task

Implement the supplied premium Beauty card composition as a versioned dynamic server template.

## Changes made

- Added the `premium-v2` double frame, left shade and gold treatment.
- Added a large top-right dynamic monogram/logo slot.
- Added dynamic title, two-line description and up to three service rows.
- Added lower-right public location.
- Kept Telegram output at 1080x900 without an in-image CTA.
- Kept default web/WhatsApp output at 1080x1020 with a separate CTA footer.
- Increased fingerprint version to 3 and persisted template version to 2.

## Scope boundary

The professional workspace Canvas preview remains unchanged in this bounded PR. It requires a separate visual-parity patch and browser smoke so the server renderer is not coupled to unverified client font and Canvas behavior.

The supplied Google Font import is not used by the server renderer. Server output uses deterministic installed serif fallbacks so JPEG generation does not depend on an external font request.

## Safety

No auth, RLS, SQL, migrations, secrets, environment, production data, merge or deployment changes.

## Checks

- `pnpm run repo:check` — PASS
- `pnpm run lint` — PASS with one pre-existing warning
- `pnpm run typecheck` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS, 153 files / 720 tests
- `pnpm run test:staff-os` — PASS
- `git diff --check` — PASS
