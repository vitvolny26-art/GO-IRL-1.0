---
title: Bible Operations and Release
owner: Release Manager
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book X — Operations and Release

## Current phase

Release Preparation and focused post-beta stabilization. Broad public launch is not claimed.

## Release principle

A feature, migration file, adapter, or historical green run is not sufficient. Release claims require evidence on the relevant commit and environment.

## Required gates

- reviewed scope and current GitHub `main`;
- typecheck, lint, build, tests, and diff hygiene where project policy requires;
- Telegram Mini App smoke;
- browser demo and join-route smoke;
- Vercel deployment status;
- Supabase auth/RLS/migration verification through the approved process;
- support, monitoring, analytics, and moderation readiness;
- provider-specific delivery, consent, idempotency, retry, and opt-out evidence;
- documentation aligned with current runtime.

## Provider operations

- Telegram and Messenger may be enabled where current production evidence confirms their gates.
- WhatsApp and Instagram remain disabled until each individual production gate passes.
- Enable one provider at a time.
- Never expose credentials in client code, logs, reports, or documentation.
- Operational provider limits are not automatically application regressions.

## Category and product gates

The six categories remain the proven Olomouc baseline. New categories, cities, verticals, payments, ticketing, direct messages, public ratings, or high-risk social features require explicit reviewed product and release decisions.

## Incident rule

Stop scope expansion, capture evidence, reproduce minimally, fix one blocker, verify on the same commit, update durable records, and never force-push or hide the incident in chat.

## Definition of ready

“Ready” is limited to the specific tested release candidate and environment. Public launch requires an explicit owner decision after all mandatory operational evidence is reviewed.

## Navigation

- Previous: [`09-governance-and-ai-organization.md`](09-governance-and-ai-organization.md)
- Return to audit: [`00-completion-audit.md`](00-completion-audit.md)
- Maintenance roadmap: [`00-bible-roadmap.md`](00-bible-roadmap.md)
