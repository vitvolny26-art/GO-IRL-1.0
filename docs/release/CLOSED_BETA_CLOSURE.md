---
title: Closed Beta Closure
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-03
---

# GO IRL 1.0 Closed Beta Closure

## Decision

The Olomouc closed beta phase is closed on 2026-07-20.

The product moves from closed-beta stabilization to post-beta release preparation and measured iteration.

## Evidence

- Core two-account Telegram flow passed: create -> share -> join/request -> participant count -> event chat -> organizer visibility.
- Canonical six-category create taxonomy is enforced for the beta flow.
- GitHub CI passed test, typecheck, lint, and build on the latest validated beta changes.
- Vercel production deployment and Messenger preview endpoint returned green status.
- Production Supabase security hardening was merged and applied.
- Target SECURITY DEFINER execution privileges and explicit search paths were verified in production.
- Four-identity RLS matrix passed for organizer, joined member, pending member, and unrelated user.
- GitHub security issue #218 is closed as completed.

## Closed beta scope

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

Core loop validated:

```text
create event -> share -> join/request -> event chat -> attend IRL
```

## Not implied by this closure

Closed beta completion does not mean every future feature or backlog issue is complete.

The following remain separate post-beta work:

- physical Messenger cache smoke on a fresh event when needed;
- Sport Coach MVP 1.1 completion;
- performance and bundle work;
- notification automation;
- broader Meta entry points;
- future category expansion;
- moderation and public-launch hardening beyond the beta gate.

## Release rule

Do not reopen the closed-beta gate for unrelated future work.

New work must be classified as one of:

- post-beta release blocker;
- post-beta product increment;
- future backlog;
- operational follow-up.

## Source of truth

GitHub `main` remains the only source of truth. Google Drive, ClickUp, NotebookLM, n8n, and chat history are mirrors or operational tools only.
