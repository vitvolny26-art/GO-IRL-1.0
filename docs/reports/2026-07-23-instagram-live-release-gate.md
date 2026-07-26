# Instagram Direct live release gate

Date: 2026-07-23  
Scope: GO IRL Instagram Direct production messaging  
Repository: `vitvolny26-art/GO-IRL-1.0`

## Outcome

The controlled Instagram Direct production path is operational. A fresh app-scoped credential for the intended professional account was stored server-side, the webhook subscription remained enabled, real inbound commands were processed, and a controlled lifecycle notification crossed the complete production path exactly once.

The channel is not yet considered finally security-released. Previously exposed Instagram account and Meta application credentials still require rotation. Until that manual security gate is complete, production provider enablement must remain reversible and no broad outbound campaign should run.

## Live evidence

- The intended professional account was confirmed in Meta API Setup.
- A fresh server-side Instagram credential replaced the invalid or expired credential.
- Real `START`, `STOP`, ordinary-message-after-opt-out, and repeated `START` flows were exercised from the controlled secondary account.
- The visible bot responses matched the expected opt-in and opt-out state changes.
- The ordinary message after opt-out did not produce an unsolicited outbound response.
- Production recorded the inbound events as processed on attempt `1`, with no webhook error.
- Durable inbound idempotency remains enforced by the provider-scoped event key.

## Outbox release smoke

A single controlled lifecycle fixture was inserted with a unique delivery key.

- A repeated enqueue attempt created no second row.
- The protected Supabase cron continued to invoke `/api/reminders/run` once per minute using a Vault-backed server secret.
- Initial worker failures after enabling Instagram were traced to the missing non-secret `INSTAGRAM_ACCOUNT_ID` configuration.
- The intended account ID was added to Vercel and production was redeployed as `dpl_3MDseUNhqrwkJPZQg7LsoBCbnLu9`.
- On the next cron pass the worker reported `notifications: claimed=1, sent=1, retried=0, failed=0, cancelled=0`.
- The outbox row finished as `sent`, provider `instagram`, attempt count `1`, with a provider message ID and no error code.
- The Instagram conversation showed exactly one user-visible lifecycle message.
- The following minute reported `claimed=0` and `sent=0`, proving the completed item was not delivered twice.

## Release-gate status

1. Correct production account and app-scoped credential: green.
2. Webhook subscription and signature path: green.
3. Real inbound message: green.
4. Real outbound message: green.
5. Lifecycle outbox to visible message: green.
6. Delivery idempotency and no duplicate: green.
7. Explicit opt-out and opt-in behavior: green.
8. Credential hygiene and required rotations: pending manual security action.

## Remaining external actions

- Rotate the Instagram account password that appeared during interactive browser setup.
- Rotate the Instagram App Secret and webhook verification value previously exposed during setup.
- Regenerate and store any credential invalidated by those rotations.
- Repeat one small inbound/outbound smoke test after rotation.
- Keep WhatsApp disabled until both submitted templates are approved and the real-number gate is green.

## Privacy boundary

This report contains no access token, password, application secret, verification value, provider user ID, raw webhook payload, or private message identifier.
