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
- PR: `#687`;
- first CI `#1802`, run `31059749797`: one test expectation failed because `URLSearchParams` normalized the Messenger redirect without a trailing slash; runtime unchanged;
- corrected exact head: `420fbaebbf507afb173d97adbaf11921ada4e0fc`;
- CI `#1803`, run `31059826631`, job `92485128535`: PASS;
- repository hygiene: PASS, 1286 tracked files;
- diff check: PASS;
- tests: PASS, 156 files / 726 tests plus Staff OS;
- focused WhatsApp UX tests: PASS, 7 tests;
- saved Beauty artwork tests: PASS, 7 tests;
- prepared Beauty route test: PASS;
- typecheck: PASS;
- lint: PASS with one pre-existing warning in `api/_shared/admin-authorization.ts`;
- build: PASS, Vite 8.1.3, 385 modules;
- bundle budget: PASS, 10 JavaScript chunks.

## Rollback

Close PR #687 without merging. Production remains unchanged.

## Next step

Keep PR #687 in Draft until physical Telegram and Android WhatsApp smoke verifies that the cabinet JPEG is identical and WhatsApp receives the attached image. Merge and deployment require explicit approval.
