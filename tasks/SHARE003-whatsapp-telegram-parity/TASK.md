# Share003- Telegram-standard WhatsApp event sharing

- Task ID: `SHARE003`
- Display/name prefix required by owner: `Share003-` (case-sensitive)
- ClickUp: https://app.clickup.com/t/869e3k1v5
- Owner role: AI Fixer
- Status: In Progress
- Branch: `fix/share003-whatsapp-telegram-parity-20260803`
- Original base: `e3fd56624ccee6d0a441037b844d8d280b48b503`
- Current verified GitHub `main`: `252b6643c994209b5f9d6a93f57778ce6a4e9b36`

## Product decision

The owner confirmed that GO IRL should continue with organic WhatsApp sharing without company registration or documentary Meta business verification.

This task targets:

`GO IRL share action -> wa.me intent -> public event-preview URL -> WhatsApp-generated link preview`.

Company registration, Meta Business verification and documents are not required to generate GO IRL's public Open Graph event card. They belong only to the separate WhatsApp Business/Cloud API release gate for automated business-number messaging, templates and native API interactions.

## Problem

Telegram event sharing is the product reference: trusted server-side event data, localized card artwork, exact event identity, event/calendar actions, native recipient picker and tested fallback. Organic WhatsApp sharing uses a direct `wa.me` text target with an event-preview URL. The bounded gap was that the frontend dropped the selected language and the action text was weaker than the Telegram-standard contract.

## Scope

- document the complete Telegram event-share pipeline;
- map portable Telegram behavior to direct organic WhatsApp sharing;
- pass RU/UK/CS/EN into the WhatsApp event preview;
- align WhatsApp user-facing action copy with Telegram;
- preserve trusted event data, shared card composition, exact event CTA and calendar CTA;
- preserve direct `wa.me` routing and existing non-WhatsApp behavior;
- add targeted parity/regression tests;
- record provider-smoke evidence and cache limitations;
- use `Share003-` for new task-facing names and evidence files.

## Out of scope

- WhatsApp Business or Cloud API delivery;
- Meta business verification, company registration or documentary submission;
- message templates, Meta review, webhooks, tokens or automated sending;
- claiming provider delivery/rendering from opening `wa.me`;
- architecture rewrite or broad multi-network redesign;
- auth, Supabase RLS, SQL, migrations, secrets, production configuration or production data;
- merge or production deployment.

## Acceptance criteria

1. Telegram reference flow is documented from frontend trigger through trusted payload, image, actions, recipient picker and fallback.
2. WhatsApp uses selected RU/UK/CS/EN with RU fallback.
3. WhatsApp text uses the same localized primary event-action semantics as Telegram.
4. WhatsApp remains direct organic `wa.me` and preserves exact event identity through an event-specific preview.
5. The preview uses trusted server data, the shared card composition, exact event CTA and calendar CTA.
6. Telegram, Facebook, Messenger, Instagram and native behavior remain unchanged.
7. Targeted tests and required repository gates pass on the same implementation head.
8. Android/iOS/Web WhatsApp rendering and cache behavior remain an explicit physical-runtime gate.
9. No company-registration requirement is attributed to organic Open Graph sharing.

## Approval gates

Explicit owner approval is required before merge, deployment, WhatsApp Business/API work, production configuration, auth/RLS/SQL/migrations/secrets/production-data changes, architecture rewrite or beta-scope expansion.

## Dependencies

- current GitHub `main`;
- existing Telegram prepared-share and Meta event-preview infrastructure;
- public event/invite URL;
- physical WhatsApp runtime access for final provider smoke.

## Blockers

Physical provider rendering, app switching, recipient selection, delivery and crawler cache cannot be proven by CI or server HTTP checks alone.

## Related

- Draft PR #608 — active Share003 implementation.
- Draft PR #603 — Messenger/copy feedback; separate task.
- Draft PR #605 — obsolete WhatsApp locale-only base.
- Merged PR #564 — rich social event sharing baseline.
- WABA001 — separate WhatsApp Business Cloud API release gate.
