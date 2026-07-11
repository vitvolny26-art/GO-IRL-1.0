# AI Fix Report — 2026-07-11

## Summary
Restored reliable sport-card reminder/share actions, removed the conflicting global click interceptor, cleared existing TypeScript/lint blockers discovered by CI, fixed generic-card sharing to use the exact Telegram event deep link, and removed the external CDN dependency for messenger icons.

## Root cause
`enableSportCardActionSheets()` intercepted sport-card clicks in capture phase and called `stopImmediatePropagation()`, preventing React handlers from running reliably. Generic cards then used `window.location.href` for sharing because the runtime adapter had no direct event ID. Messenger icons also depended on `cdn.simpleicons.org`, which could fail inside Telegram WebView or restricted networks. CI also exposed unrelated typing issues in weather parsing, avatar path generation, chat status values, bug-report handler arguments, and Vite environment access.

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
- `public/icons/telegram.svg`
- `public/icons/whatsapp.svg`
- `public/icons/messenger.svg`
- `public/icons/viber.svg`
- `docs/reports/2026-07-11-ai-fix-report.md`

## Fix applied
- Removed startup registration of the global sport-card capture listener.
- Removed the obsolete delegated sport-card listener from `card-action-sheets.ts`.
- Wired reminder and share buttons directly in `SportVertical.tsx`.
- Kept the four-channel picker: Telegram, WhatsApp, Messenger, Viber.
- Sport-card share messages now use the Telegram Mini App event deep link.
- Generic cards now resolve their rendered event against the Zustand store and share the exact Telegram Mini App event deep link.
- Kept generic duration/date reminder actions, participant/detail action, Mapy.cz address action, informational price/status cells, Coach/detail action, and original Join/Open handler.
- Replaced external Simple Icons CDN URLs with local SVG assets under `public/icons/`.
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
Make the sport-card duration chip open the reminder picker so sport and generic cards follow the same button contract.
