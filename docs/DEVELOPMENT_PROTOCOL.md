# GO IRL Development Protocol

Generated: 2026-07-07T14:00:40.297Z

## Workflow

1. Analyze current code and all usages before editing.
2. Change only one feature per patch.
3. Run:
   - pnpm run lint
   - pnpm run build
   - pnpm run test
4. Commit only if green.
5. Push only clean working tree.

## Output format for every fix

- Analysis
- Files changed
- SQL if needed
- React/components changed
- Tests run
- Commit message
- Known risks

## Forbidden without explicit approval

- force push
- changing .env or secrets
- broad RLS changes
- production destructive SQL
- large architecture rewrites
- committing node_modules, dist, backup files, package-lock.json

## Mobile development rule

When working from phone/Codespaces:
- use scripts/patches, not manual line editing;
- use pnpm, not npm;
- keep commands short;
- check git status before and after every patch.
