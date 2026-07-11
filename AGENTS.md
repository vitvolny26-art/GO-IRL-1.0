# GO IRL Agent Rules

All agents must read:

1. `DOCS_INDEX.md`
2. `README.md`
3. `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
4. `docs/onboarding/REPORTING_RULES.md`
5. `docs/reports/README.md`

## Mandatory workflow

- One task per branch.
- Do not push intermediate attempts.
- For code or runtime/config changes, run in this order before the only push: `pnpm run typecheck`, `pnpm run lint`, `pnpm run build`, `pnpm run test`.
- Make one final commit and one final push.
- Open one PR.
- Merge with squash only.
- Pure