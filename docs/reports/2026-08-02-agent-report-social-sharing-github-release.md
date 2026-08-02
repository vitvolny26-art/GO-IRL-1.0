---
title: Agent Report
owner: GO IRL Release Engineer
status: Draft
source_of_truth: false
last_review: 2026-08-02
next_review: 2026-08-16
---

# Agent Report

## Task

Prepare GitHub-native organic event-card sharing for Facebook, Instagram, and WhatsApp, aligned with Telegram's two public actions, for guarded merge and VPS delivery.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/card-share-action.css`
- `api/meta/event-preview.ts`
- `src/cardShare.test.ts`
- `tests/api/meta/event-preview.test.ts`
- GitHub PR #414 and its exact-head CI evidence
- n8n workflow `6khfY6PmKkIVB9Qv`

## Findings

PR #414 covered organic rich previews but was stale, conflicted with current `main`, and did not contain the final two-action event-preview contract. A clean patch was rebuilt directly from authoritative GitHub `main` without using the local worktree.

## Changes made

- WhatsApp shares the event-specific public preview URL.
- Instagram is available in the event share menu and uses native share with a copy/open fallback.
- Facebook remains on the event-specific Open Graph preview.
- Messenger and native share use the provider-neutral rich-preview payload.
- The public preview exposes exactly `Open event` and `Add to calendar` in four languages.
- The six share choices use a compact two-column layout.
- Focused tests cover the rich-preview URL and two-action localization contract.

## Checks

GitHub Actions CI is the authoritative release gate for the exact PR head. Merge and VPS deployment are prohibited unless that workflow completes successfully.

## Risks

Instagram does not allow a generic web application to inject clickable buttons into arbitrary posts or stories. The two actions live on the linked event preview. Social preview caches can delay visual refreshes.

## Not touched

No local worktree, auth, RLS, SQL, migrations, secrets, environment variables, DNS, Vercel production, or production data.

## Next step

Require green GitHub Actions on the exact PR head, squash-merge to `main`, then run the single guarded VPS workflow and verify its SHA plus public HTTP 200.
