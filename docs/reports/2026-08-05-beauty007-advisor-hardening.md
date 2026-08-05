---
title: Agent Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Harden Beauty007-C against the concrete Supabase Advisor findings observed after applying Beauty007-B/C to the isolated `GO IRL Beauty007 Sandbox` project.

Issue: `#592 — Beauty007 — Server-backed Beauty booking foundation`.

PR: `#645 — Beauty007-C: booking RPC and RLS boundary`.

Sandbox project ref: `fgajrdwtpvmhgnxhwjqs`.

## Files inspected

- `supabase/migrations/20260804175500_beauty007_booking_foundation.sql`
- `supabase/migrations/20260804203000_beauty007_booking_rpc_rls.sql`
- `supabase/verify_beauty007_booking_foundation.sql`
- `supabase/verify_beauty007_booking_rpc_rls.sql`
- Supabase security and performance Advisor output from the isolated sandbox

## Findings

The Beauty007 runtime and negative-security verification passed in the sandbox, but Supabase Advisor identified four actionable Beauty007-specific findings:

1. missing covering index for the composite `(service_id, profile_id)` foreign key;
2. missing index for `beauty_time_blocks.created_by_user_key`;
3. duplicate GiST indexes on `beauty_time_blocks` because the standalone range index duplicated the exclusion-constraint index;
4. overlapping permissive `SELECT` policies caused by `FOR ALL` mutation policies;
5. the internal booking-event access helper was exposed as a callable `SECURITY DEFINER` RPC.

Fresh-sandbox unused-index notices are not evidence that production indexes are unnecessary. Existing `SECURITY DEFINER`, extension-schema and sandbox-prerequisite warnings require a separate architecture decision and were not silently changed.

## Changes made

Added `20260805002500_beauty007_advisor_hardening.sql`:

- creates `beauty_bookings_service_profile_idx`;
- creates `beauty_time_blocks_created_by_user_idx`;
- drops the duplicate standalone `beauty_time_blocks_range_idx`;
- replaces `FOR ALL` availability and time-block policies with command-specific `INSERT`, `UPDATE` and `DELETE` policies while preserving one owner-only `SELECT` policy per table;
- inlines the booking-event ownership predicate;
- removes the now-unused public `go_irl_can_access_beauty_booking(uuid)` helper.

Added `verify_beauty007_advisor_hardening.sql` to verify the new indexes, removed duplicate index, command-specific policy set, inlined event policy, removed helper and unchanged direct-table privilege boundary.

## Checks

Sandbox migration application: PASS.

`verify_beauty007_advisor_hardening.sql`: PASS.

Advisor recheck:

- unindexed composite booking FK: resolved;
- unindexed time-block creator FK: resolved;
- duplicate time-block GiST index: resolved;
- multiple permissive Beauty007 SELECT policies: resolved;
- exposed internal booking-access helper: resolved.

Remaining Advisor notices are either expected in a fresh empty sandbox or outside this narrow patch:

- unused-index INFO notices in an empty database;
- `btree_gist` extension schema placement;
- intentional public/authenticated `SECURITY DEFINER` RPC warnings;
- pre-existing Beauty/profile helper warnings;
- sandbox prerequisite warnings for `app_users`, `user_roles`, `go_irl_touch_updated_at` and `go_irl_auth_user_key`.

GitHub Actions must pass on the exact updated PR head before merge consideration.

## Safety

- Changes applied only to `GO IRL Beauty007 Sandbox`.
- Production Supabase was not changed.
- No secrets, `.env`, auth architecture, production data, frontend wiring, notification runtime, merge or deployment.
- No existing booking records were modified.

## Next step

Wait for exact-head CI. Keep PR #645 in draft until the full Beauty007-B/C/C1 migration stack and sandbox evidence are reviewed. Production application still requires separate explicit approval.
