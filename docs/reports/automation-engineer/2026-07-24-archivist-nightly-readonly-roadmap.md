---
title: Recovery Roadmap
owner: Automation Engineer
status: Draft
source_of_truth: false
last_review: 2026-07-24
next_review: 2026-07-25
---

# Chief Archivist Nightly Read-Only Recovery Roadmap

## Objective
Recover the Chief Archivist nightly path after execution `3505`, prove a genuinely side-effect-free full-path run, and prepare a minimal production-safe patch without publishing or changing the active runtime.

## Current truth
- Workflow: `ulCZrP3Ci0YJy1TY`.
- Previously reported active runtime version: `6e2fd517-83a3-4fc0-959d-f93703d5efcf`, 66 nodes.
- Last known pre-test editable draft: `02903ab8-b374-41ff-8b7f-ca72bbf92103`, 293 nodes.
- Active and draft architectures are divergent.
- Execution `3505` loaded live GitHub, Drive, ClickUp, and OpenRouter context.
- `context_complete=true`.
- `Archivist Analysis` failed with `Referenced node doesn't exist`.
- Final normalized state was `BLOCKED` with `ARCHIVIST_STATUS_INVALID`.
- Combined planners and validator were not reached.
- `Save Archivist Tracking Complete` created Data Table row `id=4`.
- No publish or production version switch occurred.

## Safety constraints
- Begin in read-only inspection mode.
- Do not publish, activate, merge, deploy, or alter production configuration.
- Do not delete Data Table row `id=4` without explicit owner approval.
- Do not modify secrets, auth, Supabase RLS, SQL, migrations, or production data.
- Do not trust chat memory for the current draft graph; inspect live workflow state first.
- Keep one active task: stabilize AI Archivist execution truth.

## Phase 0 — Refresh and preserve evidence
1. Read current workflow details, current editable version, retained history, node count, and active version.
2. Export or record the full current connection map around:
   - `ChatGPT Bridge Trigger`;
   - `Prepare Archivist Mission`;
   - `Build Archivist Context Manifest`;
   - `Archivist Analysis`;
   - `Normalize Archivist Result`;
   - `Build Archivist Failure`;
   - Drive and ClickUp planners;
   - cleanup validator;
   - tracking nodes;
   - report/Telegram nodes.
3. Inspect execution `3505` with targeted node queries and produce an explicit reached/not-reached table.
4. Record the exact editable version that contains the temporary test harness.
5. Confirm the active version remains unchanged.

Acceptance:
- Exact current version IDs and node/connection state are durably recorded.
- No workflow mutation has occurred.

## Phase 1 — Remove unsafe temporary routing
1. Restore `ChatGPT Bridge Trigger` to its normal route through `Normalize ChatGPT Request`.
2. Remove any temporary edge from `ChatGPT Bridge Trigger` to the full-nightly test mission.
3. Restore original production-draft routes:
   - `Prepare Archivist Mission` -> `Build Archivist Tracking Start`;
   - `Build Archivist Context Manifest` -> `Fresh Context Complete?`;
   - `Enforce ClickUp Cleanup Plan` -> `Archivist Result Valid?`.
4. Remove temporary full-nightly test nodes only after confirming no retained connection depends on them.
5. Re-read the workflow graph and confirm no orphaned or duplicate edge remains.

Acceptance:
- Temporary test routing is absent.
- Standard draft routing is restored.
- Active runtime is unchanged.
- No publish.

## Phase 2 — Find the exact missing-node reference
1. Inspect `Archivist Analysis` parameters, prompt expressions, model inputs, and all upstream expressions evaluated on entry.
2. Search for every name-dependent reference pattern:
   - `$node["..."]`;
   - `$('...')`;
   - `$items('...')`;
   - `$runIndex`, `$item`, or paired-item references tied to removed/renamed nodes.
3. Compare every referenced name with the current node-name set.
4. Inspect recent rename history and the last known working version.
5. Fix only the exact stale reference.
6. Prefer passing one canonical context manifest directly into the AI node over reading multiple nodes by name.
7. Validate the changed node configuration before executing it.

Acceptance:
- The missing reference is named explicitly in the report.
- The replacement input path is deterministic.
- Isolated node validation is GREEN.

## Phase 3 — Build a physically isolated AI test harness
Create a separate manual test subgraph that cannot reach operational writes under any branch.

Required shape:
1. Manual trigger.
2. Deterministic test-mission builder.
3. Live read-source chain for GitHub, Drive, and ClickUp.
4. Context-manifest builder.
5. Test-specific AI analysis node or safely parameterized analysis path.
6. Test-specific normalization.
7. Dedicated success terminal storing output only in execution memory.
8. Dedicated failure terminal storing error only in execution memory.

Forbidden connections:
- Data Table tracking nodes.
- Drive create/update nodes.
- ClickUp create/update/close/comment/status nodes.
- Telegram nodes.
- Standard `Build Archivist Failure` path.
- Standard report creation path.
- Publish/activate/deploy operations.

Acceptance:
- Static graph inspection proves no path from the test trigger to a write node.
- Both success and error branches terminate inside the isolated subgraph.

## Phase 4 — AI-only live-read test
1. Run the isolated harness with live read sources.
2. Confirm source freshness and `context_complete=true`.
3. Confirm the AI returns the expected deterministic result envelope.
4. Confirm evidence ledger shape and bounded claims.
5. Confirm explicit terminal capture on success or error.
6. Query all known write nodes and prove zero execution.

Acceptance:
- No `Referenced node doesn't exist` error.
- No write node executed.
- Result shape passes normalization.
- One GREEN run is not sufficient for promotion.

## Phase 5 — Combined planner and validator test
1. Attach the already validated Drive and ClickUp dry-run planners inside the isolated subgraph.
2. Keep `external_writes_enabled=false`.
3. Run the common candidate validator and ClickUp enforcement.
4. Verify:
   - exact allowlist;
   - evidence IDs;
   - duplicate suppression;
   - deterministic ClickUp marker handling;
   - Drive folder/report planning;
   - final report cleanup ledger;
   - fail-closed behavior.
5. Query all write nodes and prove zero execution.

Acceptance:
- Two consecutive GREEN full-path isolated executions.
- Zero write-node execution in both runs.
- Stable result envelope and evidence ledger.

## Phase 6 — Minimal production-safe patch proposal
1. Diff the isolated fix against the active 66-node runtime architecture, not merely against the 293-node draft.
2. Separate essential production fix from experimental planner/test infrastructure.
3. Prepare a minimal patch containing only:
   - exact missing-reference correction;
   - required context-manifest pass-through;
   - necessary failure-route correction;
   - no unrelated refactor.
4. Document unresolved schema warnings and schedule divergence.
5. Prepare approval package with:
   - exact version IDs;
   - execution IDs;
   - reached/not-reached node evidence;
   - zero-write proof;
   - rollback plan.

Acceptance:
- Owner receives a bounded production change proposal.
- No publish occurs until explicit approval.

## Phase 7 — Optional cleanup after approval
Only with explicit owner approval:
1. Remove Data Table row `id=4` if it is confirmed to be test-only and safe to delete.
2. Publish/activate the approved minimal workflow version.
3. Run post-publish smoke checks.
4. Update ClickUp evidence and close tasks only after verified completion.

## Evidence map
- Full-path failed test: execution `3505`.
- Cleanup validator evidence: `3482`, `3484`, `3485`.
- Drive planner evidence: `3489`–`3493`.
- ClickUp planner evidence: `3496`–`3500`.
- Primary ClickUp task: `869e5b4uh`.
- Related ClickUp task: `869e5rqwq`.
- GitHub branch: `docs/automation-engineer-nightly-cleanup-gate`.
- Umbrella report: `docs/reports/automation-engineer/2026-07-24-nightly-cleanup-policy-gate.md`.
- Failure report: `docs/reports/automation-engineer/2026-07-24-archivist-nightly-readonly-failure.md`.

## New-chat startup instruction
Select `Automation Engineer` and continue one task only: restore safe draft routing, identify the exact stale node reference, and build a physically isolated AI test harness. Start by refreshing GitHub main, Drive AI Instructions/current reports, ClickUp tasks/blockers, current n8n workflow details/history, and execution `3505`. Do not publish and do not delete Data Table row `id=4`.
