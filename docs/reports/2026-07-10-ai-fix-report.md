# AI Fix Report — 2026-07-10

## Summary
Unified event card visual template across sport and generic cards, then wired the visible generic card controls.

## Root cause
Sport cards and generic cards used different DOM structure and different CSS layers. The runtime adapter added visual buttons to generic cards, but only the coach button had a click handler. Bell, share, duration and participants chips were visible but inert.

## Files changed
- `src/verticals/SportVertical.tsx`
- `src/compact-sport-card.css`
- `src/compact-sport-card-final.css`
- `src/all-event-card-template.css`
- `src/unified-card-template.ts`
- `src/main.tsx`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Added compact sport-card visual template.
- Added a runtime adapter to normalize generic cards into the compact sport-card DOM template.
- Normalized generic card data parsing by field meaning instead of DOM position.
- Added duration fallback for generic event types.
- Aligned generic cards with sport card layout: top actions, duration/participants chips, info grid and two-button footer.
- Fixed generic SVG icons to use `currentColor` and lime stroke.
- Fixed generic status cell so it can show two icons and text rows like sport cards.
- Wired generic reminder bell to a bottom mini-sheet placeholder.
- Wired generic share button to a messenger mini-sheet with Telegram, WhatsApp, Messenger and Viber actions.
- Wired generic duration chip to the reminder placeholder.
- Wired generic participants chip to open the event detail flow through the preserved main card click.

## Button dependency map

| Button / zone | DOM/CSS selector | Current behavior | Dependency |
|---|---|---|---|
| Reminder bell | `.sport-card-icon-action[aria-label="Напоминание"]` | Opens reminder messenger placeholder sheet. | `unified-card-template.ts`, `.unified-card-mini-sheet` |
| Share | `.sport-card-icon-action[aria-label="Поделиться"]` | Opens messenger share sheet: Telegram, WhatsApp, Messenger, Viber. | `unified-card-template.ts`, browser `window.open` |
| Duration chip | `.sport-duration-chip` | Opens reminder messenger placeholder sheet. | generic `eventDuration(title)` fallback |
| Participants chip | `.sport-card-participants-chip` | Opens event detail through preserved main-card click. | original card open handler via `main.click()` |
| Date/time block | first detail block | Informational only. No calendar navigation. | event date/time or parsed generic DOM |
| Price block | second detail block | Informational. | event price or fallback `Бесплатно` |
| Address block | third detail block | Informational now; later map handler. | event location/address or parsed generic DOM |
| Status block | `.unified-status-cell` or sport status cell | Informational level/environment/status. | sport metadata or `genericStatus(title, spotsText)` fallback |
| Coach | `.sport-coach-action` | Opens event detail/chat flow through preserved main click. | `ActivityChatPanel`, `CoachRequestPanel`, original card open handler |
| Join/open | `.card-join` | Preserves original join/open handler. | `onJoin`, `joinedIds`, `pendingIds`, original button event handler |

## Verification
```text
pnpm run lint   PENDING
pnpm run build  PENDING
pnpm run test   PENDING
```

## Risks
Medium. The generic card unification currently uses a runtime DOM adapter to avoid a large `App.tsx` rewrite. This is UI-only and avoids Supabase/auth/store changes, but needs mobile visual QA after each card/button pass.

## Not touched
- Supabase schema/RLS/auth
- migrations
- env/secrets
- dependencies
- event lifecycle
- Telegram auth flow
- store architecture

## Follow-up
Next small fix: connect address to maps and keep date/time as notification placeholder, not calendar navigation.
