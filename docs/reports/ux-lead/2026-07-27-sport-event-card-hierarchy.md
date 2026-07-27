---
title: Sport event form and card hierarchy policy
owner: UX Lead
status: Partial
source_of_truth: false
last_review: 2026-07-27
---

# Task

Reduce visual load in the Sport event creation flow and establish one stable control hierarchy on Sport event cards.

# User problem

The creation form presents Level and Format as primary values even though organizers may not need them. The card then competes for attention between reminder/share controls, participant count, chat state and metadata.

# Evidence

Claim | Evidence | Scope
---|---|---
The current form auto-selects level, format and outdoor environment | `src/verticals/SportVertical.tsx` and `src/App.tsx` on `main` | Current Sport create flow
Weather is already conditional on outdoor environment | `EventWeatherStrip` and Sport sheet weather checks on `main` | Sport cards and Sport details
Participant count and chat are core-loop information | `ROADMAP.md` current Release Preparation workstream | Product priority, not implementation proof

# Current flow

- Level and Format are displayed as primary selects with defaults.
- Environment defaults to outdoor.
- Card metadata and controls compete in the same visual area.
- Participant count is clickable and opens an inline dropdown.
- Chat unread is rendered separately from the participant control.

# Proposed change

1. Make Level and Format optional with an explicit empty state.
2. Require an explicit Indoor or Outdoor selection for new Sport events.
3. Keep weather visible only for Outdoor events.
4. Fix the card hierarchy to reminder/share, participants, chat when accessible, then optional metadata.
5. Hide Level and Format from cards/details when omitted instead of showing fallback values.

# Acceptance criteria

- A new Sport event cannot be submitted without selecting Indoor or Outdoor.
- Level and Format can remain empty and are absent from saved Sport metadata.
- Editing an existing event preserves explicit values.
- Outdoor shows weather; Indoor does not.
- Reminder and Share remain the first controls.
- Participants remain a direct dropdown on the card.
- Chat appears below participants only for joined users.
- Optional metadata is rendered below controls and omitted when empty.

# Accessibility and localization

- Required and optional markers are localized for RU, UK, CS and EN.
- Controls remain native buttons/selects with labels and keyboard access.
- Hidden duplicate controls are removed from tab order.

# Regression risks

- Runtime form interception depends on the existing Zustand create/update methods.
- Existing events with legacy fallback metadata continue to display their stored values.
- Card matching remains text-based and must be smoke-tested in all supported languages.

# Blockers

- CI and Telegram mobile smoke are not yet verified.
- Merge and production deployment require explicit owner approval.
