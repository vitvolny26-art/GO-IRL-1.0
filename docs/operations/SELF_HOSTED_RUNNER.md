---
title: GO IRL Self-Hosted Runner Operations
owner: Tech Lead
status: Active
source_of_truth: false
last_review: 2026-07-17
next_review: 2026-07-24
---

# GO IRL Self-Hosted Runner Operations

## Purpose

Run repository verification on the dedicated GO IRL server without using Termius for every check.

```text
ChatGPT -> GitHub -> GitHub Actions -> self-hosted runner -> pnpm checks
```

GitHub remains the source of truth. The runner executes checks only; it does not become a code or documentation authority.

## Installed runner

```text
Repository: vitvolny26-art/GO-IRL-1.0
Runner name: dedirock-goirl-1
Runner group: Default
Labels: self-hosted, Linux, X64, goirl
Install directory: /opt/actions-runner
Work directory: /opt/actions-runner/_work
Service user: goirl-runner
Service: actions.runner.vitvolny26-art-GO-IRL-1.0.dedirock-goirl-1.service
```

The runner must not run as `root`.

## Verification workflow

```text
Workflow file: .github/workflows/self-hosted-verify.yml
Workflow name: Self-hosted verification
Trigger: workflow_dispatch only
Checked branch: main
Permissions: contents: read
```

The workflow runs:

```text
pnpm install --frozen-lockfile
pnpm run test
pnpm run typecheck
pnpm run lint
pnpm run build
```

It must not deploy, push, merge, accept arbitrary shell input, or access `.env`, secrets, auth, RLS, migrations, or destructive SQL.

## Run from GitHub

Open:

```text
GitHub -> Actions -> Self-hosted verification -> Run workflow -> main
```

A successful run must show green results for install, test, typecheck, lint, and build.

## Service checks

Run as `root` only for service administration:

```bash
cd /opt/actions-runner
./svc.sh status
./svc.sh start
./svc.sh stop
```

Normal state:

```text
Active: active (running)
GitHub runner status: Idle
```

During a job, GitHub may show the runner as Active.

## Known setup failures

### Invalid work folder

Symptom:

```text
/usr/bin/bash: /opt/actions-runner/Runner: No such file or directory
```

Cause: setup output was accidentally entered as the work-folder value.

Required value in `/opt/actions-runner/.runner`:

```json
"workFolder": "_work"
```

After correction, restart the service.

### Font cache permission failure

Symptom:

```text
EACCES: permission denied, open '/tmp/go-irl-fontconfig/fonts.conf'
```

Repair as `root`:

```bash
rm -rf /tmp/go-irl-fontconfig
install -d -m 0775 -o goirl-runner -g goirl-runner /tmp/go-irl-fontconfig
```

Then rerun the failed GitHub Actions job.

### Node.js 20 action warning

The warning emitted by `pnpm/action-setup@v4` is non-blocking while GitHub forces the action runtime to Node.js 24. Do not set `ACTIONS_ALLOW_USE_UNSECURE_NODE_VERSION` merely to hide the warning. Upgrade the action when a supported release is available.

## Security boundaries

- Keep the runner repository-scoped.
- Keep `GITHUB_TOKEN` permissions read-only for verification.
- Do not install or run it as `root`.
- Do not expose registration tokens in chat, logs, screenshots, or documentation.
- Registration tokens are temporary and must be regenerated if exposed.
- Do not add deployment or arbitrary command inputs without explicit approval.
- Do not give the runner access to production secrets unless a separately reviewed workflow requires them.

## Verified baseline

First complete successful run:

```text
Workflow run: 29549050132
Result: success
Install dependencies: PASS
Test: PASS
Typecheck: PASS
Lint: PASS
Build: PASS
```
