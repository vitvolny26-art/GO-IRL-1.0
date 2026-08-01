---
title: Deployment Verification Policy
owner: Technical Lead
status: Active
source_of_truth: true
last_review: 2026-08-01
next_review: 2026-08-15
---

# Deployment Verification Policy

## Rule

When the exact commit SHA has already passed GitHub Actions CI, deployment must not repeat the full `lint`, `typecheck`, `build`, and `test` suite on the VPS.

The deployment flow for an exact green SHA is:

1. verify the intended merge SHA;
2. deploy the CI artifact, or build only the production `dist` when no trusted artifact is available;
3. publish atomically;
4. run the HTTP health check and required runtime smoke checks;
5. restore the previous build automatically if verification fails.

A full VPS validation run is allowed only when:

- GitHub CI is missing, stale, red, or belongs to a different SHA;
- the deployment changes environment-specific infrastructure that CI cannot verify;
- a release gate explicitly requires host-level validation;
- the Product Owner or Technical Lead explicitly requests the full run.

Do not start duplicate deployment executions for the same SHA. An already-running legacy full deployment may finish, but future workflows must use the fast path above.

## Evidence boundary

GitHub Actions proves repository checks for the exact SHA. VPS deployment proves artifact publication, runtime availability, health, and rollback readiness. These checks are complementary and must not be duplicated without a documented reason.
