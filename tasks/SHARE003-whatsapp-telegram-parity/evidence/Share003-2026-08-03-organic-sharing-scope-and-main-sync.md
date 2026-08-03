# Share003- Organic sharing scope and main synchronization evidence

Date: 2026-08-03
Role: AI Fixer
Mode: bounded product-scope clarification and branch synchronization

## Owner decision

The owner confirmed two operational constraints:

- future task-facing names use the exact case-sensitive prefix `Share003-`;
- GO IRL should continue with organic WhatsApp event sharing without company registration or documentary Meta business verification.

## Verified product boundary

Share003 uses:

`GO IRL share action -> direct wa.me intent -> public event-preview URL -> provider-generated link preview`.

This path does not depend on WhatsApp Business Cloud API credentials, a production business phone number, message templates or automated sending.

Company registration and documentary Meta verification are not treated as prerequisites for GO IRL to generate its own public Open Graph event-preview page and image. Those requirements remain relevant only to the separate WABA001 Cloud API release gate.

## Implementation boundary

The existing Share003 implementation preserves:

- one event-specific public preview URL in the WhatsApp text;
- trusted server-side event identity and visibility rules;
- RU/UK/CS/EN preview language with RU fallback;
- Telegram-standard localized primary event action;
- shared event-card composition;
- exact event and calendar actions on the public preview;
- direct organic `wa.me` routing;
- unchanged Telegram, Facebook, Messenger, Instagram and native paths.

## Current-main inspection

Previous Share003 head:

- `156609c3b6cc0ea71a6e9ae3453d1a7ac7d1b0b4`.

Current inspected `main`:

- `93b5bb26bca326e1642c34ce9de0b361aba73e85`.

GitHub comparison returned:

- Share003 ahead by 3 commits;
- Share003 behind by 6 commits;
- merge base `e3fd56624ccee6d0a441037b844d8d280b48b503`;
- status `diverged`.

The six intervening `main` commits modify Beauty/UI files and reports. They do not overlap the Share003 runtime files:

- `src/cardShare.ts`;
- `src/cardShare.test.ts`;
- `src/components/CardShareAction.tsx`;
- `tests/api/meta/event-preview.test.ts`.

A combined tree is therefore built from current `main` plus the verified Share003 blobs, with both current `main` and the previous Share003 head retained as commit parents. No force push is used.

## CI evidence before synchronization

Previous exact head `156609c3b6cc0ea71a6e9ae3453d1a7ac7d1b0b4`:

- GitHub Actions run `30841936889`;
- conclusion: PASS;
- 140 test files / 664 tests;
- focused card share: 13 PASS;
- Meta preview parity: 2 PASS;
- Staff OS, typecheck, lint, build and bundle budget: PASS.

The synchronized head requires a fresh exact-head readback. Previous CI is not transferred by assumption.

## Vercel evidence boundary

Accessible Vercel deployment listings returned production deployments from `main` only. No branch-specific Share003 Preview deployment was found.

Production deployments are not used as evidence that the Share003 branch rendered correctly. No deployment was created by this task.

## Still pending

- exact-head CI after synchronization;
- Android WhatsApp rendering;
- iOS WhatsApp rendering;
- WhatsApp Web/Desktop rendering;
- RU/UK/CS/EN provider-crawled card verification;
- preview-cache behavior after event/language changes;
- recipient selection and delivery evidence.

## Safety state

- no Meta Business/API changes;
- no company-registration workflow;
- no secrets or tokens;
- no production configuration change;
- no production data change;
- no merge;
- no deployment;
- no force push.
