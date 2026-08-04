---
title: Agent Report — SHARE006 WhatsApp safe media fallback
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-18
---

# Agent Report

## Task

Remove the visible technical `/api/meta/event-preview` URL from WhatsApp sharing and preserve JPEG media sharing on Android.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShare.test.ts`
- `api/meta/event-preview.ts`

## Findings

The Android path checked `navigator.canShare()` with both files and text. Some WebViews reject that combined probe even when file sharing is supported, causing the code to open the WhatsApp URL fallback. That fallback embedded the internal preview endpoint in user-visible text.

## Changes made

- Probe native sharing support with the JPEG file payload.
- Keep the JPEG and caption in the actual native share call.
- Make the WhatsApp URL fallback use the public event or Beauty URL only.
- Add regression assertions that WhatsApp fallback text never contains `/api/meta/event-preview`.

## Checks

- `pnpm run repo:check`: PASS
- `pnpm run lint`: PASS with one pre-existing warning
- `pnpm run typecheck`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: 667 PASS
- `pnpm run test:staff-os`: PASS
- `git diff --check`: PASS

## Next step

Run all local gates, then request explicit permission before commit, PR, merge, or deployment.
