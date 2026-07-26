---
title: Agent Report
owner: AI Fixer
status: Complete
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-07-27
---

# Agent Report

## Task

Verify Messenger sharing renders the GO IRL event preview rather than the generic Telegram bot card.

## Files inspected

- `src/cardShare.ts`
- `src/cardShare.test.ts`
- `src/components/CardShareAction.tsx`
- `api/meta/event-preview.ts`
- `api/meta/event-invitation-card.ts`

## Findings

- The share menu contains Telegram, Messenger, and native share only.
- Instagram and WhatsApp are absent.
- Messenger uses the official Send Dialog with the GO IRL preview URL.

## Changes made

- No application code changes in this verification pass.
- Recorded production smoke evidence.

## Checks

- GitHub CI and Vercel deployment are green.
- Production preview endpoint returned HTTP 200 for a real public event.
- Verified dynamic `og:title`, `og:description`, signed `og:image`, canonical preview URL, and image size `1200x630`.
- No auth, RLS, migration, secret, or database write changes.

## Next step

Perform one manual Messenger share from the Telegram Mini App using a fresh event URL to confirm Meta cache behavior.