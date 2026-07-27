---
title: Agent Report — Road105 invalid-session diagnostics
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-27
next_review: 2026-08-27
---

# Agent Report

## Task

Add safe diagnostic categories for Road105 admin-session JWT rejection while preserving the generic public denial response.

## Files inspected

- `api/_shared/admin-authorization.ts`
- `api/_shared/admin-authorization.test.ts`
- `api/admin/session.ts`
- `supabase/functions/verifyTelegramInitData/index.ts`

## Findings

The production verifier reduced malformed JWTs, invalid headers, encoding failures, signature mismatches, and invalid payloads to one `invalid_session` audit reason. This prevented runtime evidence from isolating the failed verification stage.

## Changes made

- Added bounded, non-sensitive JWT verification failure categories.
- Preserved the public `401 {"error":"access_denied"}` response.
- Added tests proving failure categories and absence of the submitted token in audit details.

## Checks

```text
pnpm run lint       PASS (one pre-existing no-console warning)
pnpm run typecheck  PASS
pnpm run build      PASS
pnpm run test       PASS (106 files, 524 tests; Staff OS checks PASS)
git diff --check    PASS
```

## Risks

The patch improves observability only. It does not change authorization decisions or resolve the underlying production token rejection by itself.

## Not touched

- Supabase code or deployment
- Vercel or Supabase configuration
- secrets
- SQL, migrations, RLS, or production data
- raw Telegram `initData`, access tokens, or JWT payload logging

## Next step

Run quality gates, publish a pull request, and inspect the safe production reason after a real Telegram admin login retry.
