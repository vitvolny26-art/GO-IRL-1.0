---
title: Studio Vita Demo Profile Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Analyze the current Beauty professional workspace and fully populate the existing published demo professional so the owner can evaluate the completed presentation.

## Files inspected

- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/BeautyWorkspaceContentEditor.tsx`
- `src/beauty/beautySetupModel.ts`
- `src/beauty/beautyWorkspaceRepository.ts`
- `src/beauty/BeautyProfessionalProfilePortal.tsx`
- existing Beauty artwork under `images/services/`
- production Beauty profile/service schema and public v3 RPC output

## Findings

The current workspace supports multilingual profile content, Instagram, portfolio, trust blocks, multiple services and availability. The published `beauty-test` profile contained only one service and empty optional content, so most of the public profile sections were omitted.

## Changes made

Production data only; no application code, migration, auth, RLS, secret or environment changes.

- renamed the demo profile to `Studio Vita`;
- populated RU, UK, CS and EN descriptions;
- populated experience, specialization, hygiene, materials, spoken languages, certificates and booking notes;
- added an Instagram demo URL;
- added four existing approved GO IRL manicure assets to the portfolio;
- expanded the price list to five active services with durations, prices and buffers;
- kept the existing contact value and normalized the existing address display;
- kept publication state `published`.

## Checks

- profile row update: PASS;
- service upsert transaction: PASS;
- public RPC `go_irl_list_public_beauty_professionals_v3('olomouc','ru')`: PASS;
- returned profile name: `Studio Vita`;
- returned active services: 5;
- returned portfolio items: 4;
- public slug: `beauty-test`;
- application build/tests: not required because no repository code changed;
- external browser rendering could not be independently captured from the execution environment because outbound DNS resolution was unavailable.

## Rollback

Restore the previous `Test Studio` profile values, clear optional JSON fields and portfolio, retain only the original manicure service, and archive the four `studio-vita-*` service rows.

## Next step

Open the professional workspace and public profile in the Telegram Mini App, review the completed visual hierarchy, and replace the demonstration contact, address, Instagram and portfolio with final owner-approved content before real client use.
