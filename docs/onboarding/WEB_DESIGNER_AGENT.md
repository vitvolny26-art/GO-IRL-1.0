# Web Designer Agent — GO IRL 1.0

## Role
Web Designer / UI Fixer for GO IRL 1.0.

Main goal: polish mobile UX fast without rewriting architecture.

## Product context
GO IRL is a Telegram Mini App for local real-life events.

Current focus: Olomouc, Czechia.

Core flow: create event -> share -> people join -> event chat -> meet in real life.

Slogan: Less scrolling. More life.

## Working style
Keep replies short and in English to save tokens.

Use this format:

```text
## Fix
1-2 lines.

## Cause
Short root cause.

## Changed
Files changed.

## Test
pnpm run lint
pnpm run build
pnpm run test

## Check
What user should verify.
```

Do not write long explanations.
Do not paste large code.
Do not ask user to manually search files if GitHub search/fetch can do it.

## Repo rules
- Repo: `vitvolny26-art/GO-IRL-1.0`
- Branch: `main`
- Use GitHub tools for patches.
- Use `pnpm`, never `npm`.
- Do not touch `.env`, secrets, Supabase RLS/auth, migrations, destructive SQL.
- Do not rewrite architecture.
- Do not add dependencies without explicit approval.
- Do not force push.
- Do not commit broken code.

After every patch:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

If green, update:

```text
docs/reports/YYYY-MM-DD-ai-fix-report.md
```

## Important docs to read first
- `README.md`
- `DOCS_INDEX.md`
- `docs/DEVELOPMENT_PROTOCOL.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `docs/bible/08-runtime-boundaries.md`
- `docs/onboarding/AI_FIXER_AGENT.md`

## Current UI work done
A compact event-card template was built across sport and generic cards.

Main files involved:

```text
src/verticals/SportVertical.tsx
src/compact-sport-card.css
src/compact-sport-card-final.css
src/all-event-card-template.css
src/unified-card-template.ts
src/unified-card-actions.css
src/card-action-sheets.ts
src/card-action-sheets.css
src/main.tsx
```

What was attempted:
- Sport cards made compact and mobile-first.
- Generic cards normalized to sport-like template through `unified-card-template.ts` runtime adapter.
- Top actions added: reminder bell and share.
- Detail cells normalized: date/time, price, address, level/status.
- Bottom actions normalized: Coach + Join/Open.
- Share/reminder flyout attempted as vertical messenger icon list.

## Current known problem
Top two card buttons may not work reliably.

Likely reasons:
- runtime DOM adapter and React handlers conflict;
- delegated handler in `card-action-sheets.ts` may be attached too early or target wrong DOM after rerender;
- CSS overlays may intercept clicks;
- selector `.sport-card-top-actions .sport-card-icon-action` may not match actual rendered button on all cards.

Before changing code:
1. Inspect real rendered DOM/classes in the relevant component.
2. Search usages:

```text
sport-card-top-actions
sport-card-icon-action
openCardShareSheet
openCardReminderSheet
enableSportCardActionSheets
enableUnifiedCardTemplate
```

## Faster way forward
Do not keep patching blindly with more CSS.

Best next step:
- move card action behavior into React where the buttons are created;
- keep runtime adapter only as temporary visual compatibility;
- avoid more global event interception unless absolutely necessary.

For sport cards, wire buttons directly in `SportVertical.tsx`.

For generic cards, either:
1. create a shared React `EventCard` component later, or
2. keep runtime adapter but attach handlers directly when creating buttons in `unified-card-template.ts`.

## Button contract
All event cards should follow this behavior:

| Button | Behavior |
|---|---|
| Bell | Open reminder channel picker placeholder |
| Share | Open share channel picker |
| Duration | Open reminder placeholder, not calendar |
| Participants | Open participants/detail view |
| Date/time | Open reminder placeholder, not calendar |
| Address | Open Mapy.cz search |
| Price | Informational only |
| Level/status | Informational only |
| Coach | Open coach/detail flow |
| Join/Open | Preserve original join/open handler |

## Desired share/reminder picker UX
User requested:
- no text labels;
- no close button;
- exactly 4 icons;
- vertical list;
- opens near/right of tapped action button;
- closes on second tap of same button.

Channels:
- Telegram
- WhatsApp
- Messenger
- Viber

Avoid invented icons. Use real app icons or stable local assets.

## Visual card target
The approved card style:
- avatar left;
- title/subtitle center;
- bell/share top-right;
- duration and participants chips right side;
- 2x2 info grid: date/time, price, address, level/status;
- bottom two buttons in one row: Coach + Join/Open;
- compact height;
- dark card, lime accent.

## Efficiency notes
- One small fix at a time.
- First find root cause, then patch.
- Prefer fixing React source over CSS hacks when behavior is broken.
- CSS-only is okay only for visual polish.
- Do not change multiple subsystems in one patch.
- User works from phone: give only one short command block.

## Report template
Use this after each successful patch:

```markdown
# AI Fix Report — YYYY-MM-DD

## Summary

## Root cause

## Files changed

## Fix applied

## Verification
```text
pnpm run lint   PASS/FAIL
pnpm run build  PASS/FAIL
pnpm run test   PASS/FAIL
```

## Risks

## Not touched

## Next small fix
```

## Handoff warning
Previous work used too many incremental CSS/runtime patches. This created fragility.

New AI should slow down, inspect DOM/source, and fix behavior at the source.
