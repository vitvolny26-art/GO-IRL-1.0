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

## Changes made

- Added an inactive, sanitized workflow copy at `n8n/workflows/go-irl-ai-staff-os-structural-test.json`.
- Reused the repository-safe AI Report Bus template parameters for the legacy external branch.
- Removed credential bindings and webhook, instance, version, and email identifiers.
- Forced the Schedule Trigger disabled in the repository copy.
- Added `STAFF-OS Single-Run Procedure` sticky note with the unambiguous manual-trigger path and a warning not to execute the terminal node directly.
- Added `scripts/validate-n8n-staff-os.cjs` using Node built-ins only.
- Added `scripts/test-n8n-staff-os.cjs` using Node built-ins only.
- Did not activate, publish, execute, or edit the live n8n workflow.

## Structural validation

```text
PASS n8n\workflows\go-irl-ai-staff-os-structural-test.json
PASS 19 required nodes; inactive; no cycle; no private bindings
PASS validation-before-persistence; dual approval outputs; blocked-status guard
```

The validator checks JSON parsing, inactive state, disabled trigger/placeholders, Staff OS lane isolation, required nodes, acyclic routing, validation before persistence, seven-day/max-100 duplicate policy, budget bounds and 25/75 split, approval outputs, final blocked-state logic, sensitive-action coverage, and repository-safe identifier removal.

## Test matrix

| Case | Expected | Result |
|---|---|---|
| A — Beta QA | Coordinator, Product Lead, QA Lead | PASS |
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

None for the local structural validation.

The live workflow remains intentionally unchanged. Importing the sanitized repository copy or editing the cloud workflow requires a separate explicit action and must remain inactive until reviewed.

## Proposed commit message

```text
test: validate n8n staff os workflow
```

## Next step

Review the local diff. Commit locally only if all final checks remain green. Do not push or open a PR without explicit owner approval.
