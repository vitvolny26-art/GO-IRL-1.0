---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-08-20
---

# Agent Report

## Task

Fix the Messenger share flow after physical-device testing showed a cropped card, automatic Telegram redirect, missing web actions, and Facebook post composer instead of recipient selection.

## Files inspected

- src/components/CardShareAction.tsx
- src/cardShare.ts
- api/meta/event-preview.ts
- api/meta/event-invitation-card.ts
- api/_shared/telegram-share-card-image.ts
- api/meta/event-invitation-card.test.ts

## Findings

- The Facebook share dialog opens a post composer, not a Messenger chat picker.
- The event preview page immediately redirected to Telegram.
- The 1080x900 image was cropped by Facebook preview rendering.
- The preview page had no calendar, details, or Telegram actions.

## Changes made

- Messenger now uses the device share picker with the GO IRL event preview URL.
- Removed automatic Telegram redirect from the preview page.
- Added web actions for calendar, event details, and Telegram.
- Rendered Meta preview images at 1200x630 with contain fitting to prevent cropping.
- Updated image-dimension regression coverage.
- Removed the temporary report placeholder accidentally created during setup.

## Checks

- Pending GitHub CI: test, typecheck, lint, build.
- Pending Vercel Preview.
- Physical Messenger smoke required after deployment.

## Next step

Merge only after CI and Vercel are green, then verify the recipient picker, uncropped card, and all three web actions on Android.