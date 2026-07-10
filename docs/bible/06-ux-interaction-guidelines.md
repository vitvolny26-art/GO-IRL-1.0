---
title: Bible UX and Interaction Guidelines
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-10
next_review: 2026-08-10
---

# Bible UX and Interaction Guidelines

## Purpose

This chapter defines current UX and interaction boundaries for GO IRL MVP 1.0 / MVP 1.1 beta stabilization.

It focuses on Telegram Mini App behavior, Browser Demo Mode, event cards, create/join/share/chat/profile/weather flows, and mobile-first clarity.

It is not a redesign brief and must not be used to justify a broad UI rewrite.

## UX principle

GO IRL UX must reduce the distance between intention and real attendance.

The core UX loop is:

```text
see event -> understand it -> trust it -> join/share -> coordinate -> attend
```

Every screen should help the user answer:

- What is happening?
- When?
- Where?
- Who is going?
- Can I join?
- What happens next?

## Mobile-first rule

The primary runtime is a phone inside Telegram.

Design must prioritize:

- thumb-friendly controls;
- readable cards;
- short copy;
- visible primary action;
- stable bottom areas;
- no horizontal overflow;
- safe spacing around Telegram UI chrome;
- graceful loading and error states.

Desktop/browser support is useful for demo and QA, but it must not override Telegram Mini App behavior.

## Telegram Mini App behavior

Telegram Mini App must feel native and predictable.

Expected behavior:

- app calls ready/expand behavior where implemented;
- shared `startapp` links open the intended event where possible;
- back behavior should not trap the user;
- close behavior must be explicit;
- app must not surprise-close after join/create/share actions;
- browser fallback must not replace Telegram-native flow.

Do not add iOS App Store redirects or external detours that break Mini App launch behavior.

## Browser Demo Mode UX

Browser Demo Mode exists for testing, onboarding, screenshots, and stakeholder review outside Telegram.

Demo mode must:

- open without Telegram;
- use clear demo identity;
- show Olomouc demo events;
- keep writes local/demo-only;
- clearly communicate demo saves;
- avoid production-looking trust claims.

Required demo save message:

```text
Изменения сохранены (Демо-режим)
```

Demo mode must not hide production-only issues. It should make environment differences explicit.

## Event card UX

Event cards are the main conversion surface.

Cards must show clearly:

- title;
- category/activity type;
- date and time;
- city/location;
- capacity or participant state where available;
- visibility/join state;
- primary action;
- organizer/trust signal where available.

Time rendering must be consistent across all cards.

There must be no empty time badge, empty date chip, or misleading placeholder that looks like valid event data.

## Event details UX

Event details should answer all attendance questions without forcing the user to read chat history.

Important sections:

- what;
- when;
- where;
- who organizes;
- who joined or how many joined;
- join status;
- notes for participants;
- chat entry point where available;
- coach/weather/share actions where relevant.

Avoid burying the primary action below secondary information.

## Create event UX

Create event flow must stay simple for beta.

Required qualities:

- clear fields;
- predictable validation;
- readable errors;
- city defaults suitable for Olomouc beta;
- category choices aligned with six beta categories;
- no advanced organizer tooling before beta;
- no hidden production writes from demo mode.

Do not add complex scheduling, ticketing, payment, or CRM-like fields before beta.

## Join UX

Join is a high-trust action.

The user should always understand:

- whether they joined immediately;
- whether request is pending;
- whether event is full;
- whether event is invite/private;
- whether action was saved only in demo mode;
- what to do next.

Join state must not visually contradict participant count or button state.

## Share UX

Share is part of the core event loop, not a secondary utility.

Share behavior should prioritize:

- Telegram Mini App direct links;
- correct event ID;
- clear copy;
- Open Graph support for fallback previews;
- no App Store redirect replacing Mini App open behavior.

Bug report actions must not reuse event share text.

## Activity Chat UX

Activity Chat exists to coordinate attendance.

UX rules:

- chat should stay close to event details;
- empty state must explain purpose;
- loading and send errors must be visible;
- messages should not imply long-term social networking;
- expiry/availability should be clear if surfaced;
- chat access must respect participant/organizer boundaries.

Activity Chat is not a general direct-message system.

## Sport Coach UX

Sport Coach is only for sport-related MVP 1.1 flows.

UX should communicate:

- what coach help means;
- whether a request was sent;
- whether request is pending/accepted/rejected where implemented;
- that Coach is not a marketplace before beta.

Future roles such as Game Master, Guide, Language Buddy, Host, or Icebreaker must not be mixed into Sport Coach UI until approved.

## Profile UX

Profile UX must stay minimal and stable.

Current profile basics:

- display name;
- city;
- avatar where implemented;
- saved joined/created context where available.

Edit profile must use clear action labels.

The save button must say save, not close.

Avatar behavior must respect runtime boundary:

- production -> Supabase Storage path where implemented and approved;
- demo -> local/base64/local state only.

Do not add complex public profiles before beta.

## Weather UX

Weather helps people decide whether to attend.

Weather should be lightweight and event-focused:

- icon;
- temperature;
- condition;
- wind/rain details where surfaced;
- forecast range fallback.

For events outside forecast range, explain clearly:

```text
Прогноз будет за 7 дней
```

Weather must not become a separate weather product.

## Bug report UX

Bug report must be clearly separated from share.

It should open a Telegram support link or feedback form where implemented.

Do not use `window.alert` for production bug reporting UX.

Do not copy event share text when the user taps bug report.

## Loading, empty, and error states

Every important flow needs a clear state:

- loading;
- empty;
- success;
- error;
- offline/sync issue where relevant.

Error copy should be human and actionable.

Do not expose raw technical errors to normal users unless needed for beta debugging.

## Language and copy

Copy should be short, local, and practical.

Tone:

- clear;
- human;
- not corporate;
- not manipulative;
- beginner-friendly.

Avoid vague labels such as:

- Submit;
- OK;
- Close when the action saves;
- Continue when the next step is unclear.

## Accessibility and touch targets

Small accessibility improvements are allowed during UX polish:

- semantic buttons;
- readable contrast;
- visible focus where applicable;
- useful labels;
- no tiny tap targets;
- no text clipped on common mobile widths.

Do not perform a full accessibility redesign without a dedicated task.

## Visual design restraint

Visual polish is allowed.

Large redesign is not.

Allowed before beta:

- spacing fixes;
- typography consistency;
- card hierarchy;
- button clarity;
- empty state cleanup;
- mobile overflow fixes;
- minor color/token consistency if existing system supports it.

Avoid before beta:

- new design system;
- full layout rewrite;
- animation-heavy changes;
- new dependency for UI;
- full component replacement without need.

## QA requirements for UX changes

For code UX changes, run:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Also manually smoke-test the touched flow in the most relevant runtime:

- Telegram Mini App for production behavior;
- browser for Demo Mode;
- mobile viewport for layout fixes.

Docs-only UX changes may skip local quality gates, but the report must say they were not run.

## UX decision filter

Before changing UX, ask:

1. Does this make create/share/join/chat/attend easier?
2. Does it reduce confusion or social fear?
3. Does it preserve Telegram Mini App behavior?
4. Does it keep demo and production clearly separated?
5. Does it avoid a broad redesign?
6. Can it be verified on mobile?
7. Does it avoid future-scope product expansion?

If the answer is no, defer.

## Final rule

The best GO IRL UX helps the user understand the event quickly, trust it enough to join, and leave the app to show up in real life.
