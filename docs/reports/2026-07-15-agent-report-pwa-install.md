---
title: Agent Report
owner: AI Fixer / QA + UX Polish Agent
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Audit and minimally repair GO IRL installability and standalone launch behavior for Issue #106. Keep Telegram Mini App behavior and protected backend scope unchanged.

## Files inspected

- `index.html`
- `package.json`
- `vite.config.ts`
- `vercel.json`
- `src/main.tsx`
- `public/favicon.png`
- `public/brand/logo-square.png`
- `public/brand/logo-square.svg`

## Findings

Before this change, the app had a theme color, favicon, and Apple touch icon, but no web app manifest and no service worker. It therefore had no declared PWA name, `start_url`, scope, standalone display mode, or required 192/512 install icons. The app could be saved as a basic browser shortcut, but did not provide a controlled install/standalone contract.

Chrome removed the service-worker fetch-handler requirement for menu installation starting with Chrome 108 on mobile and Chrome 112 on desktop. A manifest remains the portable contract for the installed name, icon, start URL, colors, and display mode. GO IRL now also includes a deliberately narrow service worker for a useful offline fallback. It does not cache the application shell, JavaScript, API responses, or event data, avoiding stale Mini App releases.

Official references:

- [Chrome installability criteria update](https://developer.chrome.com/blog/update-install-criteria)
- [Chrome installable manifest fields](https://developer.chrome.com/docs/lighthouse/pwa/installable-manifest)
- [Telegram Mini App home-screen shortcuts](https://core.telegram.org/bots/webapps)

### Resulting contract

- Name and short name: `GO IRL`
- Start URL and scope: `/`
- Display: `standalone`
- Theme color: `#0a0b0d`
- Background color: `#050607`
- PNG icons: 192×192 and 512×512, generated from the existing square brand asset
- Offline behavior: network-first navigation with a static no-connection page
- Online update behavior: application bundles are always fetched normally and are not service-worker cached

Telegram's native `addToHomeScreen()` shortcut remains a separate client capability. The manifest/service worker does not invoke it, intercept Telegram links, modify Telegram initialization, or change the Mini App UI.

## Changes made

- Added `public/manifest.webmanifest`.
- Added 192×192 and 512×512 branded PWA icons.
- Added manifest, Android standalone, and iOS standalone metadata to `index.html`.
- Added `public/service-worker.js` with network-first navigation and no application cache.
- Added `public/offline.html` as the only cached fallback.
- Registered the service worker only in production builds.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (47 files, 240 tests)
- `pnpm run typecheck` — PASS
- `pnpm exec node --check public/service-worker.js` — PASS
- `git diff --check` — PASS
- Production preview `/` — HTTP 200
- Production preview manifest — HTTP 200, `application/manifest+json`
- Production preview service worker — HTTP 200, `text/javascript`
- Production preview offline page — HTTP 200
- Browser smoke: title, root content, manifest link, and theme color present; no console warnings/errors

### Physical-device evidence

| Check | Status | Evidence needed |
| --- | --- | --- |
| Android Chrome shows Install/Add to Home screen | NOT RUN — physical device required | Screenshot of Chrome install surface on the deployed preview |
| Home-screen icon and name are correct | NOT RUN — physical device required | Launcher screenshot showing GO IRL |
| Installed launch opens `/` without browser chrome | NOT RUN — physical device required | Screenshot after launching the installed icon |
| No blank screen on installed launch | NOT RUN — physical device required | Successful rendered home screen |
| Telegram Mini App remains unaffected | NOT RUN — deployed preview and Telegram required | Open preview through Telegram and record build badge + home screen |
| Offline fallback appears | NOT RUN — physical device required | Launch installed app with network disabled |

The local in-app browser used for the smoke test does not expose service-worker installation, so it cannot replace the required Android Chrome evidence.

## Risks

- PWA installation UX varies by Chrome version, engagement signals, and device policy; a manifest alone does not guarantee an automatic prompt.
- The app still requires network access for actual event data. Offline mode intentionally shows a fallback instead of stale events.
- Existing installations may need one normal online launch before the new manifest/icon metadata is refreshed.
- Telegram's native shortcut depends on Telegram client/Bot API support and is not identical to Chrome PWA installation.

## Not touched

- Auth, RLS, SQL, migrations, schema, Supabase, secrets, or environment files
- Event UX, location-provider work, sharing, routing, or Telegram initialization
- Dependencies or deployment configuration
- GitHub, Vercel deployment, or production state

## Next step

Deploy this branch as a preview only after Tech Lead review. On an Android device, open the HTTPS preview in Chrome, install it, launch it from the home screen, verify standalone/name/icon/start route, then repeat through Telegram. Attach screenshots and device/Chrome/Telegram versions to this report or PR before merge.
