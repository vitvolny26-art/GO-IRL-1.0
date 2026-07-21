---
title: "Card 32 user image and mobile Messenger share recovery"
date: 2026-07-21
status: completed
scope: frontend, sharing, assets
---

# Card 32 user image and mobile Messenger share recovery

## Task

Use the user-selected dinner photo as the card 32 background instead of the plate placeholder and remove the mobile sharing failure `net::ERR_UNKNOWN_URL_SCHEME`.

## Files inspected

- `src/eventBackgrounds.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `src/cardShare.test.ts`
- `src/assets/event-backgrounds/card-3x4/32-dinner.webp`

## Findings

- Card 32 pointed to `32-dinner-v2.png`, while the event background loader only imports WebP and SVG files. The lookup therefore returned no image and the UI rendered the old plate fallback.
- The mobile Messenger fallback navigated the Telegram Android WebView to an `intent:` URL. That WebView treated the custom scheme as a page and rendered `net::ERR_UNKNOWN_URL_SCHEME`.

## Changes

- Converted the exact user-selected portrait image to a high-quality 1080x1440 WebP and placed it in the existing card 32 asset slot.
- Pointed dinner card artwork back to the supported `32-dinner.webp` mapping.
- Removed the Android `intent:` navigation path completely.
- Kept native Web Share as the preferred Messenger path.
- When native sharing is unavailable, the exact event share text is copied and Messenger is opened through an HTTPS URL supported by Telegram WebView.
- Added a legacy clipboard fallback for embedded browsers.
- Added regression coverage for the dinner asset mapping and HTTPS-only Messenger fallback.

## Verification

- Visually inspected the final 1080x1440 WebP at original resolution.
- TypeScript passed on the original task checkout. On the refreshed `origin/main`, typecheck is blocked by a pre-existing error in `src/meta-messaging/payload-builders.test.ts`; the failing Meta Messaging files are unchanged by this task.
- ESLint passed on refreshed `origin/main`.
- Vitest passed on refreshed `origin/main`: 57 test files, 296 tests.
- Production Vite build passed.

## Not changed

- Event data, authentication, database schema, RLS policies, Telegram sharing, and desktop Messenger Send Dialog behavior were not changed.

## Next step

Deploy and smoke-test card 32 plus Messenger sharing once inside Telegram on Android.
