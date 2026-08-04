# BEAUTY014 initial WhatsApp Beauty preview evidence

Date: 2026-08-04
Role: AI Fixer
Branch: `fix/beauty014-whatsapp-card-20260804`
Base: `b697ee9fd3c0854eb5ab133cc09dae8c7a3e7a38`

## Owner-observed physical behavior

- Android WhatsApp sport event share rendered the intended event card after provider delay.
- Android WhatsApp Beauty normal share rendered a generic `GO IRL` card instead of the intended `Test Studio` / Beauty profile card.
- A Beauty URL pasted separately could render Beauty page metadata, but this did not prove the normal share flow.
- Raw screenshots are not stored because they contain account and chat-identifying data.

## Source inspection

- `src/services/ServiceActivityCard.tsx` sends the professional public URL (`/beauty/<slug>`) through `CardShareAction`.
- `src/cardShare.ts` only converts UUID Telegram event links to `/api/meta/event-preview`.
- A Beauty URL does not match the event UUID path and therefore falls back to the original SPA route.
- The public SPA route can expose generic static `GO IRL` metadata to external crawlers.
- `api/_shared/telegram-share-beauty.ts` already loads trusted published Beauty data by slug and language.
- `api/_shared/telegram-share-card-image.ts` already renders the trusted card input as a 1200×630 JPEG.
- `api/_shared/event-share-backgrounds.ts` already maps manicure content to the Beauty share artwork.

## Reproduction classification

Root cause class: missing Beauty-specific server-rendered Open Graph URL in the organic share path.

## Smallest valid change

- add public Beauty preview and image endpoints using existing trusted public data and image renderer;
- route Beauty WhatsApp share to the short preview URL;
- send only that URL to WhatsApp so the result can appear as a card without extra share text;
- preserve event sharing behavior;
- no n8n, WABA, Business API, auth, RLS, SQL, migration, secret or production-data change.
