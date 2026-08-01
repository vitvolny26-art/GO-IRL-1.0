---
title: Remove archived Telegram legacy images
owner: Release Manager
status: Draft
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-15
---

# Remove archived Telegram legacy images

## Task

Remove images/events/telegram-legacy/ after preserving the exact 40-file set in Google Drive.

## Archive evidence

- Drive file ID: 1LOH8AbBhjMscCjHT55G1YcrU4C3s_fSr
- Archive: GO-IRL-telegram-legacy-2026-08-01.tar.gz
- Source SHA: 32bed15f4a9690205d4ce6aef6eaeb8270ff1b63
- Archived files: 40 PNG files
- SHA-256: 1ad6e94c190965e54839c0618f3f36f18d6392c9bc2ffa9d2237590beeb4fefe

## Repository change

- Base SHA: 8c2c7f658c1c33bed00c17328943707c6c492c32
- Removed: images/events/telegram-legacy/
- Preserved: images/events/source/32-dinner-v2.png

## Checks

- pnpm install --frozen-lockfile: PASS
- repo:check: PASS or not configured
- lint: PASS
- typecheck: PASS or not configured
- build: PASS
- test: PASS
- git diff --check: PASS

## Rollback

Restore the deleted directory from Git history or from the verified Google Drive archive.
