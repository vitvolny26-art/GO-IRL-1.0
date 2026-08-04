---
title: Agent Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-18
---

# Agent Report

## Task

Repair the WhatsApp share regression that exposed the technical Meta preview URL and reduced the visual invitation to a small link preview.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `api/meta/event-preview.ts`
- `src/cardShare.test.ts`
- Telegram prepared-share and card-rendering helpers

## Findings

The direct `wa.me` flow can send only text and URLs. It cannot reproduce the previous large image card. The regression passed the OG preview endpoint as user-visible message content.

## Changes made

- Reused the unified event/Beauty preview function to return the existing rendered JPEG when `format=image` is requested.
- Added native file sharing for WhatsApp so the card is sent as media with the public invitation text.
- Kept `wa.me` as a compatibility fallback when native file sharing is unavailable.
- Kept the Vercel function count at 12.
- Added regression coverage for the shared media URL.

## Checks

- `pnpm run repo:check`: PASS
- `pnpm run lint`: PASS with one pre-existing warning
- `pnpm run typecheck`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS — 667 tests
- Staff OS tests: PASS
- `git diff --check`: PASS

## Risks

Native file sharing opens the operating-system share sheet; a web page cannot force-select WhatsApp while attaching a file. Devices without Web Share file support use the text/link fallback.

## Not touched

- Telegram prepared sharing
- Supabase, auth, RLS, migrations, and secrets
- Vercel deployment and VPS

## Next step

Run CI on the exact release commit, then verify a real Android-to-WhatsApp share before production deployment.
