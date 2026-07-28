---
title: Legacy event-card control restoration
owner: UX Lead
status: Partial
source_of_truth: false
last_review: 2026-07-28
---

# Task

Remove the newly introduced participant/chat stack and restore the previous Event-card controls consistently across generic Event and Sport cards.

# Acceptance criteria

- Generic Event keeps its existing participant control.
- Sport receives the same legacy participant presentation.
- The new runtime participant badge is removed everywhere.
- The new runtime chat control is removed and the legacy chat indicator remains.
- Sport level and environment are hidden on the main card.
- Sport duration is the fourth right-side row, right aligned, without border or background.

# Evidence ledger

Claim | Evidence | Scope
---|---|---
The new runtime stack duplicates participant and chat controls | Production screenshots on commit `30da5c9` | Main Event and Sport cards
Generic Event already owns the desired participant control and preview | `src/App.tsx` | Generic Event cards
Sport metadata currently renders level, environment and duration together | `src/verticals/SportVertical.tsx` and runtime policy | Sport main cards

# Verification pending

- Repository CI
- Telegram mobile smoke
- Merge and production deployment
