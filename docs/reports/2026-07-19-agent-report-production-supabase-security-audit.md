---
title: Agent Report
owner: Chief Archivist / Security Reviewer
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-20
---

# Agent Report

## Task

Run a read-only production Supabase readiness audit for GO IRL without changing auth, RLS, secrets, migrations, schema, or production data.

## Files inspected

- `ROADMAP.md`
- `BACKLOG.md`
- `docs/SECURITY_RELEASE_CHECKLIST.md`
- `docs/bible/10-operations-and-release.md`
- `docs/reports/2026-07-16-agent-report-supabase-negative-rls-readiness.md`
- Production Supabase project metadata, RLS catalog, policy catalog, function privileges, Edge Function inventory, and Security Advisor output.

## Findings

- Production project `GO IRL` is active and healthy.
- `verifyTelegramInitData` is deployed and active with JWT verification enabled.
- RLS is enabled on all currently listed public tables, including `activities`, `activity_members`, `activity_chats`, `activity_chat_messages`, user/profile, role, audit, coach, and replay-protection tables.
- Core Activity and chat policies are restricted to the `authenticated` role and call JWT-aware helper functions.
- Live organizer/joined/pending/unrelated negative RLS scenarios are still not proven.
- Supabase Security Advisor reports mutable `search_path` warnings on five helper functions.
- Supabase Security Advisor reports multiple `SECURITY DEFINER` functions executable by `anon` and `authenticated` roles.
- Direct privilege inspection confirms the warnings. `go_irl_provider_join` is the notable hardened exception: it is `SECURITY DEFINER` but is not executable by `anon` or `authenticated`.
- These findings do not by themselves prove an exploit, but they are production security blockers until function exposure is reviewed and the live negative RLS matrix passes.

## Changes made

- Added this report only.
- No database, RLS, auth, secrets, Edge Function, migration, schema, or production data changes were made.

## Checks

- Production project health — PASS.
- Edge Function deployment presence — PASS.
- RLS enabled inventory — PASS.
- Static policy inventory — PASS.
- Security Advisor scan — RED: exposed `SECURITY DEFINER` warnings and mutable `search_path` warnings.
- Live organizer positive RLS test — NOT RUN.
- Live joined-member positive RLS test — NOT RUN.
- Live pending-user negative RLS test — NOT RUN.
- Live unrelated-user negative RLS test — NOT RUN.
- `pnpm run lint` — NOT RUN; docs-only change.
- `pnpm run build` — NOT RUN; docs-only change.
- `pnpm run test` — NOT RUN; docs-only change.

## Risks and untouched areas

- No attempt was made to revoke function privileges or modify function definitions in production.
- No temporary identities or rows were created.
- Edge Function secrets were not read or changed.
- Existing policies may depend on helper-function execution; blanket revocation without dependency review could break RLS.

## Next step

Prepare one reviewed, non-destructive hardening migration that:

1. inventories every externally executable `SECURITY DEFINER` function;
2. keeps only explicitly required RPC entrypoints executable;
3. revokes direct execution from `anon` and/or `authenticated` for internal policy, trigger, audit, cleanup, and recalculation helpers;
4. pins `search_path` for the five mutable helper functions;
5. adds verification SQL for function privileges;
6. is tested on a non-production Supabase branch before any production application.

After that patch is green, run the four-user negative RLS matrix and record PASS/RED only.
