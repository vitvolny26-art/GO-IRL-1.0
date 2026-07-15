---
title: Agent Report — Orchestrator preview archive lifecycle
owner: AI Fixer / QA Gatekeeper
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Report

## Task

Repair the JSON bridge v0.1 lifecycle so a locally validated publication preview can be archived without granting commit, push, pull request, merge, or deployment authority.

## Files inspected

- `scripts/ai-orchestrator/README.md`
- `scripts/ai-orchestrator/bridge.cjs`
- `scripts/ai-orchestrator/bridge.test.mjs`
- `scripts/ai-orchestrator/runtime/core.cjs`
- `scripts/ai-orchestrator/runtime/publisher.cjs`

## Findings

- `publish preview` returned a successful logical artifact but did not persist proof that preview validation completed.
- `archive` accepted only `draft_pr`, so the preview-only bridge could not complete its documented dry-run lifecycle.
- The previous archive test bypassed the public lifecycle by manually advancing internal state to `draft_pr`.

## Changes made

- Persist successful preview metadata without executing any command from the publish plan.
- Allow `report_ready` to transition to `archived` only when a recorded preview exists.
- Include the recorded `publish_preview` logical artifact in later public envelopes.
- Exercise `publish preview → archive` through the bridge test and cover rejection before preview.
- Document the preview archive contract.

## Checks

- `pnpm run typecheck` — PASS
- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS
- `git diff --check` — PASS

## Risks

- Preview metadata is internal runtime state and must remain sanitized from the public response envelope.
- Repeated preview calls replace the previous preview metadata with the latest validated plan.

## Not touched

- Application UI and business logic.
- Secrets, Auth, RLS, SQL, migrations, Supabase, Vercel, and production data.
- Commit, push, pull request creation, merge, and deployment.

## Next step

Review the local diff, then publish only after explicit user approval.
