---
title: GO IRL Self-Hosted Runner Operations
owner: Tech Lead
status: Active
source_of_truth: false
last_review: 2026-07-17
next_review: 2026-07-24
---

# GO IRL Self-Hosted Runner Operations

## Purpose

Run repository verification on the dedicated GO IRL server without using Termius for every check.

Flow:

```text
ChatGPT -> GitHub -> GitHub Actions -> self-hosted runner -> pnpm checks
```

GitHub remains the source of truth. The runner executes