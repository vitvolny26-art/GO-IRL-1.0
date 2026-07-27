---
title: Unified event-card primary controls
owner: UX Lead
status: Partial
source_of_truth: false
last_review: 2026-07-28
---

# Task

Move Participants and Chat higher and make Sport and generic Event cards use the same Event-card template.

# User problem

The same participant and chat actions used different placement across Sport and generic Event cards, weakening hierarchy and consistency.

# Proposed change

1. Use the shared `unified-event-card` shell for the runtime primary-control stack.
2. Place Participants directly below Reminder and Share.
3. Place Chat directly below Participants only when event-chat access exists.
4. Keep Sport optional metadata below the primary controls.
5. Reuse the Event template dimensions: 82px controls, 31px height, 14px icons.

# Acceptance criteria

- Sport and generic Event cards use identical Participants and Chat geometry.
- Participants opens the inline dropdown on both card types.
- Chat delegates to the existing card chat action.
- Chat remains hidden without access.
- Reminder, Share, Join and Details behavior remain unchanged.

# Evidence ledger

Claim | Evidence | Scope
---|---|---
The Event template defines the target compact geometry | `src/all-event-card-template.css` | Unified event cards
Sport controls were implemented separately | `src/sportEventCardPolicy.ts` | Sport card runtime controls
Generic cards already use the same `unified-event-card` shell | `src/App.tsx` | Generic Event cards

# Risks

- Activity matching is text-based.
- Existing CSS overrides may affect exact mobile offsets.
- Telegram mobile visual smoke is required.

# Blockers

- CI is pending.
- Merge and production deployment are not included.
