---
task_id: SHARE004
title: Beauty startapp opens professional card
owner: Release Manager
status: Verification pending
source: https://github.com/vitvolny26-art/Go-IRL-1.1/pull/607
last_review: 2026-08-04
next_review: 2026-08-11
---

# SHARE004 — Beauty startapp opens professional card

## Problem

Telegram Mini App links using `startapp=beauty-<slug>` previously routed into Services but stopped on the Services home/catalog surface instead of opening the intended Beauty professional card.

## Scope

- resolve valid Beauty `startapp` values into `/services?beauty=<slug>`;
- switch the app to the Services catalog surface;
- wait for the server-backed professional directory;
- find the exact professional by slug;
- open the matching professional card;
- remove only the consumed `beauty` query parameter;
- preserve Sport invitation behavior;
- maintain durable task documentation and release evidence.

## Out of scope

- WhatsApp/Open Graph Beauty preview rendering;
- `BEAUTY014` implementation;
- WhatsApp Business Platform, WABA, templates, webhooks or automated delivery;
- n8n runtime dependencies;
- auth, RLS, SQL, migrations, secrets, DNS or production-data changes;
- unrelated Beauty workspace/profile features.

## Acceptance criteria

- PR #607 is merged and the implementation remains present on current `main`;
- regression tests for valid/invalid Beauty slugs, exact selector targeting and query cleanup remain present;
- a physical Telegram smoke verifies that `https://t.me/GOirl_bot?startapp=beauty-test` opens the exact professional card without manual search;
- the consumed Beauty parameter is removed after opening;
- evidence is saved without PII;
- `STATUS.md`, task `ROADMAP.md`, report and handoff are current;
- Google Drive mirrors are current.

## Approval gates

- no code, merge or deployment is required for this documentation remediation;
- any new implementation change requires a separate approved task scope;
- any production deployment requires separate explicit owner approval.

## Dependencies

- trusted Telegram Mini App routing;
- published Beauty professional directory data;
- valid public Beauty slug.

## Blockers

The implementation and source-level regression coverage are verified, but current physical evidence for the exact post-click Telegram runtime behavior has not been supplied in this documentation pass.

## Related files

- `src/components/AppHeader.tsx`
- `src/services/ServicesClientViews.tsx`
- `src/services/beautyDeepLink.ts`
- `src/services/beautyDeepLink.test.ts`

## Related pull requests

- implementation: #607
- predecessor contract: #604
