---
title: Admin Gate A Release Readiness
owner: Release Manager
status: Partial
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-02
---

# GO IRL 1.1 — Admin Gate A release-readiness report

## Task

Reconcile the merged ADMIN005-009 implementation, historical pull requests, production topology, and the prerequisites for ADMIN010 without changing production.

## Repository and targets

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base: GitHub `main`
- Base SHA: `563b47a4b639636d5f1f6420e66d1cb6df0d1388`
- Task branch: `agent/gate-a-admin-release-readiness-20260801`
- Merge target: GitHub `main`
- Deploy target: `none`

## GitHub reconciliation

- PR #499 was closed on 2026-08-01 as superseded by merged PR #501.
- PR #500 was closed on 2026-08-01 as superseded by merged PR #501.
- historical Draft PR #444 was closed on 2026-08-01 as superseded by the implemented ADMIN006-009 line.
- PR #501 merged the Admin006 SQL keyword hotfix.
- PR #502 merged ADMIN007 bottom navigation.
- PR #507 merged ADMIN008 read-only integration status.
- PR #509 merged ADMIN009 read-only update status.
- PR #510 merged lazy loading for the admin route and is current `main`.

No PR was merged by this task.

## Documentation reconciliation

`docs/Admin.md` incorrectly stated that no admin runtime UI or API existed. It is updated to describe the implemented ADMIN005-009 boundaries, production backend evidence, split runtime topology, Gate A blockers, and the bounded ADMIN010 follow-up.

## Production metadata evidence

### Supabase

- project: `tygfsvjkznypilfyyvdc`;
- project status: `ACTIVE_HEALTHY`;
- Postgres: `17.6.1.127`;
- ADMIN005 migration: `20260731233917 admin005_role_invitations`;
- ADMIN006 migration: `20260801003640 admin006_role_management`;
- `verifyTelegramInitData`: version 17, `ACTIVE`, SHA-256 `fe2eaf78a4aeec72588c477aa55377ec5738ceb7803a3d73dd66166ca8f27762`;
- `telegramEventSupergroup`: version 8, `ACTIVE`.

### Vercel

- project: `go-irl-1-1` (`prj_MtabJvddKyFSr98iC18Ztf7rlZjF`);
- latest production deployment: `dpl_BntrDPTtWvNv6sJgZpDXWRppPAnp`;
- state: `READY`;
- deployed SHA: `e43be4ece9a5908984add70dc9dfd99cc501b2a3`;
- source: `main`, ADMIN009 PR #509;
- function inventory metadata: 11 Node.js functions.

### Public runtime topology

Direct HTTP comparison on 2026-08-01:

- `https://goirl.realitka.pp.ua`: HTTP 200, `Server: Caddy`, no `x-vercel-id`;
- `https://go-irl-1-1.vercel.app`: HTTP 200, `Server: Vercel`, `x-vercel-id` present;
- response bodies are different;
- GitHub `main` is newer than the latest READY Vercel deployment;
- the public Caddy build exposes no verified Git SHA.

The requested `Telegram -> Vercel` topology is therefore not established. Current evidence supports a public Caddy/VPS runtime and a separate Vercel production runtime with drift.

## Gate A smoke matrix

| Check | State | Evidence or blocker |
| --- | --- | --- |
| Organizer invitation | BLOCKED | Needs disposable Telegram user and production role/audit writes |
| Professional invitation | BLOCKED | Needs disposable Telegram user and production role/audit writes |
| Invitation replay | BLOCKED | Needs an actually redeemed disposable invitation |
| Role conflict | BLOCKED | Needs controlled production role state |
| Demotion | BLOCKED | Mutates production `user_roles` and writes audit data |
| `audit_log` verification | BLOCKED | Depends on authorized smoke mutations and a bounded evidence query |

Repository and automated tests are useful regression evidence but do not replace these physical production smokes.

## Safety and change ledger

- Production configuration: not changed.
- Secrets/auth settings: not changed.
- SQL, migrations, RLS: not changed.
- Supabase data: not changed.
- Vercel/VPS deployment: not performed.
- Destructive operations: not performed.

## Result

Status: **Partial**.

Repository/PR hygiene and documentation reconciliation are complete. Gate A is not complete because the disposable-account smoke matrix and audit evidence are absent. ADMIN010 must not start yet.

## Exact next safe step

Obtain separate explicit approval for bounded production-data smoke, identify disposable Telegram accounts for organizer and professional flows, execute the six-case matrix, and verify only non-sensitive audit metadata. After Gate A is green, open a separate ADMIN010 task for a protected read-only audit-log view.
