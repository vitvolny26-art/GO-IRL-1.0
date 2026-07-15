---
title: Agent Report — Telegram event artwork registry
owner: AI Fixer / QA + UX Polish Agent
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Complete `fix/telegram-event-icon-registry` after Telegram and Meta moved to one server-side event renderer. Preserve the captionless Telegram message, replace the map action with a Prague-aware Google Calendar action, and cover all known event artwork types.

## Files inspected

- `api/_shared/event-artwork.ts`
- `api/_shared/telegram-event-card.ts`
- `api/_shared/telegram-share-card-svg.ts`
- `api/_shared/telegram-share-event.ts`
- `api/telegram/prepared-event-share.ts`
- related renderer, token, input, and endpoint tests
- `src/data.ts`

## Findings

- The branch contained the shared artwork entry point, but `telegram-share-card-svg.ts` was truncated in the middle of `metricIcon` and could not parse.
- Telegram card tests still expected the removed caption and map action.
- The calendar builder had no trusted `row.event_date` input and used the server process timezone for floating event time.
- The artwork registry did not have a full taxonomy coverage test, and the previous alias matching could classify `Table tennis` as `Tennis`.
- The unknown-event renderer still used a generic code badge instead of a neutral event/calendar icon.

## Changes made

- Restored the shared SVG layout while keeping `buildEventArtworkSvg` as the only event artwork renderer for Telegram and Meta.
- Added structured emoji and ru/cs/en aliases for all 40 known taxonomy options.
- Added longest-alias matching, neutral `EV` calendar artwork, and no emoji output in generated SVG.
- Passed the trusted ISO `event_date` into the card and built a timezone-stable Google Calendar URL with `ctz=Europe/Prague`.
- Kept Telegram `caption` empty and preserved `Открыть событие` as the first action.
- Replaced the map action with `В календарь` and bumped the prepared image cache version to `v=4`.
- Added coverage for all 40 options and shared Telegram/Meta renderer behavior.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (48 files, 246 tests)
- `pnpm run typecheck` — PASS

## Risks

- Google Calendar receives floating local date/time values together with `Europe/Prague`; malformed ISO dates intentionally omit the calendar action.
- The registry must be extended whenever a new option is added to `src/data.ts`; the 40-option coverage test will fail until it is mapped.

## Not touched

- Auth, Supabase RLS, SQL, migrations, secrets, production data, and application architecture.
- Commit, push, pull request merge, and deployment.

## Next step

Run the required quality gate, review the complete branch diff, then commit only after explicit approval.
