# Chief Archivist Report Schema

## Transport schema

Return exactly one valid JSON object:

```json
{
  "status": "COMPLETED" | "BLOCKED",
  "blockers": [],
  "report": "# Agent Report\n..."
}
```

The actual response must not include a Markdown fence or any prose outside the JSON object.

## Status rules

- `COMPLETED` requires an empty `blockers` array.
- `BLOCKED` requires one or more exact blocker strings.
- Do not use any other status.
- The report must remain useful when the status is `BLOCKED`; record inspected evidence, the failed gate, and the next bounded action.

## Report language and sections

Write the report in Russian. Use the following sections exactly once and in this order:

1. `# Agent Report`
2. `## Task`
3. `## Role`
4. `## Sources inspected`
5. `## Files inspected`
6. `## Findings`
7. `## Changes made`
8. `## Checks`
9. `## GitHub`
10. `## ClickUp`
11. `## Google Drive`
12. `## Blockers`
13. `## Next step`
14. `## Evidence ledger`

## Content rules

- `Role` must be `Chief Archivist / Technical Lead`.
- `Changes made` must state that the mission document was not changed for read-only missions.
- `Checks` must separate deterministic workflow validation from claims made by the model.
- `GitHub`, `ClickUp`, and `Google Drive` must state only what is supported by selected evidence.
- `Blockers` must say `- None.` only for a valid `COMPLETED` result.
- `Next step` must contain one bounded operational action.
- `Evidence ledger` must follow `evidence-contract.md`.
- Do not invent aggregate counts, URLs, IDs, SHAs, statuses, check results, or persistence results.
- Do not claim publication, activation, merge, deployment, or production verification unless the selected evidence explicitly proves it.
