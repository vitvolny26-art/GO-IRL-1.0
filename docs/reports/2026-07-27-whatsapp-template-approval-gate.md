# WhatsApp template approval gate — 2026-07-27

## Fix

Meta approved both GO IRL service templates:

- `go_irl_event_reminder` — Active;
- `go_irl_event_update` — Active.

WhatsApp outbound remains disabled because the full production release gate is not complete.

## Analysis

The approval blocker is closed, but the selected WABA still contains only Meta's unverified test number. The production-number add action remains unavailable pending business verification/setup.

The production database currently contains no active, consented WhatsApp provider identity. Therefore an end-to-end reminder-worker smoke test cannot safely prove delivery, idempotency, retry behavior, or opt-out against an authorized recipient.

Instagram Direct and Messenger conversation windows were closed during this checkpoint, so no repeat outbound messages were sent.

## Where

- Meta WhatsApp Manager: template management and phone-number inventory.
- Supabase: aggregate, identifier-free provider identity audit.
- Google Doc: `Messaging & Reminders Production Status — 2026-07-23`.

## Run

No production message, reminder, database fixture, credential change, or channel enablement was performed.

Next controlled sequence:

1. complete Meta Business verification and register the production WhatsApp number;
2. receive an inbound `START`/opt-in from the designated test recipient;
3. verify the active, consented WhatsApp identity and allowed delivery state;
4. enqueue one reminder/update with a unique delivery key;
5. verify one send, one provider message ID, and no duplicate on the next worker pass;
6. verify retry classification and `STOP`/opt-out;
7. enable WhatsApp only after the physical-device release matrix passes.

## Check

- both templates: Active;
- production WhatsApp number: absent;
- test number: unverified;
- active/consented WhatsApp identities: zero;
- live outbound messages sent in this checkpoint: zero;
- secrets, recipient IDs, raw payloads, and personal message text recorded: zero.

Overall roadmap completion: 94%.

## If green

Proceed with the controlled production-number and opt-in smoke sequence above, then add WhatsApp to the production provider allowlist.

## If red

Keep WhatsApp disabled and record only the sanitized error class and failed release-gate step.