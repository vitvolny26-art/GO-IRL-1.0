---
title: Closed Beta Status
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-20
---

# Closed Beta Status

GO IRL 1.0 closed beta is complete as of 2026-07-20.

## Closed beta scope

Olomouc-first Telegram Mini App flow:

`create event -> share -> join/request -> event chat -> attend IRL`

Canonical beta categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

## Acceptance evidence

- Real two-account Telegram smoke: PASS.
- Create, share, exact-event deep link, join/request, participant count, chat, and organizer visibility: PASS.
- No critical runtime bug in the tested beta loop: PASS.
- GitHub CI: PASS for test, typecheck, lint, and build.
- Vercel production endpoint and Open Graph event preview: PASS.
- Production Supabase function hardening: deployed and verified.
- Four-identity RLS matrix: PASS for organizer, joined, pending, and unrelated users.
- Closed-beta create taxonomy guardrail: present on current main.

## Closure decision

The closed beta phase is archived as completed. Remaining open issues and pull requests are future product, operations, documentation, or post-beta work unless explicitly marked as a release blocker.

This closure does not claim broad public launch readiness. Public launch remains a separate release decision with its own rollout, support, analytics, moderation, and operational gates.

## Next phase

Release preparation and focused post-beta stabilization.

1. Preserve the proven Olomouc event loop.
2. Avoid architecture rewrites and scope expansion.
3. Process one reviewed task at a time.
4. Keep GitHub main as the only source of truth.
5. Treat Google Drive, NotebookLM, ClickUp, and n8n as mirrors or workflow tools only.
