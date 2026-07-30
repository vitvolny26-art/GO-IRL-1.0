---
title: Roadmap Part 02 — Release Preparation
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Active Release Preparation and Stabilization bridge
last_review: 2026-07-30
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

### Priority 1 — Authentication, external entry and first onboarding

Authentication is the first implementation priority and a release blocker. The governing draft is **26 — Authentication, External Entry & First-Onboarding Canonical Contract — GO IRL 1.1** in the GO IRL User Domain Package. It remains `source_of_truth: false` until reviewed and promoted through the repository governance process.

Required product behavior:

- Allow public event-card viewing from Telegram, WhatsApp, Instagram, Messenger, and the system share sheet without mandatory sign-in.
- Use verified Telegram `initData` as the Telegram authentication path.
- Use Google as the recommended web authentication path.
- Complete first onboarding only after the user confirms name, a unique GO IRL nickname, explicit age 18+, Terms acceptance, and Privacy Policy acceptance.
- Preserve the original `view`, `join`, or `request_to_join` intent through authentication and return the user to the originating event.
- Never join or request participation automatically after authentication.
- Prevent messenger preview bots and crawlers from causing authenticated actions or participation state changes.
- Define account states and provider-linking rules without automatic account merging.
- Separate publicly readable event data from protected user, membership, chat, and moderation data.
- Define the minor-user rejection path and avoid collecting unnecessary minor data.
- Specify security, privacy, analytics, API, and data-entity requirements before implementation.

Implementation order:

1. Audit current Telegram authentication, browser identity, routing, and event-entry behavior.
2. Convert the draft contract into reviewed repository documentation and acceptance criteria.
3. Produce a bounded technical design covering identity, onboarding state, intent persistence, provider linking, and protected data boundaries.
4. Review proposed Supabase/Auth/RLS/schema changes separately; no protected change is authorized by this roadmap entry.
5. Implement in small reviewed patches with tests and rollback notes.
6. Verify Telegram and web flows with at least two real accounts and direct runtime evidence.

Authentication completion gate:

- Telegram and Google may verify an external account, but GO IRL activation completes only after name, unique nickname, explicit 18+ confirmation, Terms acceptance, and Privacy Policy acceptance.
- Public event viewing works without authentication while protected actions remain blocked.
- Intent restoration works without automatic participation.
- Preview bots cannot create sessions, accounts, joins, requests, or analytics events representing human intent.
- Provider linking cannot silently merge two GO IRL accounts.
- Production no longer depends on demo-only identity.
- Required Auth, RLS, migration, and runtime checks are independently evidenced.

### Workstreams

1. **Authentication, external entry and first onboarding**
   - Treat the Priority 1 contract and completion gate above as the first active workstream.
   - Do not start lower-priority product expansion while authentication remains an unresolved release blocker.

2. **Core-loop stability**
   - Keep event cards readable and reliable.
   - Stabilize join state, participant count, chat, share, and organizer controls.
   - Ensure profile basics create enough trust to join.
   - Preserve the proven Olomouc baseline unless a reviewed product decision changes it.

3. **Infrastructure hardening**
   - Verify Supabase production readiness.
   - Keep migrations safe, repeatable, and explicitly approved.
   - Harden and document RLS for user, activity, and chat data.
   - Enforce roles and permissions.
   - Maintain database verification SQL and release checklists.
   - Remove legacy local fallbacks only after production replacement is verified.

4. **Sport Coach MVP 1.1**
   - Keep Coach sport-only.
   - Stabilize coach request and confirmation flows.
   - Keep browser demo behavior local-only.
   - Show coach details and confirmed badges only from valid state.
   - Measure show-up rate and beginner comfort.

5. **Product quality and performance**
   - Improve event cards, creation, details, profile, and organizer UX only where needed for the current loop.
   - Improve empty, loading, and error states.
   - Add lazy loading, code splitting, bundle optimization, and Telegram startup improvements where evidence shows value.

6. **Release operations**
   - Verify Vercel deployment and environment configuration.
   - Verify support, monitoring, analytics, moderation, and incident readiness.
   - Run real Telegram smoke checks, including a second-account share/join flow.

### Exit criteria

This bridge is complete only when:

- Priority 1 authentication, external entry, onboarding, and intent-restoration acceptance criteria are evidenced;
- the latest reviewed `main` passes all required quality checks;
- real Telegram smoke verification passes;
- production Supabase behavior and RLS are verified through approved procedures;
- production does not depend on demo-only identity;
- support, monitoring, analytics, moderation, and deployment readiness are evidenced;
- critical create-share-join-chat-meet flows have no unresolved release blocker.
