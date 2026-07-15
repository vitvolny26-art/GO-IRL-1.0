---
title: Agent Task — Meta Template Alignment
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-15
next_review: 2026-07-22
---

# Agent Task

## Task

Implement one isolated patch that makes WhatsApp, Instagram Direct, and Messenger invitation payloads use the same localized copy model as Telegram sharing.

## Source template

Telegram source of truth:

- `ShareTemplateService.build`
- `buildShareModel`
- `renderShareText`

Expected order:

1. greeting;
2. activity-specific sentence;
3. location;
4. time range;
5. optional price;
6. optional low-spots line;
7. closing line;
8. Join CTA and URL;
9. `GO IRL`.

## Implementation constraints

- Do not duplicate Telegram copy in Meta provider files.
- Add one provider-neutral `EventInvitationSummary -> ShareModel` adapter under `src/share/`.
- Keep provider files responsible only for payload structure.
- Preserve `join:<eventId>` and `details:<eventId>` contracts.
- Preserve webhook, auth, RLS, migration, identity, RPC, and secret behavior.
- Support CS/EN/RU/UK.
- Default to EN only when language is absent.
- Align WhatsApp button, image-header, and Flow bodies.
- Align Instagram and Messenger text/no-image and image/generic variants.
- Move join-result strings into a shared localized map without changing statuses.
- Add provider snapshot/unit tests for all languages and image/no-image variants.

## Checks

Run:

- `pnpm run lint`
- `pnpm run build`
- `pnpm run test`
- `pnpm run typecheck`

Commit only when all checks pass.

## Report

Save the final report under `docs/reports/` and reference Meta Messaging Epic #83.
