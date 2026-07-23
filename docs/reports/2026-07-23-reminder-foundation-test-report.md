---
title: Event Reminder Foundation Test Report
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-23
next_review: 2026-07-30
---

# Event Reminder Foundation Test Report

## Task

Prepare the provider-neutral server foundation for event reminders without enabling production delivery.

## Files inspected

- Current `origin/main` through commit `83755cb`.
- Existing event, user, authorization, Meta messaging, calendar, and reminder UI modules.
- Supabase schema and policies in the isolated test project `bacvtlypxcolgeykybtw`.

## Findings

- The shipped reminder UI persists choices locally and does not schedule server delivery.
- A provider identity link is required before a user can select Telegram, WhatsApp, Instagram, or Messenger delivery.
- Reminder claiming must be service-only, leased, retryable, and idempotent.
- Supabase advisors reported no new missing-RLS finding for the reminder tables.
- The first performance pass found a missing activity foreign-key index; it was added and the finding cleared.
- Remaining advisor findings belong to pre-existing test-project objects. The authenticated SECURITY DEFINER warning for the reminder upsert RPC is intentional: it is the validated user entrypoint.

## Changes made

- Added provider identity and event reminder tables with RLS.
- Added a validated authenticated reminder upsert RPC.
- Added service-only claim and finish RPCs with leases, retry state, and delivery keys.
- Added automatic rescheduling when an event date or time changes.
- Added a rollback-only SQL verifier for owner access, stranger isolation, claiming, and completion.
- Added provider-neutral reminder message types and localized message builder tests.
- Applied and verified the schema only in the isolated test Supabase project.
- Production Supabase, production webhooks, credentials, and outbound delivery remain unchanged.

## Checks

- SQL verifier: PASS after an explicit `smallint` test cast.
- RLS enabled on both new tables: PASS.
- Anonymous reminder RPC execution denied: PASS.
- Authenticated direct insert/update denied: PASS.
- Claim/finish RPC restricted to service role: PASS.
- All three SECURITY DEFINER functions use an empty search path: PASS.
- Reminder table indexes: six, including the activity foreign-key index.
- Supabase performance advisor: no missing index on new reminder tables.
- Application lint: PASS.
- Application build: PASS.
- Application test: PASS, 63 files and 323 tests.
- Application typecheck: PASS.

## Next step

Open a reviewable foundation PR. Then add the disabled-by-default due-reminder worker and provider adapters in separate small patches before any production migration or scheduled execution.
