---
title: Share003 Physical WhatsApp Smoke Preflight
owner: AI Fixer
status: Blocked on physical provider execution
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Share003- physical WhatsApp smoke preflight

## Task

Prepare the final provider-verification gate for the organic WhatsApp sharing path without merging or deploying.

Target runtime:

`GO IRL share action -> wa.me -> public event-preview URL -> WhatsApp-generated preview`

## Verified repository state before this evidence

- Branch: `fix/share003-whatsapp-telegram-parity-20260803`
- Starting head: `1a99a23e979ce3da64a35d9d701349984e11f256`
- Draft PR: `#608`
- PR state: open, Draft, mergeable, unmerged
- Starting-head CI: run `30862372304` — PASS
- n8n result: Result A; n8n is not a Share003 runtime dependency

## Vercel preflight

Accessible Vercel scope:

- Team: `team_BuP2F4XGjFGussJqmQrISrbj`
- Project: `prj_MtabJvddKyFSr98iC18Ztf7rlZjF` (`go-irl-1-1`)

The 20 latest accessible deployments were inspected. Every returned deployment had:

- target: `production`;
- Git ref: `main`;
- Git commit SHA from current or earlier `main`;
- no deployment for branch `fix/share003-whatsapp-telegram-parity-20260803`;
- no deployment for head `1a99a23e979ce3da64a35d9d701349984e11f256`.

Conclusion: no branch-specific runtime is available. Production `main` must not be used as evidence for this PR head.

No deployment was started because production or preview deployment requires separate explicit approval.

## Event-preview contract verified from the branch

`api/meta/event-preview.ts` provides:

- GET-only handler;
- trusted event lookup by event UUID and language;
- accepted languages: RU, UK, CS and EN;
- RU default/fallback behavior;
- one canonical event-preview URL;
- Open Graph title, description, image and canonical URL;
- image dimensions declared as 1200 × 630;
- localized event and calendar actions;
- calendar download/Google Calendar behavior;
- five-minute response/CDN cache headers.

The branch tests verify these localized actions:

| Language | Event action | Calendar action |
|---|---|---|
| RU | Открыть событие | В календарь |
| UK | Відкрити подію | У календар |
| CS | Otevřít událost | Do kalendáře |
| EN | Open event | Add to calendar |

Code and CI prove construction and regression behavior only. They do not prove the card rendered by WhatsApp.

## Required physical matrix

Use one trusted public event available in all four languages. Record the exact event ID and URL without recording recipient personal data.

| Platform | RU | UK | CS | EN |
|---|---|---|---|---|
| Android WhatsApp | pending | pending | pending | pending |
| iOS WhatsApp | pending | pending | pending | pending |
| WhatsApp Web/Desktop | pending | pending | pending | pending |

For each cell verify:

1. Share opens WhatsApp through `wa.me`.
2. The text contains one event-preview URL.
3. The preview renders a non-placeholder image.
4. Title matches the event.
5. Date and time match the event.
6. Address matches the event.
7. Preview language matches the selected GO IRL language.
8. Event action opens the exact event.
9. Calendar action opens or downloads a valid calendar entry.
10. App switching and return to GO IRL work.
11. No WhatsApp Business/API send occurs.

## Cache verification

For one event:

1. Share RU and capture rendered preview.
2. Share EN using the language-specific canonical URL and capture rendered preview.
3. Change a safe non-production test-event field or use a separately approved test event/version.
4. Share the new URL/version.
5. Record whether WhatsApp refreshes title, description and image.

Do not mutate production event data solely for this test without explicit approval.

## Evidence required from the device tester

For every platform provide:

- device/platform and WhatsApp version;
- test timestamp and timezone;
- tested language;
- redacted screenshot of composed message and preview;
- preview URL with event UUID redacted only in screenshots, but recorded in secured task evidence if allowed;
- PASS/FAIL for title, date, address, image, actions and app switching;
- cache observation;
- exact failure reproduction steps.

Do not include recipient names, phone numbers, chat history, tokens or personal data.

## Result

Preflight is complete. Physical provider execution is not verifiable from the available connectors because:

- no branch-specific Vercel deployment exists;
- no Android, iOS or authenticated WhatsApp Web device session is available;
- WhatsApp crawler rendering and cache behavior cannot be inferred from CI or HTML construction.

PR #608 must remain Draft. No merge or deployment was performed.
