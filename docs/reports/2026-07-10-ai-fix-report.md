# AI Fix Report — 2026-07-10

## Summary
Unified event card visual template across sport and generic cards, then changed share/reminder actions into a compact vertical messenger flyout.

## Root cause
Sport cards and generic cards used different DOM structure and different action behavior. The previous sheet showed labels and a close button, and appeared as a large bottom modal. The requested UX is a small vertical icon list near the tapped action button, with no text and no explicit close button.

## Files changed
- `src/verticals/SportVertical.tsx`
- `src/compact-sport-card.css`
- `src/compact-sport-card-final.css`
- `src/all-event-card-template.css`
- `src/unified-card-template.ts`
- `src/unified-card-actions.css`
- `src/card-action-sheets.ts`
- `src/card-action-sheets.css`
- `src/main.tsx`
- `docs/reports/2026-07-10-ai-fix-report.md`

## Fix applied
- Added compact sport-card visual template.
- Added a runtime adapter to normalize generic cards into the compact sport-card DOM template.
- Wired generic reminder/share/duration/participants/date/address controls.
- Added shared action-sheet helpers for card reminder/share flows.
- Standardized reminder/share actions to exactly four messenger options: Telegram, WhatsApp, Messenger, Viber.
- Replaced the large bottom sheet with a small fixed-position vertical flyout.
- Removed title text, subtitles, labels and the `Закрыть` button from the flyout UI.
- Anchored the flyout to the tapped card action button.
- Added toggle behavior: tapping the same button closes the current flyout.

## Button dependency map

| Button / zone | DOM/CSS selector | Current behavior | Dependency |
|---|---|---|---|
| Reminder bell | `.sport-card-icon-action[aria-label="Напоминание"]` | Toggles vertical four-icon reminder flyout. | `card-action-sheets.ts`, `card-action-sheets.css` |
| Share | `.sport-card-icon-action[aria-label="Поделиться"]` / second top action | Toggles vertical four-icon share flyout. | `card-action-sheets.ts`, browser `window.open` |
| Duration chip | `.sport-duration-chip` | Generic: opens reminder flyout anchored to chip. Sport: visual chip for now. | generic `eventDuration(title)` fallback |
| Participants chip | `.sport-card-participants-chip` | Generic: opens event detail. Sport: existing members preview. | original card open/members handlers |
| Date/time block | first detail block | Generic: opens reminder flyout. No calendar navigation. | parsed generic DOM, `openCardReminderSheet()` |
| Price block | second detail block | Informational. | event price or fallback `Бесплатно` |
| Address block | third detail block | Generic: opens Mapy.cz search. | parsed generic DOM, `openMap()` |
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
Medium. The generic card unification still uses a runtime DOM adapter to avoid a large `App.tsx` rewrite. The flyout positioning is UI-only and should be checked on narrow mobile screens.

## Not touched
- Supabase schema/RLS/auth
- migrations
- env/secrets
- dependencies
- event lifecycle
- Telegram auth flow
- store architecture

## Follow-up
Next small fix: wire sport-card address/date/duration to the same behavior, or replace runtime adapter with a shared React card component when beta pressure is lower.
