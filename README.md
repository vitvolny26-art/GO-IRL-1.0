# GO IRL 1.0

This repository is a clean stabilized GO IRL 1.0 app copy with synchronized MVP 1.1 documentation.

Primary source repository:

```text
vitvolny26-art/GO-IRL
```

## Purpose

Use this repository as a safer clean-copy workspace for the stabilized GO IRL MVP.

This is **not** a documentation-only repository.

It can contain:

- React / TypeScript / Vite app source;
- pnpm project files;
- Vercel configuration;
- synchronized documentation;
- beta readiness docs.

It must not contain:

- `.env` files;
- secrets;
- Supabase service keys;
- destructive SQL experiments;
- `node_modules`;
- `dist`;
- backup files.

## Stack

```text
React
TypeScript
Vite
pnpm
Supabase
Telegram Mini Apps
Vercel
```

## Product focus

GO IRL is a Telegram Mini App for local real-life events.

Current MVP 1.1 focus:

```text
Olomouc beta
Telegram Mini App
Create event
Share event
Join event
Event chat
People meet in real life
Sport-first Coach stabilization
Weather and share/join polish
Browser demo mode without production writes
```

Core loop:

```text
create event -> share -> participants join -> event chat -> people show up in real life
```

Slogan:

```text
Less scrolling. More living.
```

## Local commands

Use pnpm only:

```powershell
pnpm install
pnpm run lint
pnpm run build
pnpm run test
```

Do not claim beta-ready until these pass on the latest commit.

## Current source-of-truth files

| Area | File |
|---|---|
| Documentation registry | `DOCS_INDEX.md` |
| MVP conflict audit | `docs/MVP_DOC_AUDIT.md` |
| Missing sections / boundary registry | `docs/MISSING_SECTIONS.md` |
| Deployment and release gate | `DEPLOYMENT.md` |
| Beta testing | `BETA_TESTING.md` |
| Manual beta checklist | `BETA_CHECKLIST.md` |
| Roadmap | `ROADMAP.md` |
| Backlog | `BACKLOG.md` |
| Changelog | `CHANGELOG.md` |
| Release notes | `RELEASE_NOTES.md` |
| MVP stabilization | `docs/MVP_STABILIZATION_PLAN.md` |
| Event/chat lifecycle | `docs/EventLifecycle.md` |
| Sport Coach MVP | `docs/SPORT_COACH_MVP.md` |
| Market positioning | `docs/MARKET_POSITIONING.md` |
| Competitor watch | `docs/COMPETITOR_WATCH.md` |

## Hard boundaries

Do not generate current MVP code from historical docs.

Deprecated/historical snapshot files from the source repo:

```text
SETUP.md
SETUP_RU.md
SPRINT0_STATUS.md
CHECKLIST.md
PATCH_REPORT.md
GO_IRL_DOCUMENTATION.md
```

These documents are preserved only as history in the source repo and must not define current implementation behavior.

## Current operational note

Vercel may show failure when the target URL contains:

```text
upgradeToPro=build-rate-limit
```

Treat that as a Vercel quota issue, not an app or documentation regression.

## Release rule

Before any release/beta claim, verify in this repo or the primary source repo:

```powershell
pnpm run lint
pnpm run build
pnpm run test
```

Then run Telegram, Vercel, and Supabase smoke checks from `BETA_CHECKLIST.md`.
