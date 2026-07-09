# GO IRL Bible

# Book I

## 03 — MVP Scope and Market Positioning

Version 1.0 Draft

Status: Current MVP boundary / market guardrail

---

## Purpose

This chapter defines what GO IRL is allowed to be during MVP 1.0 and closed beta.

It protects the product from becoming too broad too early.

The rule is simple:

```text
Prove the real-life meetup loop before expanding the platform.
```

---

## One-line definition

GO IRL is a Telegram-first local meetup layer for people who want to spend less time scrolling and more time meeting in real life.

Russian product line:

```text
Меньше скроллинга. Больше жизни.
```

English product line:

```text
Less scrolling. More life.
```

---

## MVP 1.0 product promise

GO IRL helps a person do five things:

1. Find a small local real-life event.
2. Create a simple local real-life event.
3. Share the event through Telegram.
4. Join or request to join the event.
5. Coordinate enough to meet offline.

The product is successful only when people actually meet.

Clicks, views, likes, and scrolling are secondary.

---

## Primary beta loop

The core loop is:

```text
create event -> share event -> join/request -> event chat -> real-life meeting
```

Every MVP feature must support this loop directly.

If a feature does not make this loop simpler, safer, or more reliable, it belongs outside closed beta.

---

## Current city focus

The current focus is:

```text
Olomouc, Czech Republic
```

The product should not expand to multiple cities until Olomouc proves:

- people understand the concept;
- event creation works;
- sharing brings real participants;
- chat helps coordination;
- at least some events happen offline;
- beta users can report bugs clearly.

---

## Canonical beta categories

Closed beta uses six categories:

```text
Volleyball
Running
Walking
Coffee meetup
Board games
Language exchange
```

These are enough because they test different behavior patterns:

| Category | What it tests |
|---|---|
| Volleyball | sport coordination, capacity, team format |
| Running | time/place precision, weather sensitivity |
| Walking | low-pressure newcomer-friendly meetup |
| Coffee meetup | casual social meetup |
| Board games | indoor group coordination |
| Language exchange | social utility, recurring community potential |

Do not add broad category systems before these six categories are stable.

---

## What GO IRL is not in MVP 1.0

GO IRL is not an event calendar.

Calendars optimize for browsing many events.

GO IRL optimizes for actually joining one real event.

GO IRL is not a ticketing platform.

Ticketing optimizes for paid access, venues, and transactions.

GO IRL optimizes for low-friction local human meetings.

GO IRL is not a sport-only app.

Sport is a strong entry point, but the product is broader: local real-life connection.

GO IRL is not a dating app.

Dating needs separate consent, safety, matching, and identity rules. It must not be launched as a normal event-join flow.

GO IRL is not a social feed.

Feeds create scrolling.

GO IRL should reduce scrolling.

GO IRL is not a club CRM.

Clubs, payments, memberships, and advanced admin tools are future scope.

---

## Market guardrail

Competitor analysis is useful only as input.

Competitor features do not automatically become GO IRL scope.

A competitor idea can enter MVP only if it passes this filter:

1. Does it help the create/share/join/chat/meet loop?
2. Can it be implemented without a big architecture rewrite?
3. Can it be tested in Olomouc closed beta?
4. Does it reduce user confusion?
5. Does it avoid turning GO IRL into scrolling, ticketing, dating, or CRM?

If the answer is not clearly yes, move the idea to backlog.

---

## MVP feature filter

Before adding a feature, ask:

```text
Will this help two real people meet this week?
```

If not, it is probably not MVP 1.0.

Allowed MVP improvements:

- clearer event cards;
- reliable event time display;
- stable create/edit flow;
- safe browser demo mode;
- better share link behavior;
- simple join/request state;
- temporary event chat;
- weather summary for event planning;
- basic profile save;
- clear bug report path;
- release and QA stability.

Blocked before beta:

- payments;
- recommendations;
- endless discovery feed;
- public ratings;
- achievements;
- multi-city expansion;
- AI automation;
- marketplace behavior;
- complex moderation dashboard;
- dating/matching;
- club management.

---

## Beta success criteria

Closed beta is successful if:

- users can open the app in Telegram;
- users understand what to do in under one minute;
- at least one event can be created without developer help;
- the event can be shared;
- another user can join or request to join;
- participants can coordinate in chat;
- people can realistically meet offline;
- bug reports are understandable;
- the product does not feel like another feed.

---

## Product behavior rule

GO IRL should always push toward real action:

```text
Choose something -> join people -> go outside -> meet.
```

The product should not reward passive consumption.

---

## Relationship to future Bible books

Future Bible chapters may describe:

- Event Roles;
- Coach marketplace;
- RLI / Trust;
- AI discovery;
- recommendations;
- notifications;
- multi-city platform;
- admin tools;
- dating vertical.

These are future directions.

They do not override MVP 1.0 scope.

For the closed beta, the MVP scope in this chapter wins.
