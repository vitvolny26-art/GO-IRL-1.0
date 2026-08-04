---
title: SHARE004 WhatsApp Beauty Preview Agent Report
owner: Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Prepare organic WhatsApp sharing for public Beauty profiles using server-rendered Open Graph metadata and a 1200x630 JPEG card. Keep Telegram prepared-inline sharing unchanged. Do not add WhatsApp Business Platform or automated messaging.

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/services/ServiceActivityCard.tsx`
- `src/services/beautyShareLink.ts`
- `api/meta/event-preview.ts`
- `api/meta/event-invitation-card.ts`
- `api/_shared/telegram-share-beauty.ts`
- `api/_shared/telegram-share-card-image.ts`

## Findings

- WhatsApp already receives the Meta preview URL for UUID event links.
- Public Beauty URLs previously fell back to the SPA URL, whose client-side metadata is not available to WhatsApp crawlers.
- Existing trusted Beauty profile loading, signed image tokens, and 1200x630 JPEG rendering can be reused without provider API, schema, RLS, auth, secret, or migration changes.

## Changes made

- Added a server-rendered Beauty preview endpoint with dynamic OG title, description, JPEG image, canonical URL, and an open-profile action.
- Routed valid `/beauty/beauty-*` shares through that endpoint for WhatsApp and other organic preview consumers.
- Preserved Telegram sharing on the original public Beauty URL and prepared-inline path.
- Added regression coverage for Beauty preview routing and Telegram isolation.
- Prepared a one-line Vercel NodeNext compatibility hotfix by adding the explicit `.js` extension to the `beautyPublicSlug` import in `src/invitationLink.ts`.
- Consolidated event and Beauty OG rendering in the existing `api/meta/event-preview.ts` handler.
- Removed `api/meta/beauty-preview.ts` and routed Beauty shares through the common endpoint, reducing the deployment from 13 to 12 public Serverless Functions.

## Checks

- `pnpm run lint`: PASS with one pre-existing warning in `api/_shared/admin-authorization.ts`.
- `pnpm run build`: PASS.
- `pnpm run typecheck`: PASS.
- Vitest: 141 files, 666 tests PASS.
- `pnpm run test:staff-os` with `CI=true`: PASS.
- `git diff --check`: PASS.
- Original GitHub Actions run `30877397565` on `f4c9814`: PASS.
- PR #632 merged as `0adc8cf`; VPS workflow `8030`: PASS, HTTP 200.
- Vercel deployment `dpl_2DtbBQDEHCum8t9LXoJd4ueBmqP4`: RED because TypeScript 6 NodeNext required an explicit extension in `src/invitationLink.ts`.
- Local hotfix verification: lint PASS with the same pre-existing warning; typecheck, build, 666 Vitest tests, Staff OS, and `git diff --check` PASS.
- Hotfix commit `7ee0cf2`, GitHub Actions run `30878807470`: PASS; PR #633 merged as `b0abb77`.
- Vercel deployment `dpl_AhD8bqivrWJNPjKGUNbJzRGEVafy`: BLOCKED by the Hobby-plan maximum of 12 Serverless Functions because the deployment contained 13.
- Unified-preview local verification: lint PASS with the same pre-existing warning; typecheck, build, 666 Vitest tests, Staff OS, and `git diff --check` PASS.
- Public function count after consolidation: 12.
- GitHub Actions exact-head verification for the unified-preview patch: pending because no release commit exists.
- Physical WhatsApp preview smoke: pending deployment.

## Next step

After explicit release authorization, create the unified-preview commit, run GitHub Actions on that exact head, merge only if green, verify the Vercel production deployment, then send a public Beauty link in a fresh WhatsApp chat and record PII-free preview evidence.

Commit: not created

