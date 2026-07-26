---
title: Agent Report — WhatsApp MVP Phase 1 Scaffold
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Prepare the safe Phase 1 scaffold for WhatsApp event join MVP in GitHub Issue #75 without enabling production integration.

## Files inspected

- `AGENTS.md`
- `DOCS_INDEX.md`
- `README.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/reports/README.md`
- Existing share, join, calendar, TypeScript, ESLint, Vite, and Vercel files.

## Findings

- Current join state is Telegram/browser-specific and should not be reused as a WhatsApp persistence layer in Phase 1.
- Provider-neutral contracts can be introduced without changing Telegram runtime behavior.
- A webhook endpoint can be scaffolded safely when disabled by default and isolated from Meta calls and persistence.

## Changes made

- Documented the WhatsApp invitation -> join -> confirmation -> calendar/map contract.
- Added provider-neutral `JoinIntent` and discriminated `JoinResult` types, including idempotent duplicate, waitlist, and rejection outcomes.
- Added WhatsApp invitation, Flow, and confirmation payload builders.
- Added unit tests for event summary, Join action, Flow data, calendar/map confirmation, and full-event rejection.
- Added test payload parsing for text and button replies.
- Added a mock GET verification/POST parsing handler that requires explicit test enablement.
- Added a Vercel-style endpoint that remains disabled and returns `503`.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (23 files, 144 tests)
- `pnpm run typecheck` — PASS

## Risks

- Payload builders are scaffold contracts only and require Meta sandbox validation before Phase 2.
- The endpoint intentionally cannot complete live webhook verification while disabled.
- Signature validation, replay protection, identity mapping, persistence, and live messages remain unimplemented.

## Not touched

- `.env` or secrets
- Supabase, RLS, SQL, or migrations
- Authentication or identity persistence
- Telegram share/join flow
- Production Meta webhook or Cloud API

## Next step

After explicit Phase 2 approval, validate payloads in the Meta test environment and design signature verification plus shared join-service persistence before enabling any endpoint.


## Follow-up — Instagram invitation smoke test (2026-07-20)

### Task

Run the production Instagram invitation trigger safely, identify the first live blocker, and remove the temporary trigger credential after the test.

### Findings

- Production deployment and trigger authentication worked.
- The authenticated request reached `sendProviderInvitation("instagram", ...)` but returned `502 invitation_send_failed`.
- The shared trigger handler swallowed the provider error, so Vercel logs could not expose the Meta rejection reason.
- Hoppscotch preflight returned `405` because the trigger did not support `OPTIONS`.
- Vercel `Redeploy` clones the selected deployment configuration; it must not be used as proof that a deleted environment variable is absent from a newly sourced deployment.

### Changes prepared

- Added Hoppscotch-scoped CORS and `OPTIONS` handling to the provider test trigger.
- Added server-only provider failure logging while keeping the public response generic.
- Added unit coverage for preflight and sanitized provider diagnostics.
- Removed the temporary `INSTAGRAM_TEST_TRIGGER_TOKEN` value from Vercel after the smoke test.

### Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (45 files, 236 tests)

### Next step

Publish the minimal diagnostics patch from current `main`, create a fresh production deployment, recreate a short-lived trigger token, repeat one invitation, read the Meta error from Vercel logs, then delete the trigger token and create another fresh deployment.
