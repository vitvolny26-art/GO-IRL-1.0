---
title: Agent Report — Meta Messaging Production Readiness
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Audit Issue #83 and the Issue #75 follow-up against the current remote `main`, the deployed webhook boundary, and the live Meta app configuration. Identify the smallest safe next production step without exposing or changing secrets, auth, RLS, or migrations.

## Files inspected

- `api/_shared/meta-signature.ts`
- `api/_shared/provider-join-service.ts`
- `api/_shared/provider-messages.ts`
- `api/_shared/provider-webhook.ts`
- `api/_shared/provider-webhook.test.ts`
- `api/whatsapp/webhook.ts`
- `api/instagram/webhook.ts`
- `api/messenger/webhook.ts`
- `src/whatsapp/`
- `src/meta-messaging/`
- `src/join/types.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `docs/architecture/WHATSAPP_MVP.md`
- `docs/architecture/META_MESSAGING_MVP.md`
- Meta app `Go IRL Messaging` configuration, read-only
- Production webhook responses, unsigned and wrong-token requests only

## Findings

### Repository state and commit `498a09e`

- Current remote `main` is `852c451be9060baab28782da2c4e5d9d3cd12097` and its GitHub CI run passed.
- The audit uses a clean worktree created directly from current `origin/main`.
- Local commit `498a09e` is not in current remote `main`.
- Its parent is `11ec66c`, which was remote `main` when the commit was created and remains an ancestor of current `origin/main`.
- `498a09e` adds only `docs/reports/2026-07-13-agent-report-meta-messaging-verification.md` (65 lines). It changes no runtime behavior.
- The commit should not be merged as the current readiness result because live Meta state has changed and this report supersedes it.

### Implemented runtime

- All three callbacks support Meta GET verification and verify `X-Hub-Signature-256` before JSON parsing or persistence.
- Provider identities use opaque internal user keys; external provider IDs are not copied into public participant keys.
- Join is capacity-safe and membership-idempotent through `go_irl_provider_join`.
- Joined, duplicate, pending, waitlisted, closed, missing, and disallowed outcomes are represented.
- Successful results contain calendar and map actions.
- Production endpoints reject a wrong verification token with HTTP 403 and an unsigned POST with HTTP 401 for WhatsApp, Instagram, and Messenger.

### Credentials and connected assets

- Shared Meta App Secret and webhook verify token are production server credentials. Historical deployment reports say they are configured in Vercel; values were not read or exposed during this audit.
- WhatsApp currently has only the Meta test number. The Meta setup screen shows no newly generated dashboard token. The previously deployed WhatsApp token was documented as temporary and is not release-grade.
- A registered production WhatsApp number, permanent system-user token, payment setup, and business verification are not complete.
- Facebook Page `GO IRL` is connected to the Messenger use case. No Page access token has been generated in the current screen.
- Instagram account `yuzhaniin` is connected to the Instagram API and its account-level webhook switch is enabled. No Instagram access token has been generated in the current screen.

### Webhook subscriptions

- WhatsApp callback is configured at `/api/whatsapp/webhook`, but the `messages` field shows **No subscription**. Test `messages` events visible in the dashboard are panel-generated test events, not proof of live delivery.
- Messenger callback is configured at `/api/messenger/webhook`. The connected `GO IRL` Page shows no subscribed fields, and the app-level `messages` field shows **No subscription**.
- Instagram callback is configured at `/api/instagram/webhook`. Subscribed fields are `comments`, `live_comments`, `message_edit`, `message_reactions`, `messages`, `messaging_postbacks`, `messaging_referral`, and `messaging_seen`.
- The Meta app is not published. Meta explicitly warns that live webhook data is unavailable until publication/app review requirements are satisfied.

### Outbound invitations and delivery policy

- The product share UI opens Telegram, WhatsApp, Instagram, or Facebook share destinations. It does not call the server-side Meta send adapters.
- There is no authenticated admin endpoint or product action that initiates `sendProviderInvitation`.
- The only runtime reference to `sendProviderInvitation` is an internal response to a `details:<eventId>` inbound action. Therefore a first outbound invitation is not reachable from the product.
- WhatsApp invitation payloads are interactive session messages, not approved business-initiated templates. They cannot be treated as a production invitation path outside the customer-service window.
- WhatsApp Flow has a payload builder only. No deployed Flow ID, Flow token lifecycle, or live Flow endpoint was verified.

### Reliability, privacy, and operations

- Database membership is idempotent, but webhook event IDs are not durably deduplicated. Duplicate deliveries may produce duplicate outbound confirmations even though they do not create duplicate membership rows.
- Graph API sends have no bounded timeout, retry/backoff policy, or durable outbound status record.
- No channel-level operational metrics, dead-letter handling, or alerting were found.
- No WhatsApp/Instagram/Messenger opt-out command handler was found.
- Provider IDs remain server-side and participant keys are opaque, which is the correct privacy boundary. Operational retention and deletion handling for provider identities still need an explicit release checklist.

## Changes made

- Added this evidence-based readiness report.
- No runtime code, Meta settings, Vercel variables, secrets, Supabase configuration, auth, RLS, SQL, or migrations were changed.

## Checks

- `pnpm run lint` — PASS.
- `pnpm run build` — PASS.
- `pnpm run test` — PASS (31 files, 167 tests).
- `pnpm run typecheck` — PASS.
- `git diff --check` — PASS.
- Current `main` GitHub CI — PASS (`852c451`, run `29266656611`).
- WhatsApp wrong verify token — PASS (HTTP 403).
- WhatsApp unsigned POST rejection — PASS (HTTP 401).
- Instagram wrong verify token — PASS (HTTP 403).
- Instagram unsigned POST rejection — PASS (HTTP 401).
- Messenger wrong verify token — PASS (HTTP 403).
- Messenger unsigned POST rejection — PASS (HTTP 401).
- Meta configuration inspection — PASS, read-only; no secret values were opened.

## Next step

Keep the release gate closed. The smallest production sequence is:

1. Subscribe WhatsApp `messages` and replace the test credential with a permanent system-user token plus registered production number.
2. Create and approve a WhatsApp event-invitation template before adding any business-initiated send path.
3. Generate the Instagram token and complete one live inbound/outbound Join smoke test.
4. Generate the Page token, subscribe Messenger Page `messages`/`messaging_postbacks`, and complete one live smoke test.
5. Only then add a narrowly authenticated outbound invitation trigger, durable webhook-event deduplication, delivery logging, and opt-out handling.

Changing subscriptions, generating tokens, connecting a production number, adding payment, and submitting App Review are external permission changes. They require owner confirmation at action time and must not be performed by writing secrets into the repository.
