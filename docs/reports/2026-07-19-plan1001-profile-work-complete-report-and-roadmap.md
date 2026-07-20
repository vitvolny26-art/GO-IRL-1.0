---
title: GO IRL Profile Work Complete Report and Roadmap
owner: Chief Archivist / Technical Lead
status: Complete
source_of_truth: false
work_id: PLAN1001
last_review: 2026-07-19
next_review: 2026-07-26
source_repository: vitvolny26-art/GO-IRL-1.0
source_branch: main
---

# GO IRL Profile Work Complete Report and Roadmap

## Task

Document the complete profile and identity work completed on 2026-07-19, reconcile it with the active Google Drive operating instruction, and publish the full remaining roadmap from the current `main` branch through production verification and later trust layers.

This report supersedes the stale implementation-state assumptions in Draft PR #224. GitHub `main` remains authoritative for merged code, runtime behavior, tests and durable project documentation. Google Drive is a controlled mirror and instruction workspace, not the code source of truth.

## Executive summary

The profile programme has moved from an own-profile editor to a reusable public identity layer.

Completed and merged:

- avatar interaction gate;
- read-only public profile contract;
- single and batch public-profile repository reads;
- deduplicated list loading and a short in-memory cache;
- profile-first organizer identity on generic and sport event cards;
- organizer profile sheet backed by public profile data;
- profile-first organizer identity in generic and sport event details;
- safe fallback to immutable Activity snapshots and initials;
- focused tests and four green GitHub Actions runs.

The current implementation does not modify auth, RLS, schema, migrations, secrets or production data. Participant, chat and Telegram Share identity consistency remain unfinished. Production two-account and Telegram Android smoke verification also remain open.

## Governing instruction read

Google Drive document `03 — GO IRL Role — Chief Archivist & Technical Lead` was read before writing this report.

Applied rules:

- GitHub `main` controls code, implementation state and merged durable reports;
- Drive controls current AI operating instructions until repository reconciliation;
- durable knowledge is first written to `docs/reports/`;
- a Drive mirror is created only after the GitHub source is merged;
- Drive reports must remain `source_of_truth: false`;
- reports belong in `Go IRL/Reports`, not Drive root;
- no success claim is allowed without tool evidence;
- one task at a time, minimal patches, pnpm only for code checks;
- no `.env`, secrets, auth, RLS, destructive SQL, migrations or production-data changes without explicit approval.

## Files and evidence inspected

### Google Drive

- `03 — GO IRL Role — Chief Archivist & Technical Lead`;
- `00 — GO IRL AI Instructions — Index`;
- mirrored AI Successor Instructions;
- mirrored ChatGPT Project Setup;
- mirrored ROADMAP and BACKLOG;
- documentation governance and migration reports.

### GitHub

- `ROADMAP.md`;
- Draft PR #224 and its full profile roadmap;
- merged PR #222;
- merged PR #225;
- merged PR #228;
- merged PR #231;
- merged PR #233;
- phase reports for PROFILE-002, PROFILE-003, PROFILE-004A and PROFILE-004B;
- GitHub Actions runs #729, #739, #744 and #750.

## Work completed

## Gate 0 — Avatar interaction

Status: Complete and merged.

PR: #222  
Merge commit: `882a1700a3560ce0f626727b8753f70b7ade1afc`

Outcome:

- the camera button is the only avatar-selection control;
- the 320x320 preview is retained;
- the camera control is contained inside the preview corner;
- the photo surface no longer opens file selection;
- keyboard focus remains visible.

## PROFILE-002 — Public profile contract

Status: Complete and merged.

PR: #225  
Merge commit: `6bb98b14a2704f91d35f2061058229eb94aa786f`  
CI: #729 — success.

Delivered:

- `PublicProfile` read model;
- `loadPublicProfile(userKey)` repository contract;
- mapper returning `null` for private profiles;
- hidden favorite activities omitted from public projection;
- owner reads continue to preserve hidden favorites;
- Local/Demo and Supabase implementations;
- focused regression tests.

Public fields are limited to approved presentation data. Owner-only visibility flags and private identity data are not exposed.

## PROFILE-003 — Batch public-profile repository

Status: Complete and merged.

PR: #228  
Merge commit: `f922b95ef1f46956d3281c8e4aa032aa9a58ba03`  
CI: #739 — success.

Delivered:

- `loadPublicProfiles(userKeys)`;
- `PublicProfileMap` with explicit `null` results;
- deduplication of requested keys;
- first-seen key order preservation;
- at most one profile query and one visible-interests query per uncached Supabase batch;
- 30-second in-memory cache for profiles and negative results;
- cache invalidation after own-profile save;
- Local/Demo isolation with zero production reads for unrelated users;
- tests for public, private, missing, cache, expiry and deduplication behavior.

Known limitation:

- there is no cross-call in-flight Promise deduplication; the implemented protection is key deduplication plus TTL cache. This is acceptable for the current beta scope and may be revisited only if profiling shows duplicate concurrent calls.

## PROFILE-004A — Organizer cards and profile sheet

Status: Complete and merged.

PR: #231  
Merge commit: `111ba9e96ba927109696b7f22885e19df6351d09`  
CI: #744 — success.

Delivered:

- microtask batching of organizer identity requests;
- public profile display name, avatar, bio and city take precedence;
- generic and sport cards use the shared organizer action;
- organizer profile sheet uses resolved public identity;
- Activity snapshot name and initials remain fallback for private, missing or failed reads;
- avatar URL failure falls back to avatar code or initials;
- legacy localStorage name matching was removed from the organizer-card identity path;
- focused tests for batching, precedence and fallbacks.

## PROFILE-004B — Organizer identity in event details

Status: Complete and merged.

PR: #233  
Merge commit: `16fc5532945e782ec6d07e67eece238822f99bd1`  
CI: #750 — success.

Delivered:

- one canonical organizer identity row in generic event details;
- one canonical organizer identity row in sport event details;
- clicking the row opens the existing organizer profile sheet;
- the same PROFILE-004A resolver is reused;
- public profile name and avatar take precedence;
- Activity snapshot and initials remain fallback;
- matching uses title plus description to avoid collisions between equal titles;
- organizer-tips rows are not hidden by the organizer-row detector.

Implementation note:

- a small portal layer was used to avoid unsafe full-file rewrites of the large `App.tsx` and `SportVertical.tsx` files. This is a bounded compatibility patch, not an architecture rewrite.

## Quality and safety checks

Verified green GitHub Actions runs:

- CI #729 — PROFILE-002;
- CI #739 — PROFILE-003;
- CI #744 — PROFILE-004A;
- CI #750 — PROFILE-004B.

The CI workflow includes:

- tests;
- TypeScript typecheck;
- lint;
- production build.

Confirmed scope exclusions across the completed phases:

- no auth changes;
- no Supabase RLS changes;
- no schema or migration changes;
- no Storage policy changes;
- no `.env` or secret changes;
- no destructive SQL;
- no production-data changes;
- no participant or chat identity changes;
- no Telegram Share identity change.

Not yet verified:

- two real Telegram accounts testing public versus private profile behavior;
- real Telegram Android visual smoke for all organizer surfaces;
- target-environment migration and RLS state;
- production signed-avatar expiry behavior;
- Vercel production deployment for the latest full profile stack.

## Current product state

The profile is a trust utility for deciding whether to join a real-life Activity. It is not a social network.

Current identity resolution order:

1. readable GO IRL public profile;
2. Activity, membership or chat historical snapshot;
3. safe initials;
4. generic GO IRL fallback.

Historical snapshots remain valid and must not be rewritten after profile edits:

- `activities.organizer`;
- `activities.organizer_key`;
- `activity_members.display_name`;
- `activity_chat_messages.sender_display_name`;
- Coach-specific snapshots.

## Full roadmap

## Phase A — Finish identity consistency for closed beta

### PROFILE-005 — Participant and chat presentation

Priority: Next.

Goal: apply the public-profile presentation resolver after a user joins without rewriting historical membership or chat records.

Consumers:

- participant previews on cards;
- joined participant list;
- waiting list;
- pending join requests;
- organizer approval surfaces;
- Activity Chat sender header/avatar.

Requirements:

- batch-resolve unique visible user keys;
- never query once per participant or message;
- preserve `activity_members.display_name` and `sender_display_name` as immutable fallback snapshots;
- private or missing profile still renders an event-specific snapshot identity;
- avatar failure degrades to initials;
- chat access rules remain unchanged;
- no auth, RLS, schema or migration work in this phase.

Definition of done:

- no N+1 profile requests;
- public participant identity is consistent with organizer surfaces;
- private profile leaks no hidden fields;
- old chat history remains readable after profile edits or deletion;
- test, typecheck, lint and build pass.

### PROFILE-006 — Canonical identity for new snapshots

Goal: use the saved GO IRL display name when new historical records are created.

Write paths:

- new Activity organizer snapshot;
- join/request member snapshot;
- Activity Chat sender snapshot;
- future Coach assignment snapshots.

Requirements:

- resolve the current user's own profile before write;
- fall back to trusted auth display name if no profile exists or read fails;
- never accept an arbitrary target identity from the client;
- never backfill or rewrite old records;
- a profile read failure must not block create, join or chat.

Definition of done:

- create, join and chat produce the same saved GO IRL display name;
- ownership remains tied to `user_key`, never display name;
- old snapshots are unchanged;
- automated checks pass.

### PROFILE-007 — Telegram Share identity consistency

Goal: make Share cards use the same safe public organizer identity as the Mini App.

Requirements:

- server-side lookup by `organizer_key`;
- readable public profile name/avatar first;
- Activity organizer snapshot fallback;
- no private bio or favorites in share payloads;
- no persisted signed URLs;
- keep avatar-host allowlisting;
- expired avatar resolution degrades safely;
- old Activities remain shareable.

Definition of done:

- in-app and Telegram Share organizer identity match;
- private profile does not leak;
- Share security tests pass.

### PROFILE-008 — Privacy and semantic cleanup

Goal: make existing privacy controls understandable and correct misleading statistics.

Requirements:

- clear public/private profile explanation;
- clear favorite-activity visibility explanation;
- distinguish profile city from discovery city;
- never label membership counts as confirmed attendance;
- precise loading, empty, private and save-error states;
- complete RU, UK, CS and EN translations;
- no broad privacy matrix during beta.

### PROFILE-009 — Beta production verification

Goal: prove the entire profile system across actual runtime boundaries.

Automated gates:

- tests;
- typecheck;
- lint;
- build;
- public/private projection tests;
- batch and fallback tests;
- no-private-field payload tests.

Manual matrix:

1. Browser Demo saves locally and performs no production profile or avatar writes.
2. Telegram user A creates and edits a profile.
3. A reopens the Mini App and sees the persisted profile.
4. Telegram user B sees public A profile data.
5. B cannot see private A fields.
6. B sees safe snapshots when A is private.
7. A creates an Activity and all organizer surfaces match.
8. B joins and participant/chat identity stays consistent.
9. Telegram Share matches the approved public identity.
10. Legacy Activities without profiles still render.
11. Signed avatar expiry/failure falls back safely.
12. Vercel production and Telegram Android smoke are green.

Beta exit criteria:

- identity consistency across profile, cards, details, participants, chat and Share;
- no private-field leakage;
- no N+1 profile loading;
- no demo-to-production writes;
- all automated and manual gates green.

## Phase B — Attendance evidence

### ATTEND-001 — Attendance confirmation

Blocked until Phase A is complete and requires explicit product plus Supabase approval.

First release:

- organizer-confirmed attendance;
- states: `confirmed`, `no_show`, `late_cancel`, `excused`, `disputed`;
- evidence and audit timestamps;
- no geolocation;
- no QR requirement;
- no automatic penalties;
- no fake backfill of old events.

Attendance evidence must exist before reputation, organizer reliability or RLI becomes public.

## Phase C — Factual organizer reliability

### ORGANIZER-001

Public facts only after a minimum evidence sample:

- completed organized Activities;
- cancellation facts;
- attendance-confirmation coverage;
- recent completion history;
- `New organizer` or `Not enough data` for small samples.

Not allowed:

- universal public score;
- stars;
- open review wall;
- leaderboard;
- public shame state.

## Phase D — Real Life Index

### RLI-001 — Private shadow ledger

Requirements:

- immutable ledger entries;
- idempotency key;
- evidence reference;
- reason code;
- policy version;
- reversal entry instead of deletion;
- private audit before any public projection.

No public RLI score is approved initially. A minimal band or confirmed-count summary may be considered only after abuse, bias and appeals review.

## Phase E — Life Map and achievements

### LIFE-001

Derived only from confirmed evidence:

- categories tried;
- active weeks;
- confirmed Activities;
- organized Activities;
- personal milestones.

Private by default. No comparison between users and no public leaderboard.

## Phase F — Community contribution

### CONTRIBUTION-001

Separate evidence for:

- helping newcomers;
- healthy organizing;
- community building;
- future ambassador or moderator work.

No universal numeric Community Score and no automatic conversion into RLI or Trust.

## Phase G — Hidden Trust and appeals

### TRUST-001

Internal only and requires dedicated security, privacy, moderation and Supabase work.

Requirements:

- service/moderator-written trust events;
- private risk projection;
- case linkage;
- retention policy;
- moderator audit log;
- appeals before severe penalties;
- anti-bias review.

Normal clients must never read Trust Score or protected trust events.

## Phase H — Coach profile boundary

### COACH-PROFILE-001

Coach shares the base GO IRL display name and avatar but keeps separate:

- Coach bio;
- sports and languages;
- assignment history;
- sport-specific review dimensions;
- Coach rating.

Coach reviews require confirmed assignment and confirmed reviewer attendance. Coach rating must not automatically change RLI, organizer reliability or hidden Trust.

## Project-wide guardrails

### Product

- Closed beta remains Olomouc-first.
- Canonical categories remain Volleyball, Running, Walking, Coffee meetup, Board games and Language exchange.
- The core loop remains create -> share -> join/request -> chat -> attend IRL.
- No feed, followers, direct messages, dating fields, galleries or public ranking.

### Architecture

- no architecture rewrite;
- keep `app_users` as trusted identity anchor;
- keep `user_key` compatibility;
- keep existing Activity, membership and chat tables during beta;
- keep historical snapshots;
- extend repositories incrementally;
- do not migrate to speculative future `users/events` architecture in this programme.

### Performance

- batch profile reads for lists and chat;
- deduplicate user keys;
- short in-memory cache only;
- no persisted signed URLs;
- no request per participant, message or card.

### Privacy and security

- frontend receives public projection fields only;
- service-role credentials remain server-side;
- profile writes remain owner-only;
- fallback uses snapshots, not hidden profile fields;
- no Telegram ID, username, phone, email, role or moderation data in public profile payloads;
- no Trust join in public profile reads.

## Known risks

1. The portal-based PROFILE-004B patch is intentionally bounded but should be removed later if the large sheet components are safely decomposed for another approved reason.
2. Draft PR #224 now contains stale status assumptions and must not be merged as the current roadmap.
3. Production RLS and migration state is not proven by repository code alone.
4. Signed avatar URLs require real expiry/failure smoke testing.
5. Equal participant names or stale snapshots must never be used as identity keys.
6. PROFILE-005 can regress performance if batching is not enforced.
7. Attendance, RLI and Trust remain blocked until separate approvals.

## Changes made by PLAN1001

- Added this consolidated report and updated full roadmap.
- Reconciled the roadmap against the merged PROFILE-002, PROFILE-003, PROFILE-004A and PROFILE-004B state.
- Marked manual and production verification gaps explicitly.
- No runtime code changed.
- No auth, RLS, schema, migrations, Storage policies, secrets or production data changed.

## Checks

- Google Drive operating instruction read and applied.
- Merged PR metadata verified for #222, #225, #228, #231 and #233.
- Green CI evidence verified for runs #729, #739, #744 and #750.
- Current roadmap and phase reports reviewed.
- Documentation-only change; no new application check was required.

## Next step

1. Review and merge this report.
2. Close Draft PR #224 as superseded by this merged report.
3. Create the non-authoritative Google Drive mirror under `Go IRL/Reports` while preserving `source_of_truth: false`.
4. Start PROFILE-005 as the next isolated code mission.
