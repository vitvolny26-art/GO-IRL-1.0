---
title: Beauty Workspace Navigation Redesign
owner: GO IRL Release Engineer
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Reorganize the professional Beauty workspace around real master workflows: requests, confirmed bookings, page creation/editing and clear bottom navigation. Open the workspace in a separate browser tab and show an attention count near workspace entry points.

## Files inspected

- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/BeautyHomeEntryPortal.tsx`
- `src/beauty/BeautyWorkspaceContentEditor.tsx`
- `src/beauty/beauty-setup.css`
- `src/beauty/beauty-home-entry.css`
- `src/components/ProfilePanel.tsx`
- `src/services/servicesBookingRepository.ts`
- `src/main.tsx`

## Findings

The workspace bottom bar was already fixed to the viewport, but its information architecture remained a technical pilot: Today / Week / Client / Service. The extended page editor was always rendered below booking management, producing one long mixed screen. Workspace entry links opened in the current tab and had no pending-request indicator.

## Changes made

- Replaced the pilot navigation with `Overview / Requests / Bookings / Page`.
- Added an overview dashboard with new-request, upcoming-booking, today and next-booking metrics.
- Separated pending client requests from confirmed future bookings.
- Preserved manual booking, time blocking, confirmation, rejection, completion and calendar actions.
- Moved the extended public-page editor into the dedicated Page tab.
- Added page status, active service count, client preview and basic setup actions.
- Opened workspace entry links in a separate tab from Home, Profile and the published setup screen.
- Made the workspace back action close the new tab when possible, with Services fallback.
- Added a pending-request badge to Home/Profile workspace entries and the Requests bottom-navigation item.
- Added regression coverage for the pending-request attention counter.

## Scope and safety

- No auth, RLS, SQL, migration, secret, environment, DNS or production-data changes.
- No merge or deployment.
- Existing booking storage and status lifecycle remain unchanged.

## Checks

Exact-head GitHub Actions is required after opening the Draft PR.

Local checks could not run because the execution environment could not resolve `github.com`.

## Rollback

Revert the task branch or restore the previous four pilot tabs and remove the attention hook/badges.

## Next step

Confirm exact-head CI, then review the workspace on the same mobile Telegram viewport. Merge and production deployment require explicit approval.
