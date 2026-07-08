# GO IRL 1.0 Documentation Mirror

This repository is a documentation-only mirror for the stabilized GO IRL MVP 1.1 knowledge base.

Source code remains in:

```text
vitvolny26-art/GO-IRL
```

## Purpose

Use this repository to keep the cleaned and synchronized documentation separate from the application code.

This repo must not contain:

- app source code;
- `.env` files;
- secrets;
- Supabase service keys;
- destructive SQL;
- generated build artifacts;
- `node_modules`;
- `dist`.

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

## Current source-of-truth files

| Area | File |
|---|---|
| Documentation registry | `DOCS_INDEX.md` |
| MVP conflict audit | `docs/MVP_DOC_AUDIT.md` |
| Missing sections / boundary registry | `docs/MISSING_SECTIONS.md` |
| Deployment and release gate | `DEPLOYMENT.md` |
| Beta testing | `BETA_TESTING.md` |
| MVP stabilization | `docs/MVP_STABILIZATION_PLAN.md` |
| Event/chat lifecycle | `docs/EventLifecycle.md` |
| Sport Coach MVP | `docs/SPORT_COACH_MVP.md` |

## Hard boundaries

Do not generate code from historical docs.

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

Do not claim beta-ready until local quality gates pass in the source repo:

```text
pnpm run lint
pnpm run build
pnpm run test
```
