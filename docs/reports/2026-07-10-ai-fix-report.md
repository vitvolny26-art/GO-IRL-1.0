# AI Fix Report — 2026-07-10

## Summary
Added reminder placeholder for compact sport card bell button.

## Root cause
The compact sport card had a real bell button, but it had no user-facing action. This made the button look interactive without feedback.

## Files changed
- `src/verticals/SportVertical.tsx`
- `src/compact-sport-card.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Added local `reminderPreviewOpen` state inside `SportActivityCard`.
- Bell button now toggles a small placeholder panel.
- Placeholder explains future messenger notification choice.
- Added scoped CSS for the placeholder panel.

## Verification
```text
pnpm run lint   PASS
pnpm run build  PASS
pnpm run test   PASS
```

## Risks
Low. Local UI-only state inside `SportActivityCard`; no persistence and no backend writes.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Next small fix: replace share button with a messenger icon sheet.

---

## Summary
Aligned compact sport card top actions and right-side metadata.

## Root cause
The card used the generic share-nodes icon and displayed duration/participants in one horizontal row, while the approved target layout requires a curved share arrow and a vertical right-side stack.

## Files changed
- `src/compact-sport-card.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Replaced visible share icon with a curved arrow using scoped CSS.
- Reordered right-side chips: duration above participants.
- Shifted duration/participants stack to the right side of the card.
- Converted the lower-right sport info cell into two visual rows with level and outdoor indicators.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium-low. This is CSS-only and scoped to `.compact-sport-card`, but uses visual overrides for the lower-right info cell.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify the sport card on mobile.

---

## Summary
Applied final compact sport card visual polish batch.

## Root cause
The approved mobile layout still had five visual inconsistencies: the top eyebrow duplicated data, time/participants were too low, the level/status cell icons were misaligned, footer actions were not visually split, and the share icon did not match the requested curved arrow reference.

## Files changed
- `src/compact-sport-card.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Hid the top `level · environment` eyebrow on compact sport cards.
- Raised the duration/participants stack on the right side.
- Rebuilt the share icon visually as a curved arrow using scoped CSS pseudo-elements.
- Aligned the two icons and two text rows in the lower-right sport info cell.
- Reworked the footer as a clear 50/50 split: dark coach side and lime join/status side.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium-low. CSS-only, scoped to `.compact-sport-card`; no data or business-flow changes.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and verify the compact sport card on mobile after Vercel deploy.

---

## Summary
Refined compact sport card actions without restoring the top eyebrow.

## Root cause
The previous visual pass still had a rough share arrow, oversized right-side metadata chips, slightly misaligned lower-right icons, and a footer that did not read as two equal one-line actions.

## Files changed
- `src/compact-sport-card.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Kept the top `level · environment` eyebrow hidden.
- Rebuilt the share arrow with smaller rounded pseudo-elements.
- Raised and reduced the duration/participants chips.
- Aligned lower-right level/status icons closer to their text rows.
- Forced the footer into two equal one-line buttons.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium-low. CSS-only and scoped to `.compact-sport-card`.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify the compact sport card on mobile after Vercel deploy.

---

## Summary
Fixed compact sport card share icon position and footer split.

## Root cause
The top action buttons were still too low, the CSS-drawn share icon looked broken, and footer action styles were affected by existing button rules, causing the two actions to stack visually instead of reading as a clean row.

## Files changed
- `src/compact-sport-card.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Moved bell/share action buttons higher.
- Replaced the broken drawn share icon with a simpler curved arrow glyph.
- Raised and reduced duration/participants chips further.
- Forced footer actions into a two-column single-row grid with explicit heights.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium-low. CSS-only and scoped to `.compact-sport-card`.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and verify the compact sport card footer on mobile after Vercel deploy.

---

## Summary
Added final compact sport card override layer.

## Root cause
The existing compact sport card CSS accumulated several overrides, and the requested visual order still needed a safer final layer: a proper share arrow, slightly lower metadata chips, separated footer buttons, and reordered info cells.

## Files changed
- `src/compact-sport-card-final.css`
- `src/main.tsx`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Added a final scoped CSS override loaded after `compact-sport-card.css`.
- Replaced share icon with an SVG-mask curved arrow.
- Moved duration/participants slightly lower.
- Reordered info cells visually: date, price, address, level/status.
- Forced address wrapping for two-line display.
- Split bottom actions into two separate rounded buttons.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium. CSS-only, but adds one new loaded stylesheet to avoid rewriting the accumulated old CSS.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify the compact sport card on mobile after Vercel deploy.

---

## Summary
Tightened final compact sport card rows.

## Root cause
The final card layout was visually correct, but the info blocks and footer buttons were still too tall and sitting slightly too low inside the card.

## Files changed
- `src/compact-sport-card-final.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Reduced info block min-height and padding.
- Reduced footer button height.
- Tightened icon and text sizing inside info blocks.
- Moved the rows visually higher with smaller margins.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Low. CSS-only and scoped to `.compact-sport-card`.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify the compact sport card on mobile after Vercel deploy.

---

## Summary
Rolled compact template onto generic event cards in event stacks.

## Root cause
Only sport cards had the approved compact visual template. Generic event cards on the same page still used the older taller layout, creating inconsistent card design on the All Events page.

## Files changed
- `src/all-event-card-template.css`
- `src/main.tsx`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Added a scoped CSS layer for `.activity-stack .activity-card:not(.compact-sport-card)`.
- Matched generic card header/avatar sizing to the compact sport layout.
- Reworked generic details into compact 2-column info blocks.
- Limited extra generic detail rows to avoid oversized cards.
- Reworked generic footer into two compact actions: spots and join/status action.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium-low. CSS-only and scoped to activity-stack generic cards; no data or business logic changes.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify Board games / Walking cards on All Events.

---

## Summary
Applied compact sport DOM template to generic event cards at runtime.

## Root cause
The CSS-only rollout could not make generic cards identical because generic cards and sport cards had different DOM structure. Generic cards lacked top actions, right-side chips, and the same footer structure.

## Files changed
- `src/unified-card-template.ts`
- `src/main.tsx`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Added a runtime card normalizer for generic `.activity-card` elements.
- Converts generic card DOM into the same compact structure used by sport cards.
- Adds top actions, right-side duration/participants chips, compact details grid, and two-action footer.
- Leaves existing join/open handlers intact by reusing original buttons and main click handler.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium. UI-only runtime adapter; no data or backend changes, but it mutates rendered DOM to avoid a large App.tsx rewrite.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify Walking / Board games cards match Volleyball.

---

## Summary
Normalized generic card data parsing for unified template.

## Root cause
Generic cards expose date, time, address, participants and price in different DOM positions than sport cards. The first adapter reused positional parsing, which caused Walking to render with wrong block order, missing duration, and mixed emoji/lucide-style icons.

## Files changed
- `src/unified-card-template.ts`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Replaced positional parsing with text-based field detection.
- Added duration fallback by event type.
- Rebuilt detail grid in the sport template order: date, price, address, status.
- Replaced emoji controls/detail icons with inline SVG icons.
- Kept original open/join handlers.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium. UI-only runtime adapter; no backend/data changes, but DOM normalization still needs mobile visual QA.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify Walking / Board games cards match Running/Volleyball.

---

## Summary
Aligned unified generic card icons with compact sport template.

## Root cause
Inline SVG icons in runtime-normalized generic cards inherited browser defaults and appeared black/filled. Existing sport CSS also overrode the second top action button with pseudo-elements, causing generic top actions to differ from sport cards.

## Files changed
- `src/all-event-card-template.css`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Forced unified-card inline SVGs to use `currentColor`, no fill, and consistent stroke styling.
- Restored actual SVG display for top action buttons on generic unified cards.
- Overrode sport-only pseudo-elements for generic unified cards.
- Restored correct detail grid order for generic unified cards.
- Removed pseudo star duplication in the status cell.
- Constrained footer coach icon size.

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium-low. CSS-only layer on top of the runtime adapter; no backend/data changes.

## Not touched
- Supabase schema/RLS/auth
- Telegram auth flow
- store architecture
- migrations
- env/secrets
- dependencies

## Follow-up
Run quality gates and visually verify Walking / Board games cards against Running/Volleyball.
