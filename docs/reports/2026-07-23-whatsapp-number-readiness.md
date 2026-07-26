# Agent report — WhatsApp number readiness gate

Date: 2026-07-23
Scope: GO IRL WhatsApp production release gate
Overall roadmap progress: 93%

## Fix

Audited the WhatsApp Business Account phone-number state after completing webhook verification and the `messages` subscription.

## Analysis

- The connected WABA is still the Meta test WhatsApp Business Account.
- Its only listed phone is a Meta test number.
- The listed number is not verified for production use.
- The action for adding a production phone number is currently unavailable in WhatsApp Manager.
- Meta indicates that company verification is required to expand number access and limits.
- Both GO IRL outbound templates remain under Meta review.

## Where

- WhatsApp Manager → Phone numbers.
- Meta Developers → WhatsApp → Working environment.

## Run

Before the WhatsApp live release gate can run, the account owner must complete the Meta business/phone verification flow and register a production WhatsApp number capable of receiving the verification code.

## Check

- The WhatsApp webhook callback is configured and verified.
- The `messages` webhook field is subscribed.
- The outbound provider remains disabled.
- No production message was sent.
- No phone number, token, provider identity, raw payload or private message was added to this report.

## If green

After the production number is verified and both templates are active, run the controlled inbound/outbound lifecycle smoke, retry, idempotency and opt-out checks before enabling WhatsApp.

## If red

Keep WhatsApp disabled. Telegram and Messenger remain unaffected.
