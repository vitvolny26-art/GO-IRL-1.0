# Admin Gate A Production Smoke Runbook

Status: Review
Owner: QA Lead / Chief Archivist
Last review: 2026-08-05

## Purpose
Define the bounded evidence procedure required to close Admin Gate A. This document does not authorize production execution or protected changes.

## Scope
Verify on one exact deployed commit: organizer and professional invitation redemption with disposable Telegram accounts; replay rejection; expired and malformed token rejection; elevated-role conflict rejection; guarded demotion; and the expected PII-safe audit_log evidence.

## Separate approval required
Before execution, obtain explicit approval for the exact production environment and disposable accounts. Auth, RLS, SQL, migrations, Edge Function deployment, secrets, credentials, production-data mutation, direct database queries, or destructive operations require separate explicit approval.

## Preconditions
- exact GitHub main SHA and deployed SHA recorded and equal;
- Telegram client, bot, Mini App URL, date and timezone recorded;
- two disposable accounts initially verified as role user;
- authorized admin operator and cleanup owner identified;
- no real account or raw token used in evidence.

## Evidence rules
For every case record case ID, exact SHA, timestamps, sanitized account label, action, expected and actual result, evidence reference, PASS/FAIL/BLOCKED, and cleanup. Never record raw Telegram initData, bearer sessions, JWTs, invitation tokens or hashes, credentials, phone numbers, or private chat contents.

## Test matrix
| ID | Case | Expected result | Status |
|---|---|---|---|
| A1 | Redeem organizer invitation with disposable user A | Role becomes organizer once | NOT RUN |
| A2 | Replay consumed organizer invitation | Rejected; role unchanged | NOT RUN |
| A3 | Redeem professional invitation with disposable user B | Role becomes professional once | NOT RUN |
| A4 | Use expired invitation | Rejected; no role change | NOT RUN |
| A5 | Use malformed token | Rejected; no role change | NOT RUN |
| A6 | Redeem while account already has elevated role | Rejected; existing role preserved | NOT RUN |
| A7 | Demote disposable elevated-role account | Role becomes user; admin remains protected | NOT RUN |
| A8 | Verify demotion audit record | One PII-safe audit_log row; no secret data | NOT RUN |

## Execution order
1. Freeze exact GitHub and deployed SHA evidence.
2. Confirm both disposable accounts are ordinary users.
3. Execute A1 then A2.
4. Execute A3.
5. Execute A4-A6 with isolated disposable evidence.
6. Execute A7 only after explicit production-data approval.
7. Verify A8 only through an explicitly approved safe evidence path.
8. Verify cleanup and persist a new immutable report.

## Stop conditions
Stop on SHA mismatch, real-user involvement, secret exposure, unexpected role mutation, excessive PII, unclear rollback ownership, or any protected access without approval.

## Completion criteria
Gate A may move from Partial/Blocked only when A1-A8 pass on one exact deployed SHA, cleanup is verified, evidence is persisted, and no blocker remains. ADMIN010 remains blocked until then.

Created from main/branch base b8cfed3b4f5a642be3b582165e2ecfc04ea46b7c.
