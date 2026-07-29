---
title: Roadmap Part 02 — Release Preparation
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Active Release Preparation and Stabilization bridge
last_review: 2026-07-29
next_review: 2026-08-09
---

# Roadmap Part 02 — Release Preparation

Canonical index: [ROADMAP.md](../../ROADMAP.md).

## Current state

Closed Beta was completed on 2026-07-20. The active phase is **Release Preparation and Stabilization**. Broad public launch is not yet claimed.

Current proven baseline:

- Browser Mock Mode works for non-Telegram usage.
- Browser demo writes are local-only and must not touch production Supabase.
- Sport details include Coach and Event Chat.
- Event cards, time rendering, support flow, weather, and Telegram `startapp` sharing have working implementations.
- The core product loop is present: create event, share, join, chat, and meet in real life.

Current release gate:

- `pnpm run lint`, `pnpm run typecheck`, `pnpm run build`, `pnpm run test`, and `git diff --check` must pass on reviewed changes.
- Real Telegram smoke verification is required before broad public launch.
- Supabase production tables, authentication, migrations, and RLS require manual production-sensitive verification.
- Vercel deployment, support, monitoring, analytics, and moderation readiness must be verified.
- Production must not depend on demo-only identity.
- Operational provider limits must be distinguished from code failures.

Do not claim public-launch-ready until the latest `main` and required operational checks provide direct evidence that this gate is green.

## Active bridge — Release Preparation and Stabilization

**State:** Active
**Goal:** Verify the post-beta product, infrastructure, operations, and real Telegram flow before broader launch.

### Workstreams

1. **Core-loop stability**
   - Keep event cards readable and reliable.
   - Stabilize join state, participant count, chat, share, and organizer controls.
   - Ensure profile basics create enough trust to join.
   - Preserve the proven Olomouc baseline unless a reviewed product decision changes it.

2. **Infrastructure hardening**
   - Verify Supabase production readiness.
   - Keep migrations safe, repeatable, and explicitly approved.
   - Harden and document RLS for user, activity, and chat data.
   - Enforce roles and permissions.
   - Maintain database verification SQL and release checklists.
   - Remove legacy local fallbacks only after production replacement is verified.

3. **Sport Coach MVP 1.1**
   - Keep Coach sport-only.
   - Stabilize coach request and confirmation flows.
   - Keep browser demo behavior local-only.
   - Show coach details and confirmed badges only from valid state.
   - Measure show-up rate and beginner comfort.

4. **Product quality and performance**
   - Improve event cards, creation, details, profile, and organizer UX only where needed for the current loop.
   - Improve empty, loading, and error states.
   - Add lazy loading, code splitting, bundle optimization, and Telegram startup improvements where evidence shows value.

5. **Release operations**
   - Verify Vercel deployment and environment configuration.
   - Verify support, monitoring, analytics, moderation, and incident readiness.
   - Run real Telegram smoke checks, including a second-account share/join flow.

### Exit criteria

This bridge is complete only when:

- the latest reviewed `main` passes all required quality checks;
- real Telegram smoke verification passes;
- production Supabase behavior and RLS are verified through approved procedures;
- production does not depend on demo-only identity;
- support, monitoring, analytics, moderation, and deployment readiness are evidenced;
- critical create-share-join-chat-meet flows have no unresolved release blocker.
