---
title: GO IRL Profile Work Complete Report and Roadmap
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
work_id: PLAN1158
last_review: 2026-07-19
next_review: 2026-07-26
source_repository: vitvolny26-art/GO-IRL-1.0
source_branch: docs/plan1000-profile-work-report-roadmap
---

# GO IRL Profile Work Complete Report and Roadmap

## Task

Record the complete implementation work delivered for the GO IRL profile identity layer, reconcile it with current GitHub evidence and Google Drive operating instructions, and publish the full remaining roadmap from the current merged state through production verification and the post-beta trust programme.

This report supersedes the implementation-state assumptions in Draft PR #224. GitHub `main` remains authoritative for code, runtime behavior, tests, schemas, migrations, and merged durable documentation. Google Drive is a controlled mirror and instruction workspace only.

## Executive summary

The profile programme has moved from a local own-profile editor to a reusable public identity layer across the most important organizer surfaces.

Completed and merged:

1. PROFILE-002 — read-only public profile contract.
2. PROFILE-003 — batch public profile repository with deduplication and short cache.
3. PROFILE-004A — profile-first organizer identity on generic and sport cards plus organizer profile sheet.
4. PROFILE-004B — profile-first organizer identity in generic and sport event details.

The implementation now follows one presentation rule:

```text
readable public GO IRL profile
-> historical Activity snapshot
-> initials
-> safe generic fallback
```

This preserves privacy and historical compatibility while allowing current public profile data to improve trust on join-decision surfaces.

No profile phase in this programme changed auth, Supabase RLS, schema, migrations, secrets, service-role exposure, destructive SQL, or production data.

Automated CI passed for every merged phase. Manual two-account, production RLS, Vercel and Telegram Android smoke remain release gates and must not be reported as completed.

## Authority and instructions reviewed

### Google Drive operating instruction

Reviewed `03 — GO IRL Role — Chief Archivist & Technical Lead`.

Applied rules:

- GitHub main controls implementation state and durable project documentation.
- Google Drive controls current AI role and operating instructions until repository reconciliation.
- Durable reports are created in `docs/reports/` first.
- Drive mirrors are created only after the GitHub source is merged or when explicitly review-only.
- Drive reports must be marked `source_of_truth: false`.
- Final human-facing reports belong in `Go IRL/Reports`.
- Review-pending AI reports belong in `Go IRL/AI Reports/Inbox`.
- No GO IRL files are created in Drive root.
- No success claim is allowed without tool evidence.

### GitHub source-of-truth reviewed

- `ROADMAP.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/reports/2026-07-19-profile-002-public-profile-contract.md`
- `docs/reports/2026-07-19-profile-003-batch-public-profile-resolver.md`
- `docs/reports/2026-07-19-profile-004a-organizer-cards-profile-sheet.md`
- `docs/reports/2026-07-19-profile-004b-organizer-event-details.md`
- Draft PR #224 roadmap v2
- merged PRs #222, #225, #228, #231 and #233
- CI runs #729, #739, #744 and #750

## Product decision

The GO IRL profile is a trust utility for real-life meetings, not a social-network profile.

It should help users answer:

1. Who is this person?
2. What is their role in this Activity?
3. Is the visible identity consistent enough to support a join decision?
4. What minimum public context is useful without exposing private account data?

The profile must not become:

- a feed;
- a follower graph;
- a people-search product;
- a media gallery;
- a dating identity layer;
- a public shame score;
- a universal reputation number;
- a leaderboard.

## Work completed

## Gate 0 — Avatar interaction stabilization

Status: completed and merged before the public identity work.

PR #222:

- camera button became the only avatar-selection control;
- full 320x320 preview was preserved;
- photo-area click handling was disabled;
- file input was limited to the camera control;
- keyboard focus visibility was preserved.

Merge commit:

`882a1700a3560ce0f626727b8753f70b7ade1afc`

This gate changed UI interaction only and did not alter profile architecture.

## PROFILE-002 — Public profile contract

Status: completed and merged.

PR #225

Merge commit:

`6bb98b14a2704f91d35f2061058229eb94aa786f`

Delivered:

- added `PublicProfile`;
- added `ProfileRepository.loadPublicProfile(userKey)`;
- added public projection mapping;
- private profiles return `null`;
- hidden favorite activities are omitted from public reads;
- owner reads retain hidden favorite activities;
- Local/Demo and Supabase implementations were added;
- focused regression tests were added;
- no UI consumer was switched.

Public contract:

```ts
export type PublicProfile = {
  userKey: string;
  displayName: string;
  bio: string;
  cityId: string;
  avatarPath: string | null;
  avatarCode: string | null;
  favoriteActivityIds: string[];
  updatedAt: string;
};
```

Security outcome:

- owner-only visibility flags are not exposed through the public projection;
- hidden interests remain private;
- missing/private records do not hard-fail the UI;
- historical snapshots remain available as fallback.

CI:

- workflow run #729;
- test, typecheck, lint and build passed.

## PROFILE-003 — Batch public profile repository

Status: completed and merged.

PR #228

Merge commit:

`f922b95ef1f46956d3281c8e4aa032aa9a58ba03`

Delivered:

- added `loadPublicProfiles(userKeys)`;
- added `PublicProfileMap`;
- deduplicated requested user keys;
- preserved first-seen key order;
- returned explicit `null` values for missing/private profiles;
- implemented one Supabase profile query and at most one visible-interests query per uncached batch;
- added a 30-second in-memory cache for profiles and `null` results;
- invalidated the current user's cached public profile after save;
- kept Local/Demo mode isolated from production reads;
- added tests for public, private, missing, hidden favorites, deduplication, cache hit, cache expiry and demo isolation.

Performance outcome:

- list consumers are no longer forced into N+1-only public-profile loading;
- duplicate keys within one batch do not create duplicate reads;
- signed URLs are not persisted in the profile record;
- service-role credentials remain outside the frontend.

Known limitation:

- there is no cross-call in-flight promise coalescing; current protection is key deduplication plus short TTL cache.

CI:

- workflow run #739;
- test, typecheck, lint and build passed.

## PROFILE-004A — Organizer cards and profile sheet

Status: completed and merged.

PR #231

Merge commit:

`111ba9e96ba927109696b7f22885e19df6351d09`

Delivered:

- added a microtask organizer identity resolver;
- card requests are batched through `loadPublicProfiles`;
- public profile display name, bio, city and avatar take precedence;
- Activity organizer snapshot remains fallback;
- initials remain avatar fallback;
- signed-avatar resolution failure degrades safely;
- generic and sport cards continue to share one organizer action;
- organizer profile sheet now receives canonical organizer identity;
- legacy localStorage name matching was removed from this presentation path;
- Local/Demo isolation was preserved;
- focused tests cover batching, profile-first presentation, explicit fallback and avatar failure.

Organizer identity presentation type:

```ts
export type OrganizerIdentity = {
  organizerKey: string;
  displayName: string;
  bio: string;
  cityId: string;
  avatar: string;
};
```

Fallback order:

1. readable public profile;
2. Activity organizer name snapshot;
3. avatar code or initials;
4. safe generic fallback.

Scope exclusions maintained:

- event details;
- participant lists;
- chat;
- Telegram Share;
- auth;
- RLS;
- schema;
- migrations;
- secrets;
- production data.

CI:

- workflow run #744;
- test, typecheck, lint and build passed.

## PROFILE-004B — Organizer identity in event details

Status: completed and merged.

PR #233

Merge commit:

`16fc5532945e782ec6d07e67eece238822f99bd1`

Delivered:

- added a shared organizer detail action using the PROFILE-004A resolver;
- generic event details use the canonical public organizer identity;
- sport event details gained the missing organizer identity row;
- clicking the organizer detail row opens the existing organizer profile sheet;
- public profile name and avatar take precedence;
- Activity snapshot and initials remain fallback;
- implementation avoided duplicating public-profile loading in two large sheet files;
- final review corrected organizer-row detection so sport organizer tips are not hidden accidentally;
- sheet-to-Activity matching uses title plus description to reduce collisions between Activities with the same title.

Implementation files:

- `src/components/EventCardPrimitives.tsx`
- `src/components/OrganizerEventDetailsPortal.tsx`
- `src/main.tsx`
- `src/organizer-event-details.css`
- `docs/reports/2026-07-19-profile-004b-organizer-event-details.md`

Scope exclusions maintained:

- participants;
- chat;
- Share;
- auth;
- RLS;
- schema;
- migrations;
- secrets;
- production data.

CI:

- workflow run #750;
- test, typecheck, lint and build passed.

## Current merged architecture

### Identity anchors

- `app_users` and trusted Telegram authentication remain account identity anchors.
- `user_profiles` and `user_profile_interests` remain editable GO IRL profile storage.
- `organizer_key`, member `user_key`, chat sender key and Coach keys remain ownership and relationship identifiers.

### Historical snapshots retained

The following snapshots must remain and must not be rewritten when profiles change:

- `activities.organizer`;
- `activity_members.display_name`;
- `activity_chat_messages.sender_display_name`;
- Coach-specific presentation snapshots.

They provide durable historical context when:

- a profile becomes private;
- a profile is deleted;
- a profile name changes;
- a public profile read fails;
- old Activities predate profile support.

### Public presentation rule

Current organizer surfaces resolve:

```text
public profile
-> Activity snapshot
-> initials
-> generic fallback
```

### Privacy boundary

Public profile reads must never expose:

- Telegram ID;
- Telegram username;
- phone;
- email;
- admin or internal role state;
- Trust Score;
- moderation data;
- fraud/risk signals;
- notification identifiers;
- service-role credentials.

## Checks and evidence

### Automated checks completed

| Phase | PR | CI run | Result |
|---|---:|---:|---|
| PROFILE-002 | #225 | #729 | success |
| PROFILE-003 | #228 | #739 | success |
| PROFILE-004A | #231 | #744 | success |
| PROFILE-004B | #233 | #750 | success |

Each run completed:

- tests;
- TypeScript typecheck;
- lint;
- production build.

### Manual checks not yet evidenced

The following remain pending until explicitly performed and recorded:

- two-account public/private profile behavior in the target Supabase environment;
- production migration and RLS verification;
- private avatar bucket and signed URL behavior under real expiry/failure;
- Vercel deployment verification from current `main`;
- Telegram Android visual smoke for organizer cards, details and profile sheet;
- old Activity rendering with missing profile rows;
- duplicate-title Activities in real UI;
- browser Demo Mode verification that no production profile reads/writes occur.

No report may claim beta-ready before these gates are completed.

## Known risks and technical debt

1. The event-details portal detects the active Activity from rendered title and description because the current sheet components do not expose a stable Activity ID hook. This is a bounded compatibility patch, not the ideal long-term interface.
2. Duplicate title and description combinations can still be ambiguous. A future small refactor should expose `data-activity-id` or render the organizer component directly when safe.
3. Public profile reads depend on actual production RLS matching repository assumptions.
4. Signed avatar URLs require expiry and failure smoke testing.
5. Participant and chat consumers still use historical snapshots only.
6. New Activity, member and chat snapshots may still source names from trusted auth rather than the saved GO IRL profile.
7. Telegram Share identity is not yet aligned with the in-app public projection.
8. README, ROADMAP release-gate text and some Drive mirrors may be stale relative to current merged code.
9. Draft PR #224 contains the original roadmap state and should be closed as superseded after this report is reviewed.
10. Attendance, RLI, organizer reliability and Trust remain blocked until separate product, privacy and Supabase approvals.

# Full roadmap from current state

## Delivery order

```text
PROFILE-005 participant/chat presentation
-> PROFILE-006 canonical identity for new snapshots
-> PROFILE-007 Telegram Share identity consistency
-> PROFILE-008 privacy and semantic cleanup
-> PROFILE-009 production verification
-> ATTEND-001 attendance evidence
-> ORGANIZER-001 factual organizer reliability
-> RLI-001 private shadow ledger
-> LIFE-001 private Life Map and achievements
-> CONTRIBUTION-001 community contribution evidence
-> TRUST-001 hidden trust, moderation and appeals
-> COACH-PROFILE-001 shared identity with separate Coach reputation
```

## PROFILE-005 — Participant and chat presentation

Goal:

Show consistent profile-first identity after joining while preserving member and message snapshots as historical fallback.

Consumers:

- card participant preview;
- full participant list;
- waiting list;
- pending request list;
- organizer approval surfaces;
- Activity Chat sender header/avatar.

Required implementation:

- inventory every member/chat consumer before editing;
- batch-resolve visible public profiles by unique `userKey`;
- preserve `activity_members.display_name` and `sender_display_name` as immutable snapshots;
- do not rewrite old membership or chat rows;
- private/missing profiles render event-specific snapshot identity;
- avatar failure degrades to initials;
- existing membership and chat access control remains unchanged;
- no one-query-per-member or one-query-per-message implementation.

Definition of done:

- participant surfaces use batch loading;
- chat history remains readable after profile rename, privacy change or deletion;
- no private fields leak;
- generic and sport surfaces remain consistent;
- tests cover public/private/missing profiles and batch behavior;
- test, typecheck, lint and build pass.

## PROFILE-006 — Canonical identity for new snapshots

Goal:

Use the saved GO IRL own profile as the preferred source when writing new historical snapshots.

Write paths:

- Activity organizer snapshot;
- join/request member display name;
- Activity Chat sender display name;
- future Coach presentation snapshots.

Required implementation:

- load the current user's own profile before a write when available;
- fall back to trusted auth display name when profile read fails or no profile exists;
- store the resolved name as a snapshot;
- never trust an arbitrary client-provided target identity;
- do not backfill old rows;
- core event actions must still work if profile loading fails.

Definition of done:

- newly created Activities use the GO IRL profile name;
- new joins/requests use the same current profile name;
- new chat messages use the same current profile name;
- old snapshots remain unchanged;
- failure fallback is tested;
- test, typecheck, lint and build pass.

## PROFILE-007 — Telegram Share identity consistency

Goal:

Use the same approved public organizer identity in server-generated Share cards and text.

Required implementation:

- server-side lookup by `organizer_key`;
- public profile name/avatar when readable;
- Activity organizer snapshot fallback;
- no bio or interests in share payload unless explicitly approved;
- no private profile leakage into tokens, URLs or rendered metadata;
- signed URL/asset host allowlist preserved;
- legacy Telegram `photo_url` reviewed as last-session fallback only.

Definition of done:

- Share and in-app card show the same public organizer identity;
- private profiles fall back to Activity snapshots;
- expired avatar resolution does not break Share;
- old Activities still generate valid Share output;
- security and share tests pass.

## PROFILE-008 — Privacy and semantic cleanup

Goal:

Make profile visibility understandable and eliminate misleading trust labels before production verification.

Required implementation:

- expose profile visibility and favorites visibility only with simple beta UX;
- clearly distinguish public profile city from discovery city;
- ensure membership counts are not labelled confirmed attendance;
- add explicit loading, private, empty and error states;
- ensure production failures never silently write Demo Mode data;
- complete translations for supported languages;
- document deletion/export as future governed work;
- avoid a broad privacy matrix.

Definition of done:

- user can understand what another participant can see;
- private behavior is visible before save;
- no false attendance/reliability claims;
- all states are translated and testable;
- quality gates pass.

## PROFILE-009 — Beta production verification

Goal:

Prove the complete profile identity system across actual runtime boundaries.

Automated gates:

- test;
- typecheck;
- lint;
- build;
- public/private projection tests;
- batch resolver tests;
- snapshot fallback tests;
- no-private-field payload tests;
- Share identity tests.

Manual matrix:

1. Browser Demo Mode stores profile data locally only.
2. Demo Mode performs no profile-table or avatar-bucket writes.
3. Telegram user A creates and edits a profile.
4. A reopens the Mini App and sees persisted data.
5. Telegram user B sees A when public.
6. B cannot see private A fields.
7. B sees Activity snapshots when A is private or missing.
8. A creates an Activity and the organizer identity is consistent on card, details and Share.
9. B joins and participant/chat presentation is consistent.
10. Old Activities without profiles remain readable.
11. Signed avatar expiry/failure degrades safely.
12. Vercel deployment is healthy.
13. Real Telegram Android smoke is green.
14. Target Supabase RLS and migrations are verified explicitly.

Beta exit criteria:

- identity is consistent across own profile, cards, details, participants, chat and Share;
- no private identity leakage;
- no N+1 profile loading;
- no Demo-to-production write path;
- no misleading attendance labels;
- automated and manual gates are recorded green.

# Post-beta trust programme

These phases require explicit owner approval and separate schema/RLS/privacy work. They are not part of the current profile-consistency sprint.

## ATTEND-001 — Attendance evidence

Purpose:

Create trustworthy evidence that a person attended a real Activity.

First release:

- organizer confirmation only;
- states: `confirmed`, `no_show`, `late_cancel`, `excused`, `disputed`;
- no QR requirement;
- no geolocation requirement;
- no automatic penalty;
- no retroactive backfill of old events as attended.

Required controls:

- immutable or auditable attendance events;
- explicit dispute path;
- idempotency;
- organizer abuse review;
- retention policy;
- clear separation from simple membership/join state.

Gate:

No public reliability, RLI or achievements based on attendance before this evidence layer is stable.

## ORGANIZER-001 — Factual organizer reliability

Purpose:

Expose factual organizing history after sufficient evidence exists.

Allowed public facts after a minimum sample:

- completed organized Activities;
- cancellation facts;
- attendance-confirmation coverage;
- recent completion history;
- `New organizer` or `Not enough data` state.

Not allowed:

- universal stars;
- open public review wall;
- public shame score;
- leaderboard;
- hidden moderation signals in public payloads.

## RLI-001 — Real Life Index shadow ledger

Purpose:

Develop an auditable private evidence ledger before exposing any user-facing reputation summary.

Required design:

- immutable entries;
- idempotency key;
- evidence reference;
- reason code;
- policy version;
- reversal entries instead of deletion;
- actor and timestamp audit;
- no public score initially.

Only after abuse, bias and appeal review may a minimal band or confirmed-count summary be considered.

## LIFE-001 — Life Map and achievements

Purpose:

Show personal offline progress derived only from confirmed evidence.

Possible private metrics:

- categories tried;
- active weeks;
- confirmed Activities;
- organized Activities;
- personal milestones.

Rules:

- private by default;
- no ranking;
- no comparison between users;
- no achievement based on unconfirmed membership alone.

## CONTRIBUTION-001 — Community Contribution

Purpose:

Record helpful community behavior separately from attendance and trust.

Possible evidence:

- newcomer support;
- healthy organizing;
- community building;
- future ambassador/moderator work.

Rules:

- no single public Community Score;
- no automatic conversion into RLI;
- no automatic conversion into Trust;
- evidence and policy must remain auditable.

## TRUST-001 — Hidden Trust, moderation and appeals

Purpose:

Support safety and abuse prevention through internal controls.

Internal-only capabilities:

- service/moderator-written trust events;
- private risk projection;
- moderation case linkage;
- retention policy;
- moderator audit log;
- appeals before severe automated penalties;
- anti-bias review.

Hard boundary:

Normal clients must never read Trust Score, protected trust events or moderation reasoning.

## COACH-PROFILE-001 — Shared identity, separate Coach reputation

Purpose:

Use the same base GO IRL display name and avatar while keeping Coach-specific evidence separate.

Coach-specific fields may include:

- Coach bio;
- sports;
- languages;
- assignment history;
- sport-specific review dimensions;
- Coach rating.

Eligibility rules:

- confirmed Coach assignment required;
- confirmed reviewer attendance required;
- Coach rating must not automatically alter RLI;
- Coach rating must not automatically alter organizer reliability;
- Coach rating must not automatically alter hidden Trust.

# Technical guardrails

## No architecture rewrite

- keep `app_users` as trusted identity anchor;
- keep `user_key` compatibility;
- keep existing Activity, membership and chat tables during beta;
- keep historical snapshots;
- extend repository and presentation layers incrementally;
- do not migrate to a speculative future users/events architecture in this programme.

## Query performance

- batch public-profile reads for lists;
- deduplicate user keys;
- short in-memory cache only;
- no persisted signed URLs;
- no request per participant, message or card;
- measure cache and avatar failure rates before optimization.

## Privacy and security

- frontend receives only approved public projection fields;
- owner writes remain bound to trusted identity;
- service-role use remains server-side;
- private profile fallback uses snapshots, not hidden fields;
- Trust/moderation data never joins public profile reads;
- no auth, RLS or migration changes without explicit owner approval.

## Historical compatibility

- profile edits affect current presentation, not historical ownership;
- old snapshots remain readable;
- deleted/private profiles leave safe Activity context;
- no automatic localStorage-to-production import;
- no mass backfill without separate migration review.

# Product metrics

Primary profile metrics:

- profile completion rate after first Activity interaction;
- percentage of event cards with resolved GO IRL identity;
- organizer-profile open to join conversion;
- join conversion with complete profile versus snapshot-only identity;
- profile save success rate;
- avatar resolution failure rate;
- Share identity consistency rate;
- participant/chat identity fallback rate.

After attendance exists:

- repeat participant rate;
- repeat organizer rate;
- confirmed attendance rate;
- organizer confirmation coverage.

Do not optimize for:

- profile-page time;
- profile views as a vanity metric;
- follower count;
- posting volume;
- public ranking engagement.

# Recommended next actions

## Immediate

1. Close Draft PR #224 as superseded by this updated report after review.
2. Merge this report after docs review.
3. Create the Google Drive mirror in `Go IRL/Reports` after merge.
4. Start PROFILE-005 as the next isolated implementation mission.

## PROFILE-005 task boundary

Allowed:

- participant preview/list identity;
- pending/waiting/request identity;
- chat sender presentation;
- batch public profile reads;
- snapshot and initials fallback;
- focused tests.

Forbidden in the same task:

- Share changes;
- canonical write-path changes;
- attendance;
- reliability;
- RLI;
- Trust;
- auth;
- RLS;
- schema;
- migrations;
- secrets;
- production data.

## Files inspected

- Google Drive `03 — GO IRL Role — Chief Archivist & Technical Lead`
- `ROADMAP.md`
- Draft roadmap PR #224
- PR #222
- PR #225
- PR #228
- PR #231
- PR #233
- merged profile phase reports
- CI runs #729, #739, #744 and #750

## Findings

- Public organizer identity is now implemented across cards, organizer sheet and event details.
- Batch read architecture and fallbacks are in place.
- Participants, chat and Share remain the next consistency gaps.
- Automated quality gates are green for all delivered profile phases.
- Production and two-account verification remain pending.
- Draft PR #224 is stale relative to merged PROFILE-002 through PROFILE-004B work.

## Changes made

- Added this consolidated implementation report.
- Updated phase status using merged PR and CI evidence.
- Added the complete remaining profile roadmap.
- Added the post-beta attendance, reliability, RLI, Life Map, contribution, Trust and Coach boundaries.
- No runtime, auth, RLS, schema, migration, secret, Storage policy or production-data change was made.

## Checks

- All referenced implementation PRs are merged.
- CI #729, #739, #744 and #750 completed successfully.
- This change is documentation-only.
- Manual production and Telegram smoke checks remain explicitly pending.

## Next step

Human review and merge this report, then mirror the merged source to `Go IRL/Reports` and begin PROFILE-005 as one isolated task.
