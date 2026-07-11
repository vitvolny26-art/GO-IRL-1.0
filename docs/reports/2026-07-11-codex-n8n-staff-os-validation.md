---
title: Codex n8n Staff OS Structural Validation
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Codex n8n Staff OS Structural Validation

## Task

Locally validate, test, sanitize, and minimally harden the inactive GO IRL AI Staff OS structural-test workflow without running or modifying the live n8n workflow.

## Files inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/automation/go-irl-ai-report-bus-v1.template.json`
- `docs/reports/2026-07-11-agent-report-n8n-export-sanitization.md`
- `docs/reports/2026-07-11-n8n-ai-staff-os-audit.md`
- user export `C:\Users\lenovo\Downloads\GO-IRL-AI-Staff-OS-Structural-Test.json`

## Findings

- The exported workflow was inactive and the Schedule Trigger was disabled.
- The Staff OS test lane was disconnected from the AI Report Bus lane.
- Validation already preceded duplicate persistence in the exported connection graph.
- The three future AI placeholders were disabled and no AI model was connected.
- Both Human Approval IF outputs reached `STAFF-01 Report Only Complete`.
- The final node blocked on budget excess or invalid results and requested human approval only for a clean sensitive proposal.
- The raw export contained environment-specific credential bindings, notification email, and webhook identifiers in the legacy AI Report Bus branch. Those values were not copied into the repository version.
- The workflow lacked an explicit single-run instruction warning against direct execution of the terminal node.
- Cloud runtime verification exposed the architectural blocker: n8n allows only one `Manual Trigger` per workflow. The combined workflow already used it for AI Report Bus, leaving the Staff OS raw-input node without a runnable input.

## Changes made

- Added an inactive, Staff-only workflow copy at `n8n/workflows/go-irl-ai-staff-os-structural-test.json`.
- Removed the entire AI Report Bus graph, including Schedule/Report Bus Manual triggers and all Drive, GitHub, and Gmail nodes and connections.
- Removed credential bindings and webhook, instance, version, and email identifiers by excluding the account-bound branch.
- Kept exactly one `Manual Trigger`, connected directly to `STAFF-00 Raw Mission Input (Sample)`.
- Added `STAFF-OS Single-Run Procedure` sticky note with the unambiguous manual-trigger path and a warning not to execute the terminal node directly.
- Added `scripts/validate-n8n-staff-os.cjs` using Node built-ins only.
- Added `scripts/test-n8n-staff-os.cjs` using Node built-ins only.
- Added the same single-run instruction as a sticky note to the live structural-test workflow and confirmed it persisted after reload.
- Did not activate, publish, execute, or change node configuration, connections, credentials, or the AI Report Bus branch in the live workflow.
- Created a separate inactive n8n workflow, `qZi63dEgSwxAmbPT`, named `GO IRL — AI Staff OS Structural Test — Staff-only`.
- Imported only the 22 executable Staff OS nodes plus the single-run sticky note; the cloud copy contains one Manual Trigger and no AI Report Bus, Drive, GitHub, Gmail, Schedule Trigger, or credential-bound nodes.
- Ran one clean Beta QA mission from `STAFF-00 Mission Trigger (Manual)` through `STAFF-01 Report Only Complete` in one execution, inspected the terminal output, and cleared the execution afterward.
- The cloud result was `completed` with Project Coordinator, Product Lead, and QA Lead; invalid results, critic, approval, budget excess, cost, and token use were all zero/false, while `synthetic` and `report_only` were true.
- The Staff-only cloud workflow remained inactive and unpublished after reload.

## Structural validation

```text
PASS n8n\workflows\go-irl-ai-staff-os-structural-test.json
PASS 19 required nodes; exactly one Manual Trigger; inactive; no cycle
PASS Staff-only graph; no external nodes, credentials, or private bindings
PASS validation-before-persistence; dual approval outputs; blocked-status guard
```

The validator checks JSON parsing, inactive state, exactly one correctly wired Manual Trigger, disabled AI placeholders, Staff-only graph isolation, required nodes, full reachability, acyclic routing, validation before persistence, seven-day/max-100 duplicate policy, budget bounds and 25/75 split, approval outputs, final blocked-state logic, sensitive-action coverage, and repository-safe identifier removal.

## Test matrix

| Case | Expected | Result |
|---|---|---|
| A — Beta QA | Coordinator, Product Lead, QA Lead | PASS — local and cloud single-run |
| B — Auth/RLS | Coordinator, Tech Lead, QA Lead, Security Lead, Supabase Steward | PASS |
| C — Bug investigation | Coordinator, Tech Lead, QA Lead | PASS |
| D — `proposed_changes: ["merge branch"]` | invalid result, critic, approval, blocked | PASS |
| E — clean restored result | completed, zero cost, synthetic, report-only | PASS |

Additional deterministic checks passed for budget bounds, the 25/75 reserve split, duplicate detection, seven-day retention, and the 100-record cap.

## Quality gates

```text
pnpm run lint   PASS
pnpm run build  PASS
pnpm run test   PASS — 13 files, 65 tests
```

## Blockers

The local Staff-only artifact, checks, and one cloud end-to-end run are green.

PR #49 is already merged and cannot be updated or returned to Draft. The follow-up isolation patch therefore remains local until the owner permits a new Draft PR or another delivery path. The original combined cloud workflow was not executed, activated, or published.

## Proposed commit message

```text
test: validate n8n staff os workflow
```

## Next step

Run any future n8n manual test only from `STAFF-00 Mission Trigger (Manual)`. Do not push or open a PR without explicit owner approval.
