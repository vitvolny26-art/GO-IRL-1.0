---
title: Agent Report
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-07
next_review: 2026-08-14
---

# Agent Report

## Task

Add service selection inside the Beauty booking flow and allow client cancellation of pending/confirmed bookings until 24 hours before start.

## Files inspected

- src/services/ServiceActivityCard.tsx
- src/services/ServicesBookingsView.tsx
- src/services/servicesBookingClientRepository.ts
- src/services/servicesBookingRepository.ts
- production go_irl_cancel_my_beauty_booking RPC

## Findings

The booking sheet displayed the current service but did not expose the existing service picker. The client bookings view had no cancellation action. The existing server cancellation RPC only accepted pending bookings.

## Changes made

- expose the existing service picker directly inside the booking sheet;
- refresh service-specific availability through the existing selected-service state;
- add client cancellation action and clear 24-hour cutoff copy;
- wire cancellation to go_irl_cancel_my_beauty_booking;
- update the RPC to allow pending/confirmed cancellation only when starts_at is at least 24 hours away;
- retain existing ownership, stale-write and notification event boundaries.

## Checks

Pending exact-head CI and production migration verification.

## Next step

Run checks, apply the explicitly approved production migration, verify the function, then request separate merge/deploy approval.
