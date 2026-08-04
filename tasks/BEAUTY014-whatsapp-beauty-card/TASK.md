# BEAUTY014 — WhatsApp Beauty profile preview card

- Task ID: `BEAUTY014`
- Source: GitHub issue #626
- Owner role: AI Fixer
- Status: Active

## Problem

The normal Beauty share flow can render the generic GO IRL preview instead of a Beauty-specific professional card.

## Scope

- organic user-driven WhatsApp sharing;
- one public Beauty preview URL per professional profile;
- large 1200×630 Open Graph image;
- professional/studio name, primary service and location;
- RU/UK/CS/EN with deterministic fallback;
- whole preview card opens the Beauty profile;
- targeted tests and provider evidence.

## Out of scope

- WhatsApp Business Platform, WABA and Cloud API;
- native WhatsApp CTA buttons;
- n8n runtime dependency or automated delivery;
- auth, RLS, SQL, migrations, secrets and production data;
- unrelated Beauty features.

## Acceptance criteria

- normal Android WhatsApp Beauty share renders the intended Beauty-specific card after provider processing;
- no generic GO IRL fallback for the verified profile;
- image endpoint returns a valid large image;
- metadata contract covers RU/UK/CS/EN;
- required CI gates pass;
- evidence, STATUS, ROADMAP and report are current.

## Approval gates

Separate explicit approval is required for merge and production deployment or configuration changes.

## Dependencies

- current public Beauty professional directory and profile route;
- WhatsApp provider preview/cache behavior.

## Blockers

None at task creation.

## Related

- Issue #626
- SHARE003 / PR #608 is separate and must not absorb this scope.
