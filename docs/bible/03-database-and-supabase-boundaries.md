---
title: Bible Database and Supabase Boundaries
owner: Supabase Steward
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-08-25
---

# Book III — Database and Supabase Boundaries

## Authority order

1. verified production evidence;
2. `supabase/schema.sql` and applied migrations;
3. `supabase/README.md`;
4. `docs/DATABASE_SCHEMA_AUDIT.md`;
5. this chapter;
6. future database designs.

## Current boundary

The current model is based on `activities` and `activity_members`, with approved extensions such as trusted Telegram auth, coach requests, temporary Activity Chat, reminders, provider identities, and notification outbox behavior where current migrations and production evidence confirm them.

This chapter does not claim that every table present in a migration is enabled in every environment.

## Security boundary

- Production identity comes from verified Telegram `initData`.
- RLS remains mandatory.
- Client-visible configuration is not a secret store.
- Browser Demo Mode must not write production data.
- No Bible text is a migration instruction.
- No schema, RLS, auth, secret, or production-data change may be inferred from this chapter.

## Current versus future

Current names and compatibility contracts win over future `events`, generalized role, RLI, recommendation, or marketplace models.

## Activity Chat decision

Current migration behavior remains authoritative. Public wording is limited to:

> Activity Chat is temporary and exists only for activity coordination.

Changing creation-plus-24-hours to event-end-plus-24-hours requires a separate approved product, SQL, code, RLS, and release task.

## Messaging and reminders

Provider-neutral reminder persistence and notification outbox behavior are current where verified. Provider enablement is operationally gated. WhatsApp or Instagram approval must never be inferred from schema presence.

## Final rule

Stable, explicit, RLS-protected data boundaries are more valuable than a future-perfect schema.
