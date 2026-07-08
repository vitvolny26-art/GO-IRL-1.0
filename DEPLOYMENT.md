# Deployment

Status: **current Vercel-first deployment checklist / needs live verification before public release**.

This checklist is for releasing the GO IRL Telegram Mini App to production.

Current primary hosting target: **Vercel**.

Netlify references are historical/secondary only. Do not configure BotFather or release notes from Netlify-era snapshots unless Vercel is explicitly replaced by a new product decision.

## 1. Build Locally

```powershell
pnpm install
pnpm run test
pnpm run lint
pnpm run build
```

Do not deploy if any command fails.

Local gates are required even when Vercel is temporarily blocked by quota or build-rate limits.

## 2. Supabase

1. Open the production Supabase project.
2. Apply only approved migrations for the current release scope.
3. Confirm `activities` and `activity_members` exist.
4. Confirm realtime is enabled for both tables.
5. Confirm RLS is enabled for both tables.
6. Confirm trusted-auth migration status before public release.

Required frontend environment variables:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_TELEGRAM_BOT_USERNAME=GOirl_bot
VITE_GO_IRL_LEGACY_DEMO_AUTH=false
```

Use only the publishable/anon key in frontend hosting. Never put a service role key in Vercel, Netlify, or client code.

## 3. Vercel production deployment

1. Import the GitHub repository `vitvolny26-art/GO-IRL`.
2. Framework preset: `Vite`.
3. Build command: `pnpm run build`.
4. Install command: `pnpm install --frozen-lockfile`.
5. Output directory: `dist`.
6. Add environment variables:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
VITE_TELEGRAM_BOT_USERNAME=GOirl_bot
VITE_GO_IRL_LEGACY_DEMO_AUTH=false
```

The repository includes `vercel.json`, so Vercel should pick up the SPA fallback settings automatically.

After the GitHub connection is active, every push to `main` should trigger a production deploy automatically.

### Vercel status interpretation

| Vercel status | Meaning | Action |
|---|---|---|
| `success` | Deployment/build passed. | Continue release smoke tests. |
| `pending` | Deployment/build is still running. | Wait and re-check. |
| `failure` with app/build logs | Possible app/build regression. | Inspect first red build error before changing code. |
| `failure` with `upgradeToPro=build-rate-limit` | Vercel quota/build-rate limit. | Treat as operational quota issue, not app regression. Do not change code for this. |

If Vercel is blocked by build-rate limit, keep local `pnpm run lint`, `pnpm run build`, and `pnpm run test` as the temporary quality gate until Vercel builds are available again.

## 3a. Historical / Secondary Netlify Notes

Netlify was used earlier in the project and can remain as a fallback only if explicitly selected again.

Historical Netlify settings:

```text
Build command: pnpm run build
Publish directory: dist
Node: 24
pnpm: 11.7.0
```

Do not configure BotFather to a stale Netlify URL if the current production Mini App runs on Vercel.

Do not use `SPRINT0_STATUS.md` as deployment truth. It contains historical Netlify-era verification.

## 4. Telegram BotFather

1. Open `@BotFather`.
2. Select the GO IRL bot.
3. Configure the Mini App web app URL to the current production Vercel URL.
4. Configure the menu button title.
5. Restart the Mini App in Telegram after changing the URL.
6. Validate Telegram `startapp` share links through `@GOirl_bot`.

## 5. Smoke Test

Use at least two Telegram accounts.

1. Account A creates a public activity.
2. Account B sees the activity without refreshing too long.
3. Account B joins the public activity.
4. Account A creates a private activity.
5. Account B does not see the private activity from the main list.
6. Account A shares the private activity link.
7. Account B opens the shared link and sends a join request.
8. Account A approves or rejects the request.
9. Account A edits an activity and Account B sees the update.
10. Confirm `/join/:id` opens the target activity in browser fallback.
11. Confirm Telegram Mini App `startapp` opens the target activity.
12. Confirm explicit Done / Back to Telegram behavior on real Telegram clients.
13. Confirm Browser Demo Mode does not write to production Supabase.
14. Confirm Weather Widget failure does not block event details.
15. Confirm Bug Report opens support/feedback flow and does not copy share text.

## 6. Trusted Auth Release Gate

Trusted Telegram auth is the shipped production path, but public release still requires live verification.

Do not launch publicly until all are true:

- `verifyTelegramInitData` Edge Function is deployed;
- required Edge Function secrets are configured;
- `supabase/migration_v4_trusted_telegram_auth.sql` is applied;
- `supabase/verify_trusted_auth.sql` passes;
- create/join/edit/delete smoke tests pass with real Telegram accounts;
- production no longer relies on forged `x-go-irl-user-key` identity.

## 7. Release Notes

Update `RELEASE_NOTES.md` before announcing the release.

Release notes must match:

- `README.md` for current code scope;
- `DOCS_INDEX.md` for source-of-truth status;
- this file for deployment target and release gate wording.
