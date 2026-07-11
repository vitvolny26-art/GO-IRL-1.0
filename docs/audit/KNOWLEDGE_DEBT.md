---
title: Knowledge Debt
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# Knowledge Debt

## Purpose

This document tracks missing, stale, conflicting, duplicated, or misleading project knowledge in GO IRL 1.0.

It exists to prevent AI agents, contributors, and future maintainers from treating outdated or missing documentation as current project truth.

## Rules

- Every debt item must have an owner, severity, status, and due date.
- Critical items must be reviewed weekly until closed.
- Closed items move to the history section.
- This file tracks documentation and knowledge debt only.
- Code, `.env`, secrets, Supabase RLS, auth, and destructive SQL are out of scope unless explicitly approved elsewhere.
- Assistant reports from NotebookLM, Gemini, or other AI tools are inputs for review, not source-of-truth documents.

## Severity model

| Severity | Meaning |
|---|---|
| Critical | Misleads implementation, onboarding, release, security, or source-of-truth hierarchy. |
| High | Blocks clean documentation automation or creates repeated confusion. |
| Medium | Important cleanup, but not blocking beta-readiness decisions. |
| Low | Naming, formatting, archival, or later structural improvement. |

## Status model

| Status | Meaning |
|---|---|
| Open | Known debt, not fixed. |
| In Progress | Fix is being worked on. |
| Review | Fix exists and needs validation. |
| Closed | Resolved and moved to history. |
| Deferred | Accepted debt with explicit reason. |

## Open items

| ID | Debt item | Type | Severity | Owner | Status | Due date | Notes |
|---|---|---|---|---|---|---|---|
| KD-005 | Strategic docs lack YAML frontmatter | Metadata debt | High | Project Archivist | Open | 2026-07-31 | Add `title`, `owner`, `status`, `source_of_truth`, `last_review`, `next_review`. |
| KD-006 | `docs/GO_IRL_PRODUCT.md` is not registered in the source-of-truth hierarchy | Orphaned document | High | Product Lead | Open | 2026-07-31 | Register as product narrative or archive/split into canonical docs. |
| KD-007 | Security/release wording drifts across release and security docs | Consistency conflict | High | Security Lead | Open | 2026-07-16 | Align `RELEASE_NOTES.md`, `docs/Security.md`, `docs/SECURITY_RELEASE_CHECKLIST.md`, `supabase/README.md`. |
| KD-008 | `supabase/README.md` is source-of-truth but has no Knowledge Status metadata | Metadata debt | High | Supabase Steward | Open | 2026-07-31 | Add YAML and align with schema/RLS/security docs. |
| KD-009 | ADR registry does not exist | Missing governance package | High | Executive Council | Open | 2026-08-15 | Create `docs/adr/` and initial ADR-001 through ADR-006. |
| KD-010 | AI onboarding docs reference missing market and Bible files | Broken onboarding references | High | Project Archivist | Open | 2026-07-23 | Fix after missing Bible chapters are created or explicitly deferred. |
| KD-011 | Root legacy docs are referenced in `DOCS_INDEX.md` although some are absent | Registry conflict | Medium | Project Archivist | Open | 2026-07-31 | Either restore historical snapshots or remove from active registry. |
| KD-012 | `docs/governance/KNOWLEDGE_PLATFORM_2_0.md` and `docs/audit/KNOWLEDGE_PLATFORM_EPIC.md` overlap | Duplication | Medium | Project Archivist | Open | 2026-08-09 | Merge, archive, or define distinct purpose. |
| KD-014 | Chat lifecycle wording may conflict with SQL/migration behavior | Docs/schema mismatch | High | Supabase Steward | Open | 2026-07-18 | NotebookLM audit flagged a possible mismatch between event lifecycle documentation and chat expiry behavior. Verify against migrations and product intent before any SQL work. Do not change Supabase/RLS/auth from this item alone. |
| KD-015 | Legacy/demo identity fallback can confuse Trusted Auth documentation | Security documentation drift | Medium | Security Lead | Open | 2026-07-24 | Verify current production path, release wording, and legacy/demo header boundaries. Do not change `.env`, Vercel secrets, auth, or RLS from this item alone. |
| KD-016 | Assistant reports may contain false positives if generated from incomplete exports | AI audit reliability | Medium | Project Archivist | Open | 2026-07-24 | NotebookLM reported missing files that may exist in GitHub. Add verification discipline: every AI audit claim must be checked against GitHub before changing source-of-truth docs. |

## Immediate correction order

1. Add YAML frontmatter to P0/P1 source-of-truth documents.
2. Verify NotebookLM findings against GitHub before accepting them into source-of-truth docs.
3. Review chat lifecycle documentation versus current Supabase migration behavior without changing SQL yet.
4. Align security/release/Supabase wording.
5. Create ADR registry.
6. Add docs audit automation.

## Closed history

| ID | Closed on | Resolution |
|---|---|---|
| KD-001 | 2026-07-09 | `DOCS_INDEX.md` status registry normalized from `Current` to `Active` under Knowledge Status Model. |
| KD-002 | 2026-07-09 | `README.md` root sprint references replaced with `docs/roadmap/SPRINTS.md` and `docs/roadmap/SPRINT_0.md`; Knowledge Debt link added. |
| KD-003 | 2026-07-11 | Bible target chapters were completed and the audit/roadmap were rewritten to actual state. `docs/bible/09-governance-and-ai-organization.md` and `docs/bible/10-operations-and-release.md` now exist and are registered in `DOCS_INDEX.md`. |
| KD-004 | 2026-07-09 | Created `docs/market/README.md`, `docs/market/CONTINUOUS_COMPETITOR_INTELLIGENCE.md`, and `docs/market/COMPETITOR_ANALYSIS_TEMPLATE.md`. |
| KD-013 | 2026-07-11 | Category scope conflict moved from docs-only ambiguity to implemented closed-beta taxonomy guard: `CHANGELOG.md` labels extras as taxonomy/test candidates; `ROADMAP.md` and `BACKLOG.md` keep six-category guardrail; create-event UI now uses closed beta categories/options while broader taxonomy remains hidden/experimental data. |
