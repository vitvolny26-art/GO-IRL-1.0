---
title: Agent Report
owner: Technical Lead / Supabase Steward
status: Draft
source_of_truth: false
last_review: 2026-08-01
next_review: 2026-08-08
---

# Agent Report

## Task

Perform the inspection-only first step from Issue #491 before any Services SQL, RLS, auth, migration, or production change.

The requested outcome is a bounded design note for replacing the bundled Beauty professional mock directory with a server-backed public projection while preserving the existing trusted Telegram identity and role model.

## Repository state

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Inspected base: `main`
- Exact base SHA: `edb91fbd3a30364b3e57cfccac21b78af5e89a12`
- Merge target for a later implementation: `main`
- Deploy target: `none`
- Production changes in this task: none

## Files and evidence inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md`
- `docs/DATABASE_SCHEMA_AUDIT.md`
- `docs/RLS.md`
- `docs/GO_IRL_BEAUTY_ARCHITECTURE_PRIVACY_REVIEW.md`
- `docs/reports/2026-07-31-go-irl-1-1-services-release-and-codex-handoff.md`
- `docs/reports/2026-07-31-agent-report-domain-production-roles.md`
- `supabase/migration_v2_backend_foundation.sql`
- `supabase/migrations/20260731110701_add_professional_role.sql`
- `supabase/migrations/20260704_coach_requests_and_ratings.sql`
- `supabase/functions/verifyTelegramInitData/index.ts`
- `src/types.ts`
- `src/authSession.ts`
- `src/store.ts`
- `src/config/admin.ts`
- `src/beauty/BeautyRouteGuard.tsx`
- `src/beauty/beautySetupModel.ts`
- `src/beauty/beautyWorkspaceStorage.ts`
- `src/services/servicesProfessionalDirectory.ts`
- `src/services/ServicesClientViews.tsx`
- Draft PR #493, `Admin005: add 24-hour Telegram role invitations`

## Findings

### 1. The production role foundation already exists

`public.user_roles` is the canonical single-role store. Its accepted values are:

- `user`
- `organizer`
- `professional`
- `moderator`
- `admin`

The `professional` constraint migration was applied and verified in production according to the existing role report. Role insertion and update remain admin-controlled by RLS.

A new Services implementation must reuse this role model. It must not add a second role table, a `master` role alias, or client-controlled role assignment.

### 2. Trusted Telegram identity is already the production trust chain

The current production path is:

```text
Telegram WebApp.initData
-> verifyTelegramInitData Edge Function
-> canonical user_key telegram:<numeric_id>
-> app_users / user_provider_identities
-> user_roles lookup
-> short-lived JWT with go_irl_user_key and go_irl_role
-> Supabase RLS
```

The Services implementation must derive ownership from the verified server identity. `initDataUnsafe`, `localStorage`, URL parameters, and public `VITE_*` values cannot authorize profile ownership or role changes.

### 3. The current Beauty route guard is only a UI gate

`BeautyRouteGuard` allows `professional` and `admin` after trusted-auth initialization. This prevents ordinary users from opening the workspace UI, but it does not create a server-owned professional record and does not protect stored profile data.

Authorization must remain enforceable in RLS even when the frontend is modified or bypassed.

### 4. The professional catalog is still bundled and device-local

The client catalog currently combines:

- the bundled `Studio Vita` fixture from `servicesProfessionalDirectory.ts`;
- one same-device Beauty workspace loaded from IndexedDB/localStorage.

The local workspace is stored under one browser-global key and is not keyed by the authenticated user. Publishing therefore does not create a shared professional record and does not establish ownership.

`ServicesClientViews.tsx` also silently falls back to the bundled fixture when local loading fails. That behavior is acceptable only in an explicit Browser Demo Mode, not as a production fallback.

### 5. Public and private Beauty fields already have a conceptual boundary

The local model contains both public and private fields in one browser object.

Public projection candidates already used by the UI include:

- display name;
- city;
- public location summary;
- service name;
- duration;
- price;
- public link;
- limited public schedule data.

Private fields include:

- contact details;
- exact address;
- buffer and break configuration;
- unpublished setup state;
- future operational data.

The server design must enumerate public columns explicitly. Public clients must never select the private owner table directly.

### 6. There is no current professional profile table

No current migration creates a Services professional profile, service catalog, publication-state, or Beauty availability table.

The existing `coach_profiles` implementation is useful only as a repository convention reference. It cannot be copied directly because Beauty contains private contact and location fields that require a stricter public/private boundary.

### 7. Draft PR #493 overlaps the auth and role boundary

Draft PR #493 modifies:

- `verifyTelegramInitData`;
- `src/authSession.ts`;
- admin role-assignment UI;
- role-assignment SQL.

It introduces admin-created, single-use invitations for `organizer` and `professional`. Its migration and Edge Function changes have not been applied to production.

Issue #491 must not independently implement role invitations or modify the same auth flow without first resolving PR #493. Otherwise two branches would define competing role transitions and session-refresh behavior.

### 8. Product governance still gates the production Services pilot

The canonical roadmap states that Services/Beauty is a local/mock prototype and that the production pilot remains gated. The existing production `professional` role does not by itself authorize a Services data model or public pilot.

Any schema, RLS, auth, production-data, or deployment change requires an explicit protected-change approval and Gate F decision.

### 9. Schema documentation has freshness debt

`docs/DATABASE_SCHEMA_AUDIT.md` correctly says migrations and the Supabase runbook control current schema decisions, but its confirmed-migration inventory predates the professional-role migration and other later changes.

This is documentation debt. It must not be used to infer that later verified migrations are absent.

## Inspection decision

The current implementation should not start by writing another role migration.

The smallest safe direction is:

1. reuse `public.user_roles` and the existing trusted Telegram JWT;
2. keep role assignment independent from profile publication;
3. resolve the disposition of Draft PR #493 before touching the auth/session role-transition path;
4. add a separate owner-scoped Services data model only after explicit Gate F and protected-change approval;
5. expose a narrow published projection to clients;
6. replace the bundled production directory with one repository adapter used by both catalog and count;
7. keep fixtures only in explicit Browser Demo Mode.

## Proposed bounded implementation design

The names below are provisional and must be reconciled against the final migration inventory before implementation.

### A. Private professional profile

A private owner table should hold one record per professional identity, keyed by the canonical verified `user_key`.

Candidate responsibilities:

- owner user key;
- domain/vertical identifier;
- display name;
- city ID;
- public location summary;
- private contact;
- exact address;
- publication state;
- timestamps.

Minimum publication states for the first bounded implementation:

- `draft`
- `published`
- `hidden`

Publication must not assign a role. The caller must already have a server-resolved `professional` role, or an explicitly approved administrator path must perform the transition separately.

### B. Professional services

A child table should store the professional's service rows:

- profile ID;
- service name;
- duration;
- price and currency;
- active state;
- deterministic ordering;
- timestamps.

The initial implementation should remain Beauty/Olomouc bounded and must not generalize into a multi-vertical marketplace.

### C. Availability boundary

The current workspace includes weekdays, opening hours, break settings, and buffer settings.

Before implementation, the owner and Supabase reviewer must decide whether Step 1 includes server persistence for this configuration. Two safe options exist:

1. include a small owner-only availability-rules table in the same bounded PR; or
2. keep availability explicitly prototype-only until the subsequent professional-cabinet step.

It is not acceptable to present local availability as durable server state.

### D. Public projection

Clients should read an explicitly enumerated published projection through a view or narrowly scoped RPC/repository query.

The projection may expose only approved fields, such as:

- public professional ID;
- display name;
- city ID;
- public location summary;
- active public services;
- price and duration;
- publication state implied by inclusion;
- approved public link or slug.

It must not expose:

- owner user key unless explicitly required;
- exact address;
- private contact;
- draft state;
- internal notes;
- break/buffer controls;
- integration configuration;
- another professional's private data.

### E. RLS contract

Required behavior:

- public or authenticated clients can read only the published public projection;
- a professional can read, insert, and update only their own private profile and child records;
- another professional cannot read or mutate those private records;
- an ordinary `user` cannot create a professional profile merely by manipulating frontend state;
- publication does not grant `professional`, `moderator`, or `admin`;
- no blanket permissive private-table policy;
- service-role access stays behind reviewed server operations;
- exceptional admin/private-data access is not assumed and requires a separate purpose and audit decision.

Ownership should resolve from the trusted JWT helper and canonical `telegram:<id>` user key, not from a client-submitted owner field.

### F. Client repository adapter

Introduce one Services professional repository boundary that returns deterministic states:

- loading;
- success;
- empty;
- error.

The same server result must power:

- the Services category professional count;
- the Catalog list;
- the For You list.

Production must not silently fall back to Studio Vita or any other fake professional. A fixture may remain only behind explicit Browser Demo Mode.

### G. Workspace adapter

The Beauty workspace should load and save the authenticated professional's own server record through the same trusted session.

The adapter must:

- fail closed when trusted auth is unavailable;
- never accept an arbitrary owner key from the browser;
- preserve an explicit unsaved/error state;
- avoid overwriting another device's newer server state without a reviewed concurrency rule;
- keep the current local store only as a clearly labeled demo/recovery mechanism, not canonical production storage.

### H. Verification requirements

A later implementation PR must include executable positive and negative checks for:

- published projection visible to a client;
- draft/hidden profile absent from public results;
- private contact and exact address absent from public results;
- owner can read and update own record;
- unrelated professional cannot read or update private record;
- ordinary user cannot self-create or self-assign professional authorization;
- role manipulation in the UI grants no database access;
- catalog and count use the same query result;
- production error state does not load a fixture;
- Browser Demo Mode remains isolated from production writes.

Required repository gates remain:

- `pnpm run repo:check` when present;
- `pnpm run lint`;
- `pnpm run typecheck`;
- `pnpm run build`;
- `pnpm run test`;
- targeted migration/RLS verification;
- `git diff --check`.

## Dependencies and blockers

### Blocker 1 — Services pilot authorization

The canonical roadmap still marks the production Beauty pilot as gated. Inspection is allowed; implementation of schema/RLS requires explicit Product Owner approval of the bounded Gate F pilot and separate approval for protected production changes.

### Blocker 2 — PR #493 disposition

PR #493 must be reviewed, rebased, merged, or explicitly rejected before Issue #491 changes `verifyTelegramInitData`, `authSession.ts`, or role-transition behavior.

The preferred separation is:

- PR #493 owns admin-issued role invitations and immediate trusted-session role refresh;
- Issue #491 owns professional profile/catalog persistence and reads the already resolved role;
- Issue #491 does not create a second role-assignment mechanism.

### Blocker 3 — Step 1 availability scope

The owner must decide whether working hours and break/buffer configuration become server-backed in the first profile PR or remain explicitly deferred to the professional-cabinet lifecycle step.

### Blocker 4 — public/private field approval

The exact public field allowlist, contact visibility, exact-address timing, and admin/support access purpose require a bounded Product/Security/Supabase decision before migration authoring.

## Changes made

- Added this inspection and design note only.
- No application code changed.
- No SQL or migration was created or executed.
- No RLS, auth, Edge Function, secret, configuration, production data, deployment, or role assignment changed.

## Checks

- Repository evidence read from exact `main` SHA: PASS.
- Current role/auth/catalog/storage call sites inventoried: PASS.
- Overlapping Draft PR #493 identified: PASS.
- Protected-change and roadmap gates identified: PASS.
- `pnpm` gates: NOT RUN — docs-only.
- SQL/RLS verification: NOT RUN — no SQL/RLS change.
- Production verification: NOT RUN — no production change.

## Risks

- Merging profile work before resolving PR #493 could create incompatible auth/session behavior.
- Reading public fields from a private table could leak contact or exact-address data.
- Reusing a client-submitted user key would break the trusted identity boundary.
- Keeping the bundled fallback in production would conceal outages and fabricate supply.
- Treating `professional` role as pilot authorization would bypass the canonical Gate F decision.
- Expanding this task into booking, payments, reviews, multiple verticals, or marketplace features would violate the bounded scope.

## Not touched

- `.env` or secrets;
- Supabase production schema or data;
- RLS policies;
- Telegram auth verifier;
- role-assignment behavior;
- Draft PR #493;
- Beauty workspace runtime;
- Services catalog runtime;
- VPS or Vercel;
- DNS or Caddy;
- n8n workflows.

## Next step

1. Review this design note and Issue #491 together.
2. Resolve the disposition of Draft PR #493.
3. Record explicit Gate F and protected-change approval if the bounded server-backed Beauty pilot is authorized.
4. Decide the first-PR availability boundary and exact public field allowlist.
5. Only then create one fresh implementation branch from current `main`, author the minimal migration/RLS plus repository adapter, and stop at the first red gate.
