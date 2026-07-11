---
title: NotebookLM Docs Audit Report
owner: Assistant Archivist
status: Review
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# NotebookLM Docs Audit — GO IRL

## Status

This report is an Assistant Archivist input. It is not a source of truth.

GitHub remains the only source of truth. Findings from NotebookLM must be verified against the repository before they are accepted into `DOCS_INDEX.md`, `docs/audit/KNOWLEDGE_DEBT.md`, code, Supabase, release notes, or roadmap files.

## Executive summary

NotebookLM detected documentation/code drift, MVP scope creep risks, metadata gaps, and several Knowledge Debt candidates.

The strongest confirmed finding is that project knowledge must distinguish between:

1. Current closed beta scope.
2. Experimental/test taxonomy.
3. Future Phase 2 scope.
4. Historical documentation.

The closed beta remains Olomouc-first and must stay focused on six canonical user-facing categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

## Accepted findings for review

| Finding | Decision | Notes |
|---|---|---|
| Phantom/non-canonical categories can confuse beta scope. | Accepted. | Create-event UI must stay limited to the closed beta taxonomy. Broad taxonomy may remain as hidden/experimental data only. |
| Chat lifecycle wording may conflict with SQL/migration reality. | Accepted as Knowledge Debt. | Do not touch Supabase SQL without explicit approval. |
| Legacy identity fallback may confuse security documentation. | Accepted as Knowledge Debt. | Do not change auth, Vercel env, or secrets through this report. |
| Metadata/frontmatter is incomplete across strategic docs. | Accepted as Knowledge Debt. | Should be handled in small docs-only patches. |
| DOCS_INDEX registry needs continuous sync. | Accepted. | Update only after verified file existence in GitHub. |
| Bible governance and release chapters are still incomplete. | Accepted. | Finish without rewriting the project or treating Bible as implementation truth. |

## Findings not accepted without GitHub verification

| Finding | Reason |
|---|---|
| Missing `docs/GO_IRL_CONSTITUTION.md`. | Likely export-slice issue. Verify in GitHub before acting. |
| Missing `docs/audit/KNOWLEDGE_DEBT.md`. | Likely export-slice issue. Verify in GitHub before acting. |
| Missing `docs/SPORT_COACH_MVP.md`. | Must be verified in GitHub before restoration work. |
| Exact broken-link list. | NotebookLM source pack may be incomplete. |
| Any Supabase SQL fix recommendation. | Needs explicit product/database decision and separate safe migration review. |
| Any auth/Vercel secret recommendation. | Needs explicit release/security owner approval. |

## Accepted Knowledge Debt candidates

| ID | Title | Severity | Status | Boundary |
|---|---|---|---|---|
| KD-014 | Chat Lifecycle Mismatch | High | Open | Documentation/schema decision only; no SQL patch yet. |
| KD-015 | Unsafe Identity Fallback | Medium | Open | Documentation/security alignment only; no auth change yet. |
| KD-016 | Phantom Categories | High | Review/Open depending on taxonomy guard verification | Closed beta UI must not expose non-canonical categories. |

## Chief Archivist decisions

1. Keep the brand `GO IRL` for MVP; SEO/name-collision risk is future marketing debt, not a beta blocker.
2. Keep six canonical closed beta categories.
3. Keep experimental categories out of public beta documentation unless explicitly marked future/experimental.
4. Do not apply Supabase migration changes from this report.
5. Do not change auth, RLS, secrets, or Vercel environment variables from this report.
6. Treat NotebookLM as an analysis assistant, not an approving system.

## Recommended next patches

| Patch | Type | Files | Risk | Notes |
|---|---|---|---|---|
| Knowledge Debt update | Docs | `docs/audit/KNOWLEDGE_DEBT.md` | Low | Add KD-014, KD-015, KD-016 and close KD-013 after taxonomy guard verification. |
| Metadata Stamp | Docs | `README.md`, `ROADMAP.md`, `DOCS_INDEX.md`, `RELEASE_NOTES.md` | Low | Add standard frontmatter in small batches. |
| Registry Sync | Docs | `DOCS_INDEX.md` | Low | Register confirmed important helper files only after GitHub verification. |
| Bible Governance | Docs | `docs/bible/09-governance-and-ai-organization.md` | Low | Summarize existing AI org docs; no new architecture. |
| Bible Release Ops | Docs | `docs/bible/10-operations-and-release.md` | Low | Summarize release gates; no CI/secrets changes. |

## Do not touch from this report

- `.env`, `.env.example`, secrets, API keys.
- Supabase RLS, auth, production database data.
- Destructive SQL.
- Large code refactors.
- Force push.
- Payment/TON/Stars implementation.
- Automatic Telegram chat generation.
- Prague/Brno expansion.

## Top 5 next actions

1. Update `docs/audit/KNOWLEDGE_DEBT.md` with accepted findings.
2. Close KD-013 only if taxonomy guard is verified in code and docs.
3. Add metadata to source-of-truth docs in small batches.
4. Finish Bible 09 and Bible 10 as documentation-only chapters.
5. Keep NotebookLM exports as read-only analysis inputs.
