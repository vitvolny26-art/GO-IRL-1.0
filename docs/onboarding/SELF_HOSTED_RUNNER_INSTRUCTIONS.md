---
title: Self-Hosted Runner Instructions
owner: Project Archivist
status: Active
source_of_truth: false
last_review: 2026-07-20
next_review: 2026-08-20
---

# Self-Hosted Runner Instructions

Use this when GO IRL checks should run without asking the user to open Termius.

## Available runner

```text
Name: dedirock-goirl-1
Labels: self-hosted, Linux, X64, goirl
Workflow: Self-hosted verification
File: .github/workflows/self-hosted-verify.yml
Trigger: manual workflow_dispatch
Branch checked: main
```

## Agent procedure

1. Confirm the requested task is verification only.
2. Use the existing GitHub workflow; do not invent an SSH or Termius connection.
3. Trigger or rerun the self-hosted verification workflow only when GitHub tooling permits it.
4. The workflow run may appear with delay; recheck the same commit SHA before concluding the runner is unavailable.
5. Read the failed step and request only the first red block when user input is required.
6. Treat third-party action runtime deprecation messages as warnings unless the affected step fails.
7. Declare green only after install, test, typecheck, lint, and build all pass for the relevant commit.

## Safety

The verification runner is read-only at repository-token level and must remain verification-only.

Do not use it for:

- arbitrary user-provided shell commands;
- deployment;
- automatic push or merge;
- `.env` or secret access;
- auth or Supabase RLS changes;
- migrations or destructive SQL;
- architecture rewrites.

Do not expose runner registration tokens. A token shown in chat or logs must be discarded and regenerated.

## Failure classification

```text
/opt/actions-runner/Runner: No such file or directory
```

The configured work folder is invalid. Expected: `_work`.

```text
EACCES: permission denied, open '/tmp/go-irl-fontconfig/fonts.conf'
```

The temporary font-cache directory has wrong ownership. It must be writable by `goirl-runner`.

```text
Runner is offline
```

Ask the user to check the systemd service under `/opt/actions-runner` as root. Do not ask for SSH credentials.

## Historical baseline

Workflow run `29549050132` previously completed with install, test, typecheck, lint, and build passing. Treat it as setup evidence only. Current work still requires verification against the current commit SHA.

Full operational details are in `docs/operations/SELF_HOSTED_RUNNER.md`.
