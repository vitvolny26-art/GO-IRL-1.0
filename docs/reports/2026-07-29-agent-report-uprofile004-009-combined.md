---
title: UProfile004-009 Combined Profile Slice
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-29
next_review: 2026-08-05
---

# Agent Report

## Task

Combine the safe, non-migration parts of UProfile004 through UProfile009 into one reviewable pull request and one final squash commit.

## Files inspected

- `src/App.tsx`
- `src/components/ProfilePanel.tsx`
- `src/components/ProfilePreferences.tsx`
- `src/profile/profileTypes.ts`
- `src/profile/profileMappers.ts`
- `src/profile/profileRepository.ts`
- `src/profile/supabaseProfileRepository.ts`
- `src/profile/organizerIdentityResolver.ts`
- `src/components/ParticipantIdentityLabel.tsx`
- `src/components/ActivityChatPanel.tsx`
- `src/mapProvider.ts`
- `src/mapyRuntimeLinks.ts`
- `src/calendar/googleCalendar.ts`
- active UProfile implementation roadmap

## Findings

- Profile save previously trusted the RPC payload without authoritative refetch verification.
- Public profile projection already used an explicit allowlist, private-profile null projection and historical snapshot fallback.
- Profile interests were a flat legacy list with no canonical six-category state model or five-favorite cap.
- My GO IRL displayed existing groups but did not expose an authoritative future/past lifecycle summary.
- Map and calendar provider adapters already existed; runtime map opening is intercepted by the provider picker and calendar URL generation reads the selected provider.
- No owned privacy route or public profile preview existed.

## Changes made

- UProfile004: added save owner validation, authoritative refetch and normalized server-state verification.
- UProfile005: preserved strict public projection and snapshot fallback boundaries; no private fields were added to public contracts.
- UProfile006: added six canonical beta interests, favorite/interested/want-to-try/hidden states, five-favorite cap, legacy migration and account-scoped local private goals.
- UProfile007: added authoritative My GO IRL lifecycle projection and summary for upcoming created, upcoming joined, pending and past events.
- UProfile008: retained existing provider adapters and verified that map runtime and calendar generation consume provider preferences.
- UProfile009: added `/profile/privacy`, repository-backed visibility controls, public preview, Privacy Notice, beta Terms, truthful 18+ wording and an explicit unavailable state for data-rights requests pending support backend.
- Added focused unit tests and bounded profile UI styles.
- Kept Vercel Preview disabled for the task branch.

## Checks

- GitHub Actions Test: PENDING on final exact head.
- GitHub Actions Typecheck: PENDING on final exact head.
- GitHub Actions Lint: PENDING on final exact head.
- GitHub Actions Build: PENDING on final exact head.
- Production deployment: NOT RUN.

## Risks

- Private goals are intentionally local/account-scoped until protected backend persistence and RLS are separately approved.
- Rights-request submission is intentionally not simulated; the UI states that support backend is not connected.
- Telegram physical-device smoke remains required before production merge.
- The branch contains multiple development commits; merge must use squash to produce the requested single commit in `main`.

## Not touched

- Auth and trusted Telegram session logic.
- Supabase schema, SQL, migrations and RLS.
- Secrets and environment files.
- Event creation, event chat and production data.
- Automated reminders or unsupported Meta delivery claims.

## Next step

Run GitHub Actions on the exact head, fix only exact red blocks, update this report with final evidence, then request separate production merge approval.
