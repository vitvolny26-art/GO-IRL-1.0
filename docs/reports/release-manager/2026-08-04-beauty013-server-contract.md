---
title: Agent Report
owner: Release Manager / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Create the approved additive Beauty013 server contract for optional public profile blocks, portfolio URLs, Instagram, and multiple services.

## Files inspected

- `src/beauty/beautySetupModel.ts`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/services/servicesProfessionalDirectory.ts`
- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- `supabase/migrations/20260801104500_beauty005_olomouc_pilot.sql`
- `supabase/migrations/20260803230500_beauty012_multilingual_content.sql`
- Issue #622

## Findings

The current schema supports one service per profile through a unique `profile_id`. It has no Instagram, portfolio collection, or structured trust content. Existing RLS already grants profile owners access to their profile and service rows, so this additive contract reuses current policies and does not add new tables or policies.

## Changes made

- Added nullable Instagram URL with strict normalization.
- Added multilingual trust-content JSON and portfolio URL JSON.
- Removed the one-service unique constraint.
- Added service buffer and stable sort order.
- Added versioned owner read/save RPC v3.
- Added versioned public directory RPC v3.
- Preserved the current service as existing row data; migration performs no destructive data rewrite.
- Added verification SQL.

## Required/optional contract

Required to publish:
- public name;
- city/public area;
- contact and exact address;
- at least one valid service;
- availability in the frontend validation layer.

Optional and omitted from the public projection when empty:
- description;
- Instagram;
- portfolio;
- experience/specialization;
- hygiene/sterilization;
- materials/brands;
- spoken languages;
- certificates/education;
- booking notes.

## Checks

Pending GitHub Actions on the exact PR head. The migration is repository-only and has not been applied to production.

## Next step

After the server-contract PR is green, implement the schema-v4 workspace model, cabinet editors, v3 repository mapping, and conditional public rendering in a follow-up commit/PR. Do not merge or apply the migration without explicit approval.
