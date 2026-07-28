# AI Fixer Report — External Telegram Chat Opener

Date: 2026-07-28
Role: AI Fixer
Status: Partial / Draft PR

## Task
Move one residual external-navigation usage in `src/externalTelegramChat.ts` onto the shared Telegram-aware opener already merged in PR #446.

## Scope
In scope:
- `src/externalTelegramChat.ts`;
- `src/externalTelegramChat.test.ts`;
- this report.

Out of scope:
- `src/App.tsx`;
- `src/verticals/SportVertical.tsx`;
- `src/components/MapProviderPickerPortal.tsx`;
- merge, deployment, production configuration, auth, SQL, RLS, migrations and production data.

## Evidence and root cause
`openExternalTelegramChat` duplicated Telegram WebApp detection and safe browser fallback already owned by `openTelegramExternal`.

## Changes
- Production mode now delegates to `openTelegramExternal`.
- Existing dependency injection remains intact for targeted unit tests and callers.
- URL normalization, access policy, lifecycle policy and local-storage behavior are unchanged.
- Added a targeted test proving the no-dependency production path uses Telegram `openTelegramLink`.

## Verification
Branch: `refactor/external-telegram-chat-opener-20260728`.
Base: merged main commit `63714a8f877b955625540b57ae345f422aee5857`.
Current implementation/test head before this report: `7808af633049eba236ad38958492421c5e2208a5`.

A terminal GitHub Actions result is required on the exact final head before green completion can be claimed.

## Residual risks
- CI is pending until the pull request starts.
- Remaining external-navigation residual scope is limited to the separately listed large activity files and map provider picker.

## Next step
Create a Draft PR, wait for terminal CI on the exact final head, persist the matching Google Drive report, and do not merge or deploy without separate explicit owner approval.
