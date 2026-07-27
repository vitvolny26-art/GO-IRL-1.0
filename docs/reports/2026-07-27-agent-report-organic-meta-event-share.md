---
title: Agent Report — Organic Meta Event Sharing
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-27
next_review: 2026-08-03
---

# Agent Report

## Task

Provide event-specific invitation-card sharing to WhatsApp, Instagram, Facebook, and Messenger without requiring GO IRL to enable production Meta Business messaging.

## Files inspected

- `src/cardShare.ts`
- `src/cardShare.test.ts`
- `src/cardShareNavigation.ts`
- `src/components/CardShareAction.tsx`
- `src/invitationLink.ts`
- `src/App.tsx`
- `public/messenger-share.html`
- `api/meta/event-preview.ts`
- `api/meta/event-invitation-card.ts`
- `api/_shared/telegram-share-event.ts`

## Findings

- The current public event-preview endpoint already supplies event-specific Open Graph metadata, a generated event image, a Google Calendar action, an optional map action, and a Telegram join action.
- WhatsApp was receiving the Telegram deep link instead of the public preview URL, so rich previews were not guaranteed.
- Messenger used the Meta Send Dialog or an intermediate share bridge. The Send Dialog is not reliable on mobile and can require Meta app configuration.
- Instagram was absent from the event-card share menu even though the browser can pass the same event-preview URL to the operating system share sheet.
- Organic sharing can distribute the public event card without production Meta Business messaging. Native bot buttons, proactive messages, and automatic reminders still require the relevant approved provider integration.

## Changes made

- Added one provider-neutral organic share payload using the event-specific public preview URL.
- Changed WhatsApp sharing to send the public preview URL, allowing WhatsApp to fetch the event-specific Open Graph card.
- Added Instagram to the event-card share menu.
- Changed Messenger and Instagram actions to use the native operating-system share flow directly, with copy fallback when Web Share is unavailable.
- Removed the runtime dependency on the unsupported Messenger Send Dialog from the event-card action.
- Kept Telegram sharing on the prepared Telegram event-card flow.
- Added focused unit coverage for the new URL and payload behavior.

## Checks

- `pnpm run lint` — PASS with one pre-existing `no-console` warning in `api/_shared/admin-authorization.ts`.
- `pnpm run typecheck` — PASS.
- `pnpm run build` — PASS.
- `pnpm run test` — PASS, 104 files and 497 tests.
- Focused card-share tests — PASS, 15 tests.

## Risks

- Instagram and Messenger do not expose a stable public deep link for preselecting a recipient with arbitrary rich-link content. Without production Meta Business messaging, the operating system share sheet remains the safe supported path.
- The final visual preview is controlled by each receiving app's link scraper and cache. A previously cached card may take time to refresh.
- Native inline chat buttons and proactive outbound bot messages are not part of organic sharing.

## Not touched

- `.env` and secrets
- Supabase auth, RLS, schema, SQL, and migrations
- Meta production messaging configuration
- WhatsApp templates and Flows
- Provider webhooks, persistence, and reminder delivery

## Next step

Create a preview deployment and perform one physical-device smoke test per channel using a current public or invite-only event:

1. WhatsApp opens directly with the event-preview URL and renders the event card.
2. Facebook Share renders the same event card.
3. Messenger native share sends the same event-preview URL without the Send Dialog error.
4. Instagram native share sends the same event-preview URL through the operating system share flow.
5. Calendar and Telegram join actions on the public preview remain functional.
