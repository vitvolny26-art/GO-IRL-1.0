---
title: Agent Report — Orchestrator Bridge v0.1
owner: Codex Engineering Runtime
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Agent Report

## Task

Implement Issue #57 as a stable JSON-only CLI bridge between the existing AI Developer Orchestrator runtime and any external orchestrator, including future n8n workflows, without rewriting the runtime.

## Files inspected

- `AGENTS.md`
- `DOCS_INDEX.md`
- `README.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/reports/README.md`
- `scripts/ai-orchestrator/orchestrator.cjs`
- `scripts/ai-orchestrator/runtime/core.cjs`
- `scripts/ai-orchestrator/runtime/workflow.cjs`
- `scripts/ai-orchestrator/runtime/codex-adapter.cjs`
- `scripts/ai-orchestrator/runtime/publisher.cjs`
- `scripts/ai-orchestrator/orchestrator.test.mjs`
- `scripts/ai-orchestrator/README.md`
- GitHub Issue #57

## Findings

- The merged runtime already provides Mission intake, approvals, scope/budget enforcement, Context Builder, planning, implementation/review adapters, QA, reporting, and guarded publication.
- The existing `prepare` CLI combined Context Builder and Planner, so an external state machine could not advance those stages independently.
- The existing operator CLI intentionally presents local artifact paths and detailed error blocks; that output is useful for a local operator but is not a safe public automation interface.
- Publication execution must remain outside bridge v0.1. A preview-only operation preserves the runtime validation gate without granting Git or GitHub mutation authority to n8n.

## Changes made

- Added `orchestrator bridge` routing with eleven command pairs: Mission create/status/approve, context build, planner run, implementer run, review run, QA run, report create, publish preview, and archive.
- Added one-JSON-object stdin requests, one-JSON-object stdout responses, deterministic exit codes, sanitized errors, stable `status`/`next_action`, and logical artifact names.
- Kept the existing one-retry QA policy reachable through `qa run` with an explicit `retry_actor`, without adding a second public command.
- Split Context Builder and Planner into separate runtime operations while preserving the existing `prepareMission` API as a backward-compatible composition; Planner verifies the persisted Context Pack hash before use.
- Added external inline Agent Result support and an explicit `mode: "codex"` path that retains the real-agent execution flag and budget reservation requirements.
- Hard-coded bridge publication to preview-only execution and kept all existing approval, final-QA, exact-selection, branch, and report-integrity guards.
- Added a response JSON Schema and bridge tests covering the command lifecycle, public-envelope shape, internal-path suppression, JSON-only failure output, and no publication execution.
- Documented the stable v0.1 interface and its operational/security boundary.

## Checks

```text
Targeted bridge/runtime tests  PASS — 2 files, 20 tests
JSON CLI smoke                 PASS — create/status, one JSON line per command
pnpm run typecheck             PASS
pnpm run lint                  PASS
pnpm run build                 PASS
pnpm run test                  PASS — 16 files, 121 tests
git diff --check               PASS
```

## Risks

- The bridge is a local process interface; remote callers still require a separately secured transport and process boundary.
- `mission approve` records the supplied human actor but does not authenticate the caller. n8n must not expose approval commands to untrusted triggers.
- Real Codex execution remains opt-in and requires a positive cost estimate. Provider billing reconciliation is still outside the runtime.
- Bridge v0.1 returns publication previews only. A separately authorized local publisher remains responsible for commit, push, and Draft PR creation.

## Not touched

- application code;
- `.env` values, secrets, credentials, or private production data;
- Auth, Supabase RLS, SQL, migrations, or deployment configuration;
- canonical roadmap, backlog, or documentation index;
- n8n workflow activation or publication;
- Git commit, push, PR creation, merge, or deploy.

## Next step

Run all five local gates. If green, perform independent review and request explicit Change Approval before committing or publishing the branch.
