---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-07-27
---

# Agent Report

## Task

Fix Facebook/Messenger sharing so the shared item renders the GO IRL event card instead of the generic `t.me` bot contact preview.

## Files inspected

- `src/cardShare.ts`
- `src/cardShare.test.ts`
- `src/components/CardShareAction.tsx`
- `api/meta/event-invitation-card.ts`
- `api/_shared/telegram-share-event.ts`
- `api/_shared/telegram-share-card-token.ts`

## Findings

- Messenger sharing passed the Telegram deep link directly to Facebook.
- Facebook therefore scraped `t.me` and rendered `Telegram: Contact @GOirl_bot`.
- The existing signed GO IRL JPEG renderer can be reused as the Open Graph image.

## Changes made

- Added a public GO IRL event-preview endpoint with dynamic Open Graph title, description, image, canonical URL, and Telegram redirect.
- Changed the Messenger share target to share the GO IRL preview URL instead of the `t.me` URL.
- Added a regression test for the Messenger target.
- Kept Telegram and system sharing unchanged.

## Checks

- GitHub CI must pass test, typecheck, lint, and build before merge.
- Vercel Preview must succeed.
- Physical Facebook/Messenger smoke test remains required because Meta may cache previous link previews.

## Next step

Merge only after all automated checks are green, then re-share a fresh event URL and verify the GO IRL card in Facebook/Messenger.
