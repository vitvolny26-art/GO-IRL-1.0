---
title: Agent Report
owner: AI Fixer / QA + UX Polish Agent
status: Draft
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Agent Report

## Task

Remove duplicate leading emoji from event card title and subtitle text while keeping the large event icon.

## Files inspected

- `DOCS_INDEX.md`
- `README.md`
- `docs/DEVELOPMENT_PROTOCOL.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `docs/bible/08-runtime-boundaries.md`
- `docs/onboarding/AI_FIXER_AGENT.md`
- `src/App.tsx`
- `src/verticals/SportVertical.tsx`
- `src/main.tsx`

## Findings

Older and newly created activities can contain a leading emoji inside activity/title strings. The card already renders a dedicated large event icon, so this creates a duplicate emoji in card text.

## Changes made

- Added `stripLeadingEmoji()` for safe leading-emoji cleanup.
- Added a small card-text observer for sport and generic unified cards.
- Kept the large event avatar/icon unchanged.
- Added unit coverage for coffee, volleyball, language exchange, plain text, and empty text.

## Checks

```text
pnpm run lint   PENDING CI
pnpm run build  PENDING CI
pnpm run test   PENDING CI
```

## Next step

Review CI on the draft pull request. Merge only after all checks pass.
