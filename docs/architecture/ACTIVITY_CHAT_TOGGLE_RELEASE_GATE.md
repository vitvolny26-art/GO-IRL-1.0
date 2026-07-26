# Activity Chat Toggle Release Gate

## Status

The Activity Chat toggle is an architecture-only item. It must not appear in activity create, edit, or settings runtime surfaces until an explicit release decision is approved.

## Default boundary

The canonical default is `not_requested`. In this state the toggle is hidden and non-interactive. A feature implementation, environment value, design mock, or database capability does not by itself authorize runtime exposure.

## Approval evidence

Runtime exposure requires one complete active decision containing:

- status `approved`;
- stable decision identifier;
- named approver;
- approval timestamp;
- durable evidence URL;
- a non-expired approval when an expiry is present.

Missing evidence, review status, rejection, revocation, or expiry is fail-closed.

## Surfaces

The gate applies consistently to:

- activity creation;
- activity editing;
- activity settings.

The contract does not add UI and does not authorize a rollout.

## Release procedure

A future rollout requires a separately approved task and PR that:

1. references the release decision evidence;
2. defines the rollout and rollback boundary;
3. verifies participant access and lifecycle behavior;
4. passes test, typecheck, lint, and build on the rollout commit;
5. receives explicit production deployment approval.

## Safety

This document and its contract do not change SQL, migrations, RLS, auth, secrets, production data, production configuration, runtime UI, or deployment state.
