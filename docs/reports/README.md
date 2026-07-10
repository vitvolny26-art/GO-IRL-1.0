---
title: AI Fix Reports
owner: Project Archivist
status: Active
source_of_truth: false
last_review: 2026-07-09
next_review: 2026-08-09
---

# AI Fix Reports

This folder stores task-level reports from AI agents that fix small bugs, UX issues, and design polish tasks.

## File naming

Use this format:

```text
YYYY-MM-DD-ai-fix-report.md
```

If multiple agents work on the same day, append a short suffix:

```text
YYYY-MM-DD-ai-fix-report-activity-card.md
YYYY-MM-DD-ai-fix-report-mobile-layout.md
```

## Required report sections

```markdown
# AI Fix Report — YYYY-MM-DD

## Summary

## Root cause

## Files changed

## Fix applied

## Verification

```text
pnpm run lint   PASS/FAIL
pnpm run build  PASS/FAIL
pnpm run test   PASS/FAIL
```

## Risks

## Not touched

## Follow-up
```

## Rules

- Reports must be short and factual.
- Do not claim beta-ready unless quality gates pass.
- If checks fail, include only the relevant red error block.
- Do not store secrets, `.env` values, tokens, or private user data in reports.
- Knowledge debt belongs in `docs/audit/KNOWLEDGE_DEBT.md`, not here.
