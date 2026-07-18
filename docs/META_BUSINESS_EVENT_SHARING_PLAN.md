---
title: Meta Business Event Sharing Plan
owner: Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-18
next_review: 2026-07-25
---

# Meta Business Event Sharing Plan

## Goal

Implement presentation-card sharing for Messenger and Instagram through the already connected Meta Business account. Use the existing Telegram prepared event card as the visual and product template.

## Product contract

The shared card must contain:

- category background;
- event title and category;
- date and time;
- address;
- participants and capacity;
- exact event deep link;
- localized CTA to open the event;
- optional calendar CTA where the channel supports it.

Telegram remains the reference implementation. Messenger and Instagram must reuse the same trusted event payload and card-rendering rules, not create separate business logic.

## Important distinction

### User-initiated share

The current card menu opens Telegram, WhatsApp, the phone system share sheet, Messenger, or Instagram. This is initiated by the user and must keep a safe text/link fallback.

### Meta Business messaging

Meta APIs may send presentation cards only to conversations and recipients allowed by Meta permissions, consent, app review, and messaging-window policies. This must not become unsolicited bulk messaging.

## Planned architecture

1. Keep `Activity` and the exact invitation URL as source data.
2. Extract a channel-neutral `EventShareCardPayload` from the current Telegram card input.
3. Keep one category-background resolver for Telegram, Messenger, and Instagram.
4. Render a stable public presentation image from trusted server-side event data.
5. Add a server-only Meta adapter using Meta credentials from runtime secrets.
6. Store no Meta tokens in the client or repository.
7. Log delivery result without storing message contents unnecessarily.
8. Preserve browser/system-share fallbacks if Meta delivery is unavailable.

## Delivery phases

### Phase 0 — verify Meta setup

- confirm Meta Business portfolio, app, Facebook Page, and Instagram Professional account linkage;
- record Page ID, Instagram account ID, app ID, webhook status, granted permissions, and app-review state;
- verify the supported recipient-entry flow and messaging windows;
- do not expose tokens in screenshots, docs, logs, or GitHub.

### Phase 1 — shared presentation-card contract

- define `EventShareCardPayload`;
- adapt the existing Telegram renderer to consume it;
- map the 40 category backgrounds;
- add fallback background and localization tests;
- verify exact deep-link preservation.

### Phase 2 — Messenger prototype

- create a server-only Messenger adapter;
- send image/card plus event CTA to an eligible test conversation;
- support one explicit test recipient first;
- add error handling for permissions, recipient eligibility, expired windows, and rate limits;
- retain system-share fallback.

### Phase 3 — Instagram prototype

- create a server-only Instagram messaging adapter;
- send the presentation image and event link to an eligible test conversation;
- verify professional-account permissions and app review;
- handle channels that cannot render Telegram-style inline buttons by sending image plus localized text and exact link.

### Phase 4 — Mini App integration

- replace temporary Messenger/Instagram URL fallbacks only after both server adapters are verified;
- show clear states: sending, sent, unavailable, cancelled, failed;
- never report success before the Meta API confirms acceptance;
- keep Telegram, WhatsApp, and system share independent.

### Phase 5 — beta QA and rollout

- test RU/UK/CS/EN;
- test all six canonical beta categories first;
- test private chat eligibility, expired messaging window, revoked permission, deleted event, and invalid event ID;
- test card image dimensions and readable text in Messenger and Instagram clients;
- enable for closed beta only after security review and manual device verification.

## Asset intake

Source archive in Google Drive: `go_irl_40_event_avatars.zip`.

- 40 PNG files;
- 1254 × 1254 each;
- approximately 74 MB total;
- filenames `01-volleyball.png` through `40-workshop.png`.

Repository copy is stored as an optimized WebP archive to avoid committing the 74 MB PNG source. The original ZIP remains in Drive as the design master.

Target repository asset path:

`docs/assets/meta-share/go_irl_share_backgrounds_webp.zip`

Before runtime use, extract only approved category files into the final public/server asset directory in a dedicated implementation PR.

## Security gates

Explicit approval is required before changing:

- `.env` or Vercel environment variables;
- Meta access tokens or app secrets;
- webhook configuration;
- auth contracts;
- Supabase RLS, SQL, or migrations.

No token may be committed, copied into ClickUp, or stored in Google Docs.

## Acceptance criteria

- Telegram behavior remains unchanged.
- Messenger and Instagram use the same trusted event payload and presentation-card design.
- Exact event deep link opens the intended event.
- No client-side Meta secret exists.
- No unsolicited or policy-invalid messaging is possible.
- Failure always falls back safely.
- `pnpm run test`, `pnpm run typecheck`, `pnpm run lint`, and `pnpm run build` pass for implementation PRs.

## Proposed PR sequence

1. `docs: add Meta Business event sharing plan and assets`
2. `refactor: extract shared event share card payload`
3. `feat: add Messenger event card adapter`
4. `feat: add Instagram event card adapter`
5. `feat: connect Meta event sharing UI`
6. `test: add Meta sharing integration and beta smoke coverage`

## Next step

Run Phase 0 as a read-only Meta configuration audit and return the exact granted permissions, account IDs, webhook state, and app-review status without revealing tokens.