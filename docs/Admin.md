# Admin Panel

Status: Active product-area locator. GitHub `main` and verified runtime remain authoritative.
Last reviewed: 2026-08-05.

## Purpose

The Admin Panel protects GO IRL operations through server-verified Telegram administration. This file is a concise repository locator; durable workflow, roadmap, reports, and handoff context live in the canonical Google Drive workspace.

## Implemented baseline

The merged ADMIN005-ADMIN009 baseline includes:

- protected Telegram-authenticated admin access with fail-closed server verification;
- single-use role invitations with a maximum 24-hour lifetime for `organizer` and `professional`;
- server-backed listing of elevated roles;
- guarded demotion of `organizer`, `professional`, and `moderator` to `user`;
- protection of `admin` from demotion;
- PII-safe audit logging for successful demotions;
- mobile-first tabs for Overview, Roles, Integrations, and Updates;
- truthful read-only integration and update states without browser deployment, rollback, SQL, migration, secret, auth, RLS, or production-data controls.

The ADMIN006 response-contract correction was merged through PR #518:

- head: `60d53749a22e48a66595c853c5196560f1f63e56`;
- merge SHA: `949b1fe8308079094cd0a70f7a71beefc163a7e7`;
- exact-head CI run `30699129636`: PASS.

## Current verification boundary

At review time, the latest verified Vercel production deployment was `dpl_9Kp4xyVArtuUnCC5Wkemogaie8cq`, READY on Git SHA `f34ee1f6285aeed5df68254ad04a7b46d9fd1b4c`.

That deployment proves a current production build of `main`; it does not prove fresh Admin Panel behavior on that exact SHA.

Gate A remains Partial / Blocked. ADMIN010 must not start until all required evidence is recorded:

- disposable-account organizer and professional invitation redemption;
- replay, expiry, malformed-token, and role-conflict handling;
- guarded demotion of a disposable elevated-role account;
- verification of the expected PII-safe `audit_log` row;
- exact tested deployment SHA and Telegram client evidence.

## Safety boundaries

Separate explicit approval is required for:

- `.env` and secrets;
- auth and RLS;
- SQL, migrations, Edge Function production deployment, and production data;
- force push;
- merge and production deployment;
- destructive admin actions, impersonation, private-chat access, or permanent deletion.

## Canonical workspace

- Admin Panel workspace: https://drive.google.com/drive/folders/1anTWsX51AAIahuk27wvf6QO7Lc83RfzT
- README: https://docs.google.com/document/d/1XPjqvfSa8zVSZZidp5YfI3JjWKcfcryKRkquLeMkRcI/edit
- Task workflow: https://docs.google.com/document/d/1n33bJcWvRD0QDfs-UJ-CyBgoQXTP38Vh2tm01M230mU/edit
- Roadmap: https://docs.google.com/document/d/1y0_MLIkwVj1ecJ5z2vXkRyyELopcLJ5jPjDEgAolx2A/edit
- Reports index: https://docs.google.com/document/d/11sVjjYHZ7sHW1Exl2LLYO1jpfMZFvFL3pB0JCNcGZQg/edit
- Current consistency audit: https://docs.google.com/document/d/1AHwpyYx1uzZnhcuavg8RRVsCNJDqdlluE7GdkUsWcJs/edit

## Resume sequence

1. Read the Drive README and workflow.
2. Read the current roadmap and consistency audit.
3. Resolve the current GitHub Issue/PR, `main`, CI, and runtime state.
4. Perform one bounded ADMIN task only.
5. Save a new immutable report and update the reports index.

## Current repository snapshot

This reconciliation branch was created from `main` at `321acacd95aa03bfe5d3fe12e5099443b62be452`.

## Next action

Review and merge the docs-only reconciliation PR after its exact-head checks are resolved. Deploy target: none. After merge, complete the separately authorized Gate A disposable-account production smoke before starting ADMIN010.
