# Codex report: Staff OS `/reject` command

Date: 2026-07-21

Status: implementation and draft workflow structure are green; production rollout and post-deployment Telegram smoke remain human-gated.

This is a non-authoritative Agent Report. GitHub `main` remains the source of truth. Google Drive was used only to compare the operational mirror.

## Task

Add an owner-gated, terminal Telegram command:

```text
/reject <MISSION-ID> [reason]
```

The command must find the persisted Mission, reject it idempotently, preserve audit evidence, release the active Runtime slot when applicable, and leave `/mission`, `/approve`, `/status`, Google Docs URLs, `/fix`, and `/archivist` unchanged.

## Files and systems inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/governance/AI_ORGANIZATION.md`
- `docs/governance/ARCHIVIST_OPERATING_POLICY.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/onboarding/PROJECT_COORDINATOR_CHARTER.md`
- `docs/onboarding/AI_ROLES.md`
- `docs/reports/2026-07-21-agent-report-n8n-reject-command.md`
- `docs/reports/2026-07-11-n8n-ai-staff-os-audit.md`
- `scripts/ai-orchestrator/bridge.cjs`
- `scripts/ai-orchestrator/runtime/core.cjs`
- live n8n workflow `bZF7vxTD6eWE6APb`
- n8n Data Table `go_irl_mission_queue`
- Drive mirrors: Governance & Staff OS Standard, Staff OS Runtime Contracts, Staff OS Role Routing Matrix, and n8n Orchestration Status

The historical report `docs/reports/2026-07-21-agent-report-n8n-reject-command.md` on `main` is truncated mid-sentence. It was treated as evidence of the reported symptom, not as a complete implementation specification.

## Root cause

The live Telegram command router gave Staff OS precedence only to `/mission` and `/approve`, routed `/status` separately, and sent everything else to the Google Docs lane. Therefore `/reject` reached the Google Docs input validator.

n8n execution `440` is the exact pre-change evidence:

- input: `/reject MISSION-TG-509799028-90`;
- executed lane: `Normalize Telegram Request` -> `Build Input Reject`;
- response: `Google Docs link is required...`;
- the Staff OS queue and Runtime were not changed.

There was also no `mission reject` command in `scripts/ai-orchestrator/bridge.cjs`. n8n must not edit Runtime state files directly, so a workflow-only patch could not safely release the Runtime slot.

## Changes made

### Runtime Bridge

- Added `mission reject` to the stable JSON Bridge command set.
- Requires `mission_id` and a non-empty human `actor`.
- Accepts an optional reason, limited to 500 characters.
- Allows rejection from the active pre-publication Runtime states.
- Transitions the Mission to terminal `rejected`.
- Records `actor`, `action`, timestamp, and reason in `closed_by` and the terminal history event.
- Clears `active_mission_id` only when the rejected Mission owns that slot.
- Returns an unchanged public envelope when the Mission is already terminal; a repeated rejection is therefore idempotent.

### n8n draft

The draft of `GO IRL — Unified AI Operations — Google Doc + Staff OS` was changed minimally. Its published active version was not changed.

The draft now routes:

```text
Telegram Trigger
  -> Staff OS command precedence
  -> Telegram owner validation
  -> Reject Command?
  -> Parse Reject Command
  -> Queue lookup by mission_id
  -> queue owner/state validation
  -> Runtime reject required?
       yes -> SSH -> bridge.cjs mission reject -> parse JSON envelope
       no  -> queued/not-started or already-terminal idempotent path
  -> persist rejected queue record
  -> Telegram confirmation
```

Two audit columns were added to `go_irl_mission_queue`:

- `rejection_reason` (`string`)
- `rejected_at` (`date`)

The workflow never reads `.runtime-state` or `state.json`. Active Runtime changes go only through `bridge.cjs`.

## Runtime slot release logic

1. A `queued` or Runtime-`not_started` Mission is made terminal in the n8n queue without calling Runtime; it never owned a Runtime slot.
2. A `running` or `awaiting_human_approval` Mission with a known Runtime state calls `bridge.cjs mission reject`.
3. Runtime changes the Mission to `rejected` and clears `active_mission_id` only if it equals the rejected Mission ID.
4. n8n then stores `integration_status=rejected`, `next_action=none`, the reason, and the rejection timestamp.
5. The existing Queue Pump can promote the next queued Mission on its next scheduled pass.
6. Completed, rejected, blocked, failed, cancelled, or archived Missions are returned idempotently and are not converted to another terminal state.

## Local files changed

- `scripts/ai-orchestrator/runtime/core.cjs`
- `scripts/ai-orchestrator/bridge.cjs`
- `scripts/ai-orchestrator/bridge.test.mjs`
- `scripts/ai-orchestrator/README.md`
- `docs/reports/2026-07-21-codex-staff-os-reject-command.md`

No application, Supabase, Auth, RLS, SQL, migration, deployment, secret, or production-data file was changed.

## Checks

| Check | Result | Evidence |
| --- | --- | --- |
| `pnpm run typecheck` | PASS | `tsc -b`, exit 0 |
| `pnpm run lint` | PASS | `eslint .`, exit 0 |
| `pnpm run build` | PASS | Vite 8.1.3, 266 modules, exit 0 |
| `pnpm run test` | PASS | 61 files, 307 tests on current `origin/main` (`f43157e`) |
| `git diff --check` | PASS | exit 0; only line-ending notices |
| Staff OS validator | PASS | 19 required nodes; inactive; no cycle; no private bindings |
| Staff OS test script | PASS | A-E, budget split, and duplicate retention |
| live draft structural matrix | PASS | 19/19 assertions |

The live draft uses the existing SSH and Telegram credentials by reference. No credential value or token was added to code or workflow parameters.

## Smoke evidence

| Scenario | Result | Evidence |
| --- | --- | --- |
| `/status` | PASS on current published workflow | n8n execution `182` reached `Status — Build Reply` and succeeded |
| `/mission` | PASS on current published workflow | n8n execution `432` reached `Build Mission JSON` and succeeded |
| `/approve` | STRUCTURAL PASS | existing approval edge and nodes are unchanged; no new production command was sent |
| `/reject` before patch | CONFIRMED FAIL | execution `440` reproduced the Google Docs routing defect |
| `/reject` Runtime unit path | PASS | terminal state, audit trail, and slot release asserted |
| repeated `/reject` | PASS in Runtime test | second request returns the same terminal envelope |
| unknown Mission | STRUCTURAL PASS | lookup failure is routed to the existing sanitized Telegram failure lane |
| ordinary Google Docs URL | STRUCTURAL PASS | router output 2 still connects to `Normalize Telegram Request` |
| `/fix <URL>` | STRUCTURAL PASS | Google Docs lane was not edited |
| `/archivist <URL>` | STRUCTURAL PASS | Google Docs lane was not edited |

Post-change real Telegram smoke is intentionally not claimed. The patched graph is still a draft, and the VPS runner does not have the local `mission reject` Bridge implementation until an approved GitHub rollout occurs.

## Risks

- Publishing the n8n draft before the Runtime commit reaches `/opt/go-irl-runner/repo` would make active-Mission rejection fail at the SSH Bridge step.
- The draft has pre-existing n8n validation warnings on older Telegram and Drive nodes that were outside this minimal patch. The newly added Telegram node has explicit `resource=message` and `operation=sendMessage` discriminators.
- Queue promotion is scheduled, not synchronous; the next Mission starts on the next Queue Pump tick.
- The canonical historical `/reject` report is truncated and should be repaired separately rather than silently rewritten in this change.

## Not touched

- published n8n version `7d4d6f05-6567-41af-8568-091f4d80ed31`
- application code
- Supabase, Auth, RLS, SQL, migrations
- secrets or credential values
- production data
- Google Docs routing behavior
- GitHub commit, branch, push, PR, merge, or deployment

## Next step

Obtain explicit Change Approval for the five-file commit and Draft PR. After review and merge, update the VPS runner to the approved commit, publish the already-prepared n8n draft, then run the full real Telegram matrix: `/status`, `/mission`, `/approve`, `/reject`, repeated `/reject`, unknown Mission, ordinary Docs URL, `/fix`, and `/archivist`.
