---
title: Operations and Release
owner: Release Manager
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# Operations and Release

## Purpose

This Bible chapter defines how GO IRL moves from MVP stabilization to closed beta without overstating readiness.

It summarizes the operational release rules for the Olomouc beta.

Primary sources:

- `README.md`
- `ROADMAP.md`
- `RELEASE_NOTES.md`
- `DEPLOYMENT.md`
- `BETA_CHECKLIST.md`
- `BETA_TESTING.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `docs/DEVELOPMENT_PROTOCOL.md`
- `supabase/README.md`

## Release principle

GO IRL is not beta-ready because a feature exists.

GO IRL is beta-ready only when the latest `main` passes quality gates and manual smoke checks.

Do not claim beta-ready until:

```text
pnpm run lint
pnpm run build
pnpm run test
```

all pass on the latest `main`, and the manual Telegram/Supabase/Vercel smoke checks are complete.

## Current deployment model

The current beta deployment target is Vercel.

Historical Netlify references may remain in old files, but they must not override current deployment truth.

Vercel is responsible for:

- serving the Telegram Mini App frontend;
- hosting static assets;
- handling browser fallback routes such as `/join/:id`;
- providing public environment configuration for the frontend.

Vercel is not responsible for:

- storing event data;
- enforcing Supabase RLS;
- verifying Telegram HMAC directly in the browser;
- hiding secrets in `VITE_*` variables.

## Runtime model

GO IRL has two supported runtime modes.

### Telegram production path

Production identity must come from:

```text
Telegram WebApp initData
-> Supabase Edge Function verifyTelegramInitData
-> verified access token
-> Supabase RLS-aware writes
```

`initDataUnsafe` is not trusted production auth.

Browser fallback identity is not trusted production auth.

Legacy demo user keys are local/demo compatibility only and must not be presented as public production identity.

### Browser demo path

Browser mode without Telegram exists to support development, review, and beta demos.

Browser demo mode must:

- open without Telegram;
- use local demo state;
- use Olomouc demo events;
- keep demo writes local-only;
- show demo-save feedback when changes are stored only locally;
- never touch production Supabase as verified production writes.

## Quality gates

Before any beta claim, run:

```bash
pnpm run lint
pnpm run build
pnpm run test
```

Rules:

- If lint fails, do not commit release claims.
- If build fails, do not deploy as beta-ready.
- If tests fail, do not call the branch stable.
- If a check was not run, report it as not run.
- Do not hide red output.
- Do not say "green" unless the command actually passed.

## Manual smoke checks

Automated checks are necessary but not enough.

Closed beta also needs manual smoke checks.

### Telegram smoke check

Verify on real Telegram clients:

- Mini App opens from the bot/link.
- Telegram theme and viewport are usable.
- Header safe-area does not overlap content.
- Back/Done/close behavior is explicit and user-triggered.
- Share opens the Telegram Mini App deep link.
- `/join/:id` browser fallback opens the target activity.
- No App Store redirect is used as a fallback.

### Core loop smoke check

Verify the main loop:

```text
create event -> share -> participant joins -> event chat -> people can coordinate attendance
```

Minimum flow:

1. Create event in a canonical beta category.
2. Share event through Telegram.
3. Open shared link as another user or test account.
4. Join the event.
5. Confirm participant count/state updates.
6. Open event chat or chat link where available.
7. Confirm the user can understand where and when to meet.

### Supabase smoke check

Supabase checks are production-sensitive.

Do not change RLS, auth, secrets, or destructive SQL during a smoke check.

Verify manually:

- production URL and publishable key are configured;
- Edge Function secrets are present;
- `verifyTelegramInitData` can issue a trusted session;
- public activity visibility works;
- private activity visibility is restricted;
- unrelated users cannot read private event data;
- participants and organizers see only what they should;
- migrations required for the deployed build are applied and verified.

Any RLS or migration change requires a separate approved Supabase release process.

### Vercel smoke check

Verify:

- latest `main` deploys successfully;
- build logs have no TypeScript/build errors;
- deployed app opens on mobile;
- `/join/:id` resolves correctly;
- Open Graph image and title work for shared event links;
- environment variables are present but no secrets are exposed as frontend-only `VITE_*` variables;
- Vercel build-rate-limit failures are treated as operational issues, not automatic code failures.

## Beta category gate

Closed beta exposes only six canonical user-facing categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

Extra taxonomy may exist in data files for experiments, old records, or future planning, but must not silently expand the closed beta create flow.

Any promotion of a new category requires:

- Product Lead decision;
- Archivist review;
- ROADMAP/BACKLOG alignment;
- DOCS_INDEX or Knowledge Debt update where relevant;
- explicit testing of create/share/join/chat behavior.

## Release blockers

Blocking before closed beta:

- failed lint/build/test on latest `main`;
- broken create/share/join/chat loop;
- production writes from browser demo mode;
- broken Telegram `initData` production path;
- private event data visible to unrelated users;
- unclear event time/location/card state;
- broken Telegram share link;
- missing manual smoke checks;
- release notes claiming readiness without verification.

Not automatic blockers, but must be recorded:

- Vercel temporary build-rate-limit;
- incomplete future docs;
- known future feature gaps;
- experimental taxonomy hidden from beta UI;
- historical Netlify references in deprecated docs.

## Documentation release discipline

Every release-affecting change must keep these aligned:

- `README.md` for implemented scope;
- `ROADMAP.md` for direction and beta gates;
- `RELEASE_NOTES.md` for release state;
- `BETA_CHECKLIST.md` and `BETA_TESTING.md` for manual verification;
- `DOCS_INDEX.md` for source-of-truth status;
- `docs/audit/KNOWLEDGE_DEBT.md` for unresolved conflicts.

Do not use release notes as marketing copy until release gates are verified.

Release notes may say:

```text
pending
verified
shipped
blocked
```

They must not imply production readiness when checks are pending.

## Incident and rollback rules

If beta breaks:

1. Stop new scope.
2. Identify the last known good commit or deployment.
3. Capture the failure in a short incident note.
4. Reproduce with minimal steps.
5. Fix one blocker at a time.
6. Run lint/build/test.
7. Update release notes or Knowledge Debt if the failure changes project truth.

Do not force push.

Do not hide incidents in chat only.

Do not rewrite architecture as a first response to a beta incident.

## Commit and push rules

For code patches:

1. Keep the patch focused.
2. Inspect where the file is used.
3. Run quality gates.
4. Commit only if green.
5. Push without force.

For docs-only GitHub edits:

- quality gates may be skipped;
- final report must clearly say they were not run;
- `DOCS_INDEX.md` must be updated when status/structure changes;
- Knowledge Debt must be updated when debt opens, changes, or closes.

## Definition of done for closed beta readiness

Closed beta can be called ready only when:

- latest `main` passes `pnpm run lint`;
- latest `main` passes `pnpm run build`;
- latest `main` passes `pnpm run test`;
- Telegram smoke check passes;
- Supabase smoke check passes;
- Vercel deployment check passes or any Vercel operational issue is explicitly documented;
- create/share/join/chat loop passes with at least two users/test identities;
- Browser Demo Mode is confirmed local-only;
- release notes reflect the real status;
- no blocker remains in Knowledge Debt or release checklist.

Until then, the correct status is:

```text
beta stabilization in progress
```

not:

```text
beta ready
```
