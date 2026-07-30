---
title: GO IRL Beauty UX Specification
owner: Product Lead
status: Draft
source_of_truth: false
work_id: BEAUTY002
parent_work_id: BEAUTY001
domain: Services
vertical: Beauty
segment: Manicure and Pedicure
last_review: 2026-07-30
next_review: 2026-08-06
---

# GO IRL Beauty UX Specification

## Decision

BEAUTY002 defines the browser-first Client experience and mobile-first Professional experience for `Services -> Beauty -> Manicure & Pedicure`.

It is a docs-only specification. It does not authorize production schema, SQL, migrations, RLS, authentication, secrets, Google OAuth, WhatsApp Cloud API, provider credentials, deployment, production configuration, or production-data changes.

## UX goals

The product must let a solo manicure or pedicure Professional publish a usable booking page, maintain Availability, manage Appointments, and reduce manual time negotiation.

The Client must be able to select one Service, choose an available time, submit a Booking without account creation, receive a clear state, and later cancel or request rescheduling through a secure link.

Primary UX qualities:

- simple enough for first-time use without training;
- optimized for one-handed mobile use;
- explicit status and next action on every state;
- no mandatory Telegram login for Clients;
- no dependency on WhatsApp to complete Booking;
- no hidden transition from Booking to confirmed Appointment;
- no exposure of other Clients or private calendar details.

## Roles

### Professional

A solo manicure or pedicure provider with one primary location who manages Appointments from a phone.

### Client

A person booking one Service from a public browser link without creating a GO IRL account.

## Information architecture

### Professional navigation

```text
Beauty
├── Today
├── Week
├── Appointments
├── Services
├── Availability
├── Public page
└── Settings
```

Default landing screen: `Today`.

Persistent primary actions:

- `Add Appointment`;
- `Block time`;
- `Share booking page`.

### Client flow

```text
Public page
→ Service
→ Date and time
→ Contact and notices
→ Booking result
→ Appointment management link
```

The Client flow must not expose Professional administration, other Client Appointments, Google Calendar event details, or internal notes.

## Professional onboarding

### Entry

Entry action: `Set up Beauty`.

The onboarding should be progressive. Only information required to publish the first usable booking page is mandatory.

### Step 1 — Profile

Required:

- display name;
- city;
- one location description;
- WhatsApp phone or other direct contact number.

Optional:

- profile photo;
- short description;
- exact address;
- preparation note.

Primary action: `Continue`.

Validation:

- display name cannot be empty;
- phone number must be normalized for display and Click-to-Chat;
- private fields must be labeled as private;
- exact address may remain hidden until an Appointment is confirmed.

### Step 2 — First Service

Required:

- Service name;
- duration;
- price.

Optional:

- description;
- buffer after Service;
- preparation instructions.

Suggested presets may include:

- Manicure;
- Manicure with gel polish;
- Gel polish removal;
- Pedicure;
- Pedicure with gel polish.

Presets are editable and do not define separate product models.

Primary action: `Add service`.

### Step 3 — Weekly Availability

Default interaction:

- select working days;
- set start and end time;
- optionally add one break interval;
- copy hours to other selected days.

Primary action: `Save availability`.

The screen must explain that Availability defines when Clients may request a Booking and that Time Blocks can remove specific intervals later.

### Step 4 — Publish

Review:

- public name;
- location;
- first Service;
- working days;
- public booking link.

Primary action: `Publish booking page`.

Secondary action: `Preview`.

Success state:

- public link displayed;
- `Copy link`;
- `Share in WhatsApp`;
- `Open public page`.

Google Calendar connection is optional and must not block publishing.

## Professional Today screen

### Purpose

Show the minimum operational information needed for the current day.

### Content order

1. current date;
2. pending Appointments requiring action;
3. confirmed Appointments in chronological order;
4. Time Blocks;
5. empty-state actions.

### Appointment card

Display:

- start time;
- Client first name;
- Service;
- duration;
- status;
- direct action indicator when attention is required.

Do not display full phone number by default in the list.

Tap opens Appointment detail.

### Primary actions

- `Add Appointment`;
- `Block time`;
- `Open week`.

### Empty state

Title: `No appointments today`.

Actions:

- `Add Appointment`;
- `Block time`;
- `Share booking page`.

## Professional Week screen

### Purpose

Provide a compact operational overview, not a complex salon calendar.

Required behavior:

- seven-day navigation;
- chronological daily columns or stacked day sections suitable for mobile;
- visual distinction between pending, confirmed, completed, cancelled, no-show, and Time Block;
- tap an item to open detail;
- tap free time to create manual Appointment or Time Block;
- no display of external Google event titles to Clients or public surfaces.

Google busy intervals, when supported, must appear as anonymous `Busy` blocks.

## Appointment detail

### Header

Display:

- status;
- date and time;
- Service;
- Client name;
- Client contact action;
- source: public Booking or manual entry.

### Actions by status

Pending:

- `Confirm`;
- `Decline`;
- `Propose another time`;
- `Open WhatsApp`.

Confirmed:

- `Reschedule`;
- `Cancel`;
- `Mark completed`;
- `Mark no-show`;
- `Open WhatsApp`.

Completed:

- view-only summary;
- optional `Book again` shortcut deferred until later validation.

Cancelled or declined:

- view-only summary;
- optional `Create new Appointment`.

### Confirmation dialog

Before confirmation, show:

- Service;
- date and time;
- Client name;
- conflict check result;
- action `Confirm Appointment`.

If the slot is no longer available, confirmation must be blocked and the Professional must choose another time.

### Decline dialog

Required:

- clear irreversible effect;
- optional reason visible to Client only if approved copy exists;
- action `Decline Booking`.

### Cancel dialog

Required:

- Appointment summary;
- optional reason;
- warning that the Client will see the cancellation state;
- action `Cancel Appointment`.

### Reschedule flow

1. select another available time;
2. review old and new time;
3. confirm change;
4. show updated Appointment state.

Client-requested rescheduling remains pending until the Professional approves the new time.

## Manual Appointment creation

### Entry points

- `Add Appointment` from Today;
- tap free time in Week;
- action from Appointments list.

### Required fields

- Service;
- date;
- start time;
- Client name;
- phone number.

Defaults:

- duration from selected Service;
- buffer from selected Service;
- status `confirmed` for Professional-created Appointments.

Validation:

- prevent overlap with confirmed or protected intervals;
- show conflict before submission;
- do not require a GO IRL Client account.

Primary action: `Create Appointment`.

## Time Block flow

### Entry points

- `Block time`;
- tap free time in Week.

### Required fields

- date;
- start time;
- end time.

Optional private label:

- Personal;
- Break;
- Unavailable;
- Custom.

The label is never shown to Clients. Clients only see that the time is unavailable.

Primary action: `Block time`.

## Services screen

### Service list

Display:

- name;
- duration;
- price;
- active/inactive state.

Primary action: `Add service`.

### Service editor

Fields:

- name;
- description;
- duration;
- price;
- optional buffer after Service;
- optional preparation instructions;
- active/inactive toggle.

Rules:

- one Service per Booking in MVP;
- inactive Services are hidden from new Client Booking but remain visible in existing Appointment history;
- deletion behavior belongs to BEAUTY003; UX should prefer deactivation over destructive deletion.

## Availability screen

### Weekly rules

For each weekday:

- working/non-working toggle;
- one or more working intervals, subject to BEAUTY003 feasibility review;
- optional break;
- copy to other days.

### Exceptions

Use Time Blocks for specific unavailable dates or intervals.

The screen must distinguish:

- recurring Availability;
- one-time Time Blocks;
- Google busy intervals when connected;
- existing Appointments.

## Public Professional page

### Content priority

1. Professional name and photo;
2. city and location summary;
3. Services;
4. price and duration;
5. short description;
6. preparation or cancellation notice;
7. direct WhatsApp contact;
8. booking action.

### Service card

Display:

- Service name;
- short description;
- duration;
- price;
- action `Choose`.

Only active Services appear.

### Trust and privacy

The page must not expose:

- Client identities;
- Appointment details;
- Google Calendar titles;
- private Professional notes;
- exact private address when configured as confirmation-only.

## Client Booking flow

### Step 1 — Select Service

One Service only.

Primary action: `Choose`.

Empty state:

- `This professional is not accepting online bookings yet.`
- `Contact in WhatsApp` when available.

### Step 2 — Select date and time

Display:

- upcoming available dates;
- only bookable slots;
- Service duration;
- local timezone label when ambiguity exists.

Do not display:

- names of other Clients;
- reasons for Time Blocks;
- Google event details.

No slots state:

- `No available times in this period.`
- actions `Show next dates` and `Contact in WhatsApp`.

### Step 3 — Contact and notices

Required fields:

- first name or preferred name;
- phone number.

Required notices:

- Appointment administration and contact-use notice;
- cancellation or rescheduling policy;
- pending confirmation explanation.

Optional WhatsApp consent must be separate from the processing required to administer the Appointment. Exact legal copy belongs to BEAUTY003.

Primary action: `Request Appointment`.

### Submission state

Disable repeated submission and show progress.

If the slot became unavailable:

- do not create a duplicate or conflicting Appointment;
- show `This time was just taken.`;
- return to slot selection with refreshed Availability.

### Result — Pending

Title: `Request sent`.

Display:

- Service;
- requested date and time;
- Professional;
- explanation that the Appointment is not final until confirmed;
- secure management link availability;
- `Add to calendar` only if product policy clearly marks it as tentative, otherwise defer until confirmation;
- `Contact in WhatsApp`.

### Result — Confirmed

Title: `Appointment confirmed`.

Display:

- date and time;
- Service;
- duration;
- location details allowed for confirmed Clients;
- `Add to calendar`;
- `Manage Appointment`;
- `Contact in WhatsApp`.

## Client Appointment management

The Client opens a secure link without logging in.

### Confirmed Appointment screen

Display:

- current status;
- Service;
- Professional;
- date and time;
- location;
- policy summary.

Actions:

- `Request another time`;
- `Cancel Appointment`;
- `Add to calendar`;
- `Contact in WhatsApp`.

### Rescheduling request

1. open secure link;
2. choose another available time;
3. review old and requested time;
4. submit request;
5. show `Reschedule request sent`;
6. retain current confirmed Appointment until Professional approval unless BEAUTY003 specifies another safe rule.

### Cancellation

1. open secure link;
2. show Appointment summary and cancellation policy;
3. confirm cancellation;
4. show `Appointment cancelled`.

Expired, invalid, revoked, or already-used links must show a safe generic error without revealing private Appointment data.

## Status model in UX

### Pending

Meaning: Client submitted a Booking; Professional action is required.

Client label: `Waiting for confirmation`.

Professional label: `Needs confirmation`.

### Confirmed

Meaning: Appointment is accepted and final unless changed or cancelled.

Label: `Confirmed`.

### Declined

Meaning: Professional did not accept the requested Appointment.

Label: `Not accepted`.

### Cancelled

Meaning: Appointment ended before completion.

Label: `Cancelled`.

### Completed

Meaning: service took place.

Label: `Completed`.

### No-show

Meaning: Client did not attend.

Professional-only operational label: `No-show`.

## Error and edge states

BEAUTY002 requires explicit UX for:

- no Services;
- no Availability;
- no free slots;
- slot taken during submission;
- duplicate tap or retry;
- pending confirmation;
- decline;
- cancellation;
- rescheduling pending;
- Appointment changed by Professional;
- expired secure link;
- revoked secure link;
- network failure;
- timezone ambiguity;
- Google Calendar disconnected;
- Google busy data stale;
- WhatsApp unavailable;
- invalid phone number;
- Professional paused online Booking;
- Service became inactive after selection.

Errors must explain the next action and must not expose implementation details.

## Czech-first copy map

The production copy must be reviewed by a native Czech speaker before pilot use. The following English keys define meaning, not final translation.

| Key | Czech draft | Russian fallback | English fallback |
| --- | --- | --- | --- |
| choose_service | Vybrat službu | Выбрать услугу | Choose service |
| choose_time | Vybrat čas | Выбрать время | Choose time |
| request_appointment | Požádat o termín | Запросить запись | Request Appointment |
| request_sent | Žádost byla odeslána | Запрос отправлен | Request sent |
| waiting_confirmation | Čeká na potvrzení | Ожидает подтверждения | Waiting for confirmation |
| appointment_confirmed | Termín je potvrzen | Запись подтверждена | Appointment confirmed |
| reschedule | Změnit termín | Перенести | Reschedule |
| cancel_appointment | Zrušit termín | Отменить запись | Cancel Appointment |
| contact_whatsapp | Napsat na WhatsApp | Написать в WhatsApp | Contact in WhatsApp |
| add_to_calendar | Přidat do kalendáře | Добавить в календарь | Add to calendar |
| no_slots | Nejsou volné termíny | Нет свободного времени | No available times |
| slot_taken | Tento termín už není dostupný | Это время уже занято | This time was just taken |
| block_time | Zablokovat čas | Заблокировать время | Block time |
| add_appointment | Přidat termín | Добавить запись | Add Appointment |

## Accessibility and mobile requirements

- minimum touch target suitable for mobile use;
- no status conveyed by color alone;
- visible focus states for browser navigation;
- readable text without horizontal scrolling;
- form labels remain visible after input;
- validation is associated with the relevant field;
- dialogs require explicit confirmation for destructive actions;
- date and time controls must work without precise drag gestures;
- screen reader labels for status, actions, and time slots;
- support browser zoom and dynamic text where practical.

## Analytics events for prototype and pilot planning

No production analytics implementation is authorized here. BEAUTY003 must review data minimization.

Candidate events:

- onboarding_started;
- profile_saved;
- first_service_added;
- availability_saved;
- booking_page_published;
- public_page_viewed;
- service_selected;
- slot_selected;
- booking_submitted;
- booking_conflict_shown;
- appointment_confirmed;
- appointment_declined;
- appointment_cancelled;
- reschedule_requested;
- manual_appointment_created;
- time_block_created;
- whatsapp_link_opened.

Analytics payloads must not contain Client name, phone number, free-text notes, or private calendar data.

## Prototype test plan

BEAUTY004 should test at minimum:

### Professional tasks

1. create profile and first Service;
2. set weekly Availability;
3. publish and share booking page;
4. confirm a pending Appointment;
5. create a manual Appointment;
6. block time;
7. reschedule and cancel;
8. find today's next Client.

### Client tasks

1. choose one Service;
2. find an available time;
3. submit Booking without account creation;
4. understand pending versus confirmed;
5. request rescheduling;
6. cancel through secure link;
7. add confirmed Appointment to calendar;
8. contact Professional in WhatsApp.

Capture:

- task completion;
- time on task;
- errors;
- hesitation points;
- misunderstood labels;
- abandonment point;
- support required.

## Acceptance criteria

BEAUTY002 may move from Draft when:

- Professional onboarding is fully specified;
- Today and Week operational views are specified;
- Service and Availability editing are specified;
- manual Appointment and Time Block flows are specified;
- Client public Booking flow is specified;
- pending, confirmation, decline, cancellation, and rescheduling flows are specified;
- critical empty, loading, conflict, error, and expired-link states are specified;
- Czech-first copy keys with Russian and English fallbacks are present;
- Google Calendar remains optional and non-canonical;
- WhatsApp remains Click-to-Chat only for MVP;
- no protected implementation change is included;
- Product Owner explicitly approves transition to BEAUTY003.

## Current recommendation

Use this specification to produce a clickable mobile prototype and confusion log in BEAUTY004 after BEAUTY003 has reviewed architecture and privacy boundaries. Do not start database, auth, RLS, provider integration, Google OAuth, WhatsApp Cloud API, deployment, or production implementation.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
Beauty is the first approved vertical inside Services | `docs/decisions/2026-07-29-beauty-inclusion.md` on current `main` | Product structure and terminology
BEAUTY001 defines the solo manicure and pedicure segment, guest Booking, pending confirmation, Google Calendar boundary, and WhatsApp Click-to-Chat scope | `docs/GO_IRL_BEAUTY_PRODUCT_BRIEF.md` on current `main` | UX constraints and product boundary
Services documentation follows BEAUTY001–005 and remains gated | `docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md` on current `main` | Delivery order and approval gates
Gemini research recommends a lightweight booking page and mobile-first flow | Drive document `19UKhXOUrl-8pqEpuDs5R5-8gdLDmanbJ1LkcbKV3Y1E` | Research input only; unverified external claims are not adopted
