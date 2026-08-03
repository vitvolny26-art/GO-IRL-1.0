# WABA001 Roadmap

## Current phase

Phase 2 — external Meta Business/WABA asset verification.

## Verified completed

- owner confirmed AI Fixer role and WhatsApp-first scope;
- existing ClickUp task `869e81k1r` selected; no duplicate task created;
- task branch and required task folder created;
- existing Cloud API webhook, signature verification, consent/idempotency, join flow, interactive invitation, outbound messages and reminder/template adapters inspected;
- historical durable evidence inspected: webhook/subscription configured, both GO IRL templates later recorded Active, production number previously blocked;
- owner confirmed Meta/WhatsApp token or tokens were created;
- no token value or secret was provided or stored;
- token type, system-user ownership, assigned assets, permissions, expiry/rotation, active WABA/number validity and access-token Production presence remain unverified;
- current production deployment verified READY at `dpl_BjDaCwagW1hvwhB9SUigj25fc18b`, main commit `db9421f8234107f4cf5ae45ee3e2fdad6e9796d2`;
- one safe negative-path GET verification probe returned controlled `403 verification_failed`;
- scoped production runtime logs verified the exact `GET /api/whatsapp/webhook 403` request;
- `META_VERIFY_TOKEN` is verified present and resolvable in active production without reading its value;
- positive callback verification from the intended Meta App, WABA subscription and `messages` field remain unverified;
- ClickUp updated and read back as In Progress / High / WhatsApp-only scope;
- Drive task, Reports and Evidence folders created;
- redacted owner-readiness checklist created and read back;
- report mirrored to Drive and read back;
- production configuration was not changed by WABA001;
- provider allowlist was not changed;
- no live WhatsApp message was sent;
- no WABA001 merge or deployment was performed;
- unrelated main deployments were observed and are not attributed to WABA001;
- GitHub did not create workflow runs or combined status checks for the docs-only head; no CI PASS/FAIL is claimed.

## Next verified step

Obtain redacted current statuses for:

- token classification: temporary or permanent system-user token;
- `whatsapp_business_messaging` and `whatsapp_business_management` permissions;
- assigned business assets and intended WABA/number validity;
- expiry/rotation ownership;
- server-only `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` Production presence by name/status only;
- positive Meta callback verification for the intended App;
- WABA app subscription and `messages` webhook field;
- production number ownership, Cloud API registration and two-step verification;
- template status/languages/component counts;
- one consented owner-controlled test recipient.

## Pending checks

- current Meta Business portfolio verification;
- current WABA ownership and app association;
- production number eligibility, ownership verification and Cloud API registration;
- two-step verification state;
- created token type, permissions, assigned assets, expiry and storage location;
- `META_APP_SECRET`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and template variable presence by name/environment;
- positive callback GET verification from the intended Meta App;
- signed POST delivery for the intended WABA;
- controlled inbound/outbound lifecycle;
- retry/idempotency and STOP/opt-out;
- provider allowlist decision;
- full repository gates if code changes are later required.

## Blockers

- no authenticated Meta Business/WhatsApp Manager connector in this session;
- token creation and production verify-token presence are confirmed, but full token/WABA/number readiness is not;
- protected production configuration and live messaging require separate explicit owner approval;
- no consented test recipient has been verified in this task.

## Completion conditions

All TASK.md acceptance criteria are verified, evidence and report are saved, ClickUp and Drive are current, and any code/config/provider changes have the required explicit approvals. No automatic merge or deployment.
