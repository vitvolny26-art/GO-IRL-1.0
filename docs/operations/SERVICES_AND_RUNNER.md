---
title: GO IRL Services and Runner Registry
owner: Technical Archivist
status: Active
source_of_truth: true
last_review: 2026-07-17
next_review: 2026-07-24
---

# GO IRL Services and Runner Registry

## Verified self-hosted runner

The GO IRL self-hosted GitHub Actions runner is fully configured and verified.

Verification evidence:

- GitHub Actions workflow run: `29549050132`
- Install dependencies: `PASS`
- Test: `PASS`
- Typecheck: `PASS`
- Lint: `PASS`
- Build: `PASS`

Routine GO IRL quality gates can run directly through GitHub Actions. Termius is not required for normal lint, build, test, or typecheck execution.

## Active services

| Service | Purpose | Authority |
|---|---|---|
| GitHub | Canonical repository, pull requests, issues, durable documentation | Source of truth |
| GitHub Actions | CI and quality gates | Runtime verification evidence |
| Self-hosted GitHub Actions runner | Executes install, test, typecheck, lint, and build | Execution infrastructure only |
| Vercel | Web and Telegram Mini App deployment | Deployment runtime |
| Supabase | Database, storage, and approved backend services | Runtime data source; sensitive changes require approval |
| Telegram Mini Apps | Primary product surface | Product runtime |
| Telegram Bot | Commands, entry point, and automation notifications | Delivery channel only |
| Self-hosted n8n | Workflow orchestration and AI Archivist automation | Not an authority |
| n8n Cloud | Previous automation environment during migration | Legacy operational reference |
| OpenRouter | Model gateway used by Archivist workflows | AI execution provider only |
| Google Drive | Export mirror and AI report lifecycle | Not source of truth |
| Google Docs | Editable reports and roadmap workspace | Review workspace only |
| ClickUp | Operational tasks and review state | Not source of truth |
| NotebookLM | Search and Q&A over exported project files | Passive reference only |
| Gemini | Assistant Archivist and report generation | Report-only role |
| ChatGPT | Final review, patch planning, GitHub operations, agent coordination | Disposable workspace; durable output belongs in GitHub |
| Termius | Emergency VPS administration and one-time setup | Manual administration only |

## Self-hosted n8n state

- Instance: `https://n8n.realitka.pp.ua`
- Workflow: `GO IRL AI Archivist`
- Workflow ID: `ot1NwNlcqD0vOHrn`
- Timezone: `Europe/Prague`
- Revision schedule: `01:00`
- Approved synchronization schedule: `13:00`
- OpenRouter is connected.
- Data Table schemas are recreated.
- Telegram, GitHub, Google Drive, Google Docs, ClickUp, and SSH credentials still require server-side authorization.
- Workflow remains inactive until credentials and a successful revision execution are verified.

## Operating rules

- GitHub remains the source of truth.
- GitHub Actions is the default path for quality gates.
- n8n performs orchestration only.
- Drive, Docs, ClickUp, NotebookLM, and Gemini are supporting services, not authorities.
- No service may auto-merge, auto-push code, edit auth/RLS/secrets, apply destructive SQL, or modify migrations without explicit approval.