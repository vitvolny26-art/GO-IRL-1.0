---
title: Agent Report — SHARE009 WhatsApp extended card and web entry
owner: Technical Archivist
status: Ready for release
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-18
---

# Agent Report

## Task

Align organic WhatsApp sharing for Activities and Services without changing Telegram sharing: use one shared client flow, a Telegram-shaped JPEG card with a localized details footer, a server-rendered Open Graph web card, and entity-preserving browser entry.

## Files inspected

- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `api/meta/event-preview.ts`
- `api/meta/event-invitation-card.ts`
- `api/_shared/telegram-share-card-image.ts`
- `docs/roadmap/ROADMAP_PART_02_RELEASE_PREPARATION.md`
- prior SHARE004, SHARE006, and SHARE007 reports and tests

## Findings

- Activities and Services already use the same `CardShareAction` component.
- The WhatsApp media path generated a JPEG but paired it with the original entity URL, while the URL fallback also bypassed the server-rendered OG web card.
- The shared Meta image renderer forced the card into `1200x630` landscape output.
- Web-card CTA links went directly to Telegram instead of the existing browser routes that retain the target entity.
- The roadmap defines web authentication and intent restoration as a separate release-blocking workstream; this patch does not modify auth, RLS, or onboarding.

## Changes made

- WhatsApp file and URL fallbacks now include the same public OG web-card URL for both entity types.
- The shared OG/JPEG output preserves the Telegram-style `1080x900` artwork and adds a separate 120 px localized `Подробнее` footer, producing `1080x1020`.
- OG image dimensions and landing-page presentation now match the `1080x1020` asset.
- Activity landing CTA opens `/join/<event-id>`.
- Service landing CTA opens `/beauty/<slug>`.
- CTA copy is localized as `Open GO IRL`.
- Share-preview language follows the current app language.
- Telegram share routing remains unchanged.

## Checks

- `pnpm run repo:check`: PASS
- `pnpm run lint`: PASS with one pre-existing `no-console` warning
- `pnpm run typecheck`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS — 670 tests
- Staff OS tests: PASS
- `git diff --check`: PASS

The earlier full test run correctly failed obsolete landscape and CTA assertions. The contracts were updated for the WhatsApp web-entry card. After the final `1080x1020` details-footer adjustment, the complete gate passed again.

## Risks

- Physical WhatsApp preview caching and Android share-sheet behavior still require a production-device smoke test after an authorized deployment.
- Full Google web authentication and restoration of `view`, `join`, or `request_to_join` after authentication remain outside this bounded patch.

## Not touched

- Telegram prepared sharing
- Supabase Auth, RLS, SQL, migrations, or secrets
- automatic join/request behavior
- WhatsApp Business API messaging

## Next step

After explicit release permission, create one bounded commit, run GitHub Actions on the exact head, merge only if green, deploy the exact merge to Vercel and VPS if authorized, then smoke-test one Activity and one Service in a fresh WhatsApp chat.
