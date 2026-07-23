---
title: Agent Report
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-23
next_review: 2026-07-24
---

# Agent Report

## Task
Complete and verify the GO IRL Messenger bot conversation flow where an event referral yields a Messenger PSID and triggers a real Meta Send API rich event card with an image and two web actions.

## Role
AI Fixer

## Sources inspected
- GitHub main provider webhook and Meta messaging implementation
- Existing Messenger invitation sender and generic-template payload builder
- Existing event preview/invitation-card generation paths
- PR #294 and exact branch history
- Vercel preview/check status

## Files inspected
- `api/_shared/provider-webhook.ts`
- `api/_shared/provider-messages.ts`
- `src/meta-messaging/mock-webhook.ts`
- `src/meta-messaging/mock-webhook.test.ts`
- `src/meta-messaging/payload-builders.ts`
- `src/meta-messaging/payload-builders.test.ts`

## Findings
- The outbound Messenger rich-card path already existed once a concrete PSID and trusted event summary were available.
- The missing bridge was inbound Messenger referral parsing: `ref=event:<uuid>` was not mapped into the existing `details:<uuid>` provider action.
- Messenger referral events can expose the sender PSID through `sender.id`; the provider pipeline can then load the event and call the existing Meta Send API sender.
- The rich Messenger payload is a `generic` template with dynamic image, default event action, and exactly two web buttons: `Открыть событие` and `В календарь`.

## Changes made
- Parse Messenger top-level referral payloads and postback referral payloads.
- Map valid `event:<uuid>` referrals into the existing `details:<uuid>` action path.
- Preserve existing quick-reply/postback precedence and echo-loop protection.
- Add regression coverage for PSID referral routing.
- Add a Messenger-specific contract test proving recipient PSID, `generic` template, image, default event action, and the two required web buttons.

## Checks
- GitHub CI run #877 on functional head `79c9648636fd0e0577ecb045858f5d169853378a`: PASS for test, typecheck, lint, and build.
- Final contract-test commit `c2c9f29d7e60bd027e1b8e1dbfe42fa7cdb341ca` changes only test coverage on top of that green functional head.
- Vercel check for `c2c9f29d7e60bd027e1b8e1dbfe42fa7cdb341ca`: SUCCESS.
- Final exact-head CI is required before marking the PR review-ready.

## GitHub
- Branch: `feat/messenger-rich-card-psid`
- Functional commit: `e9b772d5da21442208bcd78022ae8bec37591a7f`
- Referral regression commit: `79c9648636fd0e0577ecb045858f5d169853378a`
- Rich-card contract commit: `c2c9f29d7e60bd027e1b8e1dbfe42fa7cdb341ca`
- PR: #294 `feat: send Messenger rich event card from referral PSID`
- Merge: not performed.

## ClickUp
- No task state changed in this pass; completion is not claimed before exact-head CI and production smoke evidence.

## Google Drive
- No authoritative Drive instruction or production configuration changed in this pass.

## Blockers
- Production delivery smoke requires the existing production Meta credentials/webhook configuration and a real Messenger conversation/PSID. No secrets or production configuration were changed.

## Next step
Wait for exact-head CI on this report commit. If green, mark PR #294 ready for review. Production merge/deploy and live Meta smoke remain approval-gated.
