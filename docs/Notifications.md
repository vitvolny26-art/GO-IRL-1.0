# Notifications and Evening Digest

GO IRL notifications must be server-side. The Telegram Mini App must not stay alive in the background for notifications.

## Notification Platform

All notification channels are backend/n8n driven.

Supported/planned channels:

- Telegram: primary MVP channel.
- Email: later transactional/digest channel.
- WhatsApp: future channel, only after compliance and opt-in review.
- Push: future Android/iOS/web channel, not part of the current Mini App.

The frontend must not hold service credentials or run background notification workers.

## User Preferences

Preferences live in `notification_preferences`:

- city
- language
- interests
- preferred days
- preferred time window
- maximum price
- radius or district
- evening digest opt-in
- quiet hours
- notification channel:
  - Telegram
  - email
  - later: push
  - later: Viber
  - later: WhatsApp

Quiet hours should be enabled by default when notification preferences are created.

## Evening Digest Pipeline

1. n8n runs in the evening.
2. Select users with `evening_digest_enabled = true`.
3. Respect quiet hours.
4. Respect working hours and never send late-night digest batches.
5. Load user city, language, interests, price limit, preferred days/time.
6. Select matching published `events`.
7. Exclude expired, completed, cancelled, private, and already sent events.
8. Exclude events already sent using `notification_digest_log`.
9. Rank events by relevance, freshness, source trust, free spots, and interest match.
10. Render a short digest in the user's language.
11. Send through the selected channel.
12. Save result in `notification_digest_log`.

## Duplicate Send Prevention

Use:

- `notification_digest_log.user_id`
- `digest_date`
- `channel`
- `event_ids`

Do not send the same event repeatedly to the same user in the same digest window.

## Privacy Rules

- Digest is opt-in.
- Digest must not expose private user data.
- Delivery logs should be retained for a limited period.
- Disable all notifications with one preference update.
- No sensitive event participant data in notification content.
- AI digest ranking uses anonymized interests, not Telegram IDs, emails, phones, or private profiles.
- n8n should store only delivery status and event IDs needed to prevent duplicate sends.
- The Mini App is not a background notification worker.

## Activity Chat Notifications

Activity Chat notifications are future server-side notifications for optional Activity Chat.

Rules:

- Send only to organizer and confirmed participants who are active chat members.
- Do not notify guests, pending users, rejected users, blocked users, or users who left the chat.
- Allow users to mute or disable chat notifications.
- Respect quiet hours and working hours.
- Do not send chat notifications at night.
- Do not send chat notifications after the Activity ends if the chat is archived.
- Stop all chat notifications after `activity_chats.status = archived`.
- Do not include sensitive chat content in notification logs.

## Source Safety

Digest content comes from published events only.

Do not include events from:

- unreviewed `discovered_events`
- private/restricted sources
- unsafe Facebook scraping
- personal-account browser automation

## Not Implemented Now

- real Telegram bot sends
- email delivery
- Viber/WhatsApp delivery
- push notifications
- real digest ranking model
