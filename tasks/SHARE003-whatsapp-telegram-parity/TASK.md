# SHARE003 — Telegram-standard WhatsApp event sharing

- Task ID: SHARE003
- ClickUp: https://app.clickup.com/t/869e3k1v5
- Owner role: AI Fixer
- Status: In Progress
- Branch: `fix/share003-whatsapp-telegram-parity-20260803`
- Base: `e3fd56624ccee6d0a441037b844d8d280b48b503`

## Problem

Telegram event sharing is the product reference: it uses trusted server-side event data, localized card artwork, the exact event deep link, an event action, a calendar action, a native recipient picker and a tested fallback. WhatsApp currently uses a direct `wa.me` text target with an event preview URL, but the frontend drops the selected language and the text/action contract is weaker than Telegram.

## Scope

- inspect and document the complete Telegram event-share pipeline;
- map portable Telegram behavior to direct organic WhatsApp sharing;
- pass RU/UK/CS/EN into WhatsApp event preview;
- align the WhatsApp user-facing action copy with Telegram;
- preserve the trusted event payload, shared card composition, exact event CTA and calendar CTA already exposed by the event preview;
- preserve direct `wa.me` routing and existing non-WhatsApp channel behavior;
- add targeted parity and regression tests;
- save evidence, report, ClickUp and Drive references.

## Out of scope

- WhatsApp Business or Cloud API delivery;
- message templates, Meta review, webhooks, tokens or automated sending;
- claiming provider delivery from opening `wa.me`;
- architecture rewrite or broad multi-network UX redesign;
- auth, Supabase RLS, SQL, migrations, secrets, production configuration or production data;
- merge or production deployment.

## Acceptance criteria

1. Telegram reference flow is documented from frontend trigger through trusted payload, image, actions, recipient picker and fallback.
2. WhatsApp uses the selected RU/UK/CS/EN language with RU fallback.
3. WhatsApp text uses the same localized primary event action semantics as Telegram.
4. WhatsApp remains a direct organic `wa.me` flow and preserves the exact event identity through the event-specific preview.
5. The preview continues to use trusted server data, the same share-card composition, exact event CTA and calendar CTA.
6. Telegram, Facebook, Messenger, Instagram and native behavior are unchanged by the bounded runtime diff.
7. Targeted tests and required repository gates pass on the same final head.
8. Android/iOS/desktop WhatsApp preview and cache behavior are recorded as a physical-runtime gate.

## Approval gates

Explicit owner approval is required before merge, deployment, WhatsApp Business/API work, production configuration, auth/RLS/SQL/migrations/secrets/production-data changes, architecture rewrite or beta-scope expansion.

## Dependencies

- current GitHub `main`;
- existing Telegram prepared-share and Meta event-preview infrastructure;
- physical WhatsApp runtime access for provider smoke.

## Blockers

Physical provider rendering and cache behavior cannot be proven by CI alone.

## Related

- Draft PR #603 — Messenger/copy feedback; separate task.
- Draft PR #605 — earlier WhatsApp locale-only fix on an obsolete base; SHARE003 revalidates from current main.
- Merged PR #564 — rich social event sharing baseline.
