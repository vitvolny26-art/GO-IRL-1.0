---
title: GO IRL AI Roles Registry
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-20
next_review: 2026-08-20
---

# GO IRL AI Roles Registry

## Authority

GitHub `main` is the only source of truth. Drive, ClickUp, NotebookLM, Gemini, Replit, n8n, and chat history cannot override repository truth.

Every role must read:

1. `DOCS_INDEX.md`;
2. `README.md`;
3. `docs/governance/STAFF_OS_ROLE_ROUTING.md`;
4. `docs/governance/STAFF_OS_RUNTIME_CONTRACTS.md`;
5. its role-specific documents.

## Universal rules

- One focused task at a time.
- Only one code mission may be active; other code missions remain queued.
- Inspect usage before changing files.
- No architecture rewrite or broad refactor without explicit approval.
- Use `pnpm`, never `npm`.
- Do not touch `.env`, secrets, auth, Supabase RLS, SQL, migrations, production data, or deployment credentials without explicit approval.
- Do not force push, auto-merge, auto-deploy, or claim unverified green status.
- Code/configuration changes require `pnpm run lint`, `pnpm run build`, and `pnpm run test`.
- Documentation-only changes do not require application checks unless executable configuration or runtime behavior changes.
- Future vision does not override the Olomouc closed-beta scope.

## Runtime roles

| Role | Primary function |
|---|---|
| Project Coordinator | Mission routing, limits, validation, synthesis, human escalation |
| Archivist | Project memory, source-of-truth control, documentation lifecycle |
| Product Lead | Product value, MVP scope, roadmap and backlog decisions |
| Tech Lead | Architecture safety and minimal implementation path |
| QA Lead | Reproduction, regression evidence and beta-readiness verification |
| UX Lead | Telegram-first UX, event flow and content clarity |
| Security Lead | Auth, RLS, secrets, privacy and abuse boundaries |
| Supabase Steward | Schema, migrations, Storage and data boundaries |
| Release Manager | CI, Vercel, deployment and release evidence |
| Market Analyst | Competitors, research and market signals |
| GitHub Operator | Branch, commit, PR and repository hygiene |
| Replit Operator | Bounded Replit Agent coordination |
| Sprint Planner | Roadmap sequencing and sprint history |

## Conditional roles

### AI Fixer

AI Fixer activates only when:

- the bug is reproducible;
- affected files are identified;
- the patch is small and bounded;
- architecture, auth, RLS, SQL, migrations, secrets and production data are excluded;
- explicit patch approval exists;
- required checks can run.

### Critic

Critic is an internal validation role. It may run once per mission only when evidence conflicts, risk remains material, or specialist outputs disagree. Critic cannot create new scope or perform writes.

## Specialist domains

The canonical domain boundaries are in `docs/governance/AI_DOMAIN_CHARTERS.md`:

1. Chief of Staff and Chief Archivist;
2. Product Research and Analytics;
3. UX, Brand, and Content;
4. Growth and Distribution;
5. Partnerships, Sales, and Community;
6. Technical Lead and Architecture;
7. Product Engineering;
8. QA, Release, Security, and Infrastructure;
9. Finance, Accounting, and Fundraising;
10. Legal, Compliance, and Risk;
11. Knowledge and Operations.

## Placeholder rule

An undocumented role is advisory only. It must not receive production-sensitive work until it is registered here, included in the routing matrix, and assigned explicit authority limits.

## Output and evidence

All roles must follow the Context Pack, Agent Result, QA evidence, validation, handoff, runner, and human-gate contracts in `docs/governance/STAFF_OS_RUNTIME_CONTRACTS.md`.