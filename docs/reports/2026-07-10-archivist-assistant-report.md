---
title: Archivist Assistant Report
owner: Assistant Archivist
status: Review
source_of_truth: false
last_review: 2026-07-10
next_review: 2026-07-17
---

# Archivist Assistant Report — 2026-07-10

## 1. What was checked

- Index and root registries: `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `BACKLOG.md`, `RELEASE_NOTES.md`, `CHANGELOG.md` from `GO-IRL-ARCHIVE-DOCS`.
- Archived and service files: contents of the uploaded docs snapshot, including sprint protocols `SPRINT_0` through `SPRINT_5`, `DEVELOPMENT_PROTOCOL.md`, and `RecommendationEngine.md`.
- Target documents listed in the priority reading order, including `KNOWLEDGE_DEBT.md`, `ARCHIVIST_CHARTER.md`, `KNOWLEDGE_PLATFORM.md`, and `docs/bible/*`.

## 2. Findings

### Missing Files and Broken Links in the provided Drive snapshot

The following documents were requested in the reading order but were not available in the provided Google Drive / archive snapshot:

- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/onboarding/ARCHIVIST_CHARTER.md`
- `docs/governance/KNOWLEDGE_PLATFORM.md`
- `docs/bible/00-completion-audit.md`
- `docs/bible/00-bible-roadmap.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- `docs/SPORT_COACH_MVP.md`
- `DEPLOYMENT.md`
- `BETA_CHECKLIST.md`

Archivist note: this finding describes the provided Drive/archive snapshot. The GitHub repository may contain newer files not present in the uploaded snapshot.

### Documents without YAML frontmatter

The metadata header standard from `DOCS_INDEX.md` appears missing from important root files in the provided snapshot:

- `README.md`
- `DOCS_INDEX.md`
- `ROADMAP.md`
- `RELEASE_NOTES.md`
- `CHANGELOG.md`

Older sprint files in the archive appear to have better metadata structure.

### Product scope conflict around beta categories

`ROADMAP.md`, `BACKLOG.md`, and `RELEASE_NOTES.md` describe closed beta as constrained to six canonical Olomouc categories:

- Volleyball
- Running
- Walking
- Coffee meetup
- Board games
- Language exchange

`CHANGELOG.md` also mentions create-event activity option cleanup involving `Пиво после работы`, `Pub quiz`, `Table tennis`, `Dancing`, and moving `Swimming` to Nature.

This may be interpreted as scope creep unless the new options are explicitly documented as experimental, demo-only, or future/non-canonical.

### Status conflicts

- `CHANGELOG.md` is indexed as Draft, but it records confirmed changes and commit-related facts.
- `BACKLOG.md` is indexed as Draft and not source of truth, but current stabilization work appears to rely on it.

## 3. Risk

### Critical

If AI agents read only the newer code/change log and not the product guardrails, they may expand GO IRL from a focused local meetup MVP into an overloaded event aggregator.

### High

If key governance and source-of-truth files are missing from an agent's working snapshot, the agent cannot reliably enforce the MVP boundary.

## 4. Files proposed for review

- `DOCS_INDEX.md`
- `CHANGELOG.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- Missing source-of-truth files in the Drive export / archive snapshot

## 5. Proposed changes

1. Add YAML frontmatter to important root files where appropriate.
2. Open a Knowledge Debt item for category scope synchronization between UI, `CHANGELOG.md`, `ROADMAP.md`, and Bible/market docs.
3. Decide whether extra activity options are experimental/demo/future or part of current beta scope.
4. Ensure future Drive/archive exports contain all current source-of-truth docs.

## 6. Do not touch

- Stabilization workflow in `docs/GO_IRL_1_1_STABILIZATION.md`.
- Historical sprint records.
- Browser Mock Mode logic.
- `.env`, secrets, Supabase RLS, auth, SQL, or destructive migrations.

## 7. Questions for Chief Archivist

1. Where are `GO_IRL_CONSTITUTION.md` and `KNOWLEDGE_DEBT.md` physically located, or should they be regenerated?
2. Should the beta remain strictly six categories, or should extra options such as Pub quiz, Table tennis, and `Пиво после работы` be legalized?
3. Should `CHANGELOG.md` move to Active and `BACKLOG.md` to Approved in `DOCS_INDEX.md`?

## Chief Archivist initial resolution

- The missing-file finding is valid for the provided Drive snapshot, but not for the GitHub repository state.
- In GitHub, critical files such as `docs/audit/KNOWLEDGE_DEBT.md`, `docs/GO_IRL_CONSTITUTION.md`, `docs/MARKET_POSITIONING.md`, `docs/onboarding/ARCHIVIST_CHARTER.md`, and `docs/governance/KNOWLEDGE_PLATFORM.md` exist.
- The Drive export must be refreshed from GitHub before using it as the Assistant Archivist working set.
- The category scope conflict is valid and should be tracked as Knowledge Debt.
- Do not legalize extra categories yet.
- Do not change `CHANGELOG.md` or `BACKLOG.md` status until the source-of-truth model is reviewed.
