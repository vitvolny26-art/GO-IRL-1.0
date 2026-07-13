# GO IRL — native Telegram event card

Date: 2026-07-13
Role: AI Fixer / QA + UX Polish Agent
Branch: `fix/native-telegram-event-card`
Delivery state: prepared for a dedicated Draft PR and Vercel Preview verification; production merge remains out of scope.

## Goal

Replace the plain Telegram invitation-link flow with an optional native Mini App share card while preserving the corrected UUID-only invitation URL and a reliable text fallback.

## Implementation

- Added a Vercel function at `/api/telegram/prepared-event-share`.
- The function validates signed Telegram Mini App `initData` using the existing shared validator.
- The Bot API token stays server-side and is read only from the runtime `TELEGRAM_BOT_TOKEN` variable.
- The endpoint calls Telegram Bot API `savePreparedInlineMessage`.
- The prepared message is a native `InlineQueryResultArticle` containing:
  - activity icon and event title;
  - date and time;
  - address;
  - participant count and capacity;
  - localized inline button that opens the exact event.
- The inline button accepts only an HTTPS `t.me` URL whose `startapp` value exactly equals the validated event UUID.
- User-controlled text is length-limited and HTML-escaped before it reaches Telegram.
- Added the Telegram Mini App `shareMessage` type and a frontend prepared-share service.
- Connected prepared sharing to generic cards, sport cards, and the event detail share action.
- If `shareMessage`, signed `initData`, the server endpoint, or Telegram Bot API is unavailable, the existing separated URL/text sharing flow remains active.

## Scope and security

- No `.env` files or secrets changed.
- No auth contract, Supabase RLS, SQL, schema, or migration changed.
- No MutationObserver or DOM post-processing added.
- No GitHub or Vercel state changed.

## Tests

- Unit coverage verifies native card structure, HTML escaping, participant display, exact inline-button URL, and duplicate-title suppression.
- Frontend coverage verifies unsupported-client fallback and successful `shareMessage` invocation.
- Targeted tests: PASS (2 files, 4 tests).
- `pnpm run typecheck`: PASS.
- `pnpm run lint`: PASS.
- `pnpm run build`: PASS.
- `pnpm run test`: PASS (34 files, 174 tests).
- Final `pnpm run typecheck`: PASS.

## Deployment requirement

The native share dialog cannot be fully exercised in a normal desktop browser. After explicit approval to deploy, verify it from the Telegram Mini App on a preview URL with `TELEGRAM_BOT_TOKEN` configured in the Vercel runtime. The browser/local fallback remains testable without that secret.
