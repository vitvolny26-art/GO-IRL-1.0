---
title: "Mobile Messenger share bridge"
date: 2026-07-21
status: completed
scope: frontend, sharing
---

# Mobile Messenger share bridge

## Task

Replace the mobile Messenger marketing-page fallback with a working share flow from Telegram WebView.

## Findings

- Telegram WebApp `openLink` correctly opened the HTTPS fallback in an external browser, but the target was the generic Messenger marketing homepage and could not carry an event invitation.
- Telegram's embedded Android WebView does not reliably expose Web Share, while Web Share requires a direct user activation.
- There is no supported universal mobile-web URL that opens Messenger with arbitrary prefilled text and a link.

## Changes

- Added a lightweight same-origin `messenger-share.html` bridge.
- The bridge receives the exact event title, date, address, and deep link through encoded query parameters.
- A direct tap on the bridge invokes the browser's native Web Share menu, where Messenger can be selected with the invitation already populated.
- Added localized Russian, Ukrainian, Czech, and English UI.
- Preserved a robust copy fallback when Web Share is unavailable.
- Replaced the generic `messenger.com` fallback target with the same-origin bridge URL.
- Added regression coverage for the exact bridge payload.

## Verification

- ESLint passed.
- Vitest passed: 57 test files, 296 tests.
- Production Vite build passed and includes `dist/messenger-share.html`.
- Typecheck remains blocked by the pre-existing `src/meta-messaging/payload-builders.test.ts` union-narrowing error; the failing file and its types are unchanged by this task.

## Not changed

- Telegram sharing, desktop Messenger Send Dialog, event data, authentication, database schema, and RLS policies were not changed.

## Next step

Deploy and smoke-test the two-tap bridge flow from Telegram Android: Messenger icon, then share button, then Messenger in the native chooser.
