---
title: Share preference stays on Ask every time
owner: Release Engineer
status: Review
source_of_truth: false
last_review: 2026-08-02
next_review: 2026-08-09
---

# Share preference stays on Ask every time

## Task

Keep the share preference on “Ask every time” after a user chooses a service from the event-card share menu, then release the fix to GitHub main and the VPS.

## Files inspected

- `src/components/CardShareAction.tsx`
- `src/components/ProfilePreferences.tsx`
- `src/userPreferences.ts`

## Findings

The event-card share menu treated each service click as a request to save that service as the default. This overwrote the explicit “Ask every time” preference and made later share clicks jump directly to the previously used service.

## Changes made

- Removed preference writes from one-time service selections in the event-card share menu.
- Preserved direct sharing when a default service was explicitly selected in Profile Preferences.
- Kept “Ask every time” stable across repeated shares.

## Checks

- Exact-head GitHub Actions CI is required before merge.
- Production deployment is blocked until CI is green.
- VPS deployment evidence will be recorded on the pull request.

## Risks

Low. The change only removes an unintended preference mutation; share target behavior is unchanged.

## Not touched

- Authentication and authorization
- Database, RLS, migrations, and production data
- Share card content and provider URLs
- Local worktree

## Next step

Open the pull request, require green exact-head CI, merge to `main`, deploy once through the governed VPS workflow, and verify the public endpoint.
