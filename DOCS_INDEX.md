---
title: GO IRL Documentation Status Registry
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# GO IRL Documentation Status Registry

## Authority

- Verified runtime evidence and GitHub `main` define implemented truth.
- `docs/release/CURRENT_PHASE.md` defines lifecycle phase.
- `docs/PRODUCT_PHILOSOPHY.md` defines why the product exists.
- `docs/GO_IRL_CONSTITUTION.md` defines product and architecture principles.
- `docs/GO_IRL_PRODUCT.md` is the central product narrative and scope bridge.
- `docs/MARKET_POSITIONING.md` defines market positioning and feature filtering.
- `README.md` describes current repository/runtime scope.
- `docs/audit/KNOWLEDGE_DEBT.md` tracks unresolved knowledge debt.
- Bible chapters preserve reconciled product knowledge but never override code, applied schema, auth, or RLS.

## Current lifecycle

Closed Beta completed on 2026-07-20. Release Preparation and focused post-beta stabilization are active. Broad public launch is not claimed.

## Core registry

| Document | Status | Source of truth | Purpose |
|---|---|---:|---|
| `README.md` | Active | Yes | Current repository and runtime scope |
| `ROADMAP.md` | Active | Yes | Product and engineering direction |
| `BACKLOG.md` | Draft | No | Controlled work queue |
| `RELEASE_NOTES.md` | Active | Yes | Release implementation status; reconcile when stale |
| `docs/release/CURRENT_PHASE.md` | Active | Yes | Lifecycle phase |
| `docs/PRODUCT_PHILOSOPHY.md` | Active | Yes | Mission and product philosophy |
| `docs/GO_IRL_CONSTITUTION.md` | Active | Yes | Product and architecture principles |
| `docs/GO_IRL_PRODUCT.md` | Active | Yes | Central product narrative and scope layers |
| `docs/MARKET_POSITIONING.md` | Active | Yes | Market position and feature filter |
| `docs/audit/KNOWLEDGE_DEBT.md` | Active | Yes | Knowledge debt registry |
| `docs/DATABASE_SCHEMA_AUDIT.md` | Active | Yes | Schema-versus-future boundary |
| `docs/governance/ARCHIVIST_OPERATING_POLICY.md` | Active | Yes | Archivist authority and gates |
| `docs/automation/DOCUMENTATION_GOVERNANCE_ARCHIVIST.md` | Active | Yes | Current merged governance automation record |
| `docs/reports/README.md` | Active | No | Report format and lifecycle |

## Product Bible registry

| Book | Document | Status |
|---|---|---|
| Audit | `docs/bible/00-completion-audit.md` | Active |
| Maintenance | `docs/bible/00-bible-roadmap.md` | Active |
| I | `docs/bible/01-foundation/00-foundation-overview.md` | Active |
| I | `docs/bible/01-foundation/01-product-philosophy.md` | Active |
| I | `docs/bible/01-foundation/01-why-we-exist.md` | Active |
| I | `docs/bible/01-foundation/02-core-principles.md` | Active |
| I | `docs/bible/01-foundation/03-mvp-scope-and-market-positioning.md` | Active |
| II | `docs/bible/02-platform-architecture.md` | Active |
| III | `docs/bible/03-database-and-supabase-boundaries.md` | Active |
| IV | `docs/bible/04-modules-architecture.md` | Active |
| IV | `docs/bible/04-modules-mvp-audit.md` | Active |
| V | `docs/bible/05-product-requirements.md` | Active |
| V | `docs/bible/05-product-requirements-mvp-split.md` | Active |
| VI | `docs/bible/06-ux-interaction-guidelines.md` | Active |
| VII | `docs/bible/07-beta-readiness-and-operations.md` | Active |
| VIII | `docs/bible/08-runtime-boundaries.md` | Active |
| IX | `docs/bible/09-governance-and-ai-organization.md` | Active |
| X | `docs/bible/10-operations-and-release.md` | Active |

## Status model

`Draft`, `Review`, `Approved`, `Active`, `Deprecated`, `Archived`.

## Maintenance rules

Update this registry when a canonical document is added, moved, deprecated, promoted, or changes source-of-truth responsibility. Do not close Knowledge Debt or approve governance automatically.
