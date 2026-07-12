# AI Developer Orchestrator Runtime

This directory contains the local, dependency-free execution engine for the proposed AI Developer Orchestration Roadmap.

It implements:

- Phase 1: durable Mission Intake, idempotency, duplicate/conflict detection, one active Mission, expiry, sensitive-scope rejection, Mission Approval, and budget accounting;
- Phase 2: explicit Context Pack allowlists, filesystem-computed SHA-256 and byte totals, grep evidence, size/file limits, and secret redaction;
- Phase 3: exact-scope plan, Codex handoff, isolated-worktree snapshot, and reported-vs-actual diff enforcement;
- Phase 4: separate Codex implementer/reviewer executions, read-only review, one correction pass, first-red QA capture, and no self-approval;
- Phase 5: Change Approval, durable Agent Report, final QA, selected-file commit, `agent/*` push, and Draft PR creation.

The runtime never merges or deploys. Real Codex and GitHub mutations require explicit execution flags.

## Working directory

```powershell
Set-Location "<path-to-GO-IRL-1.0>"
```

Runtime state is stored outside the repository by default:

- Windows: `%LOCALAPPDATA%\GO-IRL\ai-orchestrator`;
- Linux/macOS with `XDG_STATE_HOME`: `$XDG_STATE_HOME/go-irl/ai-orchestrator`;
- fallback: `~/.local/state/go-irl/ai-orchestrator`.

Use `--state-dir <path>` only when an isolated custom state location is required.

## End-to-end run

```powershell
node scripts/ai-orchestrator/orchestrator.cjs intake scripts/ai-orchestrator/fixtures/runtime/mission-docs-pilot.json
node scripts/ai-orchestrator/orchestrator.cjs approve-mission MISSION-RUNTIME-DOCS-PILOT --actor "human-owner"
node scripts/ai-orchestrator/orchestrator.cjs prepare MISSION-RUNTIME-DOCS-PILOT --include "scripts/ai-orchestrator/README.md" --grep "Phase 5,Draft PR"
```

The prepare command writes a bounded Context Pack, plan, and Codex handoff under:

```text
<state-dir>/artifacts/MISSION-RUNTIME-DOCS-PILOT/
```

If the orchestration infrastructure itself is repaired after `prepare` but before the first agent result, a human may refresh the worktree baseline once the repair is inspected:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs refresh-baseline MISSION-RUNTIME-DOCS-PILOT --actor "human-owner"
```

Baseline refresh is rejected after any agent result exists.

Run a real implementer only after Mission Approval:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs run-implementer MISSION-RUNTIME-DOCS-PILOT --execution impl-001 --cost-usd 0.40 --execute-agent
```

Run a separate read-only reviewer execution:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs run-reviewer MISSION-RUNTIME-DOCS-PILOT --execution review-001 --cost-usd 0.20 --execute-agent
```

If review returns `CHANGES_REQUIRED`, run the implementer once more with a new execution ID. A second correction request blocks the Mission.

Continue only after reviewer `PASS`:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs qa MISSION-RUNTIME-DOCS-PILOT
node scripts/ai-orchestrator/orchestrator.cjs approve-change MISSION-RUNTIME-DOCS-PILOT --actor "human-owner"
node scripts/ai-orchestrator/orchestrator.cjs report MISSION-RUNTIME-DOCS-PILOT --report "docs/reports/2026-07-12-agent-report-runtime-docs-pilot.md"
node scripts/ai-orchestrator/orchestrator.cjs final-qa MISSION-RUNTIME-DOCS-PILOT
```

If QA records a first-red block and the defect is corrected, one human-audited retry is available:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs retry-qa MISSION-RUNTIME-DOCS-PILOT --actor "human-owner"
node scripts/ai-orchestrator/orchestrator.cjs qa MISSION-RUNTIME-DOCS-PILOT
```

Preview the guarded publish plan without changing GitHub:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs publish MISSION-RUNTIME-DOCS-PILOT --selected "docs/reports/2026-07-12-agent-report-runtime-docs-pilot.md" --commit-message "docs: complete orchestrator pilot" --pr-title "AI orchestrator docs pilot"
```

Add `--execute` only after explicit Change Approval. The publisher stages exactly the implementer-reported files plus the Agent Report, pushes only the current `agent/*` branch, and creates a Draft PR.

After a human merge decision, release the active Mission slot:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs archive MISSION-RUNTIME-DOCS-PILOT --actor "human-owner"
```

## Manual adapter path

External agents may return a schema-valid Agent Result instead of using the built-in Codex adapter:

```powershell
node scripts/ai-orchestrator/orchestrator.cjs submit-implementer MISSION-RUNTIME-DOCS-PILOT result.json --execution impl-external --cost-usd 0.40
node scripts/ai-orchestrator/orchestrator.cjs submit-review MISSION-RUNTIME-DOCS-PILOT review.json --execution review-external --cost-usd 0.20
```

The runtime compares implementer `changed_files` with its filesystem snapshot. Undeclared, out-of-scope, or sensitive writes block the Mission even if Agent Result claims success.

## Operational limits

- `--cost-usd` is a required reservation estimate for real Codex executions; automatic provider billing reconciliation is not available.
- The runtime requires an isolated branch/worktree because filesystem changes after `prepare` are attributed to the active Mission.
- Context content is not persisted; only bounded evidence, redacted excerpts, hashes, and computed size metadata are stored.
- GitHub publication requires authenticated `git` and `gh` CLIs.
- n8n may call this CLI or exchange contract artifacts later, but it is not allowed to bypass the runtime approval and scope guards.
