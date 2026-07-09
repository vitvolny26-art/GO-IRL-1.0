# Coach / Role + Chat Trust Layer

## Product idea

GO IRL is not a feed, not a passive event calendar, and not another Telegram chat list.

The product exists to move a user through the real-life loop:

```text
see event -> trust event -> join -> chat -> show up in real life
```

The hardest point is trust before arrival.

A user can like an event and still not come because they think:

- “I do not know anyone there.”
- “What if I am too weak for this sport level?”
- “What if I do not understand the rules?”
- “What if nobody talks?”
- “What if I arrive and feel stupid?”
- “What if this event is not real?”

The Coach / Role + Chat layer exists to reduce that fear.

## Core thesis

Every event detail screen should eventually have two trust anchors close to each other:

1. **Role / helper block** — visible human support for the event.
2. **Activity Chat** — temporary group coordination before the event.

Together they answer:

> Who will help this event happen, and where can I talk to the group before I arrive?

The role block creates confidence.

The chat creates social commitment.

Together they increase the chance that a joined user actually shows up.

## Why Role next to Chat is powerful

Role and chat solve the same conversion problem from different angles.

| User fear | Role block solves | Chat solves |
|---|---|---|
| “I am coming alone.” | Shows a responsible/supporting person. | Lets user write before arrival. |
| “I do not understand the format.” | Explains who leads/supports the event. | Lets users ask details. |
| “Maybe this event is dead.” | Shows structure and ownership. | Shows group activity. |
| “I may not fit the level.” | Shows help is available. | Lets user say they are new. |
| “People may not come.” | Adds accountability. | Creates social commitment. |

GO IRL should not optimize for screen time.

This layer is useful only if it increases real attendance.

## Current MVP boundary

The canonical MVP 1.1 role is **Sport Coach**.

Coach means sport-only.

Sport Coach is the first proof:

> Sport events with a confirmed coach should improve show-up rate and beginner comfort.

Current Sport Coach source of truth:

- `docs/SPORT_COACH_MVP.md`
- `ROADMAP.md` -> Sport Coach MVP 1.1

## Current implementation status

Current implementation uses one component with two copy variants:

- `variant="coach"` for sport events;
- `variant="event_helper"` for generic non-sport events.

Implementation files:

- `src/components/CoachRequestPanel.tsx`
- `src/components/ActivityChatPanel.tsx`
- `src/coachFeature.ts`
- `src/verticals/SportVertical.tsx`
- `src/coach-panel.css`
- `src/main.tsx`

Merged implementation:

```text
PR #1: fix: use event helper copy for generic events
merge commit: 9b7297519aacd130e334bc1dc65fe22e8f8fc454

PR #2: feat(coach): show confirmed coach badge on sport cards
merge commit: 76b52b20da6e4297e2e5b92006ad186dd38966d0

PR #6: feat(coach): allow cancelling coach requests
merge commit: e2871dba290f414d822847c9eacc74d66b2f17a6
```

Verification:

```text
PR #1 GitHub Actions CI: PASS
PR #2 GitHub Actions CI: PASS
PR #6 GitHub Actions CI: PASS
Test: PASS
Lint: PASS
Build: PASS
```

## Generic event bridge

Generic event sheets currently mount the same underlying panel near `ActivityChatPanel`, but the UI copy must say **Помощник события**, not **Тренер**.

This is a pragmatic stabilization bridge, not the final product language.

The bridge is acceptable because it restores the trust layer without rewriting a large `App.tsx` or creating a new Event Roles system before beta.

But it must be treated carefully:

- It does **not** mean Coach is universal.
- It does **not** mean guides, hosts, tutors, or game masters are part of Coach MVP.
- It does **not** introduce payments or marketplace behavior.
- It does **not** change Supabase RLS/auth/schema.
- It should later migrate to Event Roles if the pattern proves value.

## Current UI copy rule

### Sport events

Sport events use coach copy:

```text
Тренер
Пригласить тренера
Хочу тренера
Тренер запрошен
Есть тренер
Больше не нужен
Отменить запрос
```

### Generic non-sport events

Generic events use event-helper copy:

```text
Помощник события
Нужен помощник
Хочу помощника
Помощник запрошен
Больше не нужен
Отменить запрос
```

Do not show `Тренер` in non-sport generic event sheets.

## Request cancellation rule

Active role requests must be cancellable from the same panel where they were created.

Current cancel copy:

```text
Organizer: Больше не нужен
Participant: Отменить запрос
```

Cancellation behavior:

- organizer can cancel an active `organizer_request`;
- participant can cancel their own active `participant_interest`;
- cancelled requests are excluded from the visible active status;
- cancelled requests must not create public trust badges.

Cancellable statuses:

```text
pending
matched
confirmed
```

Non-cancellable terminal statuses:

```text
cancelled
completed
rejected
```

## Badge rule

Public trust badges must be confirmed-only.

Current sport card badge:

```text
Есть тренер
```

This badge may appear only when there is a confirmed organizer coach request:

```text
requestType === "organizer_request"
status === "confirmed"
```

Pending participant interest or pending organizer request must not create a public trust badge.

Current demo rule:

- organizer coach request in browser demo becomes `confirmed`;
- participant interest remains `pending`;
- production Supabase request still starts as `pending`.

## Naming rule

A role must be understood in one second.

Do not call every helper a coach.

Correct future naming:

| Event type | Future role label |
|---|---|
| Sport | Coach / Captain / Referee |
| Board games | Game Master |
| Language exchange | Language Buddy / Conversation Mentor |
| Walking / city event | Guide / Route Leader |
| Coffee meetup | Host / Icebreaker |

Wrong naming:

```text
Everything -> Coach
```

Correct product direction:

```text
Sport -> Coach
Board games -> Game Master
Language -> Language Buddy
City walk -> Guide
Coffee meetup -> Host
```

## UI placement rule

In event details, the trust layer should stay near the chat.

Target order:

```text
Event facts
Participants / join status
Role / helper block
Activity Chat
Main actions
```

For sport events:

```text
Sport Coach block
Activity Chat
```

For generic events during the bridge phase:

```text
Event Helper bridge block
Activity Chat
```

The generic block must remain documented as temporary until Event Roles exist.

## Duplication rule

Sport events must not show duplicated Coach panels.

If a sport detail already renders `CoachRequestPanel`, Activity Chat must not inject another one.

Safe guard:

```text
activity.type !== "sport" && activity.categoryId !== "sport"
```

## State model

The trust layer must separate requested support from confirmed support.

| State | Meaning | Public trust badge? |
|---|---|---|
| no role | No support requested | No |
| requested | Organizer asked for support | No |
| confirmed | Helper/coach confirmed | Yes |
| cancelled | Request cancelled by organizer/participant | No |
| completed | Event passed | Optional historical |
| rejected | Support request rejected | No |
