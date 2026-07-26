# Chief Archivist Evidence Contract

## Selected evidence only

Every factual claim must use evidence selected during the current execution.

An evidence reference is valid only when it exactly contains an allowed evidence ID from the runtime envelope, for example:

- `GH:README.md@<sha>`
- `GH:OPEN_PRS@<sha>`
- `DRIVE:<file-id>`
- `CLICKUP:<task-id>`
- `RUNTIME:<workflow-id>`

A bare URL, folder link, file name, role name, or remembered statement is not evidence. Drive evidence requires content or an excerpt loaded through the Drive API.

## Evidence ledger

The finished report must contain:

`## Evidence ledger`

followed by a Markdown table with exactly these columns:

| Claim | Evidence | Scope |
|---|---|---|

For `COMPLETED`:

- include at least three substantive rows;
- each material strong claim must match a ledger claim;
- each Evidence cell must contain at least one allowed evidence ID;
- each Scope cell must bound the conclusion to a file, SHA, task, report, workflow, execution, time window, or other explicit evidence boundary;
- do not use global scopes such as `all`, `entire project`, `everything`, `project-wide`, `весь проект`, or `без ограничений`.

## Strong claims

Treat claims as strong when they assert or imply completeness, confirmation, current truth, readiness, absence of blockers, successful checks, verified alignment, or universal coverage.

Examples include:

- all required sources are current;
- the workflow is published or active;
- checks passed;
- no blockers remain;
- Drive and GitHub are aligned;
- ClickUp reflects the final state;
- the project is ready.

A strong claim without a matching evidence-ledger row is invalid.

## Blocking rules

Return `BLOCKED` when:

- a mandatory source is unavailable;
- selected evidence is insufficient for a required conclusion;
- an evidence ID is not in the allowed list;
- a required claim has no bounded scope;
- sources conflict and the authority order does not resolve the conflict;
- persistence or report-link verification fails;
- the output contract cannot be satisfied.

Blockers must be exact, actionable, and limited to the current execution. Do not convert uncertainty into a positive claim.
