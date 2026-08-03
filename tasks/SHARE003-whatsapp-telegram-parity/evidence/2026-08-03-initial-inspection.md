# SHARE003 Initial inspection evidence — 2026-08-03

## Verified base

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Current main: `e3fd56624ccee6d0a441037b844d8d280b48b503`
- Branch: `fix/share003-whatsapp-telegram-parity-20260803`
- ClickUp: `869e3k1v5`

## Telegram reference pipeline

1. `CardShareAction` attempts event-specific or Beauty prepared sharing and falls back to `t.me/share/url`.
2. `sharePreparedTelegramEvent` sends only signed Telegram init data, event ID and language to `/api/telegram/prepared-event-share`.
3. The server validates the request and Telegram session.
4. `loadTrustedTelegramEventCard` loads the event, joined count, organizer/avatar, category metadata and weather from trusted server sources; only public/invite events are shareable.
5. The server signs the card payload and generates a 1080×900 JPEG endpoint.
6. Telegram Bot API `savePreparedInlineMessage` creates a captionless photo message with localized Open event and Add to calendar buttons.
7. Telegram WebApp `shareMessage` opens the native recipient picker and returns shared/cancelled; timeout or failure falls back to URL sharing.

## Current WhatsApp pipeline

1. `CardShareAction` routes directly to `buildCardShareTarget("whatsapp", content)`.
2. `buildCardShareTarget` builds a `wa.me/?text=...` target.
3. The message contains title/date/address and `/api/meta/event-preview?event=<uuid>&language=ru`.
4. The preview endpoint uses the same trusted event loader as Telegram.
5. Meta image generation uses the same SVG composition as Telegram and wraps it as 1200×630 JPEG.
6. The preview page exposes localized Open event and Add to calendar actions.

## Verified parity already present

- same trusted event identity and visibility rules;
- same event data loader;
- same category artwork and SVG composition;
- same organizer/avatar and weather support;
- exact Telegram event CTA;
- calendar CTA;
- RU/UK/CS/EN support in the backend preview.

## Verified gap

- frontend share content omits language;
- preview URL is always `language=ru`;
- WhatsApp text has no localized primary action label matching Telegram;
- tests lock only the RU behavior.

## Provider-native differences that remain out of scope

Direct organic WhatsApp sharing cannot provide Telegram's prepared photo attachment, inline keyboard, share callback or delivery result without a separate WhatsApp Business/API project. Opening `wa.me` is only provider intent evidence.

## Smallest valid correction

- carry current language in card-share content;
- build the event preview with that language and RU fallback;
- localize the WhatsApp event action text with the same RU/UK/CS/EN wording as the preview/Telegram action;
- preserve direct `wa.me`, one preview URL, exact event identity and all other channels;
- add targeted regression tests.
