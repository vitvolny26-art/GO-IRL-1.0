# AI Fix Report — 2026-07-11

## Summary
Fixed unreliable card action buttons.

## Root cause
A capture-phase document listener blocked React click handlers with `stopImmediatePropagation()`.

## Files changed
- `src/main.tsx`

## Fix applied
Removed the global card-action interceptor startup call. Existing React and direct generic-card handlers remain active.

## Verification
```text
pnpm run test       PASS
pnpm run typecheck  PASS
pnpm run lint       PASS
pnpm run build      PASS
```

## Risks
Generic runtime card adapter remains temporary technical debt.

## Not touched
Supabase, auth, RLS, migrations, dependencies, card CSS.

## Next small fix
Verify bell/share behavior in Telegram and browser mock mode.
