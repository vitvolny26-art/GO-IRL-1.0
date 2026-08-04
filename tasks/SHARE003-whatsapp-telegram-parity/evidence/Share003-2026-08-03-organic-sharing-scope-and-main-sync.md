# Share003- Organic sharing scope and main synchronization evidence

Date: 2026-08-03
Role: AI Fixer
Mode: bounded product-scope clarification and corrective branch synchronization

## Owner decision

- Future task-facing names use exact case-sensitive prefix `Share003-`.
- GO IRL continues with organic WhatsApp event sharing without company registration or documentary Meta business verification.

## Verified product boundary

Share003 uses:

`GO IRL share action -> direct wa.me intent -> public event-preview URL -> provider-generated link preview`.

This path does not depend on WhatsApp Business Cloud API credentials, a production business phone number, templates or automated sending.

Company registration and documentary Meta verification are not treated as prerequisites for GO IRL to generate its public Open Graph event-preview page and image. They remain relevant only to separate WABA001 Cloud API work.

## Implementation boundary

The Share003 implementation preserves:

- one event-specific public preview URL in WhatsApp text;
- trusted server-side event identity and visibility rules;
- RU/UK/CS/EN preview language with RU fallback;
- Telegram-standard localized primary event action;
- shared event-card composition;
- exact event and calendar actions on the public preview;
- direct organic `wa.me` routing;
- unchanged Telegram, Facebook, Messenger, Instagram and native paths.

## Main-ref verification and correction

Previous clean Share003 head:

- `156609c3b6cc0ea71a6e9ae3453d1a7ac7d1b0b4`.

A general recent-commit query returned `93b5bb26bca326e1642c34ce9de0b361aba73e85`. It was initially used as if it were current `main` without verifying the branch ref.

The resulting synchronization commit:

- `9c98b314e2b6af70237063cc1dc4c37e070e0dbd`.

PR readback immediately exposed the error:

- changed files increased from 10 to 24;
- unrelated Beauty files appeared in the PR.

No success claim was made. Writes were stopped.

GitHub compare using literal ref `main` then verified the real current main:

- `252b6643c994209b5f9d6a93f57778ce6a4e9b36`;
- Share003 was ahead by 3 and behind by 7;
- merge base `e3fd56624ccee6d0a441037b844d8d280b48b503`.

The seven main commits affect Beauty/UI/SQL/report files and do not overlap Share003 runtime paths:

- `src/cardShare.ts`;
- `src/cardShare.test.ts`;
- `src/components/CardShareAction.tsx`;
- `tests/api/meta/event-preview.test.ts`.

## Corrective synchronization method

A corrective tree is built from verified main `252b6643…` plus only the verified Share003 runtime/test/task blobs.

The corrective commit uses the incorrect synchronization head and verified main as parents. This preserves history, removes unrelated branch-only content from the resulting tree and allows a normal fast-forward ref update.

No force push is used.

## CI evidence before correction

Previous exact head `156609c3b6cc0ea71a6e9ae3453d1a7ac7d1b0b4`:

- GitHub Actions run `30841936889`;
- conclusion PASS;
- 140 test files / 664 tests;
- focused card share 13 PASS;
- Meta preview parity 2 PASS;
- Staff OS, typecheck, lint, build and bundle budget PASS.

Fresh exact-head CI is required after correction. Previous CI is not transferred by assumption.

## Vercel evidence boundary

Accessible Vercel deployment listings returned production deployments from `main` only. No branch-specific Share003 Preview deployment was found.

Production deployments are not used as branch-rendering evidence. No deployment was created by this task.

## Still pending

- corrective PR file-scope readback;
- exact-head CI after correction;
- Android/iOS/Web WhatsApp rendering;
- RU/UK/CS/EN provider-crawled card verification;
- preview-cache behavior;
- recipient selection and delivery evidence.

## Safety state

- no Meta Business/API changes;
- no company-registration workflow;
- no secrets or tokens;
- no production configuration/data change;
- no merge;
- no deployment;
- no force push.
