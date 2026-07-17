---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-17
next_review: 2026-07-24
---

# Agent Report

## Task

Document the installed GO IRL GitHub Actions self-hosted runner and add reusable successor instructions.

## Files inspected

- `.github/workflows/ci.yml`
- `.github/workflows/self-hosted-verify.yml`
- `package.json`
- `pnpm-lock.yaml`
- `DOCS_INDEX.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- GitHub Actions run `29549050132`

## Findings

- Runner `dedirock-goirl-1` is installed under `/opt/actions-runner` and runs as `goirl-runner`.
- The correct work folder is `_work`.
- The manual verification workflow checks `main` with read-only repository permissions.
- The first run exposed an invalid work-folder value and stale `/tmp/go-irl-fontconfig` ownership.
- Both operational issues were corrected.
- The Node.js 20 deprecation message from `pnpm/action-setup@v4` is currently non-blocking.

## Changes made

- Added `docs/operations/SELF_HOSTED_RUNNER.md`.
- Added `docs/onboarding/SELF_HOSTED_RUNNER_INSTRUCTIONS.md`.
- Recorded runner identity, workflow path, checks, safety boundaries, recovery procedures, and verified baseline.

## Checks

GitHub Actions run `29549050132`:

- install: PASS
- test: PASS
- typecheck: PASS
- lint: PASS
- build: PASS

Documentation-only changes; no additional code checks required.

## Next step

Use `Self-hosted verification` for future remote quality-gate checks. Keep deployment and arbitrary shell execution outside this workflow unless separately approved and reviewed.
