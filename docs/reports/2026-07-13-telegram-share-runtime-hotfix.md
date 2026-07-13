# GO IRL — Telegram share runtime hotfix

Date: 2026-07-13
Branch: `fix/telegram-share-validation`
Status: local hotfix complete; not committed or pushed

## Production evidence

Vercel production runtime logs recorded three consecutive requests to `POST /api/telegram/prepared-event-share`, all returning HTTP 400 after PR #93 reached production. The request therefore failed before Telegram could open the recipient picker.

The previous handler returned the same 400 family for invalid card data and invalid Telegram init data, and did not record a safe reason code. The exact rejected optional field cannot be recovered from the historical requests.

## Hotfix

- Preserve strict checks for the event UUID, language and matching `t.me` invitation URL.
- Normalize optional legacy values instead of rejecting the whole card:
  - numeric strings;
  - missing display strings;
  - out-of-range duration, price and weather values;
  - unsupported or overlong optional map URLs.
- Omit an unsafe optional map button while keeping event sharing functional.
- Add privacy-safe runtime reason codes for invalid JSON, invalid core request, invalid Telegram session, Bot API rejection and unexpected preparation errors.
- Use Telegram Mini App `openTelegramLink` as a guaranteed fallback if prepared-card creation fails, avoiding popup blocking after an asynchronous request.

## Local validation

- `pnpm run typecheck` — PASS
- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS, 41 files / 200 tests

## Scope

No `.env`, secrets, auth policy, Supabase RLS, SQL or migrations were changed.
