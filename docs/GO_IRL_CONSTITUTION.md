---
title: GO IRL Constitution
owner: Product Owner
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# GO IRL Constitution

Read [`PRODUCT_PHILOSOPHY.md`](PRODUCT_PHILOSOPHY.md) first.

## 1. Mission

**Less scrolling. More life.**

Every major decision must make real-life participation more likely.

## 2. Positioning

GO IRL is a platform for organizing and joining local offline activities. It is not a social network, generic calendar, ticketing system, sport-only app, or permanent messenger.

## 3. Current domain

`Activity` is the current core entity. Current code, schema, migrations, auth, and RLS define runtime truth.

## 4. Architecture principles

- Offline First.
- Mobile and Telegram First.
- Community and trust First.
- API-compatible platform direction.
- Backend authority for identity, permissions, moderation, and canonical state.
- Event-driven operations where approved.
- Privacy and Safety First.
- Vertical experiences only through explicit reviewed scope.

## 5. Runtime boundaries

- Production identity comes from verified Telegram `initData`.
- Browser Demo Mode is local/demo-only.
- Supabase and RLS protect persistent product data.
- n8n handles orchestration, not core business authority.
- No client-visible secret or frontend flag may substitute for backend authorization.

## 6. Lifecycle boundaries

- Closed Beta completed on 2026-07-20.
- Release Preparation is active.
- Olomouc and the six canonical categories remain the proven default baseline.
- Broad public launch and category/vertical expansion require explicit reviewed decisions.
- Long-term platform concepts are not current implementation claims.

## 7. Product non-negotiables

- No feature that exists primarily to increase scrolling.
- No unsafe high-risk social launch.
- No permanent Activity Chat that turns GO IRL into a generic messenger.
- No future schema represented as current production truth.
- No documentation override of code, applied schema, auth, or RLS.
- No provider marked enabled without provider-specific production evidence.
