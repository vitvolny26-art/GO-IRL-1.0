---
title: Beauty007 — Beauty Mini App links and editable public slug
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-17
---

# Beauty007 — Beauty Mini App links and editable public slug

## Task

Make Beauty Telegram sharing open inside the Telegram Mini App, show the firm name above a localized service name, and allow each professional to choose a unique English public-link ending.

## Implementation

- Beauty prepared cards use `https://t.me/GOirl_bot?startapp=beauty-<english-name>`.
- Beauty `startapp` values route to the Services surface inside the Telegram Mini App.
- The card headline is the firm name.
- The subtitle is the service name localized for `ru`, `uk`, `cs`, and `en`.
- The professional workspace includes an editable unique slug.
- Legacy generated `beauty-<hash>` slugs remain valid.

## Traceability

- Task ID: `Beauty007`.
- Implementation PR: `#604`.
- Implementation merge commit: `68249d580f354e5e33f952307490cbe56a408975`.
- Traceability PR: `#606`.
- Migration: `supabase/migrations/20260803185000_beauty_public_slug.sql`.
- Migration applied to Supabase project `tygfsvjkznypilfyyvdc` on 2026-08-03.
- This PR restores the missing canonical task identifier and does not change runtime behavior.

## Checks

- PR #604 exact-head CI passed.
- Repository check: PASS.
- Diff check: PASS.
- Test: PASS.
- Typecheck: PASS.
- Lint: PASS.
- Build: PASS.
- Bundle budget: PASS.

## Next step

Merge this documentation-only traceability PR after CI passes.
