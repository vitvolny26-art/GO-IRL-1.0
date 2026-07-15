---
title: Agent Report — Align Meta Templates with Telegram Share Copy
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Align WhatsApp, Instagram Direct, and Messenger invitation templates with the existing Telegram share template without duplicating business copy or changing the core join architecture.

## Files inspected

- `src/App.tsx`
- `src/share/share-template-service.ts`
- `src/share/share-model-builder.ts`
- `src/share/share-renderer.ts`
- `src/invitations/types.ts`
- `src/whatsapp/payload-builders.ts`
- `src/meta-messaging/payload-builders.ts`

## Findings

Telegram sharing already uses `ShareTemplateService.build(activity, language)` and renders a complete localized invitation:

1. greeting;
2. activity sentence;
3. location;
4. time range;
5. optional price;
6. optional low-spots warning;
7. localized closing line;
8. localized Join CTA and URL;
9. GO IRL signature.

The current Meta invitation builders duplicate a reduced template containing only title, date/time, location, and available spots. WhatsApp Flow copy and join-result copy are also partially hard-coded in English or Russian.

## Decision

The Telegram share renderer becomes the single copy source for all outbound invitation channels.

Do not copy the Telegram strings into three provider files. Add one provider-neutral adapter that converts `EventInvitationSummary` into the existing `ShareModel`, then call the existing `renderShareText` logic.

Provider builders remain responsible only for transport structure:

- WhatsApp interactive body and buttons;
- Instagram message, quick replies, and optional generic template;
- Messenger message, quick replies, and optional generic template.

## Required changes

### Shared invitation copy

Add a shared builder, for example:

- `src/share/invitation-share-model-builder.ts`
- or an equivalent minimal extension under `src/share/`

Input:

- `EventInvitationSummary`
- language
- optional URL/compact mode

Output:

- the same `ShareModel` consumed by `renderShareText`

Reuse:

- localized greetings;
- activity-specific sentence;
- location formatting;
- time range;
- price line;
- low-spots line;
- stable closing variant;
- Join CTA;
- GO IRL signature.

### WhatsApp

Update all invitation variants:

- interactive button invitation;
- image-header invitation;
- Flow invitation body.

The body must use shared Telegram-equivalent copy. Keep localized `Join` and `Details` buttons. Preserve `join:<eventId>` and `details:<eventId>` payload contracts.

### Instagram Direct

Update both variants:

- text plus quick replies;
- image generic template.

For generic templates, use a compact title/subtitle derived from the same shared model and include the full invitation text in a preceding or supported text message if the generic-card fields cannot contain the complete template safely.

### Messenger

Apply the same rules as Instagram. Do not maintain separate Russian-only helpers.

### Localization

Support the existing languages consistently:

- CS
- EN
- RU
- UK

No provider should default to Russian when `event.language` is available. Default to English only when language is missing.

### Join result copy

Keep result messages state-specific, but move their translations into one shared localized map. Align tone and GO IRL branding across WhatsApp, Instagram, and Messenger.

## Acceptance criteria

1. WhatsApp, Instagram, and Messenger invitation text contains the same content and ordering as Telegram sharing.
2. No duplicated greeting, location, time, price, low-spots, closing, CTA, or GO IRL copy remains in provider-specific builders.
3. CS/EN/RU/UK snapshots exist for all three providers.
4. Image and non-image variants are covered.
5. WhatsApp Flow invitation body is localized and aligned.
6. Existing provider payload IDs and webhook contracts remain unchanged.
7. Telegram output remains unchanged.
8. Provider payloads stay within platform constraints through compact rendering or safe truncation.
9. `pnpm run lint`, `pnpm run build`, `pnpm run test`, and `pnpm run typecheck` pass.

## Not touched

- auth;
- RLS;
- migrations;
- Supabase schema;
- Meta credentials;
- webhook signatures;
- provider identity resolution;
- join RPC behavior.

## Next step

Implement as one isolated patch under Meta Messaging Epic #83, run all quality gates, then perform one payload snapshot review for CS before live sending.
