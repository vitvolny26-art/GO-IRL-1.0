---
title: Agent Report — Canonical Beauty sharing output
owner: Release Manager
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Unify the Beauty sharing output so WhatsApp no longer requires manual JPEG attachment, Telegram sends one captionless Beauty card with one profile action, and both channels use the approved 1080×1350 Beauty design.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/beauty/BeautyShareCardEditor.tsx`
- `api/meta/event-preview.ts`
- `api/telegram/prepared-beauty-share.ts`
- `api/_shared/telegram-event-card.ts`
- `api/_shared/telegram-share-beauty.ts`
- `api/_shared/telegram-share-card-image.ts`
- current sharing and renderer tests

## Findings

- PR #658 added the approved local Beauty editor, but production Meta and Telegram sharing still used the shared Activity renderer.
- The WhatsApp flow opened a download modal and required the user to attach the JPEG manually.
- The prepared Telegram flow used Activity metadata and renderer contracts rather than a Beauty-specific result.

## Changes made

- Added one server-safe Beauty SVG/JPEG renderer at 1080×1350 using trusted public profile and up to three service rows.
- Added adaptive text sizing for long professional and service names.
- Routed Beauty OG image and Telegram prepared sharing to the same renderer and version `v=10`.
- Beauty WhatsApp now opens with exactly one versioned preview URL and bypasses the manual download modal.
- Beauty Telegram now sends one captionless photo with one localized profile button.
- Preserved the existing Activities sharing and download flow.
- Added focused WhatsApp, Telegram, aggregation, OG metadata, SVG, and real JPEG regression tests.

## Checks

- `pnpm run repo:check`: PASS
- `pnpm run lint`: PASS with one pre-existing warning in `api/_shared/admin-authorization.ts`
- `pnpm run typecheck`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS — 148 files, 699 tests, plus Staff OS
- real Beauty JPEG: PASS — JPEG, opaque, 1080×1350, below 5 MB
- `git diff --check`: PASS
- final runner execution: n8n `8437`, SSH exit code `0`

## Not touched

- Activities card renderer or UX
- auth, roles, RLS, SQL, migrations, secrets, `.env`, Supabase Storage, or production data
- `main`, production, VPS deployment, Vercel production, DNS, or domains

## Next step

Open a Draft PR for exact-head GitHub Actions. Merge and production deployment require separate approval after exact-head CI and mobile provider smoke.
