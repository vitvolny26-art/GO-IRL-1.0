---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-19
---

# Agent Report

## Task

Replace the unsupported WhatsApp JPEG file-share call inside Telegram Android WebView with a two-step download-and-open flow for both Activities and Services.

## Files inspected

- `src/telegram.ts`
- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/card-share-action.css`
- `api/meta/event-preview.ts`
- `src/components/CardShareAction.whatsapp.ux.test.ts`
- `src/cardShare.test.ts`
- `tests/api/meta/event-preview.test.ts`
- Current GitHub `main` versions of the same runtime files

## Findings

- JPEG generation and preview loading already worked.
- Telegram Android WebView rejected `navigator.share({ files })` even when the prepared JPEG was valid.
- A `wa.me` URL can prefill text and a public link but cannot attach a binary JPEG.
- Telegram Mini Apps provide `WebApp.downloadFile` for an explicit native download request.

## Changes made

- Added Telegram `downloadFile`, `isVersionAtLeast`, and `version` typings.
- Added a dedicated `format=download` card URL builder.
- Added attachment headers for Activity and Service JPEG downloads while preserving `format=image` behavior.
- Replaced WhatsApp file sharing with explicit `Download JPEG` and `Open WhatsApp` actions.
- Kept an object-URL browser fallback for clients without Telegram Download API support.
- Added RU, UK, CS, and EN copy and modal styling for the new instructions.
- Added focused tests for download URLs, attachment headers, Telegram download usage, browser fallback, and the absence of WhatsApp file sharing.

## Checks

- `pnpm run repo:check` — PASS
- `pnpm run lint` — PASS with one pre-existing warning in `api/_shared/admin-authorization.ts`
- `pnpm run typecheck` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS, 677 tests plus Staff OS
- Focused WhatsApp/CardShare/API tests — PASS, 21 tests
- `git diff --check` — PASS

## Risks

- Telegram's callback confirms that the user accepted the download request; it does not prove that the file finished downloading.
- The user must still attach the downloaded JPEG manually in WhatsApp.
- A real Telegram Android smoke test remains required after release.

## Not touched

- Auth, RLS, SQL, migrations, secrets, and environment files
- Telegram prepared-message sharing
- Facebook, Messenger, Instagram, and generic native share behavior
- Production, VPS, Vercel, and n8n runtime state

## Next step

Create one release commit only after explicit permission, run GitHub Actions on that exact commit, then request separate merge and production authorization.
