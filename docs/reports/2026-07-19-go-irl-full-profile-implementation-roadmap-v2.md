---
title: GO IRL Full Profile Implementation Roadmap v2
owner: Chief Product Officer / Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# GO IRL Full Profile Implementation Roadmap v2

## Task

Define the complete product and technical implementation sequence for the GO IRL user profile from the current `main` branch to a mature trust layer, without expanding the Olomouc closed-beta scope prematurely.

This roadmap supersedes the assumptions in Draft PR #201. It does not replace source-of-truth documents until reviewed and approved.

## Executive decision

The GO IRL profile is a **trust utility for real-life meetings**, not a social-network profile.

The profile must help a user answer four practical questions:

1. Who is this person?
2. Are they connected to this Activity?
3. Do they appear reliable enough to meet in real life?
4. What minimum context helps me decide to join?

The profile must not become:

- a feed;
- a follower graph;
- a popularity contest;
- a people-search product;
- an Instagram-style media gallery;
- a public shame score;
- a dating identity layer;
- a leaderboard.

The implementation order is:

```text
canonical profile
-> public profile projection
-> identity consistency across event surfaces
-> privacy controls and production verification
-> attendance evidence
-> factual organizer reliability
-> RLI shadow ledger
-> optional reputation summary
-> Life Map and achievements
-> Community Contribution
-> hidden Trust and appeals
```

Reputation must never be implemented before attendance evidence exists.

## Authority and evidence reviewed

### GitHub source-of-truth and runtime evidence

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/governance/ARCHIVIST_OPERATING_POLICY.md`
- `docs/automation/DOCUMENTATION_GOVERNANCE_ARCHIVIST.md`
- `docs/onboarding/ARCHIVIST_CHARTER.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- `docs/MVP_STABILIZATION_PLAN.md`
- `docs/DATABASE_SCHEMA_AUDIT.md`
- `docs/UserLifecycle.md`
- `docs/privacy.md`
- `docs/Security.md`
- `docs/reputation.md`
- `docs/Database.md`
- `docs/bible/05-product-requirements-mvp-split.md`
- `docs/bible/08-runtime-boundaries.md`
- `docs/reports/2026-07-19-profile-001-consumer-inventory.md`
- current profile, auth, store, card, chat and share runtime files
- merged profile PRs #204, #205, #206, #209, #211, #213, #217, #219 and #220
- current open avatar-control PR #222
- Draft profile roadmap PR #201

### Google Drive advisory evidence

The reviewed Drive structure includes:

- `Go IRL / GO IRL DOC`;
- repository mirrors and NotebookLM exports;
- `Plans & Roadmaps`;
- `AI Reports`;
- `Reports`;
- `Archive`;
- mirrored Constitution, Market Positioning, ROADMAP and BACKLOG;
- historical repository documentation and code exports;
- advisory Sport Coach roadmap reports.

Drive contains mirrors, exports and advisory reports of different ages. It is not used to override current GitHub `main`, merged PR evidence, migrations or verified runtime behavior.

## Current implementation state

### Completed foundation

The profile foundation is no longer localStorage-only.

Already merged:

- `user_profiles` and `user_profile_interests` schema contract;
- trusted-JWT owner-write and public/private read boundaries;
- atomic `save_my_profile` RPC;
- private `avatars` Storage bucket contract and policies;
- local and Supabase profile repositories;
- shared profile types and mappers;
- repository selection by trusted identity;
- production profile load/save from `ProfileView`;
- demo profile isolation in localStorage;
- private avatar upload and signed URL resolution;
- partial organizer-avatar use in event cards;
- server-side avatar use in Telegram Share;
- mobile profile-avatar UI polishing.

### Current canonical own-profile contract

The editable profile currently contains:

- display name;
- short bio;
- city;
- uploaded avatar path or preset avatar code;
- profile visibility;
- favorite-activity visibility;
- favorite activity IDs;
- server-owned creation and update timestamps.

### Existing historical snapshots

These are still valid and must remain:

- `activities.organizer`;
- `activities.organizer_key`;
- `activity_members.display_name`;
- `activity_chat_messages.sender_display_name`;
- Coach-specific display-name snapshots.

Snapshots protect historical rendering and must not be rewritten whenever a profile changes.

### Current critical gaps

1. `ProfileRepository` supports only own-profile loading; there is no approved public-profile read contract by `userKey`.
2. Other organizers usually fall back to initials or event snapshots.
3. Organizer profile sheet is not backed by a public profile projection.
4. Participant previews use membership snapshots and initials only.
5. Chat messages use stored sender snapshots without profile presentation.
6. Activity creation, joining and chat sending still source names from auth identity rather than the current GO IRL profile.
7. Telegram Share uses the profile avatar but keeps the Activity organizer-name snapshot.
8. Legacy profile-avatar helper logic still overlaps the repository path.
9. Production application of profile migrations, Storage policies and two-account behavior must remain a verified release gate.
10. Open PR #222 is still changing avatar edit interaction and must be resolved before additional avatar UI work.

## Product model

### 1. Auth identity

Owned by `app_users` and trusted Telegram auth.

Contains private provider identity and account state. It is never the public profile payload.

### 2. Editable GO IRL profile

Owned by `user_profiles` and `user_profile_interests`.

The owner may edit only approved product fields. The owner cannot edit counts, trust signals, reliability or reputation.

### 3. Public profile projection

A minimum safe read model for event-related surfaces.

Recommended contract:

```ts
export type PublicProfile = {
  userKey: string;
  displayName: string;
  cityId: string | null;
  bio: string;
  avatarPath: string | null;
  avatarCode: string | null;
  favoriteActivityIds: string[];
  createdAt: string;
};
```

Projection rules:

- returned only when profile visibility allows it;
- favorites included only when their visibility allows it;
- no Telegram ID or username;
- no phone or email;
- no role or admin state;
- no Trust Score;
- no moderation or fraud fields;
- no notification identifiers;
- no raw Storage metadata beyond the approved avatar object path or resolved URL.

### 4. Identity presentation resolver

All UI surfaces should ultimately use one presentation result:

```ts
export type ProfilePresentation = {
  userKey: string;
  displayName: string;
  avatar: string;
  cityId: string | null;
  bio: string;
  favoriteActivityIds: string[];
  source: "profile" | "snapshot" | "fallback";
};
```

Resolution order:

1. readable GO IRL public profile;
2. event, membership, chat or Coach snapshot;
3. safe initials;
4. generic GO IRL fallback.

### 5. Reputation domains

Keep independent:

- confirmed attendance history;
- organizer reliability;
- Real Life Index;
- Community Contribution;
- hidden Trust Score;
- Sport Coach rating.

No combined universal public user score is approved.

## Closed-beta profile scope

Allowed before or during Olomouc closed beta:

- persistent display name;
- avatar;
- city;
- short bio;
- favorite beta activities;
- own profile editor;
- public organizer profile sheet;
- consistent organizer and participant identity across cards, details, chat and Share;
- factual Activity counts only when labels are accurate;
- visibility controls already supported by the schema;
- safe fallback for legacy Activities and users without profiles.

Not allowed as beta expansion:

- public star ratings;
- public Trust Score;
- social feed;
- followers;
- direct messages;
- people search;
- galleries;
- dating profile fields;
- public achievements leaderboard;
- RLI ranking;
- broad privacy matrix;
- multi-city social discovery.

## Delivery roadmap

## Gate 0 — Finish the active avatar interaction work

Status: in progress through PR #222.

Required outcome:

- camera button is the only avatar-selection control;
- preview does not overlap fields;
- keyboard focus remains visible;
- current 320x320 preview decision is stable;
- Android Telegram visual smoke passes;
- profile display avatar remains stable;
- no new avatar redesign begins before this gate closes.

This is a UI gate only. It does not alter the profile architecture.

## PROFILE-002 — Public profile contract

Goal: define and test the read-only profile contract before wiring consumers.

Scope:

- add `PublicProfile` and `ProfilePresentation` types;
- add `loadPublicProfile(userKey)` contract;
- add `loadPublicProfiles(userKeys)` batch contract;
- define private-profile and missing-profile outcomes;
- define snapshot fallback helpers;
- add mapper and fallback tests;
- no UI consumer changes;
- no schema, RLS or migration changes.

Required behavior:

- own profile and another public profile are distinguishable;
- private profile returns no public record;
- hidden favorites are omitted;
- missing rows do not throw a hard UI error;
- snapshots remain available as fallback;
- normal clients never receive private fields.

Definition of done:

- contract tests pass;
- no N+1-only API is introduced;
- no runtime surface is switched yet;
- lint, build and test are green.

## PROFILE-003 — Public profile repository implementation

Goal: implement public reads behind the approved contract.

Scope:

- implement single and batch profile reads;
- map existing profile RLS behavior;
- resolve signed avatar URLs safely;
- add in-memory request deduplication/cache with short lifetime;
- preserve Local/Demo repository isolation;
- no Activity rendering changes.

Key constraints:

- batch reads are mandatory for lists;
- signed URLs are not persisted;
- empty/private profiles return explicit results;
- demo mode performs no production reads;
- service-role credentials never reach the frontend.

Definition of done:

- two-account public/private read test passes;
- batch result preserves requested user keys;
- avatar expiry/failure degrades to initials;
- lint, build and test are green.

## PROFILE-004 — Organizer identity surfaces

Goal: make the organizer profile-backed everywhere a user decides whether to join.

Consumers:

- generic event card;
- sport event card;
- event details;
- organizer profile sheet;
- organizer avatar action;
- own organized-event lists.

Scope:

- use public profile first;
- preserve `activities.organizer` as historical fallback;
- show profile city and bio only when public;
- keep Activity ownership tied to `organizer_key`;
- show accurate event-count facts;
- no reliability score yet.

Definition of done:

- another user's public avatar and name render;
- private/missing profile falls back safely;
- old Activities still render;
- profile changes do not mutate Activity ownership;
- card list uses batch loading;
- lint, build and test are green.

## PROFILE-005 — Participant and chat presentation

Goal: show consistent identity after a user joins without rewriting historical messages or membership rows.

Consumers:

- participant preview;
- participant list;
- pending/join request list;
- Activity Chat sender header;
- organizer approval surfaces.

Scope:

- batch-resolve visible profile presentations;
- retain `activity_members.display_name` and `sender_display_name` as snapshots;
- do not rewrite existing membership or chat records;
- use initials when avatar is unavailable;
- keep chat access controlled by existing membership/RLS rules.

Definition of done:

- participant lists do not create one query per row;
- private profile still has a safe event-specific identity;
- chat history remains readable after profile edits/deletion;
- no private fields leak to participants;
- lint, build and test are green.

## PROFILE-006 — Canonical identity for new snapshots

Goal: use the saved GO IRL profile when creating new historical snapshots.

Write paths:

- create Activity organizer name;
- join/request member display name;
- Activity Chat sender display name;
- future Coach presentation snapshots.

Scope:

- resolve own current profile before a write;
- fall back to trusted auth display name when no profile exists;
- store the resolved name as the historical snapshot;
- never trust an arbitrary client-supplied target identity;
- no backfill of old records.

Definition of done:

- new Activities use the GO IRL display name;
- new memberships and chat messages use the same name;
- a failed profile read does not block the core event action;
- old snapshots remain unchanged;
- lint, build and test are green.

## PROFILE-007 — Telegram Share public profile projection

Goal: use the same safe profile identity in server-generated Share cards.

Scope:

- load organizer public profile server-side by `organizer_key`;
- use profile display name and avatar when readable;
- fall back to Activity organizer snapshot;
- retain Telegram `photo_url` only as a last-session fallback or remove it after compatibility review;
- prevent private profile data from entering share tokens or rendered card payloads;
- keep avatar-host allowlisting.

Definition of done:

- Share and in-app card display the same public identity;
- private profile never leaks bio/interests;
- expired avatar URL degrades safely;
- old Activities still create a card;
- share tests and security allowlist tests pass.

## PROFILE-008 — Profile privacy and semantic cleanup

Goal: make current visibility settings understandable and remove misleading labels.

Scope:

- expose profile visibility and favorite visibility only if UX is simple enough for beta;
- clarify the difference between public profile city and selected discovery city;
- correct any statistic labeled as attendance when it is only membership;
- add precise loading, empty, save-error and private-profile states;
- document account deletion/export as future governed work;
- do not add a complex privacy matrix.

Definition of done:

- users understand what other participants can see;
- private profile behavior is visible before save;
- joined count is never described as confirmed attendance;
- production errors never silently write demo data;
- translations are complete for supported languages.

## PROFILE-009 — Beta production verification

Goal: prove the profile works across actual runtime boundaries.

Automated gates:

- lint;
- typecheck/build;
- tests;
- public/private contract tests;
- batch resolver tests;
- snapshot fallback tests;
- no-private-field payload tests.

Manual matrix:

1. Browser Demo Mode saves locally and makes zero profile-table or avatar-bucket writes.
2. Telegram user A creates and edits a profile.
3. User A sees the saved profile after reopening the Mini App.
4. Telegram user B sees A when public.
5. User B does not see private A profile fields.
6. B sees safe event snapshots when A is private.
7. A creates an event and Share displays the approved identity.
8. B joins and participant/chat identity remains consistent.
9. Old events without profiles still render.
10. Vercel deployment and real Telegram Android smoke are green.

Beta exit criteria:

- identity is consistent across own profile, event card, details, participants, chat and Share;
- no private identity leakage;
- no N+1 profile loading in event lists;
- no demo-to-production write path;
- all quality gates are green.

## Post-beta trust programme

The following phases require explicit product approval and separate schema/RLS missions. They are not part of the current profile-consistency sprint.

## ATTEND-001 — Attendance evidence

Purpose: create trustworthy evidence of real attendance.

First release:

- organizer confirmation only;
- explicit `confirmed`, `no_show`, `late_cancel`, `excused`, `disputed` states;
- no QR code;
- no geolocation;
- no automatic penalties;
- old events are not backfilled as attended.

Only after this is stable may participant-to-participant confirmation be considered.

## ORGANIZER-001 — Factual organizer reliability

Public facts after a minimum sample:

- completed organized Activities;
- cancellation facts;
- attendance confirmation coverage;
- recent completion history;
- `New organizer` or `Not enough data` when sample is insufficient.

No stars, open public reviews, universal score or leaderboard.

## RLI-001 — Shadow ledger

Start with a private shadow ledger:

- immutable entries;
- idempotency key;
- evidence reference;
- reason code and policy version;
- reversal entries instead of deletion;
- no public score initially.

Only after audit and abuse review may a minimal RLI band or confirmed-count summary be exposed.

## LIFE-001 — Life Map and achievements

Derived only from confirmed evidence:

- categories tried;
- active weeks;
- confirmed Activities;
- organized Activities;
- personal milestones.

Private by default. No comparison between users.

## CONTRIBUTION-001 — Community Contribution

Separate evidence for helping the community:

- newcomer support;
- healthy organizing;
- community building;
- future ambassador/moderator work.

No numeric Community Score and no automatic conversion into RLI or Trust.

## TRUST-001 — Hidden Trust, moderation and appeals

Internal only:

- service/moderator-written trust events;
- private risk projection;
- case linkage;
- retention rules;
- moderator audit log;
- appeals before severe automated penalties;
- anti-bias review.

Normal clients must never read Trust Score or protected trust events.

## COACH-PROFILE-001 — Shared identity, separate Coach reputation

Coach uses the same base GO IRL display name and avatar, but keeps separate:

- Coach bio;
- sports and languages;
- assignment history;
- sport-specific review dimensions;
- Coach rating.

Coach reviews must require a confirmed Coach assignment and confirmed reviewer attendance. Coach rating must not automatically change RLI, organizer reliability or Trust.

## Technical architecture guardrails

### No architecture rewrite

- keep `app_users` as the trusted identity anchor;
- keep `user_key` compatibility;
- keep `activities` and current membership/chat tables during beta;
- keep snapshots for historical compatibility;
- extend repositories incrementally;
- do not migrate to future `users`/`events` architecture in this programme.

### Query performance

- batch profile reads for cards, lists and chat;
- deduplicate keys before querying;
- short in-memory cache only;
- no persisted signed URLs;
- no request per participant or per card.

### Privacy and security

- frontend receives only public projection fields;
- service-role use remains server-side;
- profile writes remain owner-only through trusted identity;
- private profile fallback uses snapshots, not hidden profile fields;
- no Telegram ID, username, phone, email or role in public payloads;
- Trust and moderation data are never joined into public profile reads.

### Historical compatibility

- snapshot names remain immutable history;
- profile edits affect current presentation, not ownership;
- deleted/private profile still leaves safe Activity context;
- no automatic localStorage-to-production import;
- no mass backfill without a separately approved migration.

## Product metrics

Profile work is successful only if it improves the offline conversion loop.

Primary measures:

- profile completion rate after first Activity interaction;
- percentage of event cards with a resolved GO IRL identity;
- organizer profile open -> join conversion;
- join conversion for events with a complete organizer profile versus fallback-only identity;
- profile save success rate;
- avatar load failure rate;
- Share identity consistency rate;
- repeat organizer and repeat participant rate after attendance exists.

Do not optimize for:

- profile page time;
- profile views as vanity metric;
- follower count;
- content posting volume;
- public ranking engagement.

## Known risks and decisions required

1. PR #222 is open and changes avatar interaction. Resolve it before more avatar UX work.
2. Draft PR #201 is based on an old repository state and should not be merged as-is. This v2 roadmap should supersede it after review.
3. README and some Drive mirrors contain stale statements about profile/avatar production persistence.
4. Root `supabase/schema.sql` does not represent every newer profile migration; migration and production-state verification remains authoritative.
5. Existing public-profile RLS must be verified in the actual target environment before consumer rollout.
6. Signed avatar URLs require safe expiry and failure handling.
7. Profile-first rendering can cause N+1 queries unless batch resolution is mandatory.
8. Current Activity and chat snapshots must not be mistaken for live profile fields.
9. Attendance, RLI and Trust must remain blocked until separate product, privacy and Supabase approvals.

## Immediate execution decision

Start only **PROFILE-002 — Public profile contract** after the active avatar PR is resolved.

PROFILE-002 must be a contract-and-tests task only:

- add public types;
- add single and batch repository interfaces;
- define private/missing outcomes;
- define profile/snapshot/fallback source semantics;
- add tests;
- do not wire event cards yet;
- do not change auth, RLS, schema, migrations, secrets or `.env`.

## Changes made

- Added this updated docs-only roadmap on a new branch.
- No runtime code changed.
- No Supabase schema, RLS, migration, auth, Storage, secret, `.env` or production data changed.
- No Google Drive mirror was modified before GitHub review and merge.

## Checks

- GitHub source-of-truth and current runtime evidence were reviewed.
- Google Drive mirrors and advisory reports were sampled and reconciled against GitHub.
- Current merged profile implementation and open profile-related PRs were reviewed.
- No application checks were required because this change is documentation-only.

## Next step

Human review this roadmap. After approval:

1. mark Draft PR #201 as superseded;
2. merge this roadmap through a reviewed PR;
3. refresh the approved Drive mirror from the merged commit;
4. execute PROFILE-002 as the next isolated code mission.
