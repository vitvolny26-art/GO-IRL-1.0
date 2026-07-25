---
title: GO IRL Bible Maintenance Roadmap
owner: Chief Archivist / Technical Lead
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# GO IRL Bible Maintenance Roadmap

## Purpose

Maintain the completed Product Bible without rewriting it from scratch or allowing it to override runtime evidence.

## Current state

Books I-X exist and are complete for the current documented scope.

The active lifecycle is **Release Preparation and focused post-beta stabilization**. Closed Beta completed on 2026-07-20 and remains historical acceptance evidence.

## Maintenance order

1. Verify current GitHub `main` and deployed evidence.
2. Read `docs/release/CURRENT_PHASE.md`.
3. Reconcile `README.md`, `docs/GO_IRL_PRODUCT.md`, `ROADMAP.md`, `RELEASE_NOTES.md`, and `DOCS_INDEX.md`.
4. Check schema-sensitive claims against `supabase/schema.sql`, migrations, `supabase/README.md`, and `docs/DATABASE_SCHEMA_AUDIT.md`.
5. Update the relevant Bible book only.
6. Record unresolved conflicts in the completion audit or Knowledge Debt.
7. Use a reviewed pull request; do not let automation approve source-of-truth changes.

## Scope layers

Every future update must label claims as:

- current production truth;
- proven Closed-Beta baseline;
- approved next phase;
- long-term vision.

## Book maintenance owners

| Book | Primary owner |
|---|---|
| I, V, VI | Product Lead |
| II, IV, VIII | Tech Lead |
| III | Supabase Steward |
| VII, X | Release Manager |
| IX | Chief Archivist / Technical Lead |

## Review triggers

Review the Bible when the lifecycle phase changes, runtime behavior changes materially, schema/auth/RLS truth changes through an approved process, a category or vertical is promoted, a delivery provider changes release status, or a governance source-of-truth document is merged.

## Non-goals

- No architecture rewrite.
- No speculative feature promotion.
- No SQL, migration, RLS, auth, secret, or production-data edits.
- No automatic merge or Knowledge Debt closure.
- No replacement of current terminology without a reviewed product decision.

## Next owner decisions

1. Activity Chat lifetime.
2. Public-launch decision.
3. Category expansion beyond the proven six-category baseline.
4. WhatsApp and Instagram production enablement.
5. Final governance automation source after review and merge.

## Navigation

- Previous: [`00-completion-audit.md`](00-completion-audit.md)
- Next: [`01-foundation/00-foundation-overview.md`](01-foundation/00-foundation-overview.md)
