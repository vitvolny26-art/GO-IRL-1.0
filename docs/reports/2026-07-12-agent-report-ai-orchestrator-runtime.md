---
title: Agent Report — AI Developer Orchestrator Runtime
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Agent Report

## Task

Extend the approved Phase 0 contracts into the maximum locally working AI developer orchestration model described by the proposal roadmap, without changing application code or automatically committing, pushing, merging, or deploying.

## Files inspected

- `AGENTS.md`
- `DOCS_INDEX.md`
- `README.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/reports/README.md`
- `origin/agent/go-irl-operating-system-proposal:docs/proposals/AI_DEVELOPER_ORCHESTRATION_ROADMAP.md`
- Phase 0 schemas, fixtures, validators, tests, and Agent Report
- local `codex --help`, `codex exec --help`, and `codex review --help`

## Findings

- Phase 0 contracts were sufficient for local validation but did not provide durable Mission state, filesystem-backed context, an execution adapter, independent review, QA state, approval state, or guarded publication.
- The first live Codex invocation exposed two transport incompatibilities that unit tests could not reveal: strict structured output requires explicit scalar types and does not accept the contract's `uniqueItems` keyword.
- The strict Agent Result contract therefore remains the authoritative local validator, while a smaller supported transport schema constrains Codex output before the strict validation pass.
- A live docs-only pilot completed real Mission Intake, Mission Approval, Context Pack generation, planning, a workspace-write Codex Implementer execution, a separate read-only Reviewer execution, one first-red QA capture, one audited QA retry, and the full green gate.
- The live pilot is intentionally stopped at `awaiting_change_approval`; no separate Change Approval was inferred from Mission Approval.

## Changes made

- Added durable JSON Mission state with idempotency, semantic duplicate detection, changed-payload conflicts, one active Mission, expiry, approval state, history, and terminal states.
- Added case-insensitive sensitive-scope enforcement, actual worktree snapshots, reported-vs-actual diff checks, budget reservation/accounting, and one human-audited pre-agent baseline refresh.
- Added a filesystem-backed Context Builder with explicit allowlists, mandatory source-of-truth files, computed SHA-256 and sizes, grep evidence, file/byte limits, symlink/path-escape protection, and secret redaction.
- Added deterministic Planner and Codex handoff artifacts with exact write scope, acceptance criteria, rollback, QA commands, and no dependency/architecture/external-write permissions.
- Added real Codex CLI adapters: ephemeral workspace-write Implementer and independent ephemeral read-only Reviewer, both using structured output and strict post-validation.
- Added one correction-pass limit, reviewer independence enforcement, first-red QA capture, one audited QA retry, explicit Change Approval, durable report generation, final QA, exact selected-file commit, `agent/*` push, and Draft PR-only publication.
- Hardened publication after archival review: execution now rejects any pre-existing staged file and verifies that the post-`git add` index exactly equals the selected file set before commit.
- Added an operator README, runtime pilot Mission fixture, end-to-end tests, and structured-output regression tests. Runtime state defaults to an OS user-state directory outside the repository.
- Added the live implementer-created docs-only pilot report.
- Added the OpenAI Developer Docs MCP server to global Codex configuration; it becomes available to new Codex tasks after restart.

## Checks

```text
Targeted runtime/contracts tests  PASS — 2 files, 48 tests
Live runtime QA first attempt     FAIL — first red captured at lint
Audited QA retry                  PASS — typecheck/lint/build/test/diff-check
Live runtime test result          PASS — 15 files, 113 tests
Final post-report quality gate    PASS — typecheck/lint/build/test/diff-check
Publisher index correction gate  PASS — 15 files, 115 tests; all five commands green
```

## Risks

- Real execution cost is reserved from the human-provided `--cost-usd` estimate; provider billing reconciliation is not automatic.
- The runtime attributes all filesystem changes after `prepare` to the active Mission, so a real Mission must use an isolated `agent/*` branch or worktree.
- The pilot Implementer report records its own shell limitation as a historical snapshot. The later independent reviewer and runtime QA evidence supersede that limitation, but the pilot has not received Change Approval for final report regeneration.
- n8n is not wired to execute this local CLI. It may become a transport/UI layer later, but it must not bypass runtime scope, budget, approval, review, QA, or publisher guards.
- Phase 7 Security and Supabase specialists were not activated because the pilot was docs-only and the roadmap says to add specialists only when evidence shows need.

## Not touched

- application code;
- `.env` values, secrets, credentials, or private production data;
- Auth, Supabase RLS, SQL, migrations, or deployment configuration;
- the proposal specification or canonical roadmap/backlog/index documents;
- active n8n workflows;
- GitHub merge, production deploy, or automatic publication.

## Next step

Review the runtime diff and this report. If preservation/publication is desired, grant explicit Change Approval for the `agent/ai-orchestrator-runtime` branch and name the selected files; then rerun the final gate, commit selected files, push the branch, and create one Draft PR. Do not merge or deploy automatically.
