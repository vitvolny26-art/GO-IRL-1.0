# GO IRL 1.0 clean rebuild from audit

## Goal

Create a new local folder named `GO IRL 1.0` from the current repository without rewriting the working MVP architecture.

This is not a destructive cleanup. The current repository remains unchanged. The script copies a safe allowlist into a new folder and validates it with pnpm.

## Source

- Repository: `vitvolny26-art/GO-IRL`
- Base branch: `main`
- Rebuild branch: `go-irl-1.0-rebuild`
- Script: `scripts/rebuild-go-irl-1-0.cjs`
- PowerShell wrapper: `scripts/rebuild-go-irl-1-0.ps1`

## Copied into GO IRL 1.0

Directories:

- `.github/`
- `docs/`
- `project-audit/`
- `public/`
- `scripts/`
- `src/`
- `supabase/`, except `supabase/.temp`

Root files:

- `.env.example`
- `.gitignore`
- `.npmignore`
- `.vercelignore`
- `CHANGELOG.md`
- `README.md`
- `RELEASE_NOTES.md`
- `ROADMAP.md`
- `eslint.config.js`
- `index.html`
- `package.json`
- `pnpm-lock.yaml`
- `tsconfig.app.json`
- `tsconfig.json`
- `tsconfig.node.json`
- `vercel.json`
- `vite.config.ts`

## Not copied

- `.env`, `.env.local`, environment secrets
- `node_modules/`
- `dist/`
- npm/yarn lock files
- `supabase/.temp/`
- `snapshot.txt`
- `deepseek_powershell_20260705_284627.ps1`
- `ui-cleanup-v2-report.txt`
- `.replit`
- stale/review root docs: `CHECKLIST.md`, `GO_IRL_DOCUMENTATION.md`, `PATCH_REPORT.md`, `SETUP.md`, `SETUP_RU.md`

## PowerShell usage

From the repository root:

```powershell
.\scripts\rebuild-go-irl-1-0.ps1
```

Replace an existing target folder:

```powershell
.\scripts\rebuild-go-irl-1-0.ps1 -Force
```

Custom target:

```powershell
.\scripts\rebuild-go-irl-1-0.ps1 -Target "C:\Users\lenovo\Documents\GO IRL 1.0" -Force
```

Skip install and validation:

```powershell
.\scripts\rebuild-go-irl-1-0.ps1 -SkipInstall -SkipValidation
```

## Validation commands

The script runs these commands unless skipped:

```powershell
pnpm install --frozen-lockfile
pnpm run lint
pnpm run build
pnpm run test
```

Manual final check:

```powershell
git status --short
```

## Do not touch without manual confirmation

- `.env*` secrets
- `src/supabase.ts`
- `src/authSession.ts`
- `supabase/functions/verifyTelegramInitData`
- `supabase/migrations/*`
- RLS/Auth/destructive SQL
- current runtime architecture in `src/`

## First patch after rebuild

Recommended first functional patch remains Task 3 Browser Mock Mode. It has existing scaffolding and can be finished without touching Supabase schema, secrets, RLS, or auth internals.
