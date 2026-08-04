---
title: Agent Report
owner: AI Fixer
task_id: SHARE003
task_folder: tasks/SHARE003-whatsapp-telegram-parity/
status: Draft
source_of_truth: false
last_review: 2026-08-04
next_review: 2026-08-11
---

# Agent Report

## Task

Share003- Telegram-standard WhatsApp event sharing.

## Role

AI Fixer.

## Sources inspected

- GitHub Draft PR #608 and exact branch head;
- Share003 TASK, ROADMAP, STATUS and prior reports;
- `api/meta/event-preview.ts`;
- `api/meta/event-invitation-card.ts`;
- `src/cardShare.ts`;
- `src/invitationLink.ts`;
- `tests/api/meta/event-preview.test.ts`;
- Vercel deployment metadata and public HTTP responses;
- Android WhatsApp physical screenshots supplied by the owner.

## Files inspected

- `api/meta/event-preview.ts`
- `api/meta/event-invitation-card.ts`
- `api/_shared/env.ts`
- `src/cardShare.ts`
- `src/invitationLink.ts`
- `tests/api/meta/event-preview.test.ts`
- `tasks/SHARE003-whatsapp-telegram-parity/TASK.md`
- `tasks/SHARE003-whatsapp-telegram-parity/ROADMAP.md`
- `tasks/SHARE003-whatsapp-telegram-parity/STATUS.md`

## Runtime evidence

The Android RU smoke failed to render the event card for the event-preview URL. A separate generic site URL rendered a normal WhatsApp preview, proving that the device/network preview path was operational and localizing the failure to the event-preview contract.

The public event-preview endpoint on `go-irl-1-0.vercel.app` returned `200 text/html` with correct event title, date/time and address. Its generated `og:image` and canonical URL pointed to `goirl.realitka.pp.ua`.

The custom hostname was served by Caddy and returned generic GO IRL HTML for the invitation-card path. The equivalent invitation-card endpoint on `go-irl-1-0.vercel.app` returned `200 image/jpeg` with `Content-Length: 82935`.

## Findings

- The short event-based image URL works on the Vercel function host.
- The remaining blocker was split routing, not the event card renderer.
- `api/meta/event-preview.ts` prioritized `VERCEL_PROJECT_PRODUCTION_URL` and ignored the trusted request host.
- The frontend already emits event-preview URLs on `go-irl-1-0.vercel.app`.
- Arbitrary request hosts must not be reflected into Open Graph metadata.
- No DNS or Vercel project configuration change is required for the bounded code fix.

## Changes made

Commit `221f702ff9999f282516907c834c31e465e52460`:

- added request headers to the bounded Vercel request type;
- added trusted request-origin resolution;
- allows the fixed GO IRL share alias and current Vercel deployment/branch/production hosts only;
- rejects non-Vercel environment hosts and arbitrary forwarded hosts;
- falls back to `https://go-irl-1-0.vercel.app`;
- uses the resolved origin for canonical URL, image URL and calendar payloads;
- added targeted host-selection and host-injection regression tests;
- saved pre-change runtime split evidence.

No auth, RLS, SQL, migration, secret, n8n, DNS or production-data change was made.

## Checks

Exact implementation head:

- commit: `221f702ff9999f282516907c834c31e465e52460`;
- GitHub Actions run: `30869138836`;
- job: `91867284000`;
- conclusion: PASS.

Verified steps:

- repository check PASS;
- diff check PASS;
- test PASS;
- typecheck PASS;
- lint PASS;
- build PASS;
- bundle budget PASS.

## Evidence

- `tasks/SHARE003-whatsapp-telegram-parity/evidence/Share003-2026-08-04-canonical-origin-runtime-split.md`
- `tasks/SHARE003-whatsapp-telegram-parity/evidence/Share003-2026-08-04-ci-run-30869138836.md`
- PR comment `5173519904` records the pre-change production routing split.
- Physical screenshots remain user-provided evidence and are not stored unredacted because they contain personal data.

## GitHub

Repository: `vitvolny26-art/Go-IRL-1.1`

## Branch

`fix/share003-whatsapp-telegram-parity-20260803`

## Commit

`221f702ff9999f282516907c834c31e465e52460`

## Pull request

Draft PR #608:
https://github.com/vitvolny26-art/Go-IRL-1.1/pull/608

No merge performed.

## ClickUp

Task: `869e3k1v5`

The connector previously returned a rate-limit window of 1036 minutes. That window has not elapsed, so no unverified retry or write was sent.

## Google Drive

Report mirror:
https://docs.google.com/document/d/1aZWGKb5bzl4mFha4sNcCs29APwTpGgD0oFEfGAQSgwQ/edit

Reports folder:
https://drive.google.com/drive/folders/16y0U40xHhwfXbVOMzq81zwcg6v40-99F

## Blockers

- commit `221f702...` is not deployed;
- current production deployment still runs the prior branch head `04318dc...`;
- exact-head Vercel runtime and WhatsApp provider rendering are unverified;
- iOS and WhatsApp Web/Desktop matrices remain pending;
- merge and any production deployment require separate owner approval.

## Roadmap update

The canonical-origin code defect is fixed and green in CI. The task remains in the physical-provider verification phase.

## Next verified step

Create one exact-head Vercel Preview for `221f702...`, verify it is not production, confirm canonical and image URLs use the same Vercel host, then repeat the Android RU WhatsApp smoke. Keep PR #608 Draft until the provider matrix is complete.
