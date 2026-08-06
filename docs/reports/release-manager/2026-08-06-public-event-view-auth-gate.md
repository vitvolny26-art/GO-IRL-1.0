---
title: Public Event View Auth Gate
owner: GO IRL Release Engineer
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-13
---

# Public Event View Auth Gate

## Task

Allow unauthenticated visitors to view the existing public event landing page while keeping participation behind Telegram authentication.

## Repository and targets

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base branch: `main`
- Task branch: `fix/public-event-view-auth-gate-20260806`
- Merge target: GitHub `main`
- Deploy target: none

## Files inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/release/CURRENT_PHASE.md`
- `docs/roadmap/ROADMAP_PART_02_RELEASE_PREPARATION.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `src/App.tsx`
- `src/store.ts`
- `src/invitationLink.ts`
- `api/meta/event-preview.ts`
- `api/_shared/telegram-share-event.ts`
- `supabase/schema.sql`

## Findings

- The active roadmap explicitly requires public event-card viewing without mandatory sign-in.
- Unauthenticated `/join/:id` already redirects to the server-rendered public preview.
- The preview CTA pointed back to `/join/:id`, which redirected to the same preview and created a loop.
- The event card already exposes a canonical Telegram `startapp` invite URL suitable for authenticated join continuation.

## Changes made

- Changed the public event preview primary CTA to use the canonical Telegram invite URL from the trusted event-card payload.
- Removed the unused browser-event URL helper.
- Preserved the public preview, calendar action, authentication implementation, RLS, schema, migrations, secrets, and production data.

## Checks

- Local checkout and pnpm gates were not run because the execution container could not resolve GitHub.
- GitHub CI is required on the exact branch head before merge.
- No merge or deployment was performed.

## Rollback

Revert commit `e5812a6facec7c2554a9680b9acb704b28d62b5c` or close the PR without merging.

## Next step

Run GitHub CI, review the public landing page CTA, then merge only after all required checks pass and explicit approval is given.
