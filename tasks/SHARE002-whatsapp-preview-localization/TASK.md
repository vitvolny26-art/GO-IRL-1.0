# SHARE002 — Localize WhatsApp event preview

- Task ID: SHARE002
- Title: Localize WhatsApp event preview
- Source: https://app.clickup.com/t/869edacn4
- Owner role: AI Fixer
- Status: In Progress

## Problem

Organic WhatsApp sharing opens a `wa.me` target with an event-specific rich-preview URL, but `src/cardShare.ts` hardcodes `language=ru`. Users on UK/CS/EN therefore receive a Russian preview even when the app uses another supported language.

## Scope

- Pass the current app language into card-share content.
- Build the event-preview URL with RU/UK/CS/EN language.
- Preserve current `wa.me` routing, exact event ID, rich preview, and all other channel behavior.
- Add focused regression tests.
- Save evidence, status and report.

## Out of scope

- WhatsApp Business API or automated delivery.
- Meta Business verification, app review, tokens, webhooks or templates.
- Auth, RLS, SQL, migrations, secrets, production configuration or production data.
- Architecture rewrite, merge or deployment.

## Acceptance criteria

1. WhatsApp target contains a preview URL using the selected RU/UK/CS/EN language.
2. Callers without a language retain the RU fallback.
3. Exact event ID and `wa.me` routing remain unchanged.
4. Tests cover default and non-Russian language behavior.
5. Lint, typecheck, build and test pass on the same exact commit.

## Approval gates

- Explicit owner approval before merge.
- Explicit approval before production deployment/configuration.
- Explicit approval before Meta Business, auth, RLS, SQL, migration, secret or production-data changes.

## Dependencies

- Existing event-preview endpoint language support.
- Existing organic WhatsApp `wa.me` flow.

## Blockers

- Physical-device WhatsApp preview verification remains required after code/CI verification.

## Related files and PRs

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShare.test.ts`
- `api/meta/event-preview.ts`
- Merged PR #564
- Draft PR #577 is historical/conflicting and is not the source of truth.
