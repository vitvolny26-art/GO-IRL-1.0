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

Pending exact-head GitHub Actions.

Required physical smoke after deployment:

1. `beauty_share_cards` contains the professional profile row with `status=ready` and non-null `generated_object_path`.
2. `beauty-share-cards/<userKey>/beauty-share-card/generated/current.jpg` exists.
3. Telegram prepared message renders the exact workspace JPEG.
4. WhatsApp flow opens the external bridge and the Android chooser receives the JPEG.
5. Selecting WhatsApp sends the same artwork shown in the workspace.

## Rollback

Revert the eventual squash merge commit. No database rollback is required.

## Next step

Run exact-head CI, review the diff, then keep the PR unmerged until explicit approval.
