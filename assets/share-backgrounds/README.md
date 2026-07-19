# GO IRL Event Backgrounds

## Purpose

This file defines the mandatory rules for generating, preparing, naming, storing, replacing, and verifying GO IRL event-card and share-card backgrounds.

GitHub is the runtime source of truth. Google Drive stores source media and review copies.

## Canonical category set

The background registry uses 40 stable category codes and filenames. Existing numeric prefixes and English slugs must not be changed without an approved migration.

Examples:

- `01-volleyball`
- `24-hiking`
- `31-city-walk`
- `40-workshop`

The same category code must resolve to both the Mini App card image and the Share image.

## Source files

Keep original, highest-resolution source images in Google Drive.

Current retained source collections:

- `Event Card`
- `Event Avatars`
- `GO IRL - 40 Event Card Backgrounds`

Do not move, rename, overwrite, archive, or delete those source folders without explicit approval.

Never treat `Event Card` and `Event Avatars` as exact duplicates solely because filenames overlap.

## Required output formats

Each approved category requires two independent outputs.

### Mini App card

- aspect ratio: `3:4`
- runtime size: `1080 x 1440 px`
- preferred master size: `2160 x 2880 px`
- format: WebP
- recommended quality: 82-88
- target directory: `assets/event-backgrounds/card-3x4/`

### Telegram and Meta Share

- aspect ratio: `6:5`
- runtime size: `1080 x 900 px`
- preferred master size: `2160 x 1800 px`
- format: WebP
- recommended quality: 82-90
- target directory: `assets/event-backgrounds/share-6x5/`

Do not reuse one physical image for both formats. They have different compositions and safe areas.

## Composition rules

### General

- Keep the main subject clearly visible.
- Do not stretch or distort the image.
- Do not place important content under card controls, title text, weather, metadata, or footer elements.
- Preserve sufficient contrast for white and lime UI elements.
- Avoid text, logos, watermarks, and UI-like marks inside the image.
- Avoid important details at the outer 5% edge.
- Check the final image at actual mobile size, not only at full resolution.

### Mini App 3:4 safe composition

- Main subject should usually sit in the upper-middle region.
- Keep the lower quarter calmer because metadata and actions occupy the bottom.
- Keep the top-right region clear enough for Share and participant controls.
- For categories `03`, `04`, and `08`, crop with the primary subject higher than the geometric centre.
- Do not use runtime `object-fit: cover` as a substitute for correct source composition.

### Share 6:5 safe composition

- Keep the title area in the upper-left readable.
- Keep the participant counter area in the upper-right readable.
- Keep the footer strip clear for organizer, date, price, and location.
- Preserve the full subject whenever possible.
- Extend side background naturally when converting a portrait source to 6:5.
- Do not blur the whole image. A blurred extension may be used only outside the preserved source frame when necessary.

## Generation rules

When generating a new image with an image model:

1. Generate at the preferred master aspect ratio, not square.
2. Request a clean photographic or illustrated scene without text or logos.
3. State the subject position and protected UI zones in the prompt.
4. Generate separate card and Share compositions when the subject cannot safely fit both.
5. Keep category identity obvious without relying on text.
6. Reject visible anatomy errors, duplicated objects, malformed equipment, fake text, and inconsistent lighting.
7. Save the original generation separately from runtime derivatives.

Prompt template:

```text
Create a premium GO IRL background for the category <CATEGORY>.
Format: <3:4 portrait | 6:5 landscape>.
Resolution target: <2160x2880 | 2160x1800>.
No text, no logos, no watermark, no interface elements.
Keep the main subject in <POSITION>.
Leave visual breathing room in <PROTECTED UI ZONES>.
Natural lighting, realistic proportions, clear category recognition.
```

## Cropping and reframing rules

Preferred order:

1. Re-render or outpaint to the required aspect ratio.
2. Reframe using source-resolution pixels.
3. Extend background using content-aware or generated fill.
4. Crop only when the main subject remains complete and intentional.
5. Never stretch to force the target dimensions.

For any manual crop, record special positioning in the manifest rather than hiding it in CSS.

Suggested manifest fields:

```ts
{
  code: "VB",
  slug: "01-volleyball",
  card: "card-3x4/01-volleyball.webp",
  share: "share-6x5/01-volleyball.webp",
  cardPosition: "50% 42%",
  sharePosition: "50% 50%"
}
```

Runtime positioning should normally remain centred. Category-specific offsets are exceptions and require visual approval.

## File naming

Use exactly:

```text
NN-english-slug.webp
```

Rules:

- two-digit numeric prefix;
- lowercase ASCII slug;
- hyphens only;
- no spaces;
- no version suffix in runtime filenames;
- card and Share outputs use the same filename in separate directories.

Source or review files may carry a version suffix outside runtime folders.

## Repository structure

Approved target structure:

```text
assets/event-backgrounds/
  README.md
  manifest.ts
  card-3x4/
    01-volleyball.webp
    ...
    40-workshop.webp
  share-6x5/
    01-volleyball.webp
    ...
    40-workshop.webp
```

The client and server must use the same manifest or generated registry.

Avoid maintaining two independent handwritten 40-item maps.

## Repository replacement procedure

Before changing files:

1. Inspect current usage and resolver tests.
2. Confirm category number, slug, code, and both target dimensions.
3. Compare the new image with the current production image.
4. Prepare changes on an isolated branch.
5. Do not touch auth, secrets, `.env`, Supabase RLS, SQL, or migrations.

For each replaced category:

1. Replace or add both `card-3x4` and `share-6x5` variants.
2. Verify exact pixel dimensions.
3. Verify WebP decoding.
4. Verify filename and manifest mapping.
5. Verify file size and visual quality.
6. Check that no category points to another category's asset.

Do not commit generated source archives, temporary exports, backups, or local preview folders.

## Runtime rules

### Mini App

- Card layout should use a stable `3:4` aspect ratio.
- The prepared 3:4 asset should render without cropping.
- Preferred rendering: `object-fit: contain` or exact aspect-ratio fill.
- Do not apply hidden scale transforms that crop the source.
- Do not add a black readability gradient unless explicitly approved.

### Telegram and Meta Share

- Canvas is `1080 x 900`.
- Use the prepared `6:5` asset directly.
- Do not resize a square or portrait image with `fit: cover`.
- Preserve weather, organizer, date, price, location, and participant overlays.
- Weather absence must not block Share generation.

## Weather rules for Share

- Weather is displayed only when valid forecast data exists.
- Forecast lookup must be server-side for prepared Share cards.
- Use the event date, event time, city or coordinates, and duration.
- Supported forecast window should match the weather provider capability.
- Use a short timeout and degrade safely to no-weather rendering.
- A geocoding or forecast failure must not prevent the event card from being shared.
- Do not expose provider secrets to the frontend.

## Google Drive workflow

Google Drive is the source-media and review mirror, not runtime authority.

For each approved batch:

1. Keep source-resolution images in the retained source folder.
2. Store review previews separately from originals.
3. Keep this README beside the background folders.
4. Do not overwrite originals with compressed WebP derivatives.
5. After GitHub merge, optionally upload a mirror of the approved runtime pack.
6. Record the Git commit or PR number in the batch report.

## Required checks

Run after applying the repository patch:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Also verify:

- all expected files exist;
- every card asset is `1080 x 1440`;
- every Share asset is `1080 x 900`;
- manifest count matches the approved category count;
- resolver tests cover localized category names;
- rendered Share JPEG is `1080 x 900` and under the delivery size limit;
- Mini App card has no unintended crop or stretch;
- Telegram Android visual smoke passes.

Commit only when all automated checks pass and visual review is approved.

## Approval gate

Do not merge a background batch until the user approves:

- card contact sheet;
- Share contact sheet;
- special crops and subject positions;
- removal or addition of readability overlays;
- affected category list.

## Rollback

A background-only change must be reversible by restoring the previous asset files and manifest in one PR.

Do not combine background replacement with unrelated product logic, taxonomy expansion, auth work, database work, or large refactors.
