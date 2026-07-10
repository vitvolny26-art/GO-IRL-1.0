---
title: Bible Foundation Overview
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-09
next_review: 2026-08-09
---

# Bible Foundation Overview

## Purpose

This chapter defines the foundation of GO IRL Bible.

It explains what GO IRL is, what it is not, and how all future product, architecture, market, and operational decisions must be filtered.

## Product essence

GO IRL is a Telegram-first local meetup layer for real-life activities.

The product exists to help people move from passive scrolling and fragmented chats into small, clear, real-world meetings.

Core loop:

```text
create event -> share -> participants join -> event chat -> people show up in real life
```

## Mission

Less scrolling. More living.

Any feature that increases screen time but does not increase real-life attendance must be questioned.

## Current beta focus

Closed beta focuses on:

- Olomouc, Czechia;
- Telegram Mini App runtime;
- browser demo mode for testing;
- small real-life events;
- simple event creation;
- Telegram sharing;
- one-tap join;
- temporary event coordination;
- trust signals that make people comfortable enough to attend.

## Canonical beta categories

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

These categories are enough to validate the real-life loop without turning the MVP into a generic event catalog.

## MVP 1.1 focus

MVP 1.1 is a stabilization and beta-readiness phase.

It must prioritize:

- reliability;
- UX polish;
- event card clarity;
- share/join correctness;
- Browser Mock Mode;
- profile basics;
- Sport Coach MVP;
- Activity Chat boundaries;
- weather support for event decisions;
- release and QA discipline.

It must not prioritize large new feature areas.

## Coach boundary

Coach means Sport Coach only in MVP 1.1.

Coach helps reduce beginner fear and improve attendance at sport events.

Future event roles are separate concepts:

- Game Master for board games;
- Language Buddy or Conversation Mentor for language events;
- Guide for walks;
- Host or Icebreaker for social meetups.

Do not redefine Coach as a universal helper before Sport Coach proves value.

## Non-goals before closed beta

Do not build before beta:

- ticketing;
- payments;
- subscriptions;
- club CRM;
- social feed;
- public ratings;
- direct messages;
- complex profiles;
- AI recommendations;
- broad multi-city catalog;
- dating vertical;
- friends vertical;
- travel vertical.

These may return later only after the Olomouc beta validates creation, join rate, chat activation, and real attendance.

## Source-of-truth hierarchy

When Bible conflicts with implementation or release docs, use this hierarchy:

1. Current code and Supabase schema.
2. `README.md` for implemented runtime scope.
3. `RELEASE_NOTES.md` for release state.
4. `DOCS_INDEX.md` for documentation status and source-of-truth registry.
5. `ROADMAP.md` and `BACKLOG.md` for planning.
6. Bible chapters for product philosophy and long-term structure.

Bible preserves strategic intent. It must not override current auth, RLS, Supabase schema, or runtime behavior.

## Decision filter

Before adding a product idea, ask:

1. Does it help people create, join, coordinate, or attend a real-life event?
2. Does it make Telegram sharing or joining easier?
3. Does it support Olomouc closed beta?
4. Does it improve trust or reduce social fear?
5. Can it be tested without destabilizing MVP?
6. Does it avoid turning GO IRL into a feed, calendar, ticketing product, dating app, or CRM?

If the answer is no, the idea stays future scope.

## Bible completion role

Foundation chapters must keep GO IRL focused.

Later Bible books may describe future architecture and platform expansion, but foundation chapters protect the MVP from scope creep.
