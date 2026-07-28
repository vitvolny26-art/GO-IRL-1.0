# AI Fixer Report — Shared External Link Opening

Date: 2026-07-28
Role: AI Fixer
Status: Partial / Draft PR

## Task
Implement a bounded first phase of external-link deduplication without broad refactoring, merge, deployment, production configuration, auth, SQL, RLS, migrations or production-data changes.

## Active instructions inspected
- Google Drive: 00 — AI Instructions Index.
- Google Drive: AI Fixer Operating Contract.
- Google Drive: Task Module — Bug Fix.
- GitHub main at base commit `f3a8410c94242ff640fcee7f98ce1e2a57073e90`.
- Current open PR context.
- ClickUp task search for external-link refactor/code deduplication.

## Defect / expected behavior
External navigation behavior was duplicated across bug reporting and card-share navigation. The bounded expectation is one Telegram-aware opener that preserves existing behavior and browser security flags while avoiding unrelated changes.

## Evidence and root cause
Repository inspection found repeated combinations of `openTelegramLink`, `openLink` and `window.open(..., "_blank", "noopener,noreferrer")`. The root cause is local ownership of external-navigation fallback logic in multiple modules.

## Usage audit
Repository-wide searches inspected usages of:
- `window.open(`;
- `openLink(`;
- `openTelegramLink(`.

In-scope files changed:
- `src/openExternal.ts`;
- `src/openExternal.test.ts`;
- `src/bugReport.ts`;
- `src/cardShareNavigation.ts`.

Residual usages intentionally not changed in this phase:
- `src/App.tsx`;
- `src/verticals/SportVertical.tsx`;
- `src/externalTelegramChat.ts`;
- `src/components/MapProviderPickerPortal.tsx`.

The two large activity components were not replaced wholesale because the available editing interface could not safely apply a line-level patch. Residual modules require a separately bounded follow-up.

## Changes made
- Added a shared Telegram-aware external opener.
- Preserved Telegram-target preference for `openTelegramLink`.
- Preserved bug-report fallback to `openLink(..., { try_instant_view: false })`.
- Preserved browser fallback using `_blank` with `noopener,noreferrer`.
- Added focused unit tests for Telegram and browser paths.

## Verification
Original implementation head: `32ee463cd4ce7608a1f6ad5110acb3d5faf32474`.
GitHub Actions CI run `30363602645` / run number `1259`: completed successfully on that head.

This report commit changes the branch head and therefore requires a new terminal CI result before the final branch can be called green.

## ClickUp
No matching ClickUp task was found for external-link refactor, activity-actions deduplication or code deduplication. No ClickUp state was modified.

## GitHub
- Branch: `refactor/activity-external-actions-20260728`.
- Draft PR: `#446 — Refactor shared external link opening`.
- Base: `main`.
- Merge: not performed.
- Deployment: not performed.

## Blockers and residual risks
- The final head after adding this report must reach a terminal green CI state.
- Activity-action extraction in `App.tsx` and `SportVertical.tsx` is not included.
- Remaining external-navigation usages have not been normalized and should not be claimed as centralized.
- The branch contains multiple API-created commits rather than one squashed logical commit; no history rewrite or force push was performed.

## Next step
Keep PR #446 as Draft, wait for terminal CI on the exact final head, update the PR evidence and create the matching Google Drive report. Merge and deployment require separate explicit owner approval.
