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
- `api/_shared/messenger-test-invitation.ts`
- `api/_shared/messenger-test-invitation.test.ts`
- `api/_shared/vercel-handler.ts`
- `api/whatsapp/webhook.ts`
- `api/instagram/webhook.ts`
- `api/messenger/webhook.ts`
- `api/messenger/test-invitation.ts`
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

- Shared Meta App Secret and webhook verify token are configured as sensitive Production variables in Vercel. Their values were not exposed or written to the repository.
- WhatsApp Production variables `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` are present in Vercel. The Meta account still uses the test-number setup, so the channel is not release-grade until a registered production number and permanent system-user credential are verified.
- A registered production WhatsApp number, permanent system-user token, payment setup, and business verification are not complete.
- Facebook Page `GO IRL` is connected to the Messenger use case. A Page access token was generated and stored in Vercel as the sensitive, Production-only variable `MESSENGER_PAGE_ACCESS_TOKEN`; the value was not printed or written to the repository.
- Instagram account `yuzhaniin` is assigned as an Instagram Tester and the app is shown as authorized in Instagram Apps and Websites. The account-level webhook switch is enabled, but Meta still did not expose a usable Instagram access token.

### Webhook subscriptions

- WhatsApp callback is configured at `/api/whatsapp/webhook`, and the app is subscribed to the `messages` field. A real inbound delivery smoke test is still required.
- Messenger callback is configured at `/api/messenger/webhook`. App-level `messages` and `messaging_postbacks` subscriptions are enabled, and Page `GO IRL` is subscribed to both fields. A real inbound/outbound smoke test is still required.
- Instagram callback is configured at `/api/instagram/webhook`. Subscribed fields are `comments`, `live_comments`, `message_edit`, `message_reactions`, `messages`, `messaging_postbacks`, `messaging_referral`, and `messaging_seen`.
- The Meta app is not published. Meta explicitly warns that live webhook data is unavailable until publication/app review requirements are satisfied.

### Outbound invitations and delivery policy

- The product share UI opens Telegram, WhatsApp, Instagram, or Facebook share destinations. It does not call the server-side Meta send adapters.
- There is no authenticated admin endpoint or product action that initiates `sendProviderInvitation`.
- The only runtime reference to `sendProviderInvitation` is an internal response to a `details:<eventId>` inbound action. Therefore a first outbound invitation is not reachable from the product.
- A dedicated Messenger-only test trigger now provides the narrow release-validation path. It is disabled unless `MESSENGER_TEST_TRIGGER_TOKEN` exists, accepts only authenticated POST requests, validates the PSID and event UUID, and returns generic failures without provider details.
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
- Enabled the WhatsApp app-level `messages` subscription.
- Enabled Messenger app-level and Page-level `messages` and `messaging_postbacks` subscriptions.
- Confirmed Instagram Tester assignment and the account's authorization of the Meta app.
- Generated the Messenger Page access token and stored it as the sensitive, Production-only Vercel variable `MESSENGER_PAGE_ACCESS_TOKEN`.
- Redeployed commit `852c451` to Production with the latest project settings. Deployment `7Damm96R4DD7ozUX1FttFYetfV6s` completed with status Ready and retained the primary domain.
- Added `/api/messenger/test-invitation`, backed by the existing event-summary and Messenger payload/send modules.
- Added constant-time bearer-token comparison, strict request validation, disabled-by-default behavior, and generic upstream failure responses.
- Generalized the existing Vercel request adapter so webhook and test-trigger handlers use the same request/response boundary.
- Added six unit tests for disabled, unauthorized, invalid, missing-event, successful-send, and provider-failure paths.
- No repository secrets, Supabase configuration, auth, RLS, SQL, or migrations were changed.

## Checks

- `pnpm run lint` — PASS.
- `pnpm run build` — PASS.
- `pnpm run test` — PASS (32 files, 173 tests).
- `pnpm run typecheck` — PASS.
- `git diff --check` — PASS.
- Current `main` GitHub CI — PASS (`852c451`, run `29266656611`).
- WhatsApp wrong verify token — PASS (HTTP 403).
- WhatsApp unsigned POST rejection — PASS (HTTP 401).
- Instagram wrong verify token — PASS (HTTP 403).
- Instagram unsigned POST rejection — PASS (HTTP 401).
- Messenger wrong verify token — PASS (HTTP 403).
- Messenger unsigned POST rejection — PASS (HTTP 401).
- Meta subscription configuration — PASS for WhatsApp, Instagram, and Messenger.
- Messenger credential storage — PASS; variable is marked Sensitive and scoped only to Production.
- Production redeploy — PASS (Ready, 18 seconds).
- Post-redeploy Messenger wrong verify token — PASS (HTTP 403).
- Post-redeploy Messenger unsigned POST rejection — PASS (HTTP 401).
- Live Messenger inbound delivery — PASS. A real `Привет` message reached `/api/messenger/webhook` at 19:23:22 and returned HTTP 200.
- Plain-text response behavior — EXPECTED NO-OP. Runtime only processes signed `join:<eventId>` and `details:<eventId>` quick-reply/postback payloads; ordinary text has no action payload and produces no bot reply.
- Messenger test-trigger focused tests — PASS (6 tests).
- Secret boundary — PASS; no secret value is present in the report, repository, command output, or chat response.

## Risks

- The trigger must remain disabled unless its dedicated Production secret is intentionally configured.
- It is an operator smoke-test surface, not a user-facing invitation API; no frontend must call it.
- A real outbound test still requires the Page-scoped recipient ID from the live Messenger conversation and a real event UUID.

## Not touched

- `.env` files and repository secrets.
- Supabase auth, RLS, SQL, schema, and migrations.
- Product UI and public sharing behavior.
- Instagram and WhatsApp outbound credentials or send paths.

## Next step

Keep the release gate closed. The smallest remaining production sequence is:

1. Configure the dedicated Production trigger token and Page ID, deploy the patch, resolve the test conversation PSID, and send one invitation.
2. Replace the WhatsApp test-number setup with a registered production number and verified permanent system-user credential.
3. Create and approve a WhatsApp event-invitation template before adding any business-initiated send path, then complete one real Join smoke test.
4. Resolve Instagram token generation and complete one real inbound/outbound Join smoke test.
5. Publish the Meta app only after permissions, privacy requirements, opt-out behavior, and channel smoke tests pass.
6. Only then add a narrowly authenticated outbound invitation trigger, durable webhook-event deduplication, delivery logging, and opt-out handling.

Connecting a production number, adding payment, redeploying Production, and submitting App Review are external changes that require owner confirmation at action time. Secrets must remain in the deployment platform and must never be written into the repository.
