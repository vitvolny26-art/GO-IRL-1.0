---
title: Original Event Details Requirements
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-07-25
---

# Original Event Details Requirements

## Purpose

Preserve the owner's original event-details requirements in full. These requirements were previously summarized too aggressively as deferred work. They remain valid backlog items unless the owner explicitly cancels or changes them.

The current active step is narrower: first validate the event-specific 3:4 background while preserving the existing interface. That active step does not delete the requirements below.

## Scope rule

The final template and behavior must apply to all event types, not only Sport.

Sport-specific data may remain conditional, but shared behavior and layout decisions must have a generic event equivalent where applicable.

## Original requirements

### 1. Map opening logic

- Maps must not open directly from incidental taps on address text or other uncontrolled areas.
- Map opening should happen only through the dedicated map action shown in the location block.
- The address interaction should open a provider-choice UI rather than immediately navigating away.
- The provider-choice UI should present two horizontal buttons:
  - open in the device/default maps flow;
  - open in Mapy.cz / Mapy.com using the existing remembered location logic.
- Reuse the already implemented event coordinate and saved location logic instead of inventing a new map source.
- Preserve exact point behavior when coordinates are available.

### 2. Facebook share correction

- Current Facebook sharing is considered incorrect because it sends a raw or poor-quality technical preview.
- Facebook sharing must use the same event-card content and visual logic shown in the approved rich preview example:
  - event image;
  - event title;
  - date and time;
  - address;
  - participant count where supported;
  - correct deep link to the specific event.
- Do not expose the technical `/api/meta/event-preview?...` URL as user-facing share text.
- Facebook and Messenger are separate channels and must not be conflated.

### 3. Chat placement inside the event details structure

- The event chat must be the final row/section inside the main event information block referred to by the owner as block 2.
- It should not appear as a visually detached standalone block after unrelated controls.
- Preserve participant-only access rules.

### 4. Unread event-chat indicator on event cards

- If the user participates in the event and there are unread event-chat messages, the event card must show a dedicated unread-chat icon/badge matching the owner-provided example.
- The indicator must appear only for users who are allowed to access the event chat.
- Clicking the indicator must open the event directly with the chat focused/open.
- Own messages must not count as unread.
- Read state must be tracked per event.
- Opening the chat must clear the unread state for that event.
- A new later message must make the indicator appear again.

### 5. Participants placement

- Participants must be moved inside the same main information block referred to as block 2.
- Participant count and participant access must remain functional.
- Organizer request review, waiting-list behavior and joined-member behavior must not regress.

### 6. Sport event header cleanup

For the sport event details presentation shown in the owner's screenshot:

- Remove the upper eyebrow text such as `Любитель · На улице`.
- Remove the two large duplicate cells:
  - `Уровень — Любитель`;
  - `Формат — Любительский`.
- Do not show the same level/format information repeatedly in multiple places.
- Repurpose the small oval sport chip so it represents the level, for example `Любитель`.
- Preserve sport type/title without redundant duplication.

This requirement applies to sport-specific presentation only; generic events should not receive sport fields.

### 7. City and address composition

- Merge city and address into one compact location area.
- Remove the visible labels `Город` and `Адрес`.
- Reserve three text lines for location content.
- Expected example:
  - line 1: `Оломоуц`;
  - line 2: `ZŠ Demlova`;
  - line 3: optional additional address/location detail when available.
- The venue/address line must be underlined and light lime.
- Tapping the address opens the two-button provider-choice UI described in the map requirement.

### 8. Organizer presentation and navigation

- Remove the visible border/frame around the organizer block.
- Make the organizer container visually transparent against the event background.
- Tapping the organizer must open the full public organizer profile.
- Do not open the limited preview fragment used on the home screen.
- Returning from the full profile must restore the same event details state.

### 9. Event-details background

- The whole event-details sheet/tab must use the same event-specific image source as the main event card.
- Prefer the existing 3:4 card artwork.
- The background is static for the full visible sheet; only content scrolls.
- Text and controls must remain readable through a dark overlay.
- Switching events must switch the image without stale state.
- Missing artwork must preserve the existing fallback background.

### 10. Universal application

- Shared template decisions must apply to every event category, not only sport.
- Generic and sport events may expose different metadata, but shared location, organizer, participant, chat, unread and share behavior must be consistent.
- Do not implement a sport-only fix when the same shared behavior exists for generic events.

## Current sequencing decision

The owner later rejected the broad universal redesign from PR #347 and requested that the current interface remain unchanged while the background is tested first.

Therefore the safe sequence is:

1. Validate background-only behavior with no commits.
2. Preserve all requirements in this backlog.
3. After background approval, review the remaining requirements one by one against the current interface.
4. Implement them as separate approved tasks or a newly approved consolidated redesign.
5. Do not silently treat them as cancelled.

## Relationship to PR #347

- PR #347 attempted to solve several requirements through a new universal portal.
- The owner rejected the resulting interface.
- The requirements remain valid; the implementation approach is rejected.
- Do not merge or continue PR #347.
- Re-implement approved requirements against refreshed `main` after the background step and explicit task selection.

## Recommended task decomposition

1. Event sheet 3:4 background while preserving current UI.
2. Location block and two-provider map chooser.
3. Organizer transparent block and full-profile navigation.
4. Chat and participant placement inside the main details block.
5. Event-card unread-chat indicator and focused chat navigation.
6. Sport metadata deduplication and city/address composition.
7. Facebook rich preview correction.
8. Cross-category parity QA for all shared changes.

Only one task should be active at a time.

## Evidence references

Owner-provided screenshots in the originating chat illustrated:

- current sport sheet and duplicate metadata;
- desired Mapy.com location action;
- current chat and participant placement;
- unread-chat icon location on an event card;
- desired Telegram-style rich event card used as the share design reference.

These images are conversation evidence and may not be durable in a new chat. The successor should ask the owner to re-upload a specific screenshot only when visual detail cannot be resolved from this document.
