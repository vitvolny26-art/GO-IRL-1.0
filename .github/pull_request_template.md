## Scope

Describe one focused task.

## Changes

- 

## Validation

For code changes, record actual results:

```text
pnpm run lint       PASS/FAIL
pnpm run build      PASS/FAIL
pnpm run test       PASS/FAIL
pnpm run typecheck  PASS/FAIL
```

For documentation-only changes:

```text
Checks: NOT RUN — docs-only
```

For external blockers:

```text
Checks: BLOCKED — <exact reason>
```

## Durable report

- [ ] Added or updated a task report under `docs/reports/`.
- [ ] Report follows `docs/reports/README.md`.
- [ ] Report does not claim green status without evidence.
- [ ] Historical reports were not silently rewritten.

Report path:

```text
docs/reports/YYYY-MM-DD-agent-report-<topic>.md
```

## Safety

- [ ] No `.env`, secrets, auth, Supabase RLS, destructive SQL, or migrations changed without explicit approval.
- [ ] No `node_modules`, `dist`, `package-lock.json`, exports, or backups committed.
- [ ] No force push.
