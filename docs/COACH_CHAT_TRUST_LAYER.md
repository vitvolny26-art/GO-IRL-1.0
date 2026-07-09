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

## Why Coach next to Chat is powerful

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

## Generic event bridge

The current restore patch mounts `CoachRequestPanel` near `ActivityChatPanel` for non-sport generic event sheets.

This is a pragmatic stabilization bridge, not the final product language.

The bridge is acceptable because it restores the trust layer without rewriting a large `App.tsx` or creating a new Event Roles system before beta.

But it must be treated carefully:

- It does **not** mean Coach is universal.
- It does **not** mean guides, hosts, tutors, or game masters are part of Coach MVP.
- It does **not** introduce payments or marketplace behavior.
- It does **not** change Supabase RLS/auth/schema.
- It should later migrate to Event Roles if the pattern proves value.

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
Temporary Coach/Role bridge block
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
| completed | Event passed | Optional historical |
| rejected / cancelled | No active support | No |

Only confirmed support should create a public confidence badge.

Pending requests must never look like confirmed trust.

## Activity Chat boundary

Activity Chat is not a social feed.

It is temporary event coordination.

It should support:

- “I am coming.”
- “Where exactly do we meet?”
- “I am a beginner, is it okay?”
- “Who brings the ball / game / equipment?”
- “I am five minutes late.”

It must not become:

- permanent group chat replacement;
- direct messaging;
- public comments;
- dating chat;
- post-event social feed.

## Metrics

This layer should be judged by real-life outcomes, not UI activity alone.

Primary metrics:

- Join -> show-up rate.
- Join -> first chat message.
- Chat active before event.
- Beginner comfort feedback.
- Repeat attendance.
- Event cancellation/no-show rate.

For Sport Coach specifically:

- confirmed coach events vs no-coach events;
- beginner comfort yes/no;
- organizer coach-request conversion;
- coach badge open/click rate.

For future Event Roles:

- role-confirmed events vs no-role events;
- role badge open/click rate;
- category-specific attendance improvement.

## Implementation guardrails

- Do not rewrite large `App.tsx` surfaces just to mount the trust layer.
- Prefer small component-level patches.
- Do not duplicate Coach in sport details.
- Do not change Supabase RLS/auth for UI placement work.
- Do not add payments.
- Do not add universal role tables before Sport Coach proves value.
- Do not show public badges for pending requests.
- Do not claim beta-ready until lint/build/test pass.

## Future architecture

If Sport Coach proves value, the generic bridge should evolve into Event Roles.

Future tables may include:

- `event_role_profiles`
- `event_role_requests`
- `event_role_assignments`
- `event_role_reviews`

At that point:

- Sport Coach can stay as a sport-specific module or migrate into Event Roles.
- Generic event sheets should render role blocks through a role abstraction.
- `CoachRequestPanel` should not remain the generic UI name for non-sport roles.

## Product summary

The idea is not:

```text
Add Coach everywhere.
```

The idea is:

```text
Every real-life event needs enough trust for people to actually show up.
```

Sport proves this through Coach.

Other categories later get native roles.

Chat stays next to the role because both features solve the same beta problem:

> Make the event feel real, safe, and socially easier before the user arrives.
