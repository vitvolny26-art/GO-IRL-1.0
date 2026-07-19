---
title: Phase A User Profile Contract
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-08-02
---

# Phase A User Profile Contract

## Task

Define the production contract for the minimal shared GO IRL profile without applying SQL or changing runtime code.

Parent report:

- `docs/reports/2026-07-19-user-profile-reputation-roadmap.md`

This contract covers only Phase A:

- `user_profiles`;
- profile interests;
- trusted production persistence;
- demo/local persistence;
- avatar Storage boundaries;
- RLS and migration plan;
- implementation and QA missions.

## Files inspected

- `src/App.tsx`
- `src/authSession.ts`
- `src/supabase.ts`
- `src/profileAvatar.ts`
- `src/config/cities.ts`
- `supabase/migration_v4_trusted_telegram_auth.sql`
- `docs/reports/2026-07-19-user-profile-reputation-roadmap.md`

## Current state

The current profile is a `LocalProfile` embedded in `src/App.tsx` with:

- name;
- bio;
- city ID;
- avatar code or data URL;
- local registration timestamp;
- favorite Activity slugs.

It always reads and writes `localStorage` under `go-irl-profile`. Uploaded images are cropped and converted to data URLs. Production profile persistence is therefore not implemented.

Trusted production identity already exists in `app_users`. JWT authorization is based on the verified `go_irl_user_key` claim. Phase A must use that claim and must not trust a frontend-provided user key.

## Decisions

### Identity boundary

`app_users` remains the identity and authentication table.

It owns:

- provider identity;
- Telegram ID;
- Telegram first and last name;
- Telegram username;
- account status;
- login timestamps.

`user_profiles` is a separate user-editable product profile.

It must not duplicate:

- Telegram ID;
- provider user ID;
- role;
- account status;
- trust state;
- email or phone;
- auth tokens.

### Profile key

Use the existing stable `user_key` as the Phase A primary and foreign key.

Do not migrate the application to another identity model in this phase.

### Demo and production

- Trusted Telegram session: use the Supabase profile repository only.
- Browser mock or legacy demo identity: use the local profile repository only.
- Never dual-write.
- Never silently copy `go-irl-profile` into production.
- Never fall back to local persistence after a production write error.

### Legacy event snapshots

Keep these existing fields unchanged:

- `activities.organizer`;
- `activities.organizer_key`;
- `activity_members.display_name`.

They remain creation/join-time snapshots and fallbacks. Phase A does not rewrite old Activities or members.

### Registration date

Production profile registration date is `user_profiles.created_at`.

The local `go-irl-registered-at` timestamp remains demo-only. It is never imported into production.

### Public profile scope

Phase A stores only fields safe for an authenticated GO IRL user to see when the owner enables public visibility.

No private contact, auth, moderation, Trust Score or fraud fields belong in `user_profiles`.

### Avatar source

Avatar priority after Phase A:

1. GO IRL uploaded avatar object;
2. GO IRL preset avatar code;
3. initials derived from the GO IRL display name;
4. generic `GI` fallback.

Telegram `photo_url` is not copied, persisted or used as the primary GO IRL avatar.

## Shared TypeScript contract

```ts
export type UserProfile = {
  userKey: string;
  displayName: string;
  bio: string;
  cityId: string;
  avatarPath: string | null;
  avatarCode: string | null;
  isPublic: boolean;
  showFavorites: boolean;
  favoriteActivityIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type UserProfileDraft = Pick<
  UserProfile,
  | "displayName"
  | "bio"
  | "cityId"
  | "avatarPath"
  | "avatarCode"
  | "isPublic"
  | "showFavorites"
  | "favoriteActivityIds"
>;
```

Rules:

- `userKey`, `createdAt` and `updatedAt` are server-owned.
- `favoriteActivityIds` is normalized from `user_profile_interests`.
- `avatarPath` and `avatarCode` cannot both be non-null.
- initials are derived and are not stored.

## Database contract

No SQL is applied by this report.

### `user_profiles`

| Column | Type | Null | Default | Rule |
|---|---|---:|---|---|
| `user_key` | `text` | no | none | primary key; FK to `app_users(user_key)` |
| `display_name` | `text` | no | none | trimmed length 2-60 |
| `bio` | `text` | no | `''` | maximum 280 characters |
| `city_id` | `text` | no | `'olomouc'` | lowercase slug; application must resolve it from `src/config/cities.ts` |
| `avatar_path` | `text` | yes | null | Storage object path only; no URL or data URL |
| `avatar_code` | `text` | yes | null | maximum 8 characters |
| `is_public` | `boolean` | no | `true` | controls profile reads by other authenticated users |
| `show_favorites` | `boolean` | no | `true` | controls interest reads by other authenticated users |
| `created_at` | `timestamptz` | no | `now()` | server-owned |
| `updated_at` | `timestamptz` | no | `now()` | maintained by the existing touch trigger |

Required constraints:

- `user_key` references `public.app_users(user_key)`;
- hard deletion follows the approved account-deletion process, not a normal client action;
- `display_name = btrim(display_name)`;
- `char_length(display_name)` is between 2 and 60;
- `char_length(bio) <= 280`;
- `city_id` matches a safe lowercase slug pattern;
- `avatar_path` does not contain `://` and does not start with `data:`;
- `avatar_path` and `avatar_code` are mutually exclusive;
- `updated_at` uses `public.go_irl_touch_updated_at()`.

Do not add `show_reputation` in Phase A. Add that visibility control only when reputation fields actually ship.

### `user_profile_interests`

| Column | Type | Null | Default | Rule |
|---|---|---:|---|---|
| `user_key` | `text` | no | none | FK to `user_profiles(user_key)` |
| `interest_slug` | `text` | no | none | stable current Activity/favorite slug |
| `created_at` | `timestamptz` | no | `now()` | server-owned |

Primary key:

- `(user_key, interest_slug)`

Rules:

- slug length 1-48;
- lowercase letters, digits and hyphens only;
- duplicates rejected by the primary key;
- application limit: maximum 12 selected interests;
- use current stable slugs; no category architecture migration.

### Indexes

Required beyond primary keys:

- `user_profiles_city_public_idx` on `(city_id, is_public)`;
- `user_profile_interests_interest_idx` on `(interest_slug, user_key)`.

Do not add reputation, popularity or ranking indexes in Phase A.

## Save contract

Use one atomic database operation for profile and interest updates.

Recommended interface:

- an invoker-rights RPC named `save_my_profile`;
- it accepts editable fields only;
- it derives `user_key` from `public.go_irl_auth_user_key()`;
- it never accepts a client-supplied target user key;
- it upserts `user_profiles`;
- it replaces the caller's interest rows in the same transaction;
- it validates deduplication and the maximum interest count;
- normal RLS remains active.

A direct multi-request frontend replacement of interests is not the preferred contract because a failed request can leave partial state.

## Read contract

### Own profile

A trusted user reads their complete Phase A row and interests.

When no row exists, return an in-memory draft:

- display name from verified Telegram first/last name, then username, then `GO IRL User`;
- selected application city;
- empty bio;
- no avatar object;
- no interests;
- public visibility defaults enabled.

Do not write this fallback row until the user explicitly saves.

### Another user's profile

Return the row only when `is_public = true`.

Return interests only when:

- the profile is public; and
- `show_favorites = true`.

When no readable profile exists, UI surfaces must use their existing organizer/member snapshot fallback.

### Anonymous access

No anonymous client read is required in Phase A.

Server share generation can use its existing trusted server path. Public share-card integration belongs to Phase B.

## RLS matrix

### `user_profiles`

| Actor | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Owner with trusted JWT | own row | own key only | own row/key only | denied |
| Other authenticated user | public rows only | denied | denied | denied |
| Anonymous | denied | denied | denied | denied |
| Moderator | same as normal user in Phase A | denied | denied | denied |
| Service role | operational access | operational access | operational access | approved deletion only |

Insert and update checks must compare `user_key` only with `public.go_irl_auth_user_key()`.

Do not use:

- `x-go-irl-user-key`;
- Telegram ID from request body;
- username;
- localStorage identity;
- client role fields.

### `user_profile_interests`

| Actor | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Owner with trusted JWT | own rows | own key only | unnecessary | own rows |
| Other authenticated user | only interests allowed by the owner's public flags | denied | denied | denied |
| Anonymous | denied | denied | denied | denied |
| Service role | operational access | operational access | operational access | operational access |

The atomic save RPC may delete and reinsert only the caller's own interest rows.

### Grants

Grant authenticated users only the operations required by the policies and RPC.

Do not grant normal clients write access to `app_users` as part of this phase. Existing auth policy behavior is outside this mission.

## Avatar Storage contract

### Bucket

Retain the existing logical name:

- `avatars`

Create it as a private bucket.

The database stores only `avatar_path`, never:

- a public URL;
- a signed URL;
- a data URL;
- raw image bytes.

### Object path

Use:

- `<trusted-user-key>/<random-uuid>.<extension>`

The first path segment must exactly equal `public.go_irl_auth_user_key()`.

Do not accept a target user key from UI input.

### Allowed uploads

- MIME: `image/jpeg`, `image/png`;
- maximum size: 5 MiB;
- one generated UUID filename per upload;
- `upsert: false`;
- crop/resize before upload remains allowed;
- reject SVG, GIF and arbitrary binary content in Phase A.

### Storage policies

Owner may:

- insert under their own prefix;
- select their own objects;
- delete their own old objects.

Other authenticated users may select an object only when it is referenced by a readable public profile.

Anonymous users receive no bucket access in Phase A.

### Replacement sequence

1. validate and crop locally;
2. upload the new object with a unique path;
3. save the new `avatar_path` in the profile transaction;
4. resolve and display the new object;
5. attempt deletion of the previous owned object;
6. retain an orphan-cleanup task for failed deletions.

Never delete the old object before the profile update succeeds.

### URL resolution

Generate short-lived signed URLs at read time.

Do not use `getPublicUrl()` for the private bucket.

Cache only the resolved URL in memory. Do not persist signed URLs in localStorage or the database.

## Repository boundary

Introduce one interface outside `App.tsx`:

```ts
export interface ProfileRepository {
  loadOwnProfile(): Promise<UserProfile | null>;
  saveOwnProfile(input: UserProfileDraft): Promise<UserProfile>;
  uploadAvatar(file: File): Promise<string>;
  resolveAvatarUrl(path: string): Promise<string>;
}
```

Implementations:

### `LocalProfileRepository`

- selected only for browser mock/legacy demo identity;
- keeps the current `go-irl-profile` data compatible;
- may continue storing cropped data URLs locally;
- performs zero Supabase profile or Storage requests.

### `SupabaseProfileRepository`

- selected only when a valid trusted Telegram session exists;
- uses the trusted access token already supplied to the Supabase client;
- never reads or writes `go-irl-profile`;
- never falls back to local persistence;
- maps snake_case database rows to the shared TypeScript contract.

Repository selection must be based on the resolved auth session source, not on editable profile data.

## Error behavior

### Production read failure

- show the safe verified-identity fallback in memory;
- show a synchronization error;
- do not silently present stale local demo data as production data.

### Production save failure

- keep the editor open;
- retain the unsaved draft in component memory;
- show a retryable error;
- do not write the draft to localStorage.

### Avatar upload failure

- keep the previous avatar;
- do not update `avatar_path`;
- show a file-specific error;
- do not create a data-URL fallback in production.

## Migration plan

### A1 — schema and RLS

Create one reviewed migration containing:

- `user_profiles`;
- `user_profile_interests`;
- constraints and indexes;
- touch trigger;
- RLS policies;
- minimal grants;
- atomic `save_my_profile` RPC.

No data backfill.

### A2 — private avatar bucket

Create the bucket and Storage policies in the same approved Supabase mission or a separately reviewed Storage migration.

No production object upload during migration.

### A3 — shared frontend contract

Add:

- profile types;
- row mappers;
- repository interface;
- local repository;
- Supabase repository;
- repository-selection tests.

Do not change the profile UI in this mission.

### A4 — profile UI persistence

Wire `ProfileView` to the repository:

- production loads/saves Supabase;
- demo loads/saves localStorage;
- existing layout and translations remain;
- no card/share-card changes.

### A5 — avatar persistence

Replace the production data-URL path with private Storage upload and signed URL resolution.

Keep demo data URLs local.

### A6 — QA gate

Run automated checks and a two-account RLS smoke test before commit approval.

## Rollout order

1. approve this contract;
2. merge the parent docs PR;
3. implement and review schema/RLS in a dedicated branch;
4. apply to a non-production Supabase environment;
5. complete two-account RLS tests;
6. implement frontend repository and UI wiring;
7. run lint/build/test;
8. deploy frontend only after the database contract is available;
9. perform Telegram production smoke test;
10. enable Phase A without importing local demo profiles.

## Rollback

- Frontend may be reverted while keeping the additive profile tables.
- Do not drop profile tables after real user data exists.
- Do not revert production to localStorage persistence.
- A failed avatar release may disable new uploads while retaining stored paths and existing avatars.
- Schema rollback is permitted only before production data exists and after explicit approval.

## Acceptance criteria

### Identity and persistence

- trusted user A can create and update only profile A;
- trusted user A cannot target user B through payload manipulation;
- browser demo makes zero profile-table and avatar-bucket requests;
- production makes zero `go-irl-profile` writes;
- production profile survives a new device/session;
- no automatic local-to-production import occurs.

### Privacy

- user A can read public profile B;
- user A cannot read private profile B;
- hidden favorites are not returned to another user;
- owner can always read their own row and interests;
- anonymous client reads are denied;
- no Telegram ID, auth field, role or Trust data is exposed through the profile tables.

### Validation

- blank or overlong display names are rejected;
- bio over 280 characters is rejected;
- malformed city and interest slugs are rejected;
- duplicate interests are rejected;
- more than 12 interests is rejected by the save contract;
- data URLs and external URLs cannot be stored in `avatar_path`;
- both avatar fields cannot be active simultaneously.

### Avatar

- only JPEG/PNG files up to 5 MiB are accepted;
- user A cannot upload, replace, read-private or delete objects under user B's prefix;
- database stores only the object path;
- signed URLs are not persisted;
- failed replacement preserves the old avatar;
- Telegram profile photo is not copied or prioritized.

### Compatibility

- old Activities render with existing organizer snapshots when no profile row exists;
- old member rows render with existing display-name snapshots;
- no Activity ownership or membership rows are rewritten;
- no reputation, RLI, attendance or coach behavior changes.

### Quality gate

- `pnpm run lint` passes;
- `pnpm run build` passes;
- `pnpm run test` passes;
- two-account RLS matrix passes in a non-production environment;
- one browser-demo smoke test confirms zero Supabase profile writes;
- one trusted Telegram smoke test confirms production persistence.

## AI Fixer missions

### Mission A1 — Profile schema and RLS

Scope:

- one additive Supabase migration;
- tables, constraints, indexes, policies, grants and atomic save RPC only;
- no frontend changes;
- no production apply.

Forbidden:

- auth redesign;
- changes to existing Activity/member RLS;
- data backfill;
- destructive SQL;
- reputation tables.

### Mission A2 — Avatar bucket policies

Scope:

- private `avatars` bucket contract;
- owner-prefix write/delete;
- profile-visibility read rule;
- MIME and size restrictions;
- no frontend changes;
- no production apply.

### Mission A3 — Profile repository

Scope:

- extract shared profile types;
- implement local and Supabase repositories;
- add repository-selection and mapping tests;
- do not change `ProfileView` rendering.

### Mission A4 — Profile UI persistence

Scope:

- wire current `ProfileView` to the repository;
- preserve visual layout and translations;
- keep local demo behavior;
- no organizer card or share-card changes.

### Mission A5 — Production avatar upload

Scope:

- production uploads JPEG/PNG to private Storage;
- database stores path;
- signed URL resolution;
- safe replacement cleanup;
- demo retains local data URLs.

### Mission A6 — Phase A QA

Scope:

- automated checks;
- two-account RLS tests;
- browser demo zero-write test;
- trusted Telegram persistence test;
- blocker report only if red.

## Checks

Documentation-only design task.

Not run:

- lint;
- build;
- test;
- SQL migration;
- Supabase policy test;
- Storage policy test.

## Changes made

- Added this Phase A design contract only.
- No runtime code changed.
- No SQL applied.
- No auth, RLS, schema, migration, Storage bucket, secret or production data changed.

## Next step

Review and approve the contract. Then run Mission A1 as a separate, explicitly approved Supabase design/patch task without applying it to production.
