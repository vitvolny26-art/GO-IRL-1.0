# Agent report — Meta webhook verify rotation

Date: 2026-07-23
Scope: GO IRL Meta messaging security release gate
Overall roadmap progress: 93%

## Fix

Rotated the shared server-only Meta webhook verification token and revalidated the configured Meta webhook endpoints without exposing the value.

## Analysis

- `META_VERIFY_TOKEN` was replaced as a sensitive Production and Preview variable in Vercel.
- Production was redeployed from the last known-good runtime deployment.
- Deployment `dpl_AjC24hmzzMYytK4DNuMXdK9v5eAX` reached **Ready**.
- Instagram webhook was reverified against `https://go-irl-1-0.vercel.app/api/instagram/webhook`.
- Messenger webhook was reverified against `https://go-irl-1-0.vercel.app/api/messenger/webhook`.
- Messenger subscriptions `messages` and `messaging_postbacks` remain active.
- WhatsApp webhook was configured and verified at `https://go-irl-1-0.vercel.app/api/whatsapp/webhook`.
- WhatsApp `messages` subscription is now active.
- The WhatsApp outbound channel remains disabled because both GO IRL templates are still under Meta review.

## Where

- Vercel project `go-irl-1-0` production environment.
- Meta Developers → Instagram API → Webhooks.
- Meta Developers → Messenger API → Webhooks.
- Meta Developers → WhatsApp → Working environment → Webhooks.

## Run

After the deployment became Ready, the production reminder scheduler was observed on the new deployment.

## Check

- Repeated `/api/reminders/run` executions returned HTTP 200.
- Each run reported zero claimed, sent, retried, failed and cancelled items.
- Vercel reported no runtime errors in the checked period.
- No secret, provider user ID, raw webhook payload or private message text was recorded.
- No runtime code, database schema, auth, RLS or migration was changed.

## If green

Continue with the remaining Instagram App Secret/account password security rotation, then repeat the short Instagram lifecycle smoke test. Keep WhatsApp disabled until both templates are approved and its full live release gate passes.

## If red

Retain Telegram and Messenger as the only enabled providers and do not expand the provider allowlist.
