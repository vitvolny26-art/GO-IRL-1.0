# AI Fix Report — 2026-07-11

## Summary
Restored reliable sport-card reminder/share actions, removed the conflicting global click interceptor, and cleared existing TypeScript/lint blockers discovered by CI.

## Root cause
`enableSportCardActionSheets()` intercepted sport-card clicks in capture phase and called `stopImmediatePropagation()`, preventing React handlers from running reliably. CI also exposed unrelated typing issues in weather parsing, avatar path generation, chat status values, bug-report handler arguments, and Vite environment access.

## Files changed
- `src/main.tsx`
- `src/card-action-sheets.ts`
- `src/verticals/SportVertical.tsx`
- `src/bugReport.ts`
- `src/profileAvatar.ts`
- `src/types.ts`
- `src/services/weather.ts`
- `vite.config.ts`
- `docs/reports/2026-07-11-ai-fix-report.md`

## Fix applied
- Removed startup registration of the global sport-card capture listener.
- Removed the obsolete delegated sport-card listener from `card-action-sheets.ts`.
- Wired reminder and share buttons directly in `SportVertical.tsx`.
- Kept the four-channel picker: Telegram, WhatsApp, Messenger, Viber.
- Share messages now use the Telegram Mini App event deep link.
- Added safe Open-Meteo response types.
- Aligned chat message status typing with current demo behavior.
- Fixed avatar path ID typing.
- Kept bug-report compatibility arguments without lint errors.
- Replaced Node `process.env` usage in Vite config with `loadEnv()`.

## Verification
```text
pnpm run lint   PASS
pnpm run build  PASS
pnpm run test   PASS
pnpm run typecheck PASS
```

## Risks
- Reminder channel actions are still placeholders.
- Messenger icons still depend on the Simple Icons CDN.
- Generic cards still use the runtime compatibility adapter.

## Not touched
- `.env` or secrets
- Supabase RLS/auth/schema
- migrations or destructive SQL
- dependencies
- store architecture
- event lifecycle
- card CSS/layout

## Next small fix
Verify generic-card reminder/share/duration/date/address behavior against the documented button contract in Telegram WebView and browser mode.
