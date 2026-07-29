---
title: Product Roadmap Part 02 — Release Preparation
owner: Product Lead
status: Active
source_of_truth: false
canonical_index: docs/product-roadmap/PRODUCT_ROADMAP.md
source_document_id: 12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw
source_revision_id: AIroW346eIu9snQFAYkAFasStCULkk2N0Q97H4Ah1K5hYdNuqeuUCTEoUXxs95EcEaCUSJBvfVxeyK4yTL66wgL5oPKoXGV1zPywI0M_W58
scope: Active Release Preparation and Stabilization bridge
last_review: 2026-07-29
next_review: 2026-08-09
---

# Product Roadmap Part 02 — Release Preparation

Canonical index: [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

## 6. Active bridge — Release Preparation and Stabilization
**State:** Active / Partial.
**Goal:** Verify the post-beta product, infrastructure, operations, and real Telegram flow before broader launch.
### 6.1 Core-loop stability
- Keep event cards readable and reliable.
- Stabilize join state, participant count, chat, share, and organizer controls.
- Ensure profile basics create enough trust to join.
- Preserve the proven Olomouc baseline unless a reviewed product decision changes it.
- Resolve current event-sheet, profile, organizer, map, selection, chat-badge, and weather UX issues only where they support the current loop.
### 6.2 Infrastructure and security
**Completed evidence retained from the prior verified roadmap state**
- [x] Notification/reminder production recovery was recorded.
- [x] Quarter-hour worker schedule and terminal retry guards were recorded.
- [x] Notification queue recovery without active retry backlog was recorded.
**Partial / open**
- [~] Production reminder migrations were applied, but GitHub synchronization and same-commit CI evidence remain incomplete.
- [~] RLS is enabled on reviewed tables, but security-advisor findings and public/signed-in execution of several SECURITY DEFINER RPCs remain unresolved.
- [~] Role and audit objects exist, but end-to-end permission enforcement verification is incomplete.
- [~] Database verification evidence exists, but the reusable release verification package is not persisted in reviewed GitHub main.
- [ ] Trusted authentication and production write paths are unverified.
- [ ] Legacy local fallback removal is unverified.
Evidence scope retained from the previous verified roadmap state:
- Supabase project: `tygfsvjkznypilfyyvdc`
- Production migrations: `20260726040728`, `20260726041440`, `20260726041751`
- ClickUp task: https://app.clickup.com/t/869e3jw2r
This Drive cleanup did not rerun production-sensitive verification.
### 6.3 Sport Coach MVP 1.1
Sport Coach is a bounded validation track, not a universal event-role system.
Current work:
- keep Coach sport-only;
- stabilize coach request and confirmation flows;
- keep browser demo behavior local-only;
- show coach details and confirmed badges only from valid state;
- measure show-up rate and beginner comfort.
Primary signal:
- Show-up Rate: joined users who actually attended.
Supporting signals:
- coach badge open rate;
- join-to-chat-message rate;
- join-to-attendance-confirmation rate;
- beginner comfort;
- repeat sport attendance;
- organizer coach-request conversion.
Future Event Roles may use vertical-specific names such as Game Master, Language Buddy, Guide, or Host. Do not build a universal role marketplace before Sport Coach proves value.
### 6.4 Product quality and release operations
- Improve event cards, creation, details, profile, and organizer UX only where needed for the current loop.
- Improve empty, loading, success, and error states.
- Add lazy loading, code splitting, bundle optimization, and Telegram startup improvements only where evidence shows value.
- Verify Vercel deployment and environment configuration.
- Verify support, monitoring, analytics, moderation, and incident readiness.
- Run real Telegram smoke checks, including a second-account share/join flow.
### 6.5 Exit criteria
The active bridge is complete only when:
- the latest reviewed main passes all required quality checks;
- real Telegram smoke verification passes;
- production Supabase behavior and RLS are verified through approved procedures;
- production does not depend on demo-only identity;
- support, monitoring, analytics, moderation, and deployment readiness are evidenced;
- critical create-share-join-chat-meet flows have no unresolved release blocker.
