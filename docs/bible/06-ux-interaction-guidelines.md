---
title: Bible UX and Interaction Principles
owner: UX Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book VI — UX and Interaction Principles

## Goal

Reduce the distance between interest and real attendance:

```text
see -> understand -> trust -> join/share -> coordinate -> attend
```

## Core rules

- Mobile-first and Telegram-native.
- One dominant action per state.
- Explicit Back/Done/close behavior.
- No surprise Mini App close.
- No infinite feed or engagement trap.
- Clear time, place, capacity, organizer, and join state.
- Demo and production behavior visibly separated.
- Human, short, beginner-friendly copy.
- Useful loading, empty, error, and retry states.
- Accessible touch targets and no mobile overflow.

## Current interaction surfaces

- Event cards and detail sheets use category artwork without allowing imagery to obscure content.
- Create/edit can store an event point and select supported map routing.
- Profile preferences expose maps, calendars, sharing, and reminders.
- Calendar actions may route to Google, Apple, or Outlook.
- Reminder controls stay disabled when trusted auth, provider connection, or server persistence is unavailable.
- Provider defaults must not imply delivery success.
- Activity Chat remains event coordination, not a permanent messenger.
- Weather remains supporting context.

## Scope guardrail

The six proven categories remain the default Olomouc baseline. Category-specific polish is allowed; category expansion or a broad redesign requires a separate reviewed decision.
