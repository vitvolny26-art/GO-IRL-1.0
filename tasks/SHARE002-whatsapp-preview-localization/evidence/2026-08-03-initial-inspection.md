# SHARE002 Initial Inspection Evidence

Date: 2026-08-03
Role: AI Fixer
Base commit: `3d5c69f128c34d502c49c3c760394cf1950fb323`

## Files inspected

- `src/cardShare.ts`
- `src/components/CardShareAction.tsx`
- `src/cardShareNavigation.ts`
- `src/cardShare.test.ts`
- `src/store.ts`
- `src/types.ts`
- `api/meta/event-preview.ts`

## Verified observations

1. `CardShareContent` currently carries title, date, address and URL only.
2. `buildMetaEventPreviewUrl` always writes `language=ru`.
3. WhatsApp uses `buildMetaEventPreviewUrl` inside a direct `https://wa.me/?text=...` target.
4. `CardShareAction` already reads the current app `language` but does not include it in share content.
5. The backend event-preview endpoint validates and renders `ru`, `uk`, `cs` and `en`.
6. Existing tests intentionally preserve the rich-preview URL in the WhatsApp message and the RU default.
7. Search of `CardShareContent` found only `src/cardShare.ts`, `src/cardShareNavigation.ts`, `src/components/CardShareAction.tsx` and `src/cardShare.test.ts`.

## Root cause

The language value exists in application state and is supported by the backend, but it is dropped at the frontend share-content boundary. The preview helper therefore uses its hardcoded RU value for every WhatsApp share.

## Smallest valid change

- Add optional `language` to `CardShareContent`.
- Use `content.language ?? "ru"` in the preview URL.
- Include current `language` in the `CardShareAction` content object.
- Add focused default and non-Russian tests.

## Guardrails

No Meta Business/API, secrets, webhooks, auth, RLS, SQL, migrations, production configuration, production data, merge or deployment.
