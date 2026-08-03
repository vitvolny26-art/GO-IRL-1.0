---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Agent Report

## Task

Implement Beauty012 Slice B: let a professional maintain RU, UK, CS and EN profile descriptions and price-list service names, then resolve public content by the client-selected language.

## Files inspected

- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/beautySetupModel.ts`
- `src/beauty/beautyWorkspaceLocalStorage.ts`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/services/servicesProfessionalDirectory.ts`
- `src/services/ServicesClientViews.tsx`
- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- Beauty and Services focused tests
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`

## Findings

The current Beauty model stores one service name and no professional description. The public directory RPC is language-neutral, so the client cannot request translated professional content. Existing production may not yet have the new RPCs, therefore the application requires a compatibility fallback until the additive migration is explicitly applied.

## Changes made

- bumped the Beauty local workspace schema to version 3;
- added RU, UK, CS and EN description and service-name maps;
- added deterministic fallback order: requested language, English, Czech, Russian, Ukrainian, legacy value;
- migrated version 2 local workspaces without discarding the existing service name;
- added four-language editing controls to profile and service setup;
- kept duration, price and buffer language-neutral and shared;
- projected the current client language into setup preview, catalog, card and professional profile;
- added `description` to the public professional projection;
- added compatibility fallback from versioned RPCs to legacy RPCs before migration rollout;
- prepared an additive migration with JSONB translation columns and versioned owner/public RPCs;
- added a read-only migration verification script.

## Checks

Pending exact-head GitHub Actions:

- repository check;
- diff check;
- tests;
- typecheck;
- lint;
- build;
- bundle budget.

The migration has not been applied to production. No RLS policy, auth flow, secret, environment variable or production configuration was changed.

## Next step

Fix any exact-head CI failures. Keep the PR unmerged and undeployed until CI is green. Apply the additive Supabase migration only after a separate explicit owner approval, verify the versioned RPCs, then merge and deploy the application against the migrated schema.
