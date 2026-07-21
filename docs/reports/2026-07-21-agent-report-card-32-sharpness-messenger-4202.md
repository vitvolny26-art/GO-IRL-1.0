---
title: "Card 32 sharpness and Messenger error 4202"
date: 2026-07-21
status: completed
scope: frontend, sharing, assets
---

# Card 32 sharpness and Messenger error 4202

## Task

Remove the visible blur from card 32 sharing artwork and stop mobile Facebook Messenger sharing from failing with error 4202.

## Files inspected

- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `src/cardShare.test.ts`
- `api/_shared/telegram-share-card-image.ts`
- `assets/event-backgrounds/share-6x5/32-dinner.webp`
- `src/assets/telegram-share-backgrounds/32-dinner.png`

## Findings

- The share renderer produces a 1080x900 image, but card 32 used a heavily compressed share background of about 15 KB. Stretching it across the full canvas made the final Telegram and Meta image visibly soft.
- On mobile, the fallback after `navigator.share()` opened Facebook's web Send Dialog. That dialog is not supported for some mobile display contexts and returns API error 4202.

## Changes

- Rebuilt `assets/event-backgrounds/share-6x5/32-dinner.webp` at the renderer's native 1080x900 size from the dedicated high-resolution dinner source, with high-quality WebP encoding and light sharpening.
- Kept native Web Share as the first mobile option so Messenger receives the same exact text and deep link as Telegram.
- Replaced the failing mobile Send Dialog fallback with an Android Messenger intent.
- Added a browser fallback to `messenger.com` inside the Android intent.
- On non-Android mobile devices, the exact share text is copied before Messenger Web is opened.
- Kept the desktop Facebook Send Dialog unchanged.
- Extended the Android intent regression test to cover the browser fallback URL.

## Verification

- Visually inspected the rebuilt 1080x900 background at original resolution; fine details are preserved.
- Production build completed after rebuilding the asset.
- TypeScript typecheck passed.
- ESLint passed.
- Vitest passed: 58 test files, 314 tests.
- Production Vite build passed.

## Risks and follow-up

- A real-device smoke test in Telegram's WebView and the installed Messenger app remains the best final confirmation after deployment.
- iOS does not expose an equivalent reliable Messenger custom URL contract. The safe fallback copies the exact message and opens Messenger Web instead of invoking the unsupported Facebook dialog.

## Not changed

- Authentication, database schema, RLS policies, event data, Telegram share link format, and desktop sharing behavior were not changed.

## Next step

Deploy the verified revision and test card 32 sharing once on Android and once on iOS.

