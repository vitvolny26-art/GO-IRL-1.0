# GO IRL — Telegram event share-card visual report

Date: 2026-07-13
Branch: `fix/telegram-share-card-visual`
Status: local implementation complete; not committed or pushed

## Goal

Replace the plain prepared Telegram event message with a branded event image that stays visually close to the canonical GO IRL event card while keeping Telegram actions genuinely interactive.

## Implemented

- Changed the prepared result from `InlineQueryResultArticle` to `InlineQueryResultPhoto`.
- Added a 1080×900 server-rendered JPEG with:
  - GO IRL dark/lime card styling;
  - activity artwork;
  - title and subtitle;
  - duration and participant chips;
  - date/time, price, address and level/format cells;
  - optional weather strip;
  - localized RU/UK/CS/EN labels.
- Added bundled color SVG artwork for volleyball and inline skating so Vercel does not depend on system color-emoji fonts.
- Kept `Open event` and `Map` as native Telegram inline buttons rather than fake buttons inside the image.
- Added a signed, one-hour image token. Event data cannot be modified in the public image URL without invalidating the HMAC signature.
- Added validation for invite, map, price, sport metadata and weather values.
- Added `sharp` for server-side JPEG generation.
- Preserved the existing Mini App `shareMessage` and Telegram init-data validation flow.

## Tests

- Telegram photo payload and native buttons.
- HTML escaping in the Telegram caption.
- Signed token round-trip, tampering, wrong secret and expiry.
- SVG escaping and layout data.
- JPEG format, 1080×900 dimensions and Telegram 5 MB limit.
- Bundled inline-skating artwork.
- Client request data and prepared-message handoff.

## Local quality gates

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS, 39 files / 194 tests
- Earlier targeted `pnpm run typecheck` — PASS

## Deployment requirements and remaining external check

- `TELEGRAM_BOT_TOKEN` must be available in the target Vercel environment.
- `/api/telegram/event-share-card` must be publicly reachable by Telegram; deployment protection must not block the image request.
- The BotFather Main Mini App URL must point to `https://go-irl-1-0.vercel.app` to avoid opening a stale Mini App version.
- After an approved Preview deployment, perform one real Telegram send from the Mini App and verify the image plus both native buttons on a second account.

## Scope safety

No `.env`, secrets, auth, Supabase RLS, SQL, migrations or event business logic were changed.
