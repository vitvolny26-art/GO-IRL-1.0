---
title: GO IRL User Domain Bible
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-25
next_review: 2026-08-01
---

# GO IRL User Domain Bible

## Authority

This repository file is intentionally a skeleton and navigation index only.

The working long-form source is maintained in Google Drive during drafting. GitHub remains the final source of truth only after chapters are reviewed, reduced to durable decisions, and merged through a human-reviewed pull request.

## Scope

The User Domain Bible defines GO IRL identity, profile, preferences, privacy, trust, participation history, organizer capabilities and user-facing integrations.

It must remain aligned with:

- `docs/GO_IRL_CONSTITUTION.md`;
- `docs/MARKET_POSITIONING.md`;
- `README.md`;
- `ROADMAP.md`;
- `BACKLOG.md`;
- `docs/roadmap/USER_PROFILE_PREFERENCES_ROADMAP.md`;
- current code and verified Supabase runtime evidence.

## Planned chapters

1. Philosophy and boundaries
2. Identity domain
3. Interests and goals
4. Provider preferences
5. Notification domain
6. Connected services
7. Privacy model
8. Lifestyle and availability
9. Trust Center
10. GO IRL Passport
11. Organizer domain
12. Persistence and synchronization
13. Security and public/private contracts
14. Profile Hub UX
15. Beta diagnostics
16. Deferred evolution

## Drafting rule

- Full prose is written in Google Drive.
- ClickUp tracks chapter and implementation tasks.
- The AI Fixer handles one implementation task at a time.
- The Chief Archivist writes and reconciles Bible chapters.
- Only reviewed, stable decisions are promoted into GitHub.
- No migration, RLS, auth, secret or production change is implied by this skeleton.

## Current implementation anchor

Draft PR #262 preserves PROFILE-005 participant/chat identity and the active Profile Hub roadmap.

Implementation must proceed in small, independently reviewable slices with `pnpm run lint`, `pnpm run build`, `pnpm run test`, and typecheck where configured.
