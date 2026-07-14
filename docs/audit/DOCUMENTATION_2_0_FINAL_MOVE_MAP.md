---
title: Documentation 2.0 Final Move Map
owner: Project Archivist
status: Review
source_of_truth: false
last_review: 2026-07-12
next_review: 2026-07-19
---

# Documentation 2.0 Final Move Map

## Purpose

Approved path plan assembled from the inventory and conflict-review decisions.

This document authorizes classification only. Physical moves must use `git mv`, update inbound links in the same patch, and preserve history.

## Retain at repository root

```text
README.md
DOCS_INDEX.md
ROADMAP.md
BACKLOG.md
CHANGELOG.md
RELEASE_NOTES.md
DEPLOYMENT.md
BETA_CHECKLIST.md
BETA_TESTING.md
AGENTS.md
```

`AGENTS.md` is location-sensitive and protected.

## Product

| Current | Target | Status |
|---|---|---|
| `docs/PRODUCT_PHILOSOPHY.md` | `docs/product/PRODUCT_PHILOSOPHY.md` | Approved for move after link audit |
| `docs/GO_IRL_PRODUCT.md` | `docs/product/GO_IRL_PRODUCT.md` | Review; overview only, not Source of Truth |
| `docs/SPORT_COACH_MVP.md` | `docs/product/SPORT_COACH_MVP.md` | Approved for move after link audit |
| `docs/COACH_CHAT_TRUST_LAYER.md` | `docs/product/COACH_CHAT_TRUST_LAYER.md` | Review |
| `docs/GO_IRL_1_1_STABILIZATION.md` | `docs/product/GO_IRL_1_1_STABILIZATION.md` | Review |
| `docs/EventLifecycle.md` | `docs/product/EventLifecycle.md` | Review; chat-expiry conflict remains |
| `docs/UserLifecycle.md` | `docs/product/UserLifecycle.md` | Review |
| `docs/reputation.md` | `docs/product/reputation.md` | Draft/future |

## Governance

| Current | Target | Status |
|---|---|---|
| `docs/GO_IRL_CONSTITUTION.md` | `docs/governance/GO_IRL_CONSTITUTION.md` | Approved classification; absolute product/architecture authority |
| `docs/governance/KNOWLEDGE_PLATFORM.md` | same | Retain; Active Source of Truth |
| `docs/governance/KNOWLEDGE_PLATFORM_2_0.md` | same | Retain; implementation roadmap, not Source of Truth |
| `docs/governance/AI_ORGANIZATION.md` | same | Retain; Review until metadata conflict is fixed |

## Market

| Current | Target | Status |
|---|---|---|
| `docs/MARKET_POSITIONING.md` | `docs/market/MARKET_POSITIONING.md` | Approved for move; Active market Source of Truth |
| `docs/COMPETITOR_WATCH.md` | `docs/market/COMPETITOR_WATCH.md` | Approved for move; operational competitor-signal authority |
| `docs/market/*` | same | Retain |

## Architecture

| Current | Target | Status |
|---|---|---|
| `docs/Database.md` | `docs/architecture/Database.md` | Draft/future |
| `docs/RLS.md` | `docs/architecture/RLS.md` | Draft; no policy edits |
| `docs/Security.md` | `docs/architecture/Security.md` | Review |
| `docs/Admin.md` | `docs/architecture/Admin.md` | Draft/future |
| `docs/Moderation.md` | `docs/architecture/Moderation.md` | Draft/future |
| `docs/Notifications.md` | `docs/architecture/Notifications.md` | Draft/future |
| `docs/AI.md` | `docs/architecture/AI.md` | Draft/future |
| `docs/ai-event-discovery.md` | `docs/architecture/ai-event-discovery.md` | Draft/future |
| `docs/RecommendationEngine.md` | `docs/architecture/RecommendationEngine.md` | Draft/future |
| `docs/vertical-experiences.md` | `docs/architecture/vertical-experiences.md` | Draft/future |
| `docs/performance.md` | `docs/architecture/performance.md` | Review |
| `docs/privacy.md` | `docs/architecture/privacy.md` | Review |
| `docs/n8n-workflows.md` | `docs/architecture/n8n-workflows.md` | Future architecture; not runtime |

## Operations

| Current | Target | Status |
|---|---|---|
| `docs/MVP_STABILIZATION_PLAN.md` | `docs/operations/MVP_STABILIZATION_PLAN.md` | Approved classification; Active operational plan |
| `docs/automation/GITHUB_PR_CLICKUP_DRIVE_SYNC.md` | `docs/playbooks/GITHUB_PR_CLICKUP_DRIVE_SYNC.md` | Review after full content/reference audit |
| `docs/automation/go-irl-ai-report-bus-v1.template.json` | same until reference audit | Protected template |

## Audit

| Current | Target | Status |
|---|---|---|
| `docs/MVP_DOC_AUDIT.md` | `docs/audit/MVP_DOC_AUDIT.md` | Approved for move |
| `docs/MISSING_SECTIONS.md` | `docs/audit/MISSING_SECTIONS.md` | Approved for move |
| `docs/DATABASE_SCHEMA_AUDIT.md` | `docs/audit/DATABASE_SCHEMA_AUDIT.md` | Approved for move |
| `docs/audit/*` | same | Retain |
| `project-audit/GO_IRL_PROJECT_AUDIT.md` | `docs/archive/reports/GO_IRL_PROJECT_AUDIT.md` | Historical generated snapshot |
| `project-audit/GO_IRL_HEALTH_AUDIT.md` | `docs/archive/reports/GO_IRL_HEALTH_AUDIT.md` | Historical generated snapshot |
| `project-audit/GO_IRL_1_0_REBUILD_FROM_AUDIT.md` | `docs/archive/setup/GO_IRL_1_0_REBUILD_FROM_AUDIT.md` | Historical rebuild document |
| `project-audit/TASK1_COACH_CHAT_WEATHER_AUDIT.md` | `docs/archive/reports/TASK1_COACH_CHAT_WEATHER_AUDIT.md` | Review |
| `project-audit/BETA_READINESS_AUDIT.md` | `docs/archive/reports/BETA_READINESS_AUDIT.md` | Review |

The `project-audit/` category must disappear only after every file is moved individually and links/generators are updated.

## Root historical files

| Current | Target |
|---|---|
| `SPRINTS.md` | `docs/archive/roadmap/SPRINTS.md` |
| `SPRINT0_STATUS.md` | `docs/archive/roadmap/SPRINT0_STATUS.md` |
| `CHECKLIST.md` | `docs/archive/setup/CHECKLIST.md` |
| `SETUP.md` | `docs/archive/setup/SETUP.md` |
| `SETUP_RU.md` | `docs/archive/setup/SETUP_RU.md` |
| `PATCH_REPORT.md` | `docs/archive/reports/PATCH_REPORT.md` |
| `GO_IRL_DOCUMENTATION.md` | `docs/archive/snapshots/GO_IRL_DOCUMENTATION.md` |
| `GO_IRL_1_0_REBUILD_NOTES.md` | `docs/archive/snapshots/GO_IRL_1_0_REBUILD_NOTES.md` |

## Protected and retained

```text
supabase/README.md
scripts/ai-orchestrator/README.md
.github/pull_request_template.md
docs/bible/**
docs/onboarding/**
docs/governance/**
docs/reports/**
docs/roadmap/**
docs/exports/**
```

Historical reports remain immutable.

## NotebookLM status

Canonical generated location proposed:

```text
docs/exports/GO_IRL_NOTEBOOKLM_SYNC_STATUS.txt
```

The root duplicate must not be deleted until generator and inbound-reference audits are complete.

## Execution gate

Before each move batch:

1. obtain complete recursive file inventory;
2. search inbound links and script references;
3. use `git mv`;
4. repair links in the same commit;
5. update `DOCS_INDEX.md`;
6. run documentation link validation;
7. confirm no runtime, Auth, RLS, SQL, migration, secret, or deployment behavior changed.

## Current status

Classification is substantially complete. Physical relocation remains blocked until a working Git checkout is available and the recursive inventory is proven complete.
