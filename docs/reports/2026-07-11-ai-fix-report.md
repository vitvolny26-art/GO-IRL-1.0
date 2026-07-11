# AI Fix Report — 2026-07-11

## Summary
Restored reliable sport-card reminder/share actions, removed the conflicting global click interceptor, cleared existing TypeScript/lint blockers discovered by CI, and fixed generic-card sharing to use the exact Telegram event deep link.

## Root cause
`enableSportCardActionSheets()` intercepted sport-card clicks in capture phase and called `stopImmediatePropagation()`, preventing React handlers from running reliably. Generic cards then used `window.location.href` for sharing because the runtime adapter had no direct event ID. CI also exposed unrelated typing issues in weather parsing, avatar path generation, chat status values, bug-report handler arguments, and Vite environment access.

## Files changed
- `src/main.tsx`
- `src/card-action-sheets.ts`
- `src/verticals/SportVertical.tsx`
- `src/unified-card-template.ts`
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
- Sport-card share messages now use the Telegram Mini App event deep link.
- Generic cards now resolve their rendered event against the Zustand store and share the exact Telegram Mini App event deep link.
- Kept generic duration/date reminder actions, participant/detail action, Mapy.cz address action, informational price/status cells, Coach/detail action, and original Join/Open handler.
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
- Generic event resolution relies on title, subtitle, and address matching until cards become a shared React component.

## Not touched
- `.env` or secrets
- Supabase RLS/auth/schema
- migrations or destructive SQL
- dependencies
- store architecture
- event lifecycle
- card CSS/layout

## Next small fix
Replace external messenger icon URLs with local assets so the picker remains reliable in Telegram WebView with restricted network access.
