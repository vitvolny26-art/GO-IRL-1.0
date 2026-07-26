---
title: "Meta invitation card event actions"
date: 2026-07-21
status: completed
scope: meta messaging, invitations, web join, calendar
---

# Meta invitation card event actions

## Task

Bring Instagram Direct and Messenger invitations closer to the Telegram card standard while guaranteeing that the card image, visible facts, web action, and calendar action all describe the same event.

## Files inspected

- `api/_shared/provider-join-service.ts`
- `api/_shared/provider-messages.ts`
- `api/_shared/telegram-event-card.ts`
- `api/meta/event-preview.ts`
- `src/App.tsx`
- `src/invitations/types.ts`
- `src/meta-messaging/payload-builders.ts`
- `src/whatsapp/payload-builders.ts`

## Findings

- Provider invitations already load the trusted event-card record and render the shared Telegram/Meta image from it.
- Rich Instagram and Messenger invitations still linked their Open action to Telegram instead of the matching GO IRL web event.
- The provider summary type did not expose the canonical event date or browser-action URLs, so calendar data could not be asserted end to end.
- GO IRL already handles `/join/<eventId>` by opening the matching event in the web application.

## Changes

- Added provider-neutral `eventDate`, `openUrl`, and `calendarUrl` invitation fields.
- Reused the Telegram calendar builder so Telegram and Meta derive calendar timestamps, duration, title, and location identically.
- Built the web action as `/join/<eventId>` from the same trusted event identifier used by the card renderer.
- Updated Instagram Direct and Messenger rich cards to expose localized native `Open event` and `Add to calendar` actions.
- Kept the exact dynamic event image and bumped its cache version so Meta does not reuse an older action-era card.
- Added regression assertions for event identity, web URL, title, date/time, duration, location, and calendar details.
- Fixed the existing Meta template test narrowing so the full TypeScript gate can pass.

## Verification

- ESLint passed.
- Production Vite build passed.
- Vitest passed: 57 test files, 296 tests.
- TypeScript project build passed.
- Targeted Meta/provider tests passed: 10 tests.
- GitHub `verify` and Vercel Preview checks passed for the original implementation branch.
- Chrome smoke test confirmed `/join/demo-volleyball` opens the matching Volleyball event with `ZS Demlova, Olomouc` and `3 / 8` participants.

## Platform boundary

- Meta controls the final button chrome, media cropping, and whether a URL opens in an in-app webview or the device browser.
- Instagram Direct and Messenger support the two native web actions used here.
- WhatsApp receives the same dynamic event image and facts, but exact two-link button parity requires an approved WhatsApp template or a separate supported interaction flow.

## Not changed

- Secrets, environment files, authentication, Supabase RLS, database schema, SQL, migrations, and production Meta configuration were not changed.

## Next step

Send one real event invitation through each connected Meta channel. Compare the received card facts with the source event and verify both web and calendar actions on a physical phone.
