---
title: Beauty Share Persistence and Android Bridge
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-07
---

# Agent Report

## Task

Repair the Beauty business-card sharing chain so the generated workspace JPEG is persisted after trusted Telegram authentication, Telegram uses an image response, and Telegram Android WebView can hand the JPEG to an external system share chooser.

## Files inspected

- `src/authSession.ts`
- `src/beauty/BeautyShareCardEditor.tsx`
- `src/beauty/beautyShareCardRepository.ts`
- `src/beauty/beautyWorkspaceStorage.ts`
- `src/beauty/beautyWorkspaceSaveQueue.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShareNavigation.ts`
- `api/telegram/prepared-beauty-share.ts`
- `api/meta/event-preview.ts`
- `api/_shared/telegram-share-beauty.ts`
- `public/messenger-share.html`

## Findings

- The editor marked the card `ready` after local Canvas rendering, before Storage and the `save_my_beauty_share_card` RPC completed.
- Remote Beauty-card persistence synchronously inspected auth and silently returned when trusted Telegram auth had not completed.
- The production profile `beauty-test` had no `beauty_share_cards` row, so Telegram and WhatsApp used server-rendered fallback artwork.
- Telegram prepared sharing requested `format=download` instead of `format=image`.
- Telegram Android WebView did not expose working file sharing, forcing the manual download flow.

## Changes made

- Wait for `initializeTrustedAuth()` before trusted Beauty-card load/save.
- Fail trusted production saves instead of silently skipping missing auth or RPC.
- Keep the editor `updating` after rendering and publish `ready` only after Storage and RPC persistence succeed for the same fingerprint.
- Emit a bounded persistence event for confirmed `ready` or `error` state.
- Request Telegram photo artwork with `format=image`.
- Add a cache-busted external `beauty-share-bridge.html` that fetches the canonical JPEG and calls `navigator.share({ files })` after an explicit user click.
- Install a Telegram WebView file-share adapter without changing Activity sharing.

## Safety boundaries

- No SQL, migration, RLS, auth protocol, secret, environment, DNS, domain, or production-data mutation.
- Existing buckets, RPCs, `profile_id`, ownership checks, and optimistic conflict control are preserved.
- The bridge opens the system chooser; it cannot force WhatsApp selection.

## Checks

PR: `#690`

Initial CI:

- CI `#1810`, run `31063800533`, job `92497162572`.
- Repository check: PASS.
- Diff check: PASS.
- Tests: PASS, 158 files / 732 tests.
- Typecheck: FAIL on a Node-only test placed under `src/` and a narrowed optional Telegram `openLink` method.
- Lint, build and bundle budget: correctly skipped after the first red gate.

Corrective commit moved the static HTML assertion to `tests/public/` and captured `openLink` after the capability guard.

Green CI:

- Exact head before this report-only update: `3e82b74bfdd85176d64590b82674610852f0ed3f`.
- CI `#1813`, run `31063904099`, job `92497469197`: PASS.
- Repository check: PASS, 1292 tracked files.
- Diff check: PASS.
- Tests: PASS, 159 files / 732 tests.
- Typecheck: PASS.
- Lint: PASS with one pre-existing warning in `api/_shared/admin-authorization.ts`.
- Build: PASS, 386 modules transformed.
- Bundle budget: PASS, 10 JavaScript chunks checked.

Required physical smoke after deployment:

1. `beauty_share_cards` contains the professional profile row with `status=ready` and non-null `generated_object_path`.
2. `beauty-share-cards/<userKey>/beauty-share-card/generated/current.jpg` exists.
3. Telegram prepared message renders the exact workspace JPEG.
4. WhatsApp flow opens the external bridge and the Android chooser receives the JPEG.
5. Selecting WhatsApp sends the same artwork shown in the workspace.

## Rollback

Revert the eventual squash merge commit. No database rollback is required.

## Next step

Run final exact-head CI for this report-only commit. Keep the PR unmerged until explicit approval.
