---
title: Agent Report — Beauty Telegram Share Fix
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-08-03
next_review: 2026-08-10
---

# Agent Report

## Task

Fix Telegram sharing for Beauty professional cards so the public Beauty URL is not concatenated with the card text.

## Files inspected

- `src/components/CardShareAction.tsx`
- `src/cardShare.ts`
- `src/cardShareNavigation.ts`
- `src/openExternal.ts`
- `src/services/ServiceActivityCard.tsx`
- `src/services/servicesProfessionalDirectory.ts`
- `src/beauty/beautyWorkspaceRepository.ts`

## Findings

The shared Telegram action used the correct `t.me/share/url` endpoint, but the sharing boundary trusted the incoming card URL unchanged. A malformed Beauty public link containing appended card text therefore remained inside the Telegram `url` parameter.

## Changes made

- normalize the card URL before building provider targets;
- remove an accidentally appended `GO IRL:` card-text suffix;
- construct Telegram sharing with `URL` and `URLSearchParams` so `url` and `text` remain separate;
- add a canonical Beauty public-link helper;
- add focused regression tests using the reported Beauty URL and card text.

## Checks

- Exact-head GitHub Actions: pending.
- Local checks: unavailable because the execution environment could not resolve GitHub for repository cloning.
- Merge: not performed.
- Deployment: not performed.

## Not touched

- auth, RLS, SQL, migrations, secrets, `.env`, production data;
- Beauty booking behavior;
- other provider integrations beyond shared URL normalization.

## Next step

Open a pull request, wait for exact-head CI, and merge or deploy only after separate explicit approval.
