---
title: GO IRL Beauty Prototype Plan
owner: Product Lead
status: Draft
source_of_truth: false
work_id: BEAUTY004
parent_work_id: BEAUTY003
domain: Services
vertical: Beauty
segment: Manicure and Pedicure
last_review: 2026-07-30
next_review: 2026-08-06
---

# GO IRL Beauty Prototype Plan

## Decision

BEAUTY004 defines a bounded local or mock-data clickable prototype for `Services -> Beauty -> Manicure & Pedicure`.

The prototype exists to test usability, comprehension, task completion, and product-flow coherence before any production implementation decision.

This plan does not authorize production Supabase writes, schema creation, SQL, migrations, RLS, authentication changes, secrets, provider credentials, Google OAuth, WhatsApp Cloud API, deployment, production configuration, production analytics, or production-data use.

## Scope boundary

The prototype must preserve the approved product constraints:

- one solo Professional;
- one primary location;
- one Service per Booking;
- public browser Booking without Client account creation;
- pending-by-default confirmation;
- GO IRL as the conceptual Appointment source of truth;
- Google Calendar represented only by mock busy states;
- WhatsApp represented only by a user-initiated Click-to-Chat action;
- no payments, deposits, marketplace, ratings, reviews, CRM breadth, multi-professional scheduling, or additional Beauty categories.

Activities and Services remain separate. The prototype must not reuse Activity participants, Activity Chat, capacity, join-request, or attendance mechanics as the Services model.

## Prototype outcome

Produce a clickable mobile-first prototype that allows reviewers to complete the core Professional and Client tasks and record confusion, hesitation, errors, and unsupported expectations.

The prototype should answer:

1. Can a solo nail Professional publish a usable booking page without training?
2. Can a Client understand the difference between Booking request and confirmed Appointment?
3. Can both roles understand the next action in pending, confirmed, declined, cancelled, conflict, and rescheduling states?
4. Can the Professional manage Today, Week, Services, Availability, Time Blocks, and Appointments without salon-software complexity?
5. Do users understand that Google Calendar is optional and non-canonical?
6. Can the flow complete without WhatsApp?
7. Are private Client and calendar details visibly protected?

## Prototype format

Preferred format:

- mobile-first clickable prototype;
- browser-accessible or local design artifact;
- mock data only;
- deterministic scripted states;
- no live backend dependency;
- no production deployment requirement;
- no real Client contact data.

A static screen set is insufficient if it cannot demonstrate navigation and state transitions. A coded prototype is permitted only when it remains local/mock-only and introduces no production-sensitive integration.

## Required prototype surfaces

### Professional

- Beauty entry and setup;
- onboarding profile step;
- first Service creation;
- weekly Availability setup;
- publish and share result;
- Today view;
- Week view;
- Appointments list;
- Appointment detail;
- pending confirmation action;
- decline action;
- reschedule action;
- cancel action;
- complete and no-show actions;
- manual Appointment creation;
- Time Block creation;
- Services list and editor;
- Availability editor;
- public-page preview;
- settings boundary showing integrations as unavailable or mock.

### Client

- public Professional page;
- Service selection;
- date and time selection;
- contact and notices step;
- submission progress;
- pending result;
- confirmed result;
- secure-link Appointment view;
- rescheduling request;
- cancellation;
- invalid or expired-link state;
- no-slots state;
- slot-taken conflict state;
- WhatsApp Click-to-Chat action.

## Required scripted scenarios

### Scenario P1 — First setup

1. Professional opens `Set up Beauty`.
2. Adds display name, city, location summary, and contact number.
3. Adds one manicure Service with duration, price, and buffer.
4. Sets weekly Availability.
5. Reviews and publishes the booking page.
6. Copies or shares the public link.

Expected signal: reviewer can complete the setup without external explanation and understands what is public versus private.

### Scenario P2 — Daily operation

1. Professional opens Today.
2. Identifies one pending Appointment.
3. Opens Appointment detail.
4. Confirms the Appointment.
5. Opens WhatsApp optionally.
6. Finds the next confirmed Client.

Expected signal: status and next action are immediately understandable.

### Scenario P3 — Manual Appointment and Time Block

1. Professional creates a manual confirmed Appointment.
2. Attempts a conflicting Appointment.
3. Sees a blocked conflict state.
4. Creates a Time Block in another free interval.

Expected signal: the difference between Appointment and Time Block is clear and conflict prevention is visible as a product rule, not claimed as production concurrency proof.

### Scenario P4 — Reschedule and cancel

1. Professional opens a confirmed Appointment.
2. Proposes another time.
3. Reviews old and new time.
4. Confirms the change.
5. Cancels another Appointment.

Expected signal: destructive and schedule-changing actions are explicit, reversible where appropriate, and understandable.

### Scenario C1 — Guest Booking

1. Client opens a public link.
2. Chooses one Service.
3. Chooses a date and time.
4. Enters name and phone number.
5. Reviews notices.
6. Submits the Booking request.
7. Sees `Waiting for confirmation`.

Expected signal: Client does not believe the Appointment is final before Professional confirmation.

### Scenario C2 — Confirmed Appointment management

1. Client opens a mocked secure management link.
2. Sees confirmed Appointment details.
3. Requests another time.
4. Understands that the current Appointment remains active until approval.
5. Cancels through a separate scripted Appointment.

Expected signal: rescheduling request and cancellation are not confused.

### Scenario C3 — Conflict and error recovery

1. Client selects a slot.
2. Submission returns `This time was just taken`.
3. Client returns to refreshed slot selection.
4. Network failure is shown on another attempt.
5. Client can retry safely.

Expected signal: the next action is clear and duplicate submission is discouraged.

### Scenario C4 — Privacy and optional integrations

1. Client views the public page.
2. Confirms that no other Client or calendar details are visible.
3. Sees WhatsApp as optional.
4. Completes Booking without WhatsApp.
5. Sees only approved location detail before confirmation and fuller detail after confirmation.

Expected signal: privacy boundaries are visible in the UX.

## Mock data model

Use fictional Czech-first data only.

Example Professional:

- display name: `Studio Anna`;
- city: `Olomouc`;
- location summary: `Centrum, Olomouc`;
- exact address hidden until confirmation;
- public contact action available.

Example Services:

- Manicure;
- Manicure with gel polish;
- Gel polish removal;
- Pedicure.

Example Appointment states:

- pending;
- confirmed;
- declined;
- cancelled;
- completed;
- no-show.

Do not use real names, phone numbers, addresses, calendar events, secure tokens, or production identifiers.

## State and copy requirements

Each state must show:

- current status;
- what happened;
- whether the Appointment is final;
- the next available action;
- any consequence of the action;
- a safe recovery path for errors.

Use the Czech-first copy keys from BEAUTY002 with Russian and English fallback for review. Final Czech production copy is outside BEAUTY004 and requires native-language review.

## Prototype-only conflict behavior

The prototype may simulate conflict control through scripted state transitions.

It must explicitly state in its documentation that:

- frontend simulation does not prove atomic conflict prevention;
- no production concurrency guarantee is claimed;
- authoritative conflict control remains a BEAUTY005 implementation and verification requirement;
- pending-slot hold duration remains unresolved.

## Privacy and security simulation boundary

The prototype may demonstrate:

- masked phone display in lists;
- public versus confirmation-only address;
- generic invalid-link errors;
- anonymous Google `Busy` blocks;
- privacy notices;
- optional WhatsApp consent wording;
- support warning not to share raw secure links.

The prototype must not:

- use real bearer tokens;
- simulate weak or guessable secure links as an approved design;
- expose real provider credentials;
- store real contact data;
- make legal claims about controller roles or lawful basis;
- claim production-grade rate limiting, RLS, encryption, retention, or deletion.

## Usability test plan

### Participants

Minimum review set before BEAUTY004 can be considered complete:

- one primary design-partner Professional;
- two additional solo manicure or pedicure Professionals where available;
- three Client-role reviewers who are not involved in creating the prototype.

This is a target, not evidence of recruitment or completion.

### Method

- moderated mobile task walkthrough;
- ask participants to think aloud;
- avoid teaching the interface before each task;
- record task outcome and confusion notes;
- do not collect unnecessary personal data;
- use fictional scenarios and mock contact details.

### Measures

For each task capture:

- completed without help: yes/no;
- completion time;
- wrong path count;
- backtracks;
- hesitation points;
- misunderstood labels;
- state misunderstanding;
- support required;
- abandonment point;
- severity of each issue.

No numeric success threshold is approved in advance. BEAUTY004 should provide observed results and a recommendation, not manufacture validation.

## Confusion log

Every issue must include:

- issue ID;
- role: Professional or Client;
- screen and task;
- observed behavior;
- expected behavior;
- evidence type: observation, quote summary, or reviewer note;
- severity: blocker, high, medium, low;
- proposed correction;
- scope effect;
- resolved in prototype: yes/no.

Direct participant quotes should be brief, consented where required, and stripped of personal data.

## Prototype acceptance criteria

BEAUTY004 may move from Draft only when:

- all required Professional and Client surfaces exist;
- required scripted scenarios are clickable end to end;
- pending versus confirmed is understandable in testing;
- manual Appointment and Time Block are distinguishable;
- conflict, network, no-slots, and expired-link states are demonstrated;
- Activities concepts are not used as the Services model;
- mock data contains no real personal or production data;
- Google Calendar is represented only by anonymous mock busy states;
- WhatsApp remains optional Click-to-Chat;
- the prototype works without production Supabase or provider configuration;
- a confusion log and test summary are persisted;
- unresolved blockers are explicit;
- Product Owner reviews the evidence before any BEAUTY005 decision.

## Exit deliverables

Required artifacts:

1. clickable prototype or locally runnable mock prototype;
2. screen and flow inventory;
3. scripted scenario checklist;
4. confusion log;
5. usability test summary;
6. change recommendations mapped to BEAUTY001–003 boundaries;
7. explicit list of unresolved product, legal, privacy, security, and technical decisions;
8. recommendation: proceed, revise, narrow, or stop.

## Protected-action boundary

BEAUTY004 does not authorize:

- production schema or database design;
- SQL, migrations, or RLS;
- auth changes;
- secrets or credentials;
- real Google OAuth;
- WhatsApp Cloud API;
- production notifications;
- deployment or production configuration;
- production analytics;
- real Client data;
- Gate F approval;
- BEAUTY005 production pilot.

Any coded prototype change must remain local/mock-only and must pass applicable repository checks before a non-draft PR.

## Current recommendation

Build and test the smallest clickable mobile prototype covering the required scenarios. Use the evidence to revise BEAUTY001–003 where necessary. Do not advance to BEAUTY005 until the prototype evidence is reviewed, Gate F requirements are satisfied, and every protected production change receives separate explicit approval.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
BEAUTY004 is the local or mock-data prototype stage in the gated BEAUTY001–005 sequence | `GH:docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md@f6659c73c113f4d29ab5db125b46d7190a44c91e` | Services and Beauty delivery sequence only
BEAUTY002 defines the required Professional and Client tasks, states, copy, and prototype test inputs | `GH:docs/GO_IRL_BEAUTY_UX_SPEC.md@de5391372fdf797fee034c5628a43c514bf0054a` | UX and prototype-flow requirements
BEAUTY003 requires BEAUTY004 to remain local or mock-only and identifies privacy, conflict, secure-link, integration, and threat boundaries | `GH:docs/GO_IRL_BEAUTY_ARCHITECTURE_PRIVACY_REVIEW.md@78f59da0e993bd2c56ee3cbad8724eea0f5b8206` | Architecture, privacy, safety, and implementation boundary
Current `main` at BEAUTY004 start is merge commit `5827f5bc845eebddcb883803d4191ad054decba7` | `GH:main@5827f5bc845eebddcb883803d4191ad054decba7` | Branch base and start-state identity only
