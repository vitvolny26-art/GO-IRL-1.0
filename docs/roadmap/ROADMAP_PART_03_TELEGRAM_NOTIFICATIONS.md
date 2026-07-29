---
title: Roadmap Part 03 — Telegram and Notifications
owner: Product Lead
status: Active
source_of_truth: true
canonical_index: ROADMAP.md
scope: Gated Telegram and notification direction
last_review: 2026-07-29
next_review: 2026-08-09
---

# Roadmap Part 03 — Telegram and Notifications

Canonical index: [ROADMAP.md](../../ROADMAP.md).

## Phase 2 — Telegram and Notifications

**State:** Draft / Gated
**Goal:** Make GO IRL feel native inside Telegram without violating Mini App runtime boundaries.

Planned scope:

- Verify BotFather menu button and Mini App URL.
- Verify Telegram `startapp` share links.
- Add backend-triggered Telegram notifications.
- Notify organizers about private join requests.
- Notify participants about approve/reject decisions.
- Add reminders before activity start.

Runtime boundaries:

- Mini App lifecycle remains explicit.
- Closing is user-triggered.
- No Mini App background polling.
- Browser demo mode must not touch production Supabase.

Entry gate:

- Release Preparation exit criteria are green.
- Notification architecture and provider behavior are reviewed.
- Required production configuration has explicit approval.

Deferred within this phase:

- evening digest;
- quiet hours and working hours;
- broad n8n notification automation;
- autonomous engagement campaigns.

Source record: [`docs/roadmap/SPRINT_2.md`](docs/roadmap/SPRINT_2.md).
