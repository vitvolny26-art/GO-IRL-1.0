---
title: Com-Rev Stage 1 Production Artifact Readback
owner: Product Lead
status: Partial
source_of_truth: false
work_id: COM-REV-STAGE1-READBACK
review_date: 2026-07-30
---

# Com-Rev Stage 1 Production Artifact Readback

## Scope

This report records read-only evidence for Stage 1 of `docs/roadmap/COM_REV_IMPLEMENTATION_ROADMAP.md`.

`ROADMAP.md`, current GitHub `main`, and verified runtime evidence remain higher-authority sources.

## Vercel project

- Team: `vitvolny26-5251s-projects`
- Team ID: `team_BuP2F4XGjFGussJqmQrISrbj`
- Project: `go-irl-1-0`
- Project ID: `prj_MtabJvddKyFSr98iC18Ztf7rlZjF`

## Current production artifact

The latest READY deployment carrying production aliases is:

- Deployment ID: `dpl_5pXu1LstMrSJ2ZRijCwY53y73W8U`
- Deployment state: `READY`
- Target: `production`
- GitHub ref: `main`
- GitHub commit SHA: `6e6c4284c9cbed14f5a43ad706dc223fb3f34851`
- Commit message: `Merge pull request #477 from vitvolny26-art/product/vision002-governance-reconciled`
- Production aliases include `go-irl-1-0.vercel.app` and `goirl.realitka.pp.ua`

A direct read-only fetch of `https://go-irl-1-0.vercel.app` returned HTTP `200 OK` on 2026-07-30.

## Newer deployment attempts

A later production deployment attempt for merge commit `62ef2035020f6282188c2f021c70af3dcd89c21b` exists as deployment `dpl_4AAkH1a2hKFvPqiEccm7N7TYa3Rc`, but its state is `CANCELED`.

Therefore the currently proven READY production artifact remains commit `6e6c4284c9cbed14f5a43ad706dc223fb3f34851`.

## Comparison with current main

Current `main` is two commits ahead of the proven production artifact. The only changed file reported by the comparison is:

- `docs/GO_IRL_PRODUCT_VISION_2_0.md` — 5 additions and 5 deletions.

This is a documentation-only delta. No application runtime change between the proven production artifact and current `main` was identified by this comparison.

## Stage 1 assessment

Proven:

- exact READY production deployment ID;
- exact deployed GitHub commit SHA;
- production target and aliases;
- production root responds with HTTP 200;
- current `main` delta is documentation-only.

Not yet proven:

- visual restoration of the reverted event card in the Telegram Mini App;
- viewport, Telegram account context, and screenshot evidence for the event-card smoke;
- full Stage 1 exit signal.

## Status

**Partial.** Production artifact readback is complete, but Stage 1 remains open until the event card is visually verified in the Telegram Mini App and the evidence context is recorded.

## Protected boundaries

This readback did not deploy, promote, roll back, modify production configuration, change secrets, alter auth/RLS/SQL/migrations, or mutate production data.
