---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-07-25
---

# Agent Report

## Task
Apply the redesigned event-details template to all GO IRL event types, including the shared hero, location experience, organizer/participant profiles, event chat unread state, and Meta sharing paths.

## Role
AI Fixer

## Sources inspected
- GitHub `main` at `cf81ac8ab2e9da70bea88c670bd637ead44ab592`
- Active generic event sheet in `src/App.tsx`
- Active sport event sheet in `src/verticals/SportVertical.tsx`
- Existing event artwork, profile, chat, map normalization, calendar, Telegram share, and Meta messaging paths
- Existing merged Messenger referral/rich-card flow from PR #294
- Google Drive AI Fixer operating instruction mirror
- ClickUp search for a matching universal event-details task

## Files inspected
- `src/App.tsx`
- `src/verticals/SportVertical.tsx`
- `src/components/ActivityChatPanel.tsx`
- `src/activityChatFeature.ts`
- `src/components/EventCardPrimitives.tsx`
- `src/components/OrganizerProfilePortal.tsx`
- `src/components/OrganizerEventDetailsPortal.tsx`
- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `src/cardShareNavigation.ts`
- `src/eventLocationMap.ts`
- `src/mapyRuntimeLinks.ts`
- `api/meta/event-preview.ts`
- `src/meta-messaging/payload-builders.ts`

## Findings
- Generic and sport events used separate detail-sheet presentations, but shared actions and data contracts already existed.
- A shared portal can add one universal presentation without rewriting the existing join, moderation, category-specific detail, or chat implementations.
- The existing global Mapy.com legacy normalizer would rewrite Google Maps links unless an explicit provider choice bypass was added.
- Chat messages already contain sender keys and timestamps, allowing a client-side unread marker without schema or RLS changes.
- The existing Messenger webhook flow already converts `event:<uuid>` referrals into a rich event card after a concrete PSID is available.
- Vercel Preview is currently blocked by the free-plan daily deployment limit, not by an application build regression.

## Changes made
- Added one universal event-details portal for both generic and sport sheets.
- Added shared artwork hero with title, description, visibility, date/time, address, and outdoor weather.
- Added a full-width OpenStreetMap preview that requires no API key.
- Added Mapy.com, Google Maps, and Apple Maps route choices with persisted user preference.
- Preserved legacy Mapy.com normalization while respecting explicit Google/Apple provider choices.
- Added clickable organizer and participant public-profile actions.
- Added persisted per-event unread chat counting and a shared chat action.
- Added a separate Facebook share action.
- Routed Messenger event sharing through the existing Meta preview endpoint and `m.me` referral path so the established webhook can return the rich event card.
- Reused the existing `api/meta/event-preview.ts`; no new Vercel Function was added.
- Made public profile-sheet copy role-neutral for organizers and participants.
- Added focused regression tests for map targets, explicit provider bypass, unread counts, Facebook sharing, and Messenger referral URLs.

## Checks
- Initial GitHub Actions CI run #978 failed at Test because the map-provider helper used the wrong coordinate property names.
- The coordinate contract was corrected from `lat/lng` to `latitude/longitude`.
- Exact functional head: `ba29a16e4b9d833e81009576aa32a83d6a5dff2e`.
- GitHub Actions CI run #979: PASS.
- `pnpm run test`: PASS in CI.
- `pnpm run typecheck`: PASS in CI.
- `pnpm run lint`: PASS in CI.
- `pnpm run build`: PASS in CI.
- Local clone/check execution was unavailable in the current tool environment because DNS resolution for `github.com` failed.
- Vercel Preview: BLOCKED by `api-deployments-free-per-day` after more than 100 daily deployments.
- Physical mobile QA: not yet performed.

## GitHub
- Branch: `feat/event-details-sheet-v2`
- Draft PR: #347 `feat: apply universal event details template`
- Functional head: `ba29a16e4b9d833e81009576aa32a83d6a5dff2e`
- CI: run #979, success
- Merge: not performed

## ClickUp
- Search found no matching task for the universal event-details work.
- No task was created because the ClickUp connector requires an explicitly selected list.
- No completion status was claimed.

## Google Drive
- AI Fixer operating instructions were inspected.
- No authoritative instruction or production configuration was changed.
- A non-authoritative report mirror should be stored under `AI Reports / AI Fixer / 2026-07-24`.

## Blockers
- Vercel Preview cannot run until the daily deployment limit resets or capacity is increased.
- Physical mobile QA is still required for generic and sport events, provider persistence, profile actions, unread chat, Facebook preview, and Messenger rich-card delivery.

## Next step
After Vercel capacity becomes available, obtain a Preview for the exact PR head and run the physical QA matrix. Keep PR #347 Draft until both gates are green.
