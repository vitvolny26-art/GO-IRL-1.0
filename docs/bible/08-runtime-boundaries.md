---
title: Bible Runtime Boundaries
owner: Tech Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book VIII — Runtime Boundaries

## Runtime contexts

1. Telegram Mini App production path.
2. Browser Demo Mode.
3. Vercel server/runtime.
4. Supabase data, auth, RLS, Edge Functions, and protected workers.
5. External provider APIs with independent release gates.

## Hard rules

- Demo identity is not production identity.
- Future schema is not current schema.
- Client state is not authorization.
- An adapter is not proof of provider enablement.
- Open PR text is not current `main`.
- Documentation is not a deployment, migration, or secret-management mechanism.

## Current boundaries

- Trusted Telegram `initData` -> verification -> trusted session/JWT -> RLS-aware access.
- Demo writes remain local-only.
- `activities` remains the current core model.
- Activity Chat is temporary; applied migration behavior wins.
- Profile preferences may select map, calendar, share, and reminder defaults.
- Map and calendar routing are client actions, not proof of external account connection.
- Reminders require trusted, server-backed persistence.
- Provider-neutral outbox and workers dispatch only through enabled, consented providers.
- Telegram and Messenger may be enabled where production evidence confirms; WhatsApp and Instagram remain gated until their checks pass.

## Verification rule

Browser tests cannot prove Telegram behavior. Telegram tests cannot prove RLS. Schema files cannot prove deployment. Each claim must be verified in its owning runtime.

## Navigation

- Previous: [`07-beta-readiness-and-operations.md`](07-beta-readiness-and-operations.md)
- Next: [`09-governance-and-ai-organization.md`](09-governance-and-ai-organization.md)
