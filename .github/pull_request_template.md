## Scope

Describe one focused task and one branch.

## Delivery workflow

- [ ] One task in one branch.
- [ ] No intermediate attempts or red states were pushed.
- [ ] One final push only.
- [ ] One focused PR only.
- [ ] Squash merge only.

## Changes

- 

## Validation

For code or runtime/config changes, record actual results in this order:

```text
pnpm run typecheck  PASS/FAIL
pnpm run lint       PASS/FAIL
pnpm run build      PASS/FAIL
pnpm run test       PASS/FAIL
```

For pure documentation-only changes:

```text
Checks: NOT RUN — docs-only
```

A PR is docs-only only when every changed file is Markdown or is under `docs/`. Docs-only PRs are skipped by Vercel through the repository ignore policy.

For external blockers:

```text
Checks: BLOCKED — <exact reason>
```

## Durable report

- [ ] Added one task report under `docs/reports/`.
- [ ] Report follows `docs/reports/README.md`.
- [ ] Historical reports were not silently rewritten.

Report path:

```text
docs/reports/YYYY-MM-DD-agent-report-<topic>.md
```

## Safety

- [ ] No `.env`, secrets, auth, Supabase RLS, destructive SQL, or migrations changed without explicit approval.
- [ ] No `node_modules`, `dist`, `package-lock.json`, exports, or backups committed.
- [ ] No force push.