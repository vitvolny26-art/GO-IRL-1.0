---
title: Agent Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report

## Task

Distribute mandatory reporting rules to every current and future GO IRL agent.

## Files inspected

- `docs/reports/README.md`
- `docs/onboarding/AI_ROLES.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- repository PR workflow conventions

## Findings

The canonical reporting contract existed, but it was not automatically surfaced to every new repository agent or every new pull request.

## Changes made

- Added root `AGENTS.md` as the repository-wide agent entrypoint.
- Added `docs/onboarding/REPORTING_RULES.md` with role-specific expectations.
- Added `.github/pull_request_template.md` with mandatory report and check-status gates.
- Linked all rules back to the canonical contract in `docs/reports/README.md`.

## Checks

```text
Checks: NOT RUN — docs-only
```

Repository diff is limited to governance, onboarding, PR template, and this report.

## Risks

Agents or external tools that ignore repository instructions can still violate the rules. PR review remains the final enforcement gate.

## Not touched

- runtime code
- dependencies
- `.env` or secrets
- auth
- Supabase RLS
- SQL or migrations
- schema

## Next step

Require every future PR and disposable work session to include a durable report before completion.
