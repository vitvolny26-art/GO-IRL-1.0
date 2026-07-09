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
Coach/Role + Chat trust layer
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

## Coach / Role + Chat trust layer

The trust layer places event support close to Activity Chat.

It exists to answer two questions before a user arrives:

```text
Who helps this event happen?
Where can I talk to the group before I come?
```

Sport Coach remains the canonical MVP 1.1 implementation.

Generic non-sport usage is a temporary stabilization bridge until future Event Roles exist. It must not redefine Coach as a universal role.

See `docs/COACH_CHAT_TRUST_LAYER.md`.

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

## Deployment trigger

Last manual production redeploy trigger: weather window polish.
