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

The creation form presents Level and Format as primary values even when organizers do not need them. The card then competes for attention between reminder/share controls, participant count, chat state and metadata.

# Evidence

- Current `main` at `a259a5c39b2aab061b0d92e13efa90e337f94510` defaults Level to `intermediate`, Format to `casual`, and Environment to `outdoor`.
- Sport cards render reminder/share separately from participant and chat state.
- Weather already depends on `environment === "outdoor"` in the Sport card and sheet.
- ClickUp search found no active task matching this exact UX change.

# Current flow

- Level and Format appear as first-row selections.
- Environment defaults to Outdoor, so the organizer can publish without making a conscious indoor/outdoor choice.
- Participant count is mixed into metadata chips.
- Unread chat is positioned independently from the participant control.

# Proposed change

1. Make Level and Format optional and persist their absence instead of synthetic defaults.
2. Make Environment a required explicit choice between Outdoor and Indoor.
3. Keep weather enabled only for Outdoor events.
4. Fix the card hierarchy to reminder/share, participants, conditional chat, then optional metadata.
5. Hide Level and Format from cards and sheets when absent.

# Acceptance criteria

- A new Sport event cannot be submitted without an Environment selection.
- Empty Level and Format values are not persisted as defaults.
- Existing events retain their explicit Level, Format and Environment values while editing.
- Reminder and Share remain the top controls.
- Participants appears directly below them and opens the inline participant dropdown.
- Chat appears below Participants only for users with event-chat access.
- Environment, duration, level and format remain below as optional metadata.
- Indoor events do not render weather.

# Accessibility and localization

- Required/optional state is text-labelled in RU, UK, CS and EN.
- Controls remain native buttons/selects with `aria-label` and focus behavior.
- Environment uses native required validation.

# Regression risks

- Runtime adaptation depends on current Sport form and card selectors.
- Existing visual override files may compete with the new hierarchy CSS.
- Real Telegram mobile smoke is required before merge.

# Evidence ledger

Claim | Evidence | Scope
---|---|---
The current form inserts synthetic metadata defaults | `src/App.tsx` and `src/verticals/SportVertical.tsx` on `main` | Sport event creation only
Weather is already controlled by Environment | `EventWeatherStrip enabled={meta.environment === "outdoor"}` and Sport sheet `showWeather` | Sport card and sheet
The requested hierarchy is a bounded core-loop stabilization change | `ROADMAP.md` active bridge: event cards, participant count, chat, share | Release Preparation and Stabilization

# Blockers

- CI has not run yet.
- Mobile visual smoke has not run yet.
- Merge and production deployment are not approved by this report.
