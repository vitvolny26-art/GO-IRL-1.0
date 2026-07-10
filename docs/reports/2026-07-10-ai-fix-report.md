# AI Fix Report — 2026-07-10

## Summary
Unified event card visual template across sport and generic cards, then started wiring card button behavior.

## Root cause
Sport cards and generic cards used different DOM structure and different CSS layers. CSS-only visual overrides were not enough to make cards identical or keep button behavior consistent. Generic cards also exposed event fields in different DOM order, so date, time, price, address and status needed normalized parsing.

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
- Added top action buttons: reminder and share.
- Added reminder placeholder for sport cards.
- Added a final compact-card CSS override layer.
- Added a runtime adapter to normalize generic cards into the compact sport-card DOM template.
- Normalized generic card data parsing by field meaning instead of DOM position.
- Added duration fallback for generic event types.
- Aligned generic cards with sport card layout: top actions, duration/participants chips, info grid and two-button footer.
- Fixed generic SVG icons to use `currentColor` and lime stroke.
- Fixed generic status cell so it can show two icons and text rows like sport cards.

## Button dependency map

| Button / zone | DOM/CSS selector | Current behavior | Dependency |
|---|---|---|---|
| Reminder bell | `.sport-card-icon-action[aria-label="Напоминание"]` | Sport: opens placeholder. Generic: visual control prepared for same flow. | `SportActivityCard`, `unified-card-template.ts`, compact CSS layers |
| Share | `.sport-card-icon-action[aria-label="Поделиться"]` | Sport: existing share flow. Generic: visual control prepared; needs next handler wiring. | `src/share.ts`, `src/share/*`, `unified-card-template.ts` |
| Duration chip | `.sport-duration-chip` | Informational chip. | Sport metadata or generic `eventDuration(title)` fallback |
| Participants chip | `.sport-card-participants-chip` | Informational chip; can later open participants list. | `joinedCount`, `capacity`, parsed generic DOM |
| Date/time block | first detail block | Informational; intentionally not calendar navigation now. | event date/time or parsed generic DOM |
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
Next small fix: wire generic card reminder/share buttons to the same behavior as sport cards, then connect address/date/participants cells one by one.
