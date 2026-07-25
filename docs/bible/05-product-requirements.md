---
title: Bible Product Requirements
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book V — Product Requirements

## Product goal

Help people create, share, join, coordinate, and attend small local activities with less friction and more trust.

Mission: **Less scrolling. More life.**

## Current lifecycle

Closed Beta is complete. Current requirements are release-preparation requirements; public launch remains unclaimed.

## Core requirements

- Telegram Mini App opens through the trusted production path.
- Browser Demo Mode remains clearly local/demo-only.
- Activity cards and details communicate what, when, where, capacity, organizer, and join state.
- Create/edit supports the current Activity model.
- Share opens the intended activity.
- Public, private, pending, waiting, and organizer states remain understandable.
- Activity Chat supports temporary coordination for authorized users.
- Sport Coach remains sport-specific.
- Weather supports attendance without blocking the loop.
- Profile supports current identity basics and provider preferences.
- Map and calendar actions honor supported provider choices.
- Reminders are server-authoritative and unavailable when trust/provider requirements are not met.
- Lifecycle messages use enabled providers only.
- Errors, loading, empty, and success states remain actionable.

## Proven baseline

Olomouc and the six canonical beta categories remain the default release baseline.

## Release-preparation acceptance

A release candidate must have current quality gates and documented Telegram, Vercel, Supabase, support, monitoring, analytics, moderation, and provider checks. Historical green evidence does not automatically validate a newer commit.

## Non-goals without explicit approval

Ticketing, payments, club CRM, public ratings, direct messages, social feed, broad multi-city catalog, dating, universal Event Roles, paid coaching, and AI recommendation feed.

## Navigation

- Previous: [`04-modules-mvp-audit.md`](04-modules-mvp-audit.md)
- Next: [`05-product-requirements-mvp-split.md`](05-product-requirements-mvp-split.md)
- Central product bridge: [`../GO_IRL_PRODUCT.md`](../GO_IRL_PRODUCT.md)
