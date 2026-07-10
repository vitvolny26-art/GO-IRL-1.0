---
title: Knowledge Debt
owner: Project Archivist
status: Active
source_of_truth: true
last_review: 2026-07-09
next_review: 2026-07-16
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
| KD-003 | Bible audit and roadmap reference missing Bible books | Missing source files | Critical | Project Archivist | Open | 2026-07-23 | Restore missing files or rewrite audit to actual state. |
| KD-005 | Strategic docs lack YAML frontmatter | Metadata debt | High | Project Archivist | Open | 2026-07-31 | Add `title`, `owner`, `status`, `source_of_truth`, `last_review`, `next_review`. |
| KD-006 | `docs/GO_IRL_PRODUCT.md` is not registered in the source-of-truth hierarchy | Orphaned document | High | Product Lead | Open | 2026-07-31 | Register as product narrative or archive/split into canonical docs. |
| KD-007 | Security/release wording drifts across release and security docs | Consistency conflict | High | Security Lead | Open | 2026-07-16 | Align `RELEASE_NOTES.md`, `docs/Security.md`, `docs/SECURITY_RELEASE_CHECKLIST.md`, `supabase/README.md`. |
| KD-008 | `supabase/README.md` is source-of-truth but has no Knowledge Status metadata | Metadata debt | High | Supabase Steward | Open | 2026-07-31 | Add YAML and align with schema/RLS/security docs. |
| KD-009 | ADR registry does not exist | Missing governance package | High | Executive Council | Open | 2026-08-15 | Create `docs/adr/` and initial ADR-001 through ADR-006. |
| KD-010 | AI onboarding docs reference missing market and Bible files | Broken onboarding references | High | Project Archivist | Open | 2026-07-23 | Fix after missing Bible chapters are created or explicitly deferred. |
| KD-011 | Root legacy docs are referenced in `DOCS_INDEX.md` although some are absent | Registry conflict | Medium | Project Archivist | Open | 2026-07-31 | Either restore historical snapshots or remove from active registry. |
| KD-012 | `docs/governance/KNOWLEDGE_PLATFORM_2_0.md` and `docs/audit/KNOWLEDGE_PLATFORM_EPIC.md` overlap | Duplication | Medium | Project Archivist | Open | 2026-08-09 | Merge, archive, or define distinct purpose. |

## Immediate correction order

1. Restore or rewrite missing Bible chapters.
2. Add YAML frontmatter to P0/P1 source-of-truth documents.
3. Create ADR registry.
4. Align security/release/Supabase wording.
5. Add docs audit automation.

## Closed history

| ID | Closed on | Resolution |
|---|---|---|
| KD-001 | 2026-07-09 | `DOCS_INDEX.md` status registry normalized from `Current` to `Active` under Knowledge Status Model. |
| KD-002 | 2026-07-09 | `README.md` root sprint references replaced with `docs/roadmap/SPRINTS.md` and `docs/roadmap/SPRINT_0.md`; Knowledge Debt link added. |
| KD-004 | 2026-07-09 | Created `docs/market/README.md`, `docs/market/CONTINUOUS_COMPETITOR_INTELLIGENCE.md`, and `docs/market/COMPETITOR_ANALYSIS_TEMPLATE.md`. |
