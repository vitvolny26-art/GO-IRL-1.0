# Security Release Checklist

This checklist must be completed before every public production release of GO IRL.

Status values:

- `Not Started`
- `In Progress`
- `Done`

Release Blocker values:

- `YES`
- `NO`

Default rule: if a security-critical item is not `Done` and has `Release Blocker: YES`, the release must not go public.

## 1. Authentication

| Item | Status | Release Blocker |
| --- | --- | --- |
| Trusted Telegram `initData` verification is implemented on a backend or edge function | In Progress | YES |
| Telegram HMAC signature validation uses the bot token only on the server side | In Progress | YES |
| `auth_date` is validated and stale auth payloads are rejected | In Progress | YES |
| Replay protection exists for reused Telegram auth payloads or issued sessions | In Progress | YES |
| Verified app session/JWT is issued after Telegram verification | In Progress | YES |
| Supabase RLS uses `auth.uid()` or verified JWT claims, not frontend-controlled headers | In Progress | YES |

## 2. Authorization

| Item | Status | Release Blocker |
| --- | --- | --- |
| RLS is enabled for all user-facing tables | In Progress | YES |
| RLS policies are tested with positive and negative cases | In Progress | YES |
| Organizer permissions are enforced server-side/RLS | In Progress | YES |
| Moderator permissions are enforced server-side/RLS | In Progress | YES |
| Admin permissions are enforced server-side/RLS | In Progress | YES |
| No permission decision trusts frontend-only values | In Progress | YES |

## 3. Secrets

| Item | Status | Release Blocker |
| --- | --- | --- |
| No secrets are stored in `VITE_*` environment variables | In Progress | YES |
| No real admin IDs are bundled into frontend code | In Progress | YES |
| Supabase `service_role` key is never used in client code | Done | YES |
| Environment variable audit is completed for production and preview | Not Started | YES |

## 4. Database

| Item | Status | Release Blocker |
| --- | --- | --- |
| DB-level constraints exist for critical user input | In Progress | YES |
| All required migrations are applied in production Supabase | In Progress | YES |
| Verification SQL has been executed and passed | In Progress | YES |
| Required indexes exist for production query paths | In Progress | NO |
| Required foreign keys exist for canonical production tables | In Progress | YES |

## 5. API

| Item | Status | Release Blocker |
| --- | --- | --- |
| Backend/API input validation exists for critical writes | Not Started | YES |
| Rate limiting exists for auth, create event, join, report, and admin actions | Not Started | YES |
| Critical actions are audit logged | In Progress | YES |
| API errors are safe and do not leak secrets or internals | In Progress | YES |

## 6. Privacy

| Item | Status | Release Blocker |
| --- | --- | --- |
| GDPR-style delete account path is designed or implemented for release scope | Not Started | YES |
| User data export path is designed or implemented for release scope | Not Started | NO |
| Raw geolocation is not stored as movement history | Done | YES |
| No hidden tracking or background Mini App tracking exists | Done | YES |
| Notification opt-in and quiet-hours rules are respected for release scope | In Progress | YES |

## 7. AI

| Item | Status | Release Blocker |
| --- | --- | --- |
| AI receives no unnecessary private user data | In Progress | YES |
| Chats are not processed by AI without explicit consent | Done | YES |
| Prompt injection review is completed for AI workflows in release scope | Not Started | YES |

## 8. n8n

| Item | Status | Release Blocker |
| --- | --- | --- |
| n8n secrets are stored securely outside Git and frontend bundles | Not Started | YES |
| Retry policy is defined for notification/discovery workflows | Not Started | NO |
| Workflows are idempotent where duplicate sends or duplicate writes matter | Not Started | YES |
| Workflow logging avoids excessive personal data | Not Started | YES |
| Notification limits and quiet hours are enforced | Not Started | YES |

## 9. Chat

| Item | Status | Release Blocker |
| --- | --- | --- |
| Activity Chat is participant-only | Not Started | YES |
| Activity Chat archives after the event retention window | Not Started | YES |
| Moderation hold can pause archive/delete for open complaints | Not Started | YES |
| Report/block exists before chat is public | Not Started | YES |

## 10. Admin

| Item | Status | Release Blocker |
| --- | --- | --- |
| Admin roles are server-side verified | In Progress | YES |
| Admin actions are audit logged | In Progress | YES |
| No admin permission trusts frontend-only allowlists | In Progress | YES |

## 11. Production

| Item | Status | Release Blocker |
| --- | --- | --- |
| `pnpm run test` passes | Done | YES |
| `pnpm run lint` passes | Done | YES |
| `pnpm run build` passes | Done | YES |
| GitHub Actions are green | Done | YES |
| Vercel deployment is green | Done | YES |
| Supabase migrations required for the release are applied | In Progress | YES |
| Supabase verification SQL required for the release has passed | In Progress | YES |
