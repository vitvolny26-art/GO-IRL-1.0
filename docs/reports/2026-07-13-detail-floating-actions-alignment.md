# Event detail floating actions alignment

Date: 2026-07-13
Branch: `fix/detail-floating-actions-alignment`
State: locally verified; approved for Draft PR publication

## Change

- Aligned the close button center with the delete button center on the same vertical axis.
- Moved the trash glyph exactly 8 px down inside its floating button.
- Applied the shared CSS to both generic and sport event detail sheets.

## Scope

- CSS-only adjustment in the existing React-level implementation.
- No event data, routing, auth, Supabase, migrations, or external configuration changes.
- No MutationObserver or DOM post-processing.

## Verification

- `pnpm run lint`: pass
- `pnpm run build`: pass
- `pnpm run test`: pass (37 files, 189 tests)
- `pnpm run typecheck`: pass
