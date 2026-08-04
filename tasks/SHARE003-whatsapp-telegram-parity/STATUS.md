# Share003- Status

- Last verified: 2026-08-04
- Task ID: `SHARE003`
- Required display/name prefix: `Share003-`
- Status: In Progress — canonical-origin fix is green in CI; exact-head Vercel runtime and WhatsApp provider verification remain pending
- Owner role: AI Fixer
- Active branch: `fix/share003-whatsapp-telegram-parity-20260803`
- Pull request: Draft PR #608 — https://github.com/vitvolny26-art/Go-IRL-1.1/pull/608
- PR state: open, Draft, mergeable, unmerged
- Verified base `main`: `a904248693da99895d9298260c0e9b746cac7eac`
- Current implementation commit: `221f702ff9999f282516907c834c31e465e52460`
- Organic route: `GO IRL share action -> wa.me -> public event-preview URL -> WhatsApp-generated preview`
- WhatsApp Business/Cloud API: out of scope under WABA001
- n8n dependency conclusion: `Result A — n8n is not a Share003 runtime dependency`

## Verified provider/runtime findings

- Android RU event-preview smoke before the canonical-origin fix: FAIL — message text and event URL were present, but no event image/card rendered.
- A separate generic GO IRL page rendered a WhatsApp preview on the same Android device, proving that the device/network preview path was operational.
- `go-irl-1-0.vercel.app/api/meta/event-preview` returned `200 text/html` with correct event title, date/time and address.
- The generated Open Graph image/canonical URLs pointed to `goirl.realitka.pp.ua`.
- The custom hostname was served by Caddy and returned generic GO IRL HTML for the invitation-card path.
- The equivalent invitation-card endpoint on `go-irl-1-0.vercel.app` returned `200 image/jpeg` with `Content-Length: 82935`.
- Root cause: the event-preview handler prioritized `VERCEL_PROJECT_PRODUCTION_URL` and ignored the trusted Vercel request host.

## Change

Commit `221f702ff9999f282516907c834c31e465e52460`:

- resolves canonical/image/calendar origin from the fixed public share alias or current trusted Vercel hosts;
- rejects arbitrary forwarded hosts;
- ignores non-Vercel environment hosts for generated Open Graph URLs;
- falls back to `https://go-irl-1-0.vercel.app`;
- preserves trusted event lookup, RU/UK/CS/EN, short event-based image URL, calendar actions, cache policy and direct `wa.me`;
- adds targeted host-selection and host-injection tests.

## Checks

- GitHub Actions run: `30869138836`
- Job: `91867284000`
- Repository check: PASS
- Diff check: PASS
- Test: PASS
- Typecheck: PASS
- Lint: PASS
- Build: PASS
- Bundle budget: PASS

## Evidence and reports

- Runtime split evidence: `tasks/SHARE003-whatsapp-telegram-parity/evidence/Share003-2026-08-04-canonical-origin-runtime-split.md`
- CI evidence: `tasks/SHARE003-whatsapp-telegram-parity/evidence/Share003-2026-08-04-ci-run-30869138836.md`
- Agent report: `tasks/SHARE003-whatsapp-telegram-parity/reports/2026-08-04-ai-fixer-canonical-origin-fix.md`
- Drive report mirror: https://docs.google.com/document/d/1aZWGKb5bzl4mFha4sNcCs29APwTpGgD0oFEfGAQSgwQ/edit
- Drive Reports folder: https://drive.google.com/drive/folders/16y0U40xHhwfXbVOMzq81zwcg6v40-99F
- ClickUp task: `869e3k1v5`; prior connector rate-limit window has not elapsed, so no unverified retry/write was sent

## Deployment and safety state

- Current implementation head `221f702...` is not deployed.
- Current verified production deployment still runs prior branch head `04318dc3083f8947a30e2e5f4e5373588746e4d7`.
- No new deployment, DNS/configuration change, auth/RLS/SQL/migration/secret/production-data change, merge or force push was performed in this step.

## Active blockers

- no exact-head Vercel Preview/runtime evidence;
- Android RU must be repeated after exact-head deployment;
- Android UK/CS/EN, iOS RU/UK/CS/EN and WhatsApp Web/Desktop RU/UK/CS/EN remain pending;
- provider cache, app switching, event CTA and calendar CTA require physical verification;
- ClickUp synchronization remains blocked by the previously returned rate limit;
- production deployment and merge require separate owner approval.

## Next action

Create one exact-head Vercel Preview for `221f702...`, verify that it is not production, confirm `og:url` and `og:image` use the same working Vercel host, then repeat Android RU WhatsApp smoke. Keep PR #608 Draft.
