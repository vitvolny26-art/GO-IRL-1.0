---
title: Coach Production RLS Inventory
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-07-27
---

# Coach Production RLS Inventory

## Purpose

Preserve the read-only findings from closed PR #226 without changing current roadmap scope or production configuration.

## Historical findings

The 2026-07-19 inspection recorded:

- overlapping Coach RLS policy families;
- no public-safe confirmed Coach assignment projection;
- no complete assigned-Coach request read and response path;
- broad profile update permissions affecting server-owned fields;
- incomplete assignment integrity rules;
- duplicate or overlapping indexes.

These are historical findings only. Revalidate current production before using them for implementation decisions.

## Security gate

Before any Coach backend, RLS, projection, inbox, confirmation, or review work:

- inspect current production state read-only;
- define backend-authoritative transitions;
- protect server-owned fields;
- include rollback;
- test organizer, participant, assigned Coach, outsider, and moderator/admin identities;
- obtain explicit approval before applying migrations or policy changes.

## Scope

Documentation only. No code, SQL, RLS, migration, auth, secrets, or production data changed.

## Next step

Use this report only as historical input for a separately reviewed design.