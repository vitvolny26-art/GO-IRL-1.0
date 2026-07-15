---
title: Engineering Governance Evolution Roadmap
owner: Project Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-29
---

# Engineering Governance Evolution Roadmap

## Purpose

Translate the Engineering Governance / Engineering OS architecture vision into an incremental implementation path for GO IRL without rewriting the product architecture or destabilizing the Olomouc closed beta.

This roadmap is subordinate to `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `BACKLOG.md`, `docs/GO_IRL_CONSTITUTION.md`, and current runtime contracts.

## Current baseline

GO IRL already has an early orchestration layer:

- Telegram mission intake;
- n8n workflow orchestration;
- Runtime entry through `mission-intake.cjs`;
- subsequent Runtime commands through `bridge.cjs`;
- mission queue and idempotency;
- role selection and context building;
- Codex implementation;
- independent review;
- QA and human approval gates;
- report generation;
- GitHub Draft PR publication in explicitly approved flows;
- ClickUp and Google Drive synchronization.

This is not yet an Engineering OS. It is a working prototype that should be hardened before architectural expansion.

## Governing hierarchy

```text
Purpose
  -> Vision
  -> Principles
  -> GO IRL Constitution
  -> Engineering Governance
  -> Engineering OS
  -> Protocols / Policies / Events
  -> Providers: GitHub, n