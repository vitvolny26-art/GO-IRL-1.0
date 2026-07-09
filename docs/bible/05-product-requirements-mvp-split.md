# GO IRL Bible

# Book V Audit

## Product Requirements MVP 1.0 / 1.1 Split

Version 1.0 Draft

Status: Current MVP boundary / PRD reconciliation

---

## Purpose

This document reconciles the historical Product Requirements Document with the actual GO IRL closed-beta scope.

It does not rewrite the preserved PRD.

It classifies PRD ideas into:

```text
MVP 1.0 current beta
MVP 1.1 stabilization
Future / not current MVP
Blocked before beta
```

---

## Core MVP product goal

Current MVP goal:

```text
Help people in Olomouc create, share, join, coordinate, and attend small real-life events through Telegram Mini App.
```

Core loop:

```text
create event -> share event -> join/request -> event chat -> people meet in real life
```

Everything in the PRD must be judged against this loop.

---

## MVP 1.0 current beta scope

These PRD items are current MVP 1.0 scope:

| Area | Current interpretation |
|---|---|
| Telegram access | App opens inside Telegram Mini App. Trusted auth path must be used for production identity. |
| Browse activities | User can view local Olomouc activities. |
| Create activity | User can create a simple local activity. |
| Join activity | User can join or request to join depending on visibility/state. |
| Leave activity | Allowed if implemented safely; not a blocker if product flow is otherwise stable. |
| Event chat | Temporary Activity Chat for allowed users only. Not a permanent messenger. |
| Activity card | Shows title, date/time, participants, price/free state, organizer/context, and join/share action. |
| Activity detail | Shows enough information to decide and attend: description, time, location, participants/state, share/join/chat. |
| Profile basics | Display name, city, avatar boundary, safe save behavior. |
| Error states | Errors must be understandable and user-safe. |
| Empty states | Empty states should push toward creating or joining a real event. |
| Product rule | Every screen should support real-world action. |

---

## MVP 1.1 stabilization scope

These PRD items are allowed as MVP 1.1 stabilization if implemented minimally:

| Area | Current interpretation |
|---|---|
| Filters | Simple filters only if already aligned with current categories/city. No advanced discovery system. |
| Home personalization | Lightweight dashboard only. Not an infinite feed. |
| Popular / Last Minute | Can exist as simple labels or sorting, not recommendation engine. |
| Calendar add | Nice-to-have. Do not block beta if missing. |
| Waiting list | Allowed only if current join/request model already supports it safely. |
| Notifications | Only simple Telegram/client-visible behavior if supported. No full automation platform. |
| Weather | Open-Meteo/no-key helper with safe fallback. Not a core blocker. |
| Sport Coach | Current Sport Coach request panel only. Marketplace/reviews are future. |
| Accessibility | Large touch targets and readable mobile UI are stabilization requirements. Full screen-reader audit can be later. |
| Performance | Keep app fast enough for Telegram Mini App; do not introduce heavy architecture for theoretical targets. |

---

## Future / not current MVP

These PRD items are future unless explicitly re-approved:

| PRD item | Reason |
|---|---|
| Receive reminders | Requires notification model and Telegram/client constraints. Future until implemented and tested. |
| Confirm participation | Requires attendance model and trust policy. Future. |
| Earn RLI | RLI is future reputation system, not beta requirement. |
| Add to Calendar as required flow | Useful, but not required for closed beta. |
| Natural language search | Future discovery layer. |
| People search | Future social graph risk. |
| Recommended For You | Future recommendation engine. |
| Friends Going | Future social graph/reputation layer. |
| Trust indicator | Future unless a simple current-safe indicator exists. |
| Automatic calendar sync | Future integration. |
| Full waiting-list automation | Future unless already safely implemented. |
| Multi-step reminders | Future notification automation. |
| Attendance verification | Future trust/RLI layer. |
| Reviews | Future, except schema foundation may exist. Do not claim shipped UI. |
| Community Score | Future. |
| Achievements | Future engagement layer. |
| Favorite Modules | Future personalization. |
| Account Connections | Future. |
| Blocked Users | Future moderation/privacy feature unless already implemented. |
| Theme | Non-essential for beta. |

---

## Blocked before closed beta stability

Do not build these before the core loop is stable:

- RLI public score;
- Community Score;
- achievements;
- full recommendation engine;
- people search;
- social graph;
- full notification automation;
- attendance verification;
- automatic calendar sync;
- full review product;
- complex settings surface;
- broad module switching;
- multi-city discovery;
- AI event discovery;
- dating-style profile fields;
- club CRM;
- payments or ticketing.

---

## Navigation interpretation

Historical PRD suggests five bottom navigation items:

```text
Home
Discover
Create
Notifications
Profile
```

Current MVP interpretation:

- Create must remain easy and obvious.
- Profile must be accessible.
- Activity discovery must stay simple.
- Notifications are not a required full tab before beta unless implemented.
- Navigation must not create empty future screens.

If a nav item opens a weak or unimplemented area, simplify it before beta.

---

## Home screen interpretation

Historical PRD says Home is a dashboard, not a feed.

This remains correct.

Current MVP Home may show:

- local activities;
- joined/pending context;
- last-minute or popular markers;
- create action;
- city context.

Do not turn Home into:

- infinite feed;
- AI recommendation stream;
- social network timeline;
- multi-city catalog.

---

## Module selector interpretation

Historical PRD describes broad module switching.

Current MVP must not implement full module-specific interfaces.

MVP category layer is:

```text
Volleyball
Running
Walking
Coffee meetup
Board games
Language exchange
```

A future module system can exist in architecture docs, but current beta should stay narrow.

---

## Activity chat interpretation

Historical PRD says chat closes automatically after activity ends and messages remain archived.

Current schema audit found a different current implementation direction:

```text
migration v8: expires_at = now() + interval '24 hours'
```

Therefore current safe PRD wording is:

```text
Activity Chat is temporary and exists only for event coordination.
```

Do not promise final event-end + 24h behavior until SQL/code/product decision is made.

---

## Profile interpretation

Historical PRD includes:

- Avatar;
- Display Name;
- City;
- RLI;
- Community Score;
- Achievements;
- Upcoming Activities;
- Past Activities;
- Favorite Modules;
- Calendar;
- Settings.

Current MVP profile includes only:

- display name;
- city;
- avatar boundary;
- basic activity context if already implemented;
- safe save behavior.

Future profile items must not be shown as shipped beta requirements.

---

## Settings interpretation

Settings must stay minimal before beta.

Current allowed settings:

- language if already implemented;
- profile basics;
- safe bug/report/support path if implemented.

Future settings:

- notification preferences;
- account connections;
- privacy matrix;
- blocked users;
- themes;
- calendar integrations.

---

## PRD acceptance criteria for closed beta

Closed beta PRD is satisfied when:

1. Telegram Mini App opens.
2. Browser Demo Mode opens safely.
3. User can browse Olomouc beta activities.
4. User can create an activity.
5. User can share an activity.
6. Another user can open the shared activity.
7. Join/request state works.
8. Temporary Activity Chat is accessible only to allowed users.
9. Profile basics can be saved safely.
10. Weather does not block core event flow.
11. Bug report path does not reuse share text.
12. Lint/build/test are green.
13. Vercel deployment is green.

---

## Final PRD rule

The historical PRD is a product vision draft.

The current MVP PRD is this:

```text
Prove that people in Olomouc can use a Telegram Mini App to create, share, join, coordinate, and attend real-life events.
```

Everything else is future until the loop is stable.
