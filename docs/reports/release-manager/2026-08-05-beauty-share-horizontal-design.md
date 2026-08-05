---
title: Agent Report — Horizontal Beauty share card design
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-05
next_review: 2026-08-12
---

# Agent Report

## Task

Adjust the Beauty sharing card from the rejected vertical design to the previous Telegram-oriented horizontal format.

## Files inspected

- `src/beauty/BeautyShareCardEditor.tsx`
- `src/beauty/beauty-share-card-editor.css`
- `src/beauty/beautyShareCardModel.ts`
- `api/_shared/beauty-share-card-svg.ts`
- `api/_shared/telegram-share-card-image.ts`
- `api/_shared/telegram-event-card.ts`
- `api/_shared/telegram-share-beauty.ts`
- `api/meta/event-preview.ts`
- `api/telegram/prepared-beauty-share.ts`
- related tests

## Findings

- The editor and server renderer both used the rejected 1080×1350 vertical design.
- Decorative `GO IRL BEAUTY`, public-link, and slogan labels occupied card space without helping the recipient.
- The name and description were too low; the description was constrained to one line.
- Missing logo state used a letter initial locally and a generated initial server-side rather than a neutral image placeholder.

## Changes made

- Restored horizontal `1080×1020` output and `18:17` preview ratio.
- Removed `GO IRL BEAUTY`, public-link, and slogan text from the image.
- Moved the business name into the top header area.
- Added two-line profile specialization/description rendering.
- Added a neutral photo/image icon when no logo or avatar is available.
- Preserved up to three services, location, CTA, uploaded background, uploaded logo, and background-position controls.
- Bumped the local card fingerprint to regenerate previously cached cards.
- Bumped Beauty preview cache version from `v=10` to `v=11`.
- Activities sharing remains unchanged.

## Checks

Pending exact-head GitHub Actions.

## Not touched

- auth, roles, RLS, SQL, migrations, secrets, `.env`, production data, DNS, domains, merge, or deployment

## Next step

Open a Draft PR, run exact-head CI, then obtain visual approval before merge or production deployment.
