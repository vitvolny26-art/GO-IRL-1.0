---
title: Invitation Route and Mobile Event Details Fix
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-07-31
---

# Invitation Route and Mobile Event Details Fix

## Task

Test the production application and repair the invitation route, stale visual-demo events, mobile organizer details, and missing Meta rich-card Join action without changing authentication, Supabase, production credentials, or webhook configuration.

## Files inspected

- `src/App.tsx`
- `src/store.ts`
- `src/invitationLink.ts`
- `src/components/OrganizerEventDetailsPortal.tsx`
- `src/components/OrganizerDetailAction.tsx`
- `src/meta-messaging/payload-builders.ts`
- `api/_shared/provider-messages.test.ts`
- `api/meta/event-preview.ts`

## Findings

- An unauthenticated `/join/:eventId` request entered visual-demo mode and could silently land on the home screen instead of a safe public event preview.
- Demo invitation slugs such as `demo-volleyball` were not accepted by the route parser.
- Persisted visual-demo activities could become stale across calendar days.
- Organizer details used a global `MutationObserver` portal instead of the existing React component.
- Image-based Instagram and Messenger event cards omitted the provider-native Join postback.
- The public preview linked `Подробнее` back to `/join/:eventId`, creating a loop for external unauthenticated browsers.

## Changes made

- Route unauthenticated UUID invitations to the safe server-rendered Meta event preview.
- Accept strictly formatted `demo-*` invitation slugs for local visual QA.
- Refresh seeded visual-demo events daily while preserving visible custom demo events.
- Render organizer details directly through `OrganizerDetailAction` and remove the DOM post-processing portal.
- Restore Join as the first native action on rich Instagram and Messenger cards.
- Replace the looping public-preview details button with an optional map action.
- Add focused regression tests for invitation parsing, preview URLs, demo-state rollover, and Meta payload buttons.

## Checks

- `pnpm run lint` — PASS
- `pnpm run typecheck` — PASS
- `pnpm run test` — PASS (73 files / 370 tests)
- `pnpm run build` — PASS
- Local mobile browser smoke — PARTIAL PASS: the application loads without console errors; final invitation UI verification requires a Vercel Preview because local Vite does not execute the server-rendered preview function.

## Risks

- A physical-device smoke test remains required after the Vercel Preview is available.
- The preview Join button still opens Telegram because provider-neutral web identity and web Join are a separate authenticated product flow.
- Production Meta cards change only after merge and deployment.

## Not touched

- `.env`, access tokens, secrets, and production credentials
- Supabase RLS, schema, SQL, migrations, and production data
- Authentication implementation
- Meta webhook subscriptions or provider enablement

## Next step

Publish a clean draft PR from the current `main`, verify GitHub CI and Vercel Preview, then run the invitation, map, calendar, and mobile organizer physical-device release gate.
