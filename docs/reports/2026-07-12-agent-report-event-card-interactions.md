---
title: Agent Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Agent Report

## Task

Align bottom navigation and Sport event cards with the approved shared event-card interaction contract shown in the supplied mobile screenshot.

## Files inspected

- `src/App.tsx`
- `src/verticals/SportVertical.tsx`
- `src/card-action-sheets.ts`
- `src/styles.css`
- `src/all-event-card-template.css`
- `src/compact-sport-card.css`
- `src/compact-sport-card-final.css`
- `docs/onboarding/WEB_DESIGNER_AGENT.md`
- `docs/bible/06-ux-interaction-guidelines.md`
- `docs/COACH_CHAT_TRUST_LAYER.md`
- `docs/SPORT_COACH_MVP.md`

## Findings

- Create used an unconditional fourth-navigation-item lime block, so it looked selected even when another view was active.
- The card-details trigger covered the avatar and copy instead of exposing the event avatar as the intentional pointer target.
- Sport details used a different source order and state contract from the generic card.
- Sport Join omitted waiting/private states and showed a participant-derived label for organizers even though its click opened details.
- Sport Coach used a participant-group icon despite the documented `Dumbbell` icon contract.
- Sport map fallback was hard-coded to Olomouc instead of the activity city.
- Telegram sharing placed the same deep link in both the dedicated URL parameter and message text.
- Reminder delivery has no approved backend contract yet and is planned through n8n.

## Changes made

- Removed the always-highlighted Create icon styling; all five navigation items now use the same active-state contract.
- Limited pointer opening of event details to the event avatar while retaining keyboard activation on the existing semantic button.
- Applied the shared generic-card class/order to Sport: date/time, price, address, level/status.
- Lightened Sport duration and participant chips.
- Map uses the exact address when present and otherwise the configured activity city.
- Telegram Share uses the event deep link once; WhatsApp/Viber retain the link inside their message body and Messenger receives the URL.
- Replaced the unreliable imperative card Share flyout with a card-local React `CardShareAction`; it renders the four messenger buttons vertically and toggles closed on a second Share tap.
- Removed the card Bell action until the n8n reminder contract is implemented.
- Date/time actions now open the existing Google Calendar event template; Sport duration remains informational.
- The generic card's upper-right time chip is also informational, matching Sport; only the 2x2 date/time cell opens Google Calendar.
- Restored a neutral custom equipment checkbox whose active state colors only the internal checkmark.
- Removed the legacy `sport-card-symbol::after` trophy that duplicated the real React activity icon in the large Sport sheet.
- Kept the Sport delete action floating as requested, but moved its sticky anchor to the lower-right safe-area edge and removed the previous negative vertical offset.
- Coach now reads the real organizer-request state, uses `Dumbbell`, shows needed/requested/confirmed/details copy, and opens the existing Sport detail/Coach panel.
- The confirmed Coach badge remains confirmed-only.
- Generic event cards use the parallel Event Helper copy and open the existing helper panel in details.
- Sport and generic Join cards now preserve organizer, joined/chat, waiting, pending, private, invite, full, and available states.
- Joined, waiting, and pending card actions only open details; they cannot leave or cancel from the card.

## Checks

- `pnpm run lint` — PASS
- `pnpm run typecheck` — PASS
- `pnpm run test` — PASS (18 files, 131 tests)
- `pnpm run build` — PASS
- Mobile in-app browser visual smoke check — BLOCKED: the open localhost tab was visible but unavailable to the current browser-control session.

## Risks

- Reminder Bell stays hidden until the n8n delivery contract is approved and implemented.
- Pointer hit-area is controlled with CSS pointer-events to keep this patch small and avoid restructuring card markup.

## Not touched

- Auth, Supabase, RLS, migrations, database models, event join persistence, Coach request persistence, layout architecture, or dependencies.
- Existing unrelated n8n recovery worktree files.

## Next step

Run one Telegram Android/iOS visual smoke check after deployment, then define reminder delivery in a separate product/backend task.
