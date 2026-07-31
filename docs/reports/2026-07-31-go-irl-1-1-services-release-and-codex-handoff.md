---
title: GO IRL 1.1 Services Release Report and Codex Handoff
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-31
next_review: 2026-08-07
---

# GO IRL 1.1 — Services release report and Codex handoff

## Task

Stabilize the Beauty/Services prototype on VPS, fix client visibility and incorrect counters, split the professional cabinet into a separate route, merge and deploy the bounded patch, and prepare the next implementation handoff for Codex.

## Source-of-truth boundary

GitHub remains authoritative. Google Drive is an export/report mirror only. Current implementation decisions must be checked against `DOCS_INDEX.md`, `README.md`, `ROADMAP.md`, `docs/DATABASE_SCHEMA_AUDIT.md`, and the existing Supabase migrations/auth/RLS implementation.

No Supabase schema, auth, RLS, secret, or migration change was made in this release.

## Repository and release identifiers

- Repository: `vitvolny26-art/Go-IRL-1.1`
- Base branch: `main`
- Patch branch: `fix/services-vps-catalog-cabinet-20260731`
- Patch commit: `9a3ef907fbc07d85d7fec70bd346b8ca3056f9a6`
- Pull request: `#490` — `fix: share services catalog and split professional cabinet`
- Merge commit: `5e1c041d19b73b05aa3dfa3caa18eec2485cbc30`
- Deploy target: VPS
- Production URL: `https://goirl.realitka.pp.ua`
- n8n workflow: `GO IRL VPS Deploy`
- n8n workflow ID: `6khfY6PmKkIVB9Qv`
- n8n execution: `6378`

## Files inspected

- `src/App.tsx`
- `src/main.tsx`
- `src/services/ServicesClientViews.tsx`
- `src/services/servicesProfessionalDirectory.ts`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/beauty-setup.css`
- related tests and release documentation

## Findings

1. Services client views read professional data only from browser-local IndexedDB/localStorage. A professional configured on one device or Telegram WebView was invisible to another account or device.
2. The Services category card reused event counting logic, so Beauty displayed an unrelated event count.
3. The professional cabinet remained embedded in the setup route and used top navigation rather than a dedicated workspace route with bottom navigation.
4. The current professional directory and role model were not persisted server-side.

## Changes made

### Shared bounded mock catalog

Added `src/services/servicesProfessionalDirectory.ts` with a bundled Olomouc pilot profile for Studio Vita. Same-device published data is merged without duplicates.

This is intentionally a temporary frontend directory, not Supabase persistence.

### Correct Services counter

The Beauty card now counts professionals for the selected city and uses a localized professional/master label instead of counting unrelated activities.

### Separate professional cabinet

Added `/beauty/workspace`. Professional cabinet entry points now open this route while `/beauty` remains the profile/setup flow.

### Bottom workspace navigation

The workspace navigation for Today, Week, Client, and Services is fixed to the bottom with mobile safe-area spacing.

### Tests and evidence

Added focused tests for the professional directory and the bounded release report:

`docs/reports/2026-07-31-agent-report-services-vps-catalog-cabinet.md`

## Files changed in PR #490

- `src/App.tsx`
- `src/main.tsx`
- `src/beauty/BeautyPilotWorkspace.tsx`
- `src/beauty/BeautySetupPage.tsx`
- `src/beauty/beauty-setup.css`
- `src/services/ServicesClientViews.tsx`
- `src/services/servicesProfessionalDirectory.ts`
- `src/services/servicesProfessionalDirectory.test.ts`
- `docs/reports/2026-07-31-agent-report-services-vps-catalog-cabinet.md`

Diff: 9 files, 212 additions, 14 deletions.

## Checks

### Patch checks

- `pnpm run lint`: PASS, with one pre-existing `no-console` warning in `api/_shared/admin-authorization.ts`
- `pnpm run typecheck`: PASS
- `pnpm run build`: PASS
- `pnpm run test`: PASS
- Staff OS tests: PASS
- `git diff --check`: PASS

### CI

- GitHub Actions run `1365`: SUCCESS
- Exact head: `9a3ef907fbc07d85d7fec70bd346b8ca3056f9a6`

### VPS deployment

- n8n execution `6378`: SUCCESS
- SSH exit code: `0`
- deployed branch: `main`
- deployed SHA: `5e1c041d19b73b05aa3dfa3caa18eec2485cbc30`
- production tests: 125 files, 593 tests PASS
- Staff OS: PASS
- public health: HTTP 200
- rollback: not triggered

## Current production behavior

### Client

- Services → Beauty shows a professional count instead of an event count.
- Studio Vita is visible as the bounded Olomouc pilot profile.

### Professional

- Professional cabinet opens `/beauty/workspace`.
- Bottom navigation exposes Today, Week, Client, and Services.
- Settings returns to the Beauty setup/edit flow.

## Known limitations

1. Studio Vita is bundled in the frontend and is not a Supabase row.
2. Newly created professional profiles remain device-local and are not automatically visible to other accounts.
3. User roles are not durably stored and enforced in the database for Services.
4. There is no approved RLS model separating public professional projection from private operational data.
5. Booking availability, requests, conflict prevention, and lifecycle remain prototype/local behavior.
6. Historical Vercel-first wording still exists in deployment documentation; this is documentation debt and must not be silently rewritten during implementation.

# Codex handoff

## Mission

Replace the bundled Services professional mock directory with a minimal Supabase-backed public professional projection and persist user roles safely.

Do not expand scope into a generalized marketplace or architecture rewrite.

- Merge target: GitHub `main`
- Deploy target: none until explicit approval
- Working model: one bounded PR; no merge or deploy without human command

## Required reading order

1. `DOCS_INDEX.md`
2. `README.md`
3. `ROADMAP.md`
4. relevant canonical roadmap part(s) only
5. `docs/DATABASE_SCHEMA_AUDIT.md`
6. `docs/DEVELOPMENT_PROTOCOL.md`
7. `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
8. `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
9. current Supabase migrations, auth, identity mapping, and RLS implementation
10. PR `#490` and this release report

Historical snapshots are not implementation authority.

## First step — inspection only

Before changing code or SQL:

- inventory trusted Telegram auth and canonical user identity mapping;
- inventory current profile/user tables and role-related fields or claims;
- inspect migration naming and RLS policy conventions;
- inspect public/private profile projection patterns;
- inspect Beauty/Services storage adapters and all call sites;
- determine whether professional role activation is self-service, approval-based, or derived from publication state.

Write a short design note before SQL changes. Stop on any conflict with current schema or RLS authority.

## Proposed bounded model

Names are provisional and must be reconciled with the current schema before implementation.

### Role persistence

- Prefer an existing canonical profile role field if one already exists; otherwise use the smallest normalized role assignment model.
- Roles required by current product boundaries: user/client, organizer, professional, and only already-authorized privileged roles.
- Never trust client-supplied role state for authorization.
- Role reads must resolve from authenticated server identity.
- Privileged roles must never be self-assigned.

### Professional profile

Separate public projection from private operational data.

Public fields may include:

- professional ID;
- display/studio name;
- city ID;
- public avatar/cover;
- public bio;
- published services with public prices/durations;
- publication status;
- optional public booking state.

Private fields may include:

- exact contact details;
- internal notes;
- draft setup data;
- private availability controls;
- moderation state/reason;
- owner user ID.

### Publication lifecycle

Minimum states:

- `draft`;
- `published`;
- `suspended` or `archived` only if current governance already supports them.

Only published public projections may appear in the client catalog.

## RLS and security acceptance criteria

- Public/authenticated clients can read only approved public fields of published professionals.
- A professional can read and update only their own private profile/setup data.
- A professional cannot self-assign admin or moderator privileges.
- Role and ownership resolve from `auth.uid()` or the project’s trusted identity mapping.
- Public catalog queries cannot expose private contact or internal fields.
- No destructive migration.
- No blanket permissive policy such as `USING (true)` on private tables.
- Include positive and negative policy verification where supported by the repository.

## Client integration acceptance criteria

- Replace bundled Studio Vita production data with a repository/service adapter reading the server projection.
- Preserve deterministic loading, empty, and error states.
- Do not silently fall back to fake professionals in production.
- Preserve demo fixtures only when explicitly isolated for Browser Demo Mode.
- Services counter and catalog must use the same server result.
- Professional workspace must load/save the authenticated professional’s own record.
- `/beauty` and `/beauty/workspace` must continue working.

## Role persistence acceptance criteria

- Role survives refresh, device change, and Telegram session restoration.
- Cabinet visibility is based on server-resolved role, not localStorage.
- Manipulated UI state grants no authorization.
- Existing organizer/client behavior is not regressed.
- Any beta-user backfill must avoid guessing production identities.

## Mandatory checks

Run in order and stop on first red:

- `pnpm run repo:check` if present
- `pnpm run lint`
- `pnpm run typecheck`
- `pnpm run build`
- `pnpm run test`
- targeted Supabase/RLS verification supported by the repository
- `git diff --check`

Commit only when all required checks are green.

## Prohibited

- no architecture rewrite;
- no unrelated refactor;
- no `.env` or secret changes;
- no production database mutation from local scripts;
- no broad auth rewrite;
- no destructive SQL;
- no force push;
- no auto-merge or auto-deploy.

# Roadmap orientation

## Step 1 — Server-backed professionals and roles

Goal: replace the frontend mock with a canonical public professional projection and durable role resolution.

Deliverables:

- schema/auth/RLS inspection;
- minimal migration and policies;
- repository adapter;
- role resolver;
- tests;
- design note and agent report.

Exit gate: two-account/two-device visibility works from database state and private fields remain protected.

## Step 2 — Professional onboarding and publication lifecycle

Goal: make professional creation/editing a real server lifecycle.

Deliverables:

- draft save;
- publish/unpublish;
- server validation;
- ownership checks;
- moderation boundary if required;
- migration/backfill plan.

Exit gate: a professional creates a draft, publishes it, and clients see only the published projection.

## Step 3 — Booking backend MVP

Goal: replace local booking prototypes with minimal server-backed availability and requests.

Deliverables:

- services;
- availability windows;
- booking request lifecycle;
- accept/decline/cancel states;
- conflict prevention;
- professional/client views;
- notifications within approved scope.

Exit gate: one professional and one client complete request → accept/decline → visible state transition without double booking.

## Risks

- Existing role or identity primitives may conflict with the proposed model.
- Public/private field separation must be enforced server-side, not only in UI projections.
- Demo fixtures must not leak into production fallback behavior.
- Existing organizer/client flows may regress if role resolution is introduced too broadly.

## Not touched

- production database;
- migrations;
- RLS policies;
- auth configuration;
- secrets;
- DNS or production configuration.

## Next step

Codex performs a read-only schema/auth/RLS inspection and writes a short design note. SQL or migration work begins only after that note is reviewed and no authority conflict remains.
