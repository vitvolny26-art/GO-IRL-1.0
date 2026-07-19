---
title: Sport Coach End-to-End Production Design
owner: Chief Archivist / Technical Lead
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# Sport Coach End-to-End Production Design

## Task

Read the current product, governance, roadmap, database, and implementation sources, then define the complete Sport Coach function from first organizer request through confirmed attendance, feedback, trust, analytics, and production rollout.

This report is a reviewed implementation proposal, not a replacement for `docs/SPORT_COACH_MVP.md`.

## Authority and fixed boundaries

The following rules are non-negotiable unless the source-of-truth documents are explicitly changed:

- Coach means Sport Coach only in MVP 1.1.
- The feature must improve real-life attendance or beginner comfort.
- The current main entity remains `Activity`.
- MVP 1.1 keeps `coach_profiles`, `coach_requests`, `coach_reviews`, `user_key`, `activity_id`, and `coach_profile_id` compatibility.
- No payments, marketplace, booking, commission, availability calendar, or verified Coach badge in MVP 1.1.
- No universal Event Roles implementation before Sport Coach proves value.
- No public Trust Score, leaderboard, or public popularity ranking.
- Production identity must use trusted Telegram auth and Supabase RLS.
- Business-critical state transitions must become backend-authoritative before broad production rollout.
- No auth, RLS, migration, secret, `.env`, or production data change is included in this documentation task.

## Product definition

### Goal

Reduce the fear of joining sport events and increase the probability that joined users attend in real life.

### Core hypothesis

Sport events with a confirmed Coach should outperform similar sport events without a Coach on:

- show-up rate;
- beginner comfort;
- join-to-chat activation;
- repeat sport attendance.

### User promise

A confirmed Coach helps beginners, explains basic rules, supports warm-up and team flow, and makes arriving alone feel safer.

### Non-goals

- professional training marketplace;
- paid coaching;
- universal helper system;
- public Coach leaderboard;
- verified badge without a real verification process;
- permanent direct messaging;
- social feed or review feed.

## Current implementation inventory

### Frontend

Current Sport Coach UI is based on:

- `src/components/CoachRequestPanel.tsx`;
- `src/coachFeature.ts`;
- `src/coachRequestState.ts`;
- `src/verticals/SportVertical.tsx`;
- `src/coach-panel.css`.

Current behavior:

- organizer/admin/moderator can create an `organizer_request`;
- joined participant can create `participant_interest`;
- organizer can add participant level and a short goal;
- active requests can be cancelled in the UI;
- browser demo organizer request becomes confirmed immediately;
- confirmed organizer request can show a Sport card badge;
- Coach block is rendered next to Activity Chat;
- pure state helpers have unit tests.

### Current demo behavior

- local storage key: `go-irl-demo-coach-requests-v1`;
- mock Coach: Alex, Sport Coach, Olomouc;
- organizer request becomes `confirmed`;
- participant interest remains `pending`;
- demo writes remain local-only.

### Current schema foundation

Repository migrations define:

- `coach_profiles`;
- `coach_requests`;
- `coach_reviews`;
- status values `pending`, `matched`, `confirmed`, `cancelled`, `completed`, `rejected`;
- rating aggregate fields and review recalculation functions.

Schema presence does not prove that the migration is applied in production or that the full product flow is shipped.

## Critical gaps

### P0 — production state is not proven

Two Coach migration definitions exist with materially different policy sets. Repository history does not prove which version is applied in production.

Required before RLS or schema correction:

- applied migration history;
- current `pg_policies` rows;
- current constraints and indexes;
- grants and column privileges;
- current helper function definitions.

### P0 — no Coach-facing workflow

The repository has no complete Coach journey for:

- creating or editing a Coach profile;
- seeing an assigned request;
- accepting or declining an assignment;
- opening the related event and chat;
- marking the assignment complete.

The current request can become confirmed only through demo logic or an external/admin database action.

### P0 — public confirmed state is not safely projected

Sport cards call the request loader per activity. Existing RLS definitions do not clearly grant ordinary participants a safe public read of confirmed assignments.

A production solution needs a public-safe Coach summary that exposes only:

- assignment state;
- Coach display name/avatar boundary;
- sport support summary;
- no requester key, admin note, private goal, internal status history, or moderation data.

### P0 — state transitions are not backend-authoritative

Current client code writes request rows and status changes directly. A production Coach flow needs server-enforced commands and transition validation.

### P0 — profile trust fields need protected ownership

Repository migration definitions allow profile owners broad row updates. Verification and rating aggregate fields must not be user-controlled.

Server-owned fields include at minimum:

- `is_verified`;
- `rating_avg`;
- `rating_count`;
- `rating_weighted`;
- moderation status;
- future trust flags.

### P0 — confirmed integrity is incomplete

The database definitions do not clearly enforce:

- `coach_profile_id` is present when status is `matched`, `confirmed`, or `completed`;
- the referenced activity is a sport activity;
- only the assigned Coach can accept or decline;
- only valid actors can move each state.

### P1 — N+1 card queries

Each Sport card currently loads Coach request state separately. A production list should use one batch summary query or activity payload projection rather than one Coach query per card.

### P1 — localization is incomplete

Sport card Coach labels are localized, but the main request panel copy and fields are primarily Russian hardcoded strings.

### P1 — reviews are schema-only

The repository has review types and tables but no complete review service or UI. Reviews must remain future until attendance eligibility and abuse controls are defined.

### P1 — analytics are absent

The product hypothesis cannot be validated without event-level analytics and attendance confirmation.

## Actors and permissions

### Organizer

Can:

- request a Coach for a sport Activity;
- provide level and a short support goal;
- cancel the active organizer request;
- see matching status;
- see confirmed Coach details;
- confirm event completion and attendance when the attendance layer exists.

Cannot:

- self-set Coach verification;
- directly set rating aggregates;
- force a Coach into `confirmed` without Coach acceptance;
- access unrelated Coach requests.

### Participant

Can:

- join the sport Activity;
- express `participant_interest` after joining;
- cancel their own interest;
- see confirmed public Coach summary;
- access Activity Chat when allowed;
- submit post-event Coach feedback only when eligible.

Cannot:

- see private organizer notes;
- match or confirm a Coach;
- review without participation/attendance eligibility.

### Coach

Can:

- create and maintain an active Coach profile;
- see requests assigned to their Coach profile;
- accept or decline an assignment;
- access the assigned Activity and allowed Activity Chat;
- mark service completion only within the approved completion flow.

Cannot:

- change verification or rating aggregates;
- read unrelated requests;
- confirm themselves without an assignment;
- see private participant data beyond event requirements.

### Moderator/Admin

Can:

- inspect Coach profiles and request state;
- assign a Coach during the manual beta phase;
- reject, cancel, or correct invalid assignments;
- review reports and audit history.

All moderation actions must be auditable.

### System

Owns:

- transition validation;
- public summary projection;
- notification events;
- aggregate ratings;
- analytics events;
- future attendance-linked eligibility.

## Canonical state machine

```text
none
  -> pending
  -> matched
  -> confirmed
  -> completed
```

Terminal/exit transitions:

```text
pending   -> cancelled | rejected
matched   -> confirmed | cancelled | rejected
confirmed -> completed | cancelled
```

### State meanings

| State | Meaning | Public badge |
|---|---|---|
| `pending` | Organizer requested support | No |
| `matched` | A Coach profile is assigned, awaiting Coach acceptance | No |
| `confirmed` | Assigned Coach accepted | Yes |
| `completed` | Event and Coach assignment completed | Historical only |
| `cancelled` | Request withdrawn or assignment cancelled | No |
| `rejected` | Coach/admin declined the request | No |

### Required transition ownership

| Transition | Allowed actor |
|---|---|
| none -> pending | organizer/event manager |
| pending -> matched | moderator/admin or future matching service |
| matched -> confirmed | assigned Coach |
| pending/matched/confirmed -> cancelled | organizer, assigned Coach where applicable, moderator/admin |
| pending/matched -> rejected | assigned Coach or moderator/admin |
| confirmed -> completed | approved completion workflow/system |

## End-to-end journeys

### Organizer journey

1. Create a sport Activity.
2. Open Event Details.
3. Tap `Need a Coach`.
4. Add participant level and support goal.
5. Submit request.
6. See `Coach requested` state.
7. Receive update when a Coach is matched.
8. Coach accepts.
9. Event shows `Coach confirmed` and confirmed-only card badge.
10. Organizer and Coach coordinate through Activity Chat.
11. Event happens.
12. Attendance/completion is confirmed.
13. Eligible participants receive a minimal feedback prompt.

### Participant journey

1. Open sport Activity.
2. See no badge for pending request.
3. Join the Activity.
4. Optionally signal `I want a Coach`.
5. See confirmed Coach summary after acceptance.
6. Open Activity Chat.
7. Attend the event.
8. Confirm attendance when the trust layer exists.
9. Answer beginner-comfort feedback and optional minimal review.

### Coach journey

1. Create/activate Coach profile.
2. Add supported sports, languages, city, and short bio.
3. Receive or view a manually assigned request.
4. Review Activity facts, level, organizer goal, time, and location.
5. Accept or decline.
6. On accept, assignment becomes confirmed.
7. Open Activity Chat and coordinate.
8. Attend and support the event.
9. Complete the assignment through the approved event completion flow.
10. See private feedback summary when product policy allows it.

### Moderator beta journey

1. Open pending Coach requests.
2. Check event and Coach compatibility.
3. Assign a Coach profile.
4. Monitor acceptance/decline.
5. Resolve invalid state or abuse report.
6. Preserve audit history.

## Data contract

### `coach_profiles`

Public-safe fields:

- id;
- display name;
- avatar boundary;
- city;
- short bio;
- supported sports;
- languages;
- active state;
- future public feedback summary only after approval.

Private/server-owned fields:

- user key;
- verification state;
- moderation state;
- rating aggregates;
- audit metadata.

### `coach_requests`

Keep current compatibility fields in MVP 1.1:

- `activity_id`;
- `requester_user_key`;
- `coach_profile_id`;
- `request_type`;
- `sport_type`;
- `goal`;
- `level`;
- `status`.

Existing budget/payment fields must not drive UI or marketplace behavior during MVP 1.1.

Future approved migration may add explicit transition timestamps, but migration work must be separate.

### `coach_reviews`

Future minimal UI contract:

- overall rating 1–5;
- short comment;
- beginner comfort yes/no;
- one review per participant, Coach, and Activity;
- eligibility tied to joined/confirmed attendance and completed Coach assignment.

Public review display is not required for beta and should remain disabled until moderation policy exists.

## Backend/API contract

Before broad production rollout, use backend-authoritative commands through approved Supabase RPC or Edge Functions.

### Commands

- `requestCoach(activityId, goal, level)`
- `cancelCoachRequest(requestId)`
- `matchCoach(requestId, coachProfileId)`
- `acceptCoachAssignment(requestId)`
- `declineCoachAssignment(requestId, reason?)`
- `completeCoachAssignment(requestId)`
- `submitCoachFeedback(activityId, coachProfileId, payload)`

### Queries

- `getCoachRequestForActivity(activityId)` for authorized actors;
- `getCoachInbox()` for assigned Coach;
- `getCoachProfile(profileId)` with public/private projection;
- `getCoachSummaries(activityIds[])` for cards;
- `getCoachFeedbackEligibility(activityId)`;
- `getCoachModerationQueue()` for staff.

### Domain events

Emit observable events for notifications and analytics:

- `coach_request.created`;
- `coach_request.cancelled`;
- `coach_request.matched`;
- `coach_assignment.confirmed`;
- `coach_assignment.rejected`;
- `coach_assignment.completed`;
- `coach_feedback.submitted`.

n8n may consume events for notifications, but it must not own state transitions.

## Public summary rule

Cards and ordinary participants should not read raw `coach_requests` rows.

Use a safe summary projection such as:

```text
activity_id
coach_state: none | requested | confirmed
coach_profile_id: confirmed only
coach_display_name: confirmed only
coach_avatar: confirmed only
support_label: confirmed only
```

Do not expose:

- requester user key;
- participant interest rows;
- admin note;
- private organizer goal;
- rejection reason;
- internal moderation data;
- rating calculation internals.

## UX surfaces

### Sport card

- show `Coach confirmed` badge only for confirmed assignment;
- never show confirmed badge for pending or matched;
- update without full reload after state change;
- load Coach states in a batch;
- badge opens Event Details, not a separate marketplace.

### Event Details

Target order:

```text
Event facts
Participants/join state
Sport Coach block
Activity Chat
Main actions
```

States:

- no request;
- request form;
- requested;
- matched/awaiting Coach;
- confirmed Coach profile;
- cancelled/rejected with safe retry guidance;
- completed historical state.

### Coach profile

MVP-safe fields:

- display name;
- avatar;
- city;
- supported sports;
- languages;
- short bio;
- active/inactive toggle.

Do not show verified badge, public ranking, price, availability calendar, or marketplace booking before approval.

### Coach inbox

Minimal production surface:

- assigned request list;
- Activity title, date/time, city/address, level, goal;
- accept;
- decline;
- open Event Details/Chat.

### Feedback

After event completion:

- `Did the Coach help you feel comfortable if you came alone?`;
- 1–5 overall rating;
- optional short comment;
- no public feed in beta.

### Localization

All Coach copy must use the existing RU/UK/CS/EN localization system. Hardcoded Russian copy must not remain in the production component.

### Accessibility

- touch targets at least mobile-safe size;
- explicit labels for status and buttons;
- status must not rely on color only;
- loading and errors announced clearly;
- confirmation required for destructive cancellation where the state is confirmed.

## Notifications

Notifications are server-side/backend/n8n work only.

Minimum events:

- organizer: Coach matched;
- organizer: Coach confirmed/declined;
- Coach: assignment offered;
- Coach: Activity changed or cancelled;
- participant: Coach confirmed when already joined;
- eligible participant: post-event feedback prompt.

Rules:

- opt-in and quiet hours when notification preferences exist;
- no Mini App background polling;
- no notification should expose private notes;
- duplicate-send guard required.

## Analytics and experiment design

### Primary metric

- Show-up Rate: attended users / joined users.

### Supporting metrics

- Coach request conversion by organizers;
- request -> matched time;
- matched -> confirmed rate;
- Coach confirmation time;
- confirmed Coach badge open rate;
- join -> chat message rate;
- join -> attendance confirmation rate;
- beginner comfort yes/no;
- repeat sport attendance;
- cancellation/rejection rate.

### Experiment gate

Compare similar sport events in Olomouc:

- confirmed Coach cohort;
- no Coach cohort.

Do not expand to universal Event Roles unless confirmed Coach events show a meaningful improvement in show-up rate or beginner comfort.

## Security and abuse requirements

- trusted Telegram identity only for production writes;
- requester cannot modify unrelated rows;
- assigned Coach can read/act only on assigned requests;
- profile owner cannot set verification or rating aggregates;
- ordinary users receive public summary only;
- review eligibility must be backend-checked;
- all staff state changes are auditable;
- rate-limit repeated request creation/cancellation;
- prevent confirmation without assigned Coach profile;
- prevent non-sport Activities from using Sport Coach commands;
- no private organizer note in public payloads.

## Test plan

### Unit tests

- state transition matrix;
- actor permission resolution;
- request detail normalization;
- confirmed-only badge mapping;
- public summary mapper;
- review eligibility rules;
- localization keys.

### Service/integration tests

- organizer creates/cancels request;
- joined participant creates/cancels interest;
- outsider is rejected;
- moderator matches Coach;
- assigned Coach accepts/declines;
- unassigned Coach is rejected;
- confirmed state requires Coach profile;
- non-sport Activity is rejected;
- batch summary returns safe data only;
- review requires eligible attendance and completed assignment.

### RLS tests

Use at least four identities:

- organizer;
- participant;
- assigned Coach;
- outsider;
- plus moderator/admin where available.

Verify SELECT, INSERT, UPDATE, and public summary behavior independently.

### Demo tests

- no production Supabase write;
- organizer request confirms locally;
- participant interest remains pending;
- cancellation removes badge immediately;
- reload restores local state;
- malformed local storage fails safely.

### Manual Telegram smoke test

- organizer requests Coach;
- staff matches Coach;
- Coach accepts from another Telegram account;
- participant sees confirmed badge;
- participant opens chat;
- organizer cancels event/Coach assignment;
- all clients refresh correctly;
- unauthorized account cannot read private data.

## Delivery roadmap

### Phase 0 — evidence and decision gate

Goal: establish real production state before changing backend rules.

Tasks:

- inventory applied Coach migrations and policies;
- reconcile duplicate migration definitions;
- document state transition ownership;
- approve public summary and Coach inbox contracts;
- run latest `lint`, `build`, `test`, and typecheck on `main`.

Exit gate:

- production state is known;
- no unresolved RLS ambiguity;
- one approved backend design exists.

### Phase 1 — current MVP 1.1 stabilization

No marketplace or new schema architecture.

Tasks:

- move Coach panel copy into RU/UK/CS/EN i18n;
- improve loading/error/disabled states;
- add unit tests for panel state and demo storage behavior;
- keep confirmed-only badge;
- ensure no duplicate Coach panel;
- keep Activity Chat adjacent;
- keep demo local-only.

Exit gate:

- current request flow is predictable and fully tested;
- no scope expansion.

### Phase 2 — backend and RLS hardening

Requires explicit Supabase/RLS approval.

Tasks:

- introduce server-authoritative transition commands;
- add safe batch public summary;
- add assigned-Coach read/accept/decline path;
- protect verification and rating aggregate fields;
- enforce sport-only and confirmed-assignment integrity;
- add audit logging for staff transitions;
- add RLS verification tests.

Exit gate:

- organizer, participant, Coach, staff, and outsider permissions pass;
- card summary exposes no private data;
- production migration is applied and verified.

### Phase 3 — Coach profile and assignment UI

Tasks:

- Coach profile create/edit/activate flow;
- minimal Coach inbox;
- staff manual matching surface;
- Coach accept/decline actions;
- confirmed Coach detail block;
- batch card summary integration;
- Telegram notifications for assignment state.

Exit gate:

- real three-account organizer/Coach/participant flow works in Telegram.

### Phase 4 — event completion and minimal feedback

Depends on approved attendance confirmation.

Tasks:

- complete Coach assignment with event lifecycle;
- calculate feedback eligibility;
- implement beginner comfort question;
- implement 1–5 overall rating and short comment;
- keep review display private or aggregate-only during beta;
- add abuse/report handling.

Exit gate:

- only eligible attendees can submit one review;
- rating aggregates are server-owned;
- no public popularity feed.

### Phase 5 — analytics and validation

Tasks:

- record Coach funnel events;
- compare confirmed Coach and no-Coach cohorts;
- monitor rejection, cancellation, and no-show patterns;
- produce beta decision report.

Exit gate:

- clear evidence that Coach improves show-up rate or beginner comfort.

### Phase 6 — Sport Roles 1.2 decision

Only after Phase 5 evidence.

Possible roles:

- Beginner Helper;
- Team Captain;
- Referee;
- Safety Lead;
- Equipment Helper.

This phase still does not authorize universal Event Roles or payments.

## Work items

| ID | Priority | Work item | Dependency |
|---|---|---|---|
| COACH-001 | P0 | Read-only production migration/RLS inventory | None |
| COACH-002 | P0 | Reconcile duplicate Coach migration definitions | COACH-001 |
| COACH-003 | P0 | Approve state transition and public projection contract | COACH-001 |
| COACH-004 | P0 | Run current repo quality gates | None |
| COACH-005 | P1 | Localize Coach panel RU/UK/CS/EN | COACH-003 |
| COACH-006 | P1 | Add panel/demo/state tests | COACH-005 |
| COACH-007 | P0 | Backend-authoritative Coach commands | COACH-002, COACH-003 |
| COACH-008 | P0 | Safe batch Coach summary | COACH-007 |
| COACH-009 | P0 | Assigned Coach permissions and RLS tests | COACH-007 |
| COACH-010 | P0 | Protect verification/rating fields | COACH-002 |
| COACH-011 | P1 | Coach profile UI | COACH-009, COACH-010 |
| COACH-012 | P1 | Coach inbox and accept/decline | COACH-009 |
| COACH-013 | P1 | Staff manual matching UI | COACH-009 |
| COACH-014 | P1 | Telegram notification events | COACH-007, COACH-012 |
| COACH-015 | P1 | Attendance-linked completion | Attendance foundation |
| COACH-016 | P1 | Minimal feedback flow | COACH-015 |
| COACH-017 | P1 | Coach funnel analytics | COACH-007 |
| COACH-018 | P2 | Beta hypothesis decision report | COACH-017 |

## Definition of Done

### MVP 1.1 stabilized

- Sport-only request flow works;
- organizer and joined participant permissions are correct;
- demo is local-only;
- pending request never shows confirmed badge;
- cancellation refreshes the badge;
- panel is localized;
- unit/integration tests pass;
- latest lint/build/test/typecheck are green;
- real Telegram smoke test passes.

### Production Coach function

- Coach can create profile and receive assignment;
- assigned Coach can accept or decline;
- public card reads safe batch summary;
- state transitions are backend-authoritative;
- RLS is verified for all actors;
- notifications are server-side;
- event completion and feedback eligibility are enforced;
- analytics can test the product hypothesis;
- no payments, marketplace, false verification, or public Trust Score are introduced.

## Files inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `BACKLOG.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/MARKET_POSITIONING.md`
- `docs/SPORT_COACH_MVP.md`
- `docs/COACH_CHAT_TRUST_LAYER.md`
- `docs/DEVELOPMENT_PROTOCOL.md`
- `docs/reputation.md`
- `docs/audit/KNOWLEDGE_DEBT.md`
- `docs/governance/ARCHIVIST_OPERATING_POLICY.md`
- `docs/onboarding/AI_SUCCESSOR_INSTRUCTIONS.md`
- `docs/onboarding/CHATGPT_PROJECT_SETUP.md`
- `docs/bible/03-database-and-supabase-boundaries.md`
- `docs/bible/05-product-requirements-mvp-split.md`
- `docs/roadmap/SPRINTS.md`
- `docs/roadmap/SPRINT_3.md`
- `docs/reports/2026-07-18-coach-policy-inventory.md`
- `src/components/CoachRequestPanel.tsx`
- `src/components/CoachRequestPanel.test.ts`
- `src/coachFeature.ts`
- `src/coachRequestState.ts`
- `src/types.ts`
- `src/verticals/SportVertical.tsx`
- `supabase/migration_v7_coach_requests_and_ratings.sql`
- `supabase/migrations/20260704_coach_requests_and_ratings.sql`

## Changes made

- Added this Draft end-to-end product and production implementation plan.
- No application code, SQL, RLS, auth, secrets, migrations, or production data changed.

## Checks

Documentation-only change. Application checks were not executed through the GitHub connector.

## Next step

Start with `COACH-001`: obtain the read-only production Supabase inventory. Do not design or apply a corrective Coach migration until the deployed policy state is known and explicitly approved.
