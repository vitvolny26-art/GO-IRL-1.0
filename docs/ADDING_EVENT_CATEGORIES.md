---
title: Adding Event Categories
owner: Product and Engineering
status: Active
source_of_truth: true
last_review: 2026-07-25
next_review: 2026-10-25
---

# Adding a new event category

This document defines the runtime and media work required when adding a new GO IRL event category.

GitHub `main` is the runtime source of truth. Google Drive stores original high-resolution media and review copies only.

## Approval boundary

A new category expands product taxonomy and beta scope. Obtain Product Owner approval before implementing it.

Do not combine category work with auth, secrets, Supabase RLS, SQL, migrations, production-data changes, architecture rewrites, or unrelated refactors.

## Required category identity

Choose and approve all three values before generating assets:

- **code**: unique two-letter uppercase runtime code, for example `VB`;
- **number**: next stable two-digit numeric prefix, for example `41`;
- **slug**: lowercase English ASCII slug with hyphens only, for example `street-basketball`.

Canonical runtime filename:

```text
NN-english-slug.webp
```

Example:

```text
41-street-basketball.webp
```

The code, number, slug, and filename are permanent identifiers. Do not renumber or rename existing categories without an approved migration.

## Images required for every new category

Generate **three separate compositions**. Do not resize one crop into all formats.

### 1. Mini App event card

- aspect ratio: `3:4`;
- runtime dimensions: `1080 x 1440 px`;
- preferred generation/master dimensions: `2160 x 2880 px`;
- format: WebP;
- recommended quality: `82-88`;
- runtime directory: `images/events/cards-3x4/`.

Composition:

- keep the main subject in the upper-middle area;
- keep the lower quarter visually calmer for metadata and actions;
- leave the top-right area clear for controls;
- avoid text, logos, watermarks, fake interface elements, and critical details near the outer 5% edge.

### 2. Event detail sheet

- aspect ratio: `9:16`;
- runtime dimensions: `1080 x 1920 px`;
- preferred generation/master dimensions: `2160 x 3840 px`;
- format: WebP;
- recommended quality: `82-88`;
- runtime directory: `images/events/sheets-9x16/`.

Composition:

- use a true vertical composition, not a stretched 3:4 card;
- keep the main subject visible in the upper or central region;
- preserve quieter areas behind sheet title, metadata, description, and actions;
- ensure the image remains readable under the approved dark overlay;
- avoid important details at the top and bottom edges where sheet controls and content may overlap.

The runtime resolver prefers the 9:16 file and falls back to the 3:4 card only when the dedicated sheet asset is missing. The fallback is for resilience, not the normal production workflow.

### 3. Telegram and Meta Share card

- aspect ratio: `6:5`;
- runtime dimensions: `1080 x 900 px`;
- preferred generation/master dimensions: `2160 x 1800 px`;
- format: WebP;
- recommended quality: `82-90`;
- runtime directory: use the current Share renderer/manifest path defined by the active Share implementation.

Composition:

- keep the title area in the upper-left readable;
- keep the participant area in the upper-right readable;
- keep the footer clear for organizer, date, price, location, and weather;
- preserve the complete subject where possible;
- use outpainting or background extension instead of stretching.

Before adding the Share file, inspect the active Share resolver because legacy documentation may reference `images/events/share-6x5/` while runtime paths can change.

## Generation prompt template

Generate each aspect ratio separately:

```text
Create a premium GO IRL background for the category <CATEGORY>.
Format: <3:4 portrait | 9:16 portrait | 6:5 landscape>.
Resolution target: <2160x2880 | 2160x3840 | 2160x1800>.
No text, no logos, no watermark, no interface elements.
Keep the category immediately recognizable without written labels.
Place the main subject in <POSITION>.
Leave visual breathing room in <PROTECTED UI ZONES>.
Natural lighting, realistic proportions, coherent equipment and anatomy.
```

Reject assets containing anatomy errors, duplicated objects, malformed equipment, fake text, inconsistent lighting, or ambiguous category identity.

## Repository changes

For a new category:

1. Add the category to the canonical product taxonomy used by forms, filters, labels, and event records.
2. Inspect all usages of the category type/code before editing.
3. Add one mapping entry to `src/eventBackgrounds.ts`:

```ts
"XY": "41-street-basketball.webp"
```

4. Add matching files with the exact same filename:

```text
images/events/cards-3x4/41-street-basketball.webp
images/events/sheets-9x16/41-street-basketball.webp
```

5. Add the matching Share asset to the active Share asset directory and registry.
6. Update category labels, localized names, icons, filters, fixtures, demo data, tests, and analytics mappings wherever the canonical taxonomy requires them.
7. Search the repository for assumptions about the previous category count and update only verified usages.

Do not maintain a second independent handwritten category map when an existing canonical registry can be reused or generated.

## Google Drive storage

Keep original generations and high-resolution masters in the approved event-background source folder on Google Drive.

Recommended structure per category:

```text
NN-english-slug/
  source/
  card-3x4-master/
  sheet-9x16-master/
  share-6x5-master/
  review/
```

Do not overwrite source files with compressed runtime WebP derivatives. After merge, a reviewed runtime mirror may be stored on Drive with the PR and commit reference.

## Verification

Verify before commit:

- code, number, slug, and filename are unique;
- all required runtime files decode as WebP;
- card image is exactly `1080 x 1440`;
- sheet image is exactly `1080 x 1920`;
- Share image is exactly `1080 x 900`;
- each resolver returns the correct category image;
- no category resolves to another category's asset;
- card, sheet, and Share UI have no unintended crop, stretch, or unreadable overlay;
- mobile visual smoke passes for the affected screens.

Run on the same commit:

```bash
pnpm run lint && pnpm run typecheck && pnpm run build && pnpm run test
```

Stop at the first red gate. Do not merge until automated checks and visual review are approved.

## Pull request evidence

The PR must include:

- approved category code, number, slug, and display names;
- affected taxonomy and runtime files;
- card, sheet, and Share asset dimensions;
- contact sheets or review previews for all three formats;
- automated check results;
- explicit note that no auth, RLS, migration, secret, or production-data changes were made.
