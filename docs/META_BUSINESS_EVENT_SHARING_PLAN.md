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

Implement presentation-card sharing for Messenger and Instagram through the already connected Meta Business account. The existing Telegram prepared event card is the visual and product reference.

## Current baseline

- Telegram already creates a prepared event card with category image, event data, exact event deep link, and action buttons.
- WhatsApp uses direct text and URL sharing.
- The mobile system share sheet is handled separately through `navigator.share`.
- Messenger and Instagram currently use frontend fallbacks only; they do not yet send a native presentation card through Meta APIs.

## Required outcome

A user can initiate Messenger or Instagram sharing from an event card. GO IRL prepares a trusted presentation card based on the Telegram template and sends it only through Meta-supported conversations and permission windows.

Presentation card fields:

- category background;
- GO IRL branding;
- event title and category;
- date and time;
- address;
- participant count and capacity;
- exact event invitation link;
- primary action to open the event;
- optional calendar action where supported.

## Architecture boundary

Frontend must never receive Meta app secrets, page tokens, or long-lived access tokens.

Proposed flow:

1. User taps Messenger or Instagram.
2. Frontend calls a GO IRL server endpoint with signed Telegram session data, event UUID, language, and requested Meta channel.
3. Server validates the session and loads trusted event data.
4. Server renders or reuses the same presentation-card model used by Telegram.
5. Server sends the message through the appropriate Meta Business messaging API only when the target conversation and permission window are valid.
6. If native Meta delivery is unavailable, frontend falls back to the system share sheet or copied text plus exact event link.

## Delivery stages

### Stage 0 — Meta asset and access audit

- Confirm connected Facebook Page, Instagram professional account, Meta App, Business portfolio, and webhook subscriptions.
- Record app ID, page ID, Instagram account ID, granted permissions, token ownership, token expiry strategy, and current app-review state without committing secrets.
- Confirm which Messenger and Instagram messaging endpoints are available for the connected assets.
- Confirm messaging-window and user-initiation restrictions.

Deliverable: redacted capability matrix and security checklist.

### Stage 1 — Shared presentation-card contract

- Extract a channel-neutral event-share-card input contract from the Telegram implementation.
- Keep one trusted resolver for event data and category background.
- Define image dimensions, safe text lengths, localization, CTA labels, and fallback behavior.
- Add deterministic tests for title, date, address, participant count, exact deep link, and background resolver.

Deliverable: shared server-side card contract with no Meta calls.

### Stage 2 — Asset intake

- Store optimized category backgrounds under a dedicated share-card asset path.
- Preserve the original source archive in Google Drive.
- Add an asset manifest mapping filenames to canonical categories.
- Do not make all 40 categories active in the closed-beta create taxonomy.

Deliverable: optimized asset pack and manifest.

### Stage 3 — Messenger adapter

- Add a server-only Messenger delivery adapter.
- Use the shared presentation-card contract.
- Require an eligible user-initiated Messenger conversation and Meta-supported messaging window.
- Log delivery status without storing message contents or access tokens.
- Provide a clean unavailable result for the frontend fallback.

Deliverable: tested Messenger adapter behind a feature flag.

### Stage 4 — Instagram adapter

- Add a server-only Instagram Messaging adapter for the connected professional account.
- Use the same trusted card data and image renderer.
- Require an eligible Instagram conversation and Meta-supported messaging window.
- Provide a clean unavailable result for the frontend fallback.

Deliverable: tested Instagram adapter behind a feature flag.

### Stage 5 — Frontend integration

- Replace temporary copy-and-open fallbacks only after each native adapter is verified.
- Preserve Telegram, WhatsApp, and system-share behavior.
- Show explicit states: preparing, sent, cancelled, unavailable, and fallback used.
- Avoid silent failures and duplicate sends.

Deliverable: one share menu with channel-specific status feedback.

### Stage 6 — Security and production gate

- Store secrets only in approved runtime secret storage.
- Validate signed Telegram session data for every server request.
- Rate-limit share preparation and delivery.
- Validate UUID, language, channel, recipient/conversation identifier, and event visibility.
- Add structured audit logs without secrets or private message text.
- Complete Meta app review and production-mode verification where required.

Deliverable: security review and production checklist.

### Stage 7 — Beta verification

Test from real devices and eligible conversations:

- Telegram prepared card;
- WhatsApp direct share;
- Android and iOS system share;
- Messenger native card and fallback;
- Instagram native card and fallback;
- expired/invalid messaging window;
- missing permissions;
- invalid event UUID;
- deleted/private event;
- localization RU/UK/CS/EN;
- exact event-opening deep link.

## PR sequence

1. `docs: add Meta Business sharing plan`
2. `chore: add optimized share-card backgrounds and manifest`
3. `refactor: extract shared event presentation-card contract`
4. `feat: add Messenger event-card adapter`
5. `feat: add Instagram event-card adapter`
6. `feat: connect native Meta sharing UI`
7. `test: add Meta sharing integration and smoke coverage`

Each PR is isolated. No auth, RLS, SQL, migrations, secrets, or token changes are combined with UI work.

## Acceptance criteria

- Messenger and Instagram use the connected Meta Business assets rather than a misleading public sharer URL.
- The Telegram presentation card remains the canonical visual template.
- Exact event deep links are preserved.
- Secrets stay server-side.
- Unsupported or ineligible Meta conversations fall back safely.
- Telegram, WhatsApp, and system sharing continue to work.
- Test, typecheck, lint, and build are green before each code merge.

## Asset source

Original source archive in Google Drive:

`go_irl_40_event_avatars.zip`

Drive file ID: `1wndg3PXB3oOBtpErnUIleuEBqzSaRvzu`

The archive contains 40 square PNG category backgrounds at 1254×1254. Repository copies should be optimized for runtime delivery and accompanied by a manifest.
