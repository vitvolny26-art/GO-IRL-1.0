---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Agent Report

## Task

Fix inconsistent participant panels on the event card and event detail, and restore the event reminder bell panel on mobile.

## Files inspected

- `src/cardParticipantsDropdown.ts`
- `src/card-participants-dropdown.css`
- `src/verticals/SportVertical.tsx`
- `src/components/CardReminderAction.tsx`
- `src/glass-event-card.css`
- `src/event-main-block.css`
- user-provided production screenshots

## Findings

- The runtime participant chip retained a competing click listener that could open the full event-detail participant modal instead of the compact card panel.
- The event-detail participant control used a separate React modal and therefore produced a different visual presentation.
- The reminder panel was rendered inside a card with forced `overflow: hidden`, allowing the bell state to change while the panel remained clipped in the mobile Telegram WebView.

## Changes made

- Removed competing runtime participant-chip listeners while retaining one delegated participant action.
- Reused the same participant header, count, identity, avatar, and row presentation on the card and inside event details.
- Replaced the event-detail modal interaction with an inline participant panel directly below the participant control.
- Corrected participant-panel anchoring and responsive dimensions.
- Allowed the reminder panel to escape the event-card clipping boundary only while it is open, with explicit mobile stacking and touch behavior.

## Checks

Exact-head GitHub Actions CI is required before review or merge.

## Next step

Open a draft pull request, run the exact-head quality gates, and stop on the first red result.
