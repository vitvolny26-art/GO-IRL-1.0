# WABA001 Roadmap

## Current phase

Phase 1 — verified readiness audit and protected-change plan.

## Verified completed

- owner confirmed AI Fixer role and WhatsApp-first scope;
- existing ClickUp task `869e81k1r` selected; no duplicate task created;
- no existing GitHub task folder found for the ClickUp task;
- current `main` verified at `7068b37adeb8756315ce2f6e5fe49a3d2c744273`;
- task branch created from that commit;
- existing Cloud API webhook, signature verification, inbound consent/idempotency, join flow, interactive invitation, outbound messages and reminder/template adapters inspected;
- historical durable evidence inspected: webhook/subscription configured, both GO IRL templates later recorded Active, production number previously blocked;
- current Vercel project and latest READY production deployment identified;
- current deployment produced no WhatsApp-matching runtime logs in the inspected 24-hour window;
- official current Cloud API registration/webhook/template requirements cross-checked.

## Next verified step

Produce a redacted account-readiness checklist for the owner and collect fresh evidence of:

- business portfolio verification state;
- intended WABA/app linkage;
- production phone-number state;
- app mode and WhatsApp permissions;
- webhook subscription target;
- template status/languages/component counts;
- permanent system-user credential readiness.

## Pending checks

- current Meta Business portfolio verification;
- current WABA ownership and app association;
- production number eligibility, ownership verification and Cloud API registration;
- two-step verification state;
- permanent system-user token permissions;
- production environment variable presence by name/environment;
- callback GET verification and signed POST delivery for the intended WABA;
- controlled inbound/outbound lifecycle;
- retry/idempotency and STOP/opt-out;
- provider allowlist decision;
- full repository gates if code changes are required.

## Blockers

- no authenticated Meta Business/WhatsApp Manager connector in this session;
- protected production configuration and live messaging require separate explicit owner approval;
- no consented test recipient has been verified in this task.

## Completion conditions

All TASK.md acceptance criteria are verified, evidence and report are saved, ClickUp and Drive are current, and any code/config/provider changes have the required explicit approvals. No automatic merge or deployment.
