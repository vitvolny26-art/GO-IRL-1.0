---
title: Agent Report — Meta Privacy Policy
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-14
next_review: 2026-07-21
---

# Agent Report

## Task

Unblock Meta app publication by providing a public GO IRL privacy-policy URL.

## Files inspected

- `AGENTS.md`
- `DOCS_INDEX.md`
- `README.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/privacy.md`
- `docs/reports/README.md`
- `vercel.json`

## Findings

Meta requires a public privacy-policy URL before enabling app publication. The existing Vite fallback returned the main application for `/privacy`; it did not provide a dedicated policy page.

## Changes made

- Added a public, mobile-friendly English privacy policy at `/privacy`.
- Added a specific Vercel rewrite before the SPA catch-all.
- Documented data categories, purposes, processors, retention, security, user rights, and a deletion/contact path.

## Checks

- `pnpm run lint` — PASS
- `pnpm run build` — PASS
- `pnpm run test` — PASS (41 files, 201 tests)
- `pnpm run typecheck` — PASS
- Production URL verification — NOT RUN (requires deployment)

## Risks

The public policy uses the project identity and Telegram support bot as the contact path. A future legal review should add the formal controller identity and dedicated privacy email when they exist.

## Not touched

- Supabase RLS
- Auth
- SQL or migrations
- Runtime secrets or `.env` files
- Meta access tokens

## Next step

Run the quality gates, publish the branch through review, verify `/privacy`, and add the URL to Meta App Settings.
