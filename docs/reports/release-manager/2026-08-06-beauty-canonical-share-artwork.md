---
title: Beauty canonical share artwork
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-08-06
next_review: 2026-08-13
---

# Agent Report

## Task

Make Telegram and WhatsApp sharing use the exact JPEG generated in the Beauty professional workspace.

## Files inspected

- `src/beauty/BeautyShareCardEditor.tsx`
- `src/beauty/beautyShareCardRepository.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `api/_shared/telegram-share-beauty.ts`
- `api/meta/event-preview.ts`
- `api/telegram/prepared-beauty-share.ts`
- related tests
- current `main` commit `811c0581d98125bdcfc0615d43290ae678b93bf5`

## Findings

- the workspace generated and persisted the approved JPEG in the public `beauty-share-cards` bucket;
- Telegram and Meta preview routes ignored that persisted JPEG and rebuilt another card from the public profile projection;
- the WhatsApp modal fetched a JPEG but discarded the file and opened `wa.me` with text only;
- share helpers still exposed the obsolete `go-irl-1-0.vercel.app` origin.

## Changes made

- added a server-side loader for the ready persisted Beauty artwork and its fingerprint version;
- made the Beauty preview endpoint proxy that exact saved JPEG, with the existing renderer retained only as a compatibility fallback;
- made Telegram prepared sharing use the artwork fingerprint in its image URL;
- made supported mobile browsers call the native share sheet with the JPEG file and caption attached;
- kept manual download plus `wa.me` as the explicit unsupported-device fallback;
- separated the current Vercel API origin from the public `goirl.realitka.pp.ua` landing origin;
- updated focused regression tests;
- made no auth, RLS, SQL, migration, secret, environment, DNS, production-data, merge, or deployment change.

## Checks

- base `main`: `811c0581d98125bdcfc0615d43290ae678b93bf5`;
- branch: `fix/beauty-canonical-share-artwork-20260806`;
- changed runtime/test files before report: 10;
- GitHub Actions exact-head CI: pending.

## Rollback

Close the PR without merging. Production remains unchanged.

## Next step

Open a Draft PR, verify exact-head GitHub Actions, then run physical Telegram and Android WhatsApp smoke before merge approval.
