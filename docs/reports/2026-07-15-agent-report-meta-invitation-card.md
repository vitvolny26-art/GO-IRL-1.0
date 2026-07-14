---
title: Agent Report — Meta Invitation Card Standard
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Implement the GO IRL branded invitation-card standard for WhatsApp, Instagram Direct, and Facebook Messenger without changing auth, Supabase RLS, migrations, or secrets.

## Files inspected

- Existing Telegram share-card renderer, signed image endpoint, and tests.
- Meta and WhatsApp payload builders, provider send service, webhook flow, and event lookup.
- `docs/architecture/META_MESSAGING_MVP.md` and `docs/architecture/WHATSAPP_MVP.md`.

## Findings

- Provider Join and confirmation paths already existed, but invitations were text-only.
- The Telegram SVG/JPEG pipeline could safely provide the visual basis without adding a rendering dependency.
- Instagram and Messenger can wrap the image in provider-native Generic Template actions. WhatsApp can attach it as an interactive image header inside an active conversation.

## Changes made

- Added a provider-neutral rich invitation summary.
- Added a 1080x1080 Meta rendering variant with optional weather and the GO IRL event-card layout.
- Added a signed, expiring public JPEG endpoint at `/api/meta/event-invitation-card`.
- Added automatic image URL generation using existing server-side Meta/Vercel runtime values, with a text-only fallback.
- Added Instagram/Messenger Generic Template payloads and a WhatsApp image header.
- Added unit coverage for rendering, signatures, endpoint output, provider payloads, and fallback behavior.

## Checks

- Targeted Vitest: PASS — 6 files, 23 tests.
- `pnpm run typecheck`: PASS.
- `pnpm run lint`: PASS.
- `pnpm run build`: PASS.
- `pnpm run test`: PASS — 43 files, 229 tests after rebasing onto current `origin/main`.
- `pnpm run typecheck`: PASS (final gate).

## Risks

- Meta controls final message spacing, cropping, and native button appearance.
- WhatsApp business-initiated messages outside the service window still require an approved media template in Meta.
- Live delivery remains subject to channel permissions, app review, account connections, and valid production credentials.

## Not touched

- `.env` files or production credentials.
- Auth, Supabase RLS, SQL, migrations, or persistence.
- Telegram share behavior.

## Next step

Run the complete quality gates, publish a preview, and smoke-test one real invitation per connected Meta channel.
