---
title: User Profile, Reputation and Trust Layer Roadmap
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# User Profile, Reputation and Trust Layer Roadmap

## Task

Restore the historical GO IRL concept for User Profile, Reputation and Trust, compare it with current `main`, define one compatible production model, and produce an implementation roadmap without changing code, auth, RLS, schema, migrations, production data, or Storage policies.

## Files inspected

Primary documents:

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/roadmap/SPRINTS.md`
- `docs/roadmap/SPRINT_3.md`
- `docs/reputation.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/bible/05-product-requirements.md`
- `docs/bible/03-database-and-supabase-boundaries.md`
- `docs/Database.md`
- `docs/DATABASE_SCHEMA_AUDIT.md`
- `docs/SPORT_COACH_MVP.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`

Runtime and schema:

- `src/App.tsx`
- `src/profileAvatar.ts`
- `src/store.ts`
- `src/authSession.ts`
- `src/types.ts`
- `src/coachFeature.ts`
- `src/components/CardShareAction.tsx`
- `src/telegramPreparedShare.ts`
- `api/telegram/prepared-event-share.ts`
- `api/_shared/telegram-share-event.ts`
- `supabase/schema.sql`
- `supabase/migration_v4_trusted_telegram_auth.sql`
- `supabase/migration_v7_coach_requests_and_ratings.sql`
- `supabase/functions/verifyTelegramInitData/index.ts`

## Executive decision

GO IRL already has an approved product-level trust concept, but not an approved production implementation.

The unified direction is:

1. One GO IRL user profile provides display name, city, GO IRL avatar, bio and favorite activities.
2. Event and member rows keep legacy display-name snapshots for backward compatibility.
3. Cards and share-card resolve the current public profile first and fall back to snapshots.
4. Attendance is the evidence foundation for all later reputation.
5. RLI is a public or semi-open offline participation signal, not a star rating.
6. Trust Score is hidden, service-side and appealable.
7. Organizer reputation is factual reliability data, not a popularity rating.
8. Sport Coach rating remains a separate sport-specific review system.
9. Demo profile and reputation data remain local and never create production trust.
10. No leaderboard, popularity contest, public shame score, token, or financial promise is introduced.

## 1. Recovered original concept

### Public profile

The historical and constitutional direction expects important user profile data to live in the database, while current beta limits the UI to a minimal profile.

The intended public profile contains:

- display name;
- public city;
- GO IRL avatar;
- short bio;
- favorite activities;
- verified participation summary;
- organizer summary;
- optional RLI summary;
- achievements chosen for display.

Private identity data remains in the auth/identity layer and is not exposed through the public profile.

### Real Life Index

RLI is a public or semi-public signal of real offline activity.

Historically defined positive signals include:

- confirmed participation;
- organizing completed Activities;
- community help;
- successful full Activities;
- activity streaks;
- trying new categories;
- qualified referrals after the invited user completes three confirmed Activities.

Historically defined negative signals include:

- confirmed no-show;
- repeated late cancellation;
- spam;
- fake Activities;
- confirmed abuse reports.

RLI is explicitly not likes, currency, a game level, a leaderboard position, a financial reward, or a public shame score.

### Hidden Trust Score

Trust Score is internal only. It supports anti-spam, moderation, confirmation weighting, report weighting and future community-role access.

It must not be exposed as a public rating. Significant penalties require auditability, anti-bias review, moderator oversight, retention rules and an appeal path.

### Organizer reputation

The documents repeatedly require organizer/host trust, but do not define or approve a general public organizer star rating.

The historically consistent interpretation is factual organizer reliability derived from completed Activities, cancellations and attendance evidence. It should answer practical questions such as whether the organizer runs real Activities and whether those Activities reliably happen.

### Community Contribution

Community Contribution is separate from RLI. It represents help given to the community, not only activity volume.

Examples:

- helping newcomers;
- organizing quality Activities;
- building healthy local groups;
- reliable ambassador or moderator work later.

It must not be renamed Community Score or used as a public ranking.

### Life Map and achievements

Life Map is a personal history of real-life activity: categories, cities, active weeks, completed Activities, organized Activities and meaningful milestones.

Achievements are derived from confirmed real participation. Both are personal-progress features, not competitive leaderboards.

### Attendance verification

The recovered sequence is:

1. Organizer confirms participants after the Activity.
2. Participants may confirm each other.
3. Optional geolocation confirmation is later, opt-in, time-limited and radius-limited.

Raw location must not be stored as movement history. Only the verification result may be retained.

### Referrals

Referral credit is valid only after the referred user completes three confirmed Activities. Account creation alone is not a contribution signal.

## 2. Current implementation

### Identity

Production identity is based on verified Telegram `initData`, a trusted session and `app_users`. `app_users` stores provider identity fields, not the GO IRL public profile.

### Profile screen

`ProfileView` currently uses `LocalProfile` inside `src/App.tsx`.

Stored fields:

- name;
- bio;
- city ID;
- avatar value/data URL;
- local registration timestamp;
- favorite activity slugs.

The profile is loaded from `localStorage` keys `go-irl-profile` and `go-irl-registered-at`. Saving writes only to localStorage, including in a trusted production session.

### Profile statistics

Current profile metrics are derived from the locally loaded Activity collection and membership state:

- Activities created;
- current joined count;
- current active events;
- pending requests.

They are not verified attendance statistics. The UI label for visited events currently represents membership, not confirmed physical attendance.

### Avatar

`src/profileAvatar.ts` contains:

- demo/local data URL support;
- an `avatars` bucket name;
- a production upload helper;
- public URL resolution.

However, `ProfileView` calls only `readProfileAvatarAsDataUrl`. It does not call the production upload resolver. No repository-managed bucket creation or Storage policy for `avatars` was found. Actual production bucket state was not verified.

### Organizer and member data

`activities` stores only an organizer display-name snapshot and `organizer_key`. `activity_members` stores a member display-name snapshot.

Production Activity creation and join paths source those names from `getCurrentDisplayName`, which resolves the trusted Telegram first/last name or demo fallback. The saved local GO IRL profile is not used.

### Event cards

The runtime Activity type exposes `organizer` and `organizerKey`, but no profile ID or avatar. Cards and details therefore depend on the Activity snapshot and have no unified profile resolver.

### Share-card

The server share-card loads organizer name and key from `activities`.

When the organizer shares their own event, the prepared-share endpoint may inject Telegram `photo_url` into the card. This is an opportunistic Telegram image, not the GO IRL avatar. The normal share action otherwise contains only event title, date, address and URL.

### Coach

The database contains `coach_profiles`, `coach_requests` and `coach_reviews`. Coach profiles duplicate display name, city and bio, and contain separate rating aggregates.

The current frontend implements coach request state only. No production coach review flow is shipped. Existing review RLS checks that the reviewer is joined and the coach request is confirmed/completed; it does not require confirmed physical attendance.

### Reputation and attendance

There are no current production tables or runtime services for:

- user profile storage;
- attendance confirmation;
- organizer reliability;
- RLI ledger;
- hidden Trust Score;
- Life Map;
- achievements;
- Community Contribution;
- referral qualification.

## 3. Approval and conflict record

### Approved concept

The GO IRL Constitution approves the conceptual separation of RLI, hidden Trust Score, Community Contribution, Life Map and attendance confirmation.

### Not approved for current beta implementation

Current source-of-truth beta documents explicitly defer:

- public ratings/reviews;
- public Trust Score;
- public RLI UI;
- achievements;
- attendance verification;
- full review product;
- complex public profiles.

### User or organizer rating search result

No evidence was found that a general public 1-5 user rating or organizer rating was approved.

The historical idea is organizer reliability plus RLI based on behavior and confirmed attendance. Positive feedback is mentioned as one possible Community Contribution signal, but no general star-rating contract is defined.

### Coach exception

A separate Sport Coach 1-5 review model exists in schema and product documents. It is not approval for user or organizer ratings. The full coach review UI remains future scope.

### Current schema conflict

Coach migration v7 has public review fields and public rating aggregates, while active product documents say the full Review Flow is not shipped and public ratings are deferred. Safe interpretation: schema foundation exists, product exposure is not approved.

## 4. Gap matrix

| Domain | Intended direction | Current state | Required decision |
|---|---|---|---|
| Public profile | One GO IRL profile | localStorage-only | Add production profile contract and repository |
| Display name | Profile is canonical | Telegram name snapshots | Profile-first resolution with snapshot fallback |
| City | Profile field | local value plus app city setting | Define profile city vs selected discovery city |
| Avatar | GO IRL-owned avatar | local data URL; unused Storage helper | Approve bucket/policies and wire uploader |
| Favorite activities | Profile preferences | local array only | Store production-safe slugs/interests |
| Participation stats | Confirmed attendance | joined membership count | Replace claims after attendance exists |
| Organizer stats | Reliability facts | Activities created only | Derive from completion/cancellation/attendance |
| Event card | Current profile source | Activity snapshot only | Shared profile resolver with fallback |
| Share-card | GO IRL profile source | Activity snapshot plus Telegram photo override | Resolve GO IRL avatar; remove Telegram-photo priority |
| Attendance | Evidence layer | absent | Add confirmation records and resolution policy |
| No-show / late cancellation | Evidence-backed, appealable | absent | Define states before penalties |
| RLI | Ledger and semi-open summary | absent | Add immutable ledger and safe projection |
| Trust Score | Hidden internal | absent | Add private event journal and moderation controls |
| Achievements | Confirmed milestones | absent | Add after attendance/RLI |
| Life Map | Personal activity history | absent | Derive from confirmed participation |
| Community Contribution | Separate contribution record | absent | Add separate evidence ledger |
| Referrals | Qualify after three confirmed Activities | absent | Add referral attribution and qualification |
| Coach rating | Separate sport-specific review | schema only | Implement only after attendance verification |
| Demo boundary | Local-only writes | Activities/coach local; profile also local in all modes | Split demo and production profile repositories |

## 5. Unified profile model

### Public profile

Default public fields:

- `display_name`;
- `city_id` or public city label;
- GO IRL `avatar_path`;
- short bio;
- favorite activity slugs, owner-controlled visibility;
- confirmed attendance count;
- completed organized Activity count;
- organizer reliability facts when sample size is sufficient;
- optional RLI band/summary;
- selected achievements.

Never public by default:

- Telegram ID or username;
- provider identity;
- email/phone;
- hidden Trust Score;
- moderation notes;
- detailed negative-event history;
- raw geolocation;
- private report data.

### Identity boundary

`app_users` remains the trusted identity anchor. Do not introduce the future `users` replacement during this roadmap.

Recommended compatibility key:

- `user_profiles.user_key text primary key` linked to the unique `app_users.user_key`.

This matches existing `activities.organizer_key`, `activity_members.user_key`, `coach_profiles.user_key` and current JWT claims.

### Profile source order

For production rendering:

1. readable GO IRL public profile;
2. legacy Activity/member/coach display-name snapshot;
3. safe initials or generic fallback.

For avatars:

1. GO IRL `avatar_path`;
2. deterministic initials/avatar code;
3. generic fallback.

Telegram `photo_url` must not be the primary GO IRL avatar and must not be persisted automatically.

### Backward compatibility

Keep these fields:

- `activities.organizer`;
- `activities.organizer_key`;
- `activity_members.display_name`;
- existing coach snapshot columns.

They remain creation-time snapshots and fallbacks. Old events continue to render when no profile exists.

Do not automatically upload an existing localStorage profile into production. A local profile may belong to demo mode or another Telegram identity. Production profile creation must require a trusted session and explicit save/import action.

## 6. Reputation separation

### RLI

Purpose: minimal public/semi-open signal that the user participates in real life.

Recommended default visibility:

- public: RLI band plus confirmed attendance/organized counts;
- owner: exact total and safe ledger history;
- moderator: full audit context;
- no global sorting, discovery ranking or leaderboard by RLI.

### Hidden Trust Score

Purpose: platform risk and evidence weighting.

Rules:

- server/service writes only;
- no normal-client select access;
- no UI exposure;
- serious restrictions require human review or explicit policy;
- safe audit/export and appeal path required;
- never reuse Trust Score as public organizer status.

### Organizer reliability

Purpose: answer whether this person reliably runs real Activities.

Recommended public facts after a minimum sample:

- completed organized Activities;
- organizer cancellation rate;
- confirmed participant show-up rate;
- attendance-confirmation coverage;
- recent completion history.

Display `New organizer` before the minimum sample. Do not add stars, open-text public reviews or a global organizer score in this roadmap.

### Coach rating

Purpose: evaluate sport coaching performance only.

It remains 1-5 and sport-specific, with tags such as beginner support, rules, warm-up, safety, punctuality and atmosphere.

A coach review must require:

- confirmed/completed coach assignment;
- reviewer membership;
- confirmed attendance by the reviewer;
- one review per coach, Activity and reviewer.

Coach rating must not change RLI or organizer reliability automatically.

## 7. Proposed data model

No SQL is executed by this report.

### Phase A/B tables

#### `user_profiles`

- `user_key text primary key`
- `display_name text not null`
- `city_id text not null default 'olomouc'`
- `bio text`
- `avatar_path text`
- `avatar_code text`
- `is_public boolean not null default true`
- `show_favorites boolean not null default true`
- `show_reputation boolean not null default false`
- `created_at timestamptz`
- `updated_at timestamptz`

#### `user_profile_interests`

- `user_key text`
- `interest_slug text`
- `created_at timestamptz`
- primary key `(user_key, interest_slug)`

Use current stable slugs first. Do not force a category architecture migration.

### Phase C tables

#### `attendance_confirmations`

- `id uuid primary key`
- `activity_id uuid`
- `subject_user_key text`
- `confirmed_by_user_key text`
- `confirmation_type text`
- `result text`
- `created_at timestamptz`
- `metadata jsonb`

Allowed confirmation types: organizer, participant, geolocation-later, moderator.

Allowed results: yes, no, unknown.

#### `activity_attendance`

Resolved state per Activity/member:

- `activity_id uuid`
- `user_key text`
- `status text`
- `confidence_level text`
- `resolved_at timestamptz`
- `resolution_source text`
- `metadata jsonb`
- primary key `(activity_id, user_key)`

Candidate statuses: pending, confirmed, no_show, late_cancel, excused, disputed.

No negative reputation write occurs merely because the state is pending or disputed.

#### `activity_completion`

- `activity_id uuid primary key`
- `status text`
- `confidence_level text`
- `organizer_confirmed boolean`
- `majority_confirmed boolean`
- `calculated_at timestamptz`
- `metadata jsonb`

### Phase D/E tables

#### `organizer_reliability_summary`

Prefer a server-maintained projection or view, not user-written data.

- `user_key text primary key`
- `organized_count integer`
- `completed_count integer`
- `cancelled_count integer`
- `late_cancelled_count integer`
- `confirmed_attendee_count integer`
- `expected_attendee_count integer`
- `confirmation_coverage numeric`
- `calculated_at timestamptz`

#### `rli_ledger`

Keep the historical contract:

- `id uuid primary key`
- `user_key text`
- `activity_id uuid nullable`
- `delta integer`
- `reason text`
- `source_type text`
- `confidence_level text`
- `created_at timestamptz`
- `created_by_system boolean`
- `metadata jsonb`

Writes must be idempotent and service-side. Add a source event/idempotency key so one attendance resolution cannot award RLI twice.

#### `user_reputation_summary`

- `user_key text primary key`
- `rli_total integer`
- `rli_band text`
- `confirmed_attendance_count integer`
- `completed_organized_count integer`
- `updated_at timestamptz`

This is a projection, not the authority. The ledger remains authoritative.

### Phase F/G tables

#### `achievement_definitions`

- stable slug;
- localized copy;
- evidence rule version;
- active flag.

#### `user_achievements`

- user key;
- achievement slug;
- awarded at;
- source/evidence metadata;
- optional public visibility.

Life Map should initially be derived from confirmed attendance and completed organized Activities. Do not create a duplicate history table unless query performance requires it.

#### `community_contributions`

- `id uuid primary key`
- `user_key text`
- `activity_id uuid nullable`
- `contribution_type text`
- `evidence_status text`
- `created_at timestamptz`
- `metadata jsonb`

Do not expose a public numeric Community Score.

#### `referrals`

- referrer user key;
- referred user key;
- attribution timestamp;
- confirmed Activity count;
- status;
- qualified timestamp.

Qualification requires three confirmed Activities.

### Phase H tables

#### `trust_events`

- internal user key;
- Activity/case reference;
- event type;
- weight;
- confidence;
- reason code;
- created at;
- service/moderator source;
- protected metadata.

#### `user_trust_state`

Private summary projection. No user-facing rating field.

#### `reputation_appeals`

- user key;
- subject type and ID;
- reason;
- status;
- moderator decision;
- timestamps;
- audit linkage.

### Phase I existing coach tables

Keep current names and keys:

- `coach_profiles`
- `coach_requests`
- `coach_reviews`

Add shared-profile reads by `user_key`, but keep current coach snapshot columns for compatibility. Do not merge coach ratings into `user_reputation_summary`.

## 8. Required schema, RLS and Storage work

All items below require a separately approved Supabase mission.

### Profile RLS

- owner can insert/update own profile using trusted `go_irl_user_key`;
- public can read only explicitly public fields through a safe view or narrowly scoped select policy;
- private fields must not be returned in the public view;
- moderators do not need unrestricted profile access by default.

### Attendance RLS

- organizer may confirm members of their Activity;
- participant may confirm only eligible members of an Activity they joined;
- user may read their own attendance outcome;
- organizer may read attendance for their Activity;
- service/moderator resolves disputes and writes projections;
- duplicate confirmation constraints enforced in DB.

### RLI RLS

- clients cannot insert/update ledger entries;
- owner may read a safe own history;
- public may read only the summary projection when enabled;
- moderation/fraud metadata is hidden from normal users.

### Trust RLS

- no public or normal authenticated read;
- service/admin/moderator only;
- appeals visible to their owner and assigned moderators;
- every moderator decision audited.

### Storage

Retain the existing logical bucket name `avatars` unless a separate migration approves renaming.

Required policies:

- authenticated owner writes only to their own prefix;
- MIME and size restrictions;
- no arbitrary path overwrite outside the owner prefix;
- old avatar cleanup policy;
- public-read or signed-URL strategy approved explicitly;
- database stores object path, not a permanent generated URL.

No Telegram photo is copied into Storage automatically.

## 9. Production roadmap

### Phase A — unified minimal GO IRL profile

Scope:

- define shared `UserProfile` contract;
- split demo and production profile repositories;
- add approved `user_profiles` and profile-interest persistence;
- keep old local profile as demo/local only;
- migrate no data automatically.

Acceptance criteria:

- trusted production user loads and saves one profile row;
- browser demo saves locally and performs zero Supabase writes;
- display name, city, bio and favorites survive device/session reload in production;
- no auth/RLS weakening;
- old users without a row receive safe fallback values;
- lint/build/test green and two-account profile RLS smoke test passes.

### Phase B — profile source for cards and share-card

Scope:

- one profile resolver for organizer/member surfaces;
- card/detail organizer name and avatar from public profile;
- server share-card loads GO IRL profile by organizer key;
- legacy snapshots remain fallback;
- remove Telegram-photo priority.

Acceptance criteria:

- profile name/avatar appears consistently in profile, cards, details and share-card;
- old Activities without a profile still render;
- changing a profile does not corrupt stored Activity ownership;
- Telegram `photo_url` is not used as primary/persisted avatar;
- private profile fields never reach share payloads.

### Phase C — attendance confirmation

Scope:

- Activity completion window;
- organizer confirmation first;
- participant-to-participant confirmation after organizer flow is stable;
- resolved attendance state and confidence;
- no QR and no geolocation in first production release.

Acceptance criteria:

- only eligible organizer/participants can submit confirmations;
- one confirmer cannot duplicate confirmations;
- confirmed, no-show, late-cancel, excused and disputed states are explicit;
- disputes produce no automatic serious penalty;
- profile visited count uses confirmed attendance, not joined membership;
- old Activities remain readable and are not backfilled as confirmed.

### Phase D — organizer reliability

Scope:

- derived factual summary;
- minimum sample threshold;
- New organizer state;
- no stars or open public reviews.

Acceptance criteria:

- metrics derive only from completed/cancelled Activities and attendance evidence;
- sample size is shown with every percentage;
- no hidden Trust Score leaks into organizer UI;
- no search/sort/leaderboard by organizer status;
- cancelled legacy Activities without evidence do not create false penalties.

### Phase E — RLI ledger and basic profile reputation

Scope:

- immutable/idempotent ledger;
- owner history;
- semi-open RLI band and verified counts;
- policy versioning for every reason/delta.

Acceptance criteria:

- one evidence event produces at most one ledger entry;
- user can inspect safe own ledger history;
- public UI exposes only approved summary fields;
- no leaderboard or RLI-based discovery ranking;
- negative entries are evidence-backed and appealable;
- policy changes do not rewrite historical entries silently.

### Phase F — achievements and Life Map

Scope:

- deterministic achievements from confirmed evidence;
- personal Life Map derived from attendance and organizing;
- owner visibility controls.

Acceptance criteria:

- achievements cannot be awarded from unconfirmed joins;
- Life Map is private by default or minimally exposed by explicit choice;
- no comparison between users;
- deletion/export rules are defined;
- old profile fallback remains functional.

### Phase G — Community Contribution

Scope:

- separate contribution records;
- newcomer help, community building, ambassador/moderator contribution later;
- no global Community Score.

Acceptance criteria:

- contribution evidence and issuer are auditable;
- contribution does not automatically equal RLI or Trust;
- public UI uses descriptive badges/history, not ranking;
- manual awards require moderator permissions and audit log.

### Phase H — internal Trust Score, moderation and appeals

Scope:

- hidden trust event journal and private projection;
- report/attendance weighting;
- moderation case linkage;
- appeals, retention and anti-bias review.

Acceptance criteria:

- normal clients cannot read Trust Score or trust events;
- serious restrictions require an auditable decision path;
- appeal workflow exists before automated severe penalties;
- moderator actions are logged;
- retention and safe export policies are approved;
- Trust Score never appears as a public rating or badge.

### Phase I — separate coach reputation

Scope:

- production review UI for confirmed Sport Coach assignments;
- attendance-gated review permission;
- sport-specific rating/tags;
- shared profile name/avatar with coach-specific bio and rating retained separately.

Acceptance criteria:

- reviewer must have confirmed attendance;
- coach request must be confirmed/completed;
- one review per coach/Activity/reviewer;
- coach rating does not change user RLI, organizer reliability or Trust automatically;
- no general user/organizer rating UI is introduced;
- public coach review exposure has separate product and privacy approval.

## 10. Small AI Fixer missions

Each mission is one small task. Schema/RLS missions must be assigned only after explicit approval.

1. **Profile contract audit** — extract `LocalProfile` into a typed profile contract without changing behavior.
2. **Demo profile isolation** — rename/version the demo profile key and prove untrusted sessions cannot call Supabase profile writes.
3. **Profile repository adapter** — add local demo and production interfaces behind one API; production implementation remains disabled until schema approval.
4. **Production profile read** — load own approved profile row with fallback to trusted display name.
5. **Production profile save** — save display name/city/bio/favorites under existing trusted auth.
6. **Avatar upload wiring** — replace direct data-URL save with `resolveProfileAvatarUpload` only after bucket/policies are approved.
7. **Organizer profile resolver** — resolve public organizer name/avatar while preserving Activity snapshots.
8. **Share-card profile resolver** — load public GO IRL organizer profile server-side and remove Telegram-photo priority.
9. **Verified stats labels** — rename current joined-count labels so they do not claim attendance before Phase C.
10. **Attendance organizer UI** — post-event organizer confirmation UI against approved API/table.
11. **Attendance participant UI** — peer confirmation UI with eligibility and duplicate guards.
12. **Organizer reliability presenter** — render factual projection with sample size and New organizer fallback.
13. **RLI summary component** — feature-flagged band/count display, no leaderboard.
14. **Life Map presenter** — owner-only derived timeline from confirmed evidence.
15. **Community Contribution presenter** — descriptive records/badges only.
16. **Trust client boundary test** — verify no public bundle/query can read hidden trust data.
17. **Coach review permission fix** — require confirmed attendance in addition to current joined membership.
18. **Coach review UI** — separate sport-specific flow after Phase I approval.

## Changes made

- Added this docs-only audit and roadmap on branch `docs/user-profile-reputation-roadmap`.
- No runtime code changed.
- No auth, RLS, schema, migration, production data, secrets, `.env`, or Storage policy changed.

## Checks

- Static GitHub audit completed against `main`.
- Exact-term searches found no approved general public user/organizer star-rating contract.
- No code checks run because the change is documentation-only.
- Production Supabase and Storage state were not mutated or directly verified.

## Next step

Human review this report and approve only **Phase A contract/schema design** first.

After approval, create a dedicated Supabase design mission for `user_profiles`, public profile read boundaries, owner-write RLS and the `avatars` bucket policy. Do not start attendance, RLI, Trust Score or coach review UI in the same patch.
