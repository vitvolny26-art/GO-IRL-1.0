---
title: Agent Report
owner: Product Engineering
status: Draft
source_of_truth: false
last_review: 2026-07-23
next_review: 2026-07-24
---

# Agent Report

## Task
Implement GO IRL Messenger bot conversation flow so an event referral received for a known Messenger PSID triggers a real Meta Send API rich event card with image and two action buttons.

## Role
Product Engineering

## Sources inspected
- GitHub main provider webhook and Meta messaging parser
- Existing Messenger invitation payload builder and provider sender
- Existing event preview/card generation path

## Files inspected
- `api/_shared/provider-webhook.ts`
- `api/_shared/provider-messages.ts`
- `src/meta-messaging/mock-webhook.ts`
- `src/meta-messaging/mock-webhook.test.ts`

## Findings
- Rich Messenger generic-template sending already exists once `recipientId`/PSID and event data are available.
- The missing bridge on main is parsing Messenger referral payloads such as `ref=event:<uuid>` into the existing `details:<uuid>` action path.

## Changes made
Pending implementation.

## Checks
Pending.

## GitHub
Pending branch/commit/PR.

## ClickUp
Pending.

## Google Drive
Pending.

## Blockers
None identified in code path. Production Meta credentials/config are not modified.

## Next step
Add referral parsing + regression coverage, then validate the existing webhook-to-rich-card path.
