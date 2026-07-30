---
title: GO IRL Beauty Architecture and Privacy Review
owner: Product Lead
status: Draft
source_of_truth: false
work_id: BEAUTY003
parent_work_id: BEAUTY002
domain: Services
vertical: Beauty
segment: Manicure and Pedicure
last_review: 2026-07-30
next_review: 2026-08-06
---

# GO IRL Beauty Architecture and Privacy Review

## Decision

BEAUTY003 defines the minimum safe architecture, privacy, retention, integration, and data-boundary requirements for `Services -> Beauty -> Manicure & Pedicure`.

This is a docs-only review. It does not authorize schema creation, SQL, migrations, RLS changes, authentication changes, secrets, provider credentials, Google OAuth configuration, WhatsApp Cloud API configuration, deployment, production configuration, or production-data changes.

## Scope boundary

The reviewed product remains:

- one solo Professional;
- one primary location;
- one Service per Booking;
- public browser Booking without Client account creation;
- pending-by-default confirmation;
- GO IRL as canonical Appointment state;
- Google Calendar optional and non-canonical;
- WhatsApp limited to user-initiated Click-to-Chat in MVP;
- no payments, deposits, marketplace, reviews, CRM breadth, multi-professional scheduling, or additional Beauty categories.

Activities and Services must remain separate product and data domains. Activity participants, Activity Chat, capacity, join requests, attendance state, or organizer membership must not become the primary model for Services.

## Architecture principles

1. Use the smallest architecture that can prevent confirmed double booking and protect Client contact data.
2. Keep the existing GO IRL frontend, Supabase backend, trusted Telegram auth, and RLS boundaries intact unless separately approved.
3. Treat public guest Booking as an untrusted external write path.
4. Keep privileged credentials and service-role access outside the browser.
5. Make Appointment state authoritative in GO IRL; integrations synchronize selected facts only.
6. Keep Browser Demo Mode local or mock-only and isolated from production writes.
7. Prefer reversible state transitions and deactivation over destructive deletion.
8. Collect and expose only data necessary to administer the Appointment.

## Proposed runtime boundary

```text
Professional Telegram Mini App
        -> trusted Telegram initData verification
        -> short-lived trusted session
        -> RLS-protected Professional operations

Public Client browser
        -> public read surface
        -> rate-limited server-mediated Booking command
        -> authoritative conflict check and Appointment creation
        -> opaque secure management token

GO IRL Appointment state
        -> optional Google Calendar busy read/export
        -> user-initiated WhatsApp Click-to-Chat
```

The public browser must not receive service-role credentials, Google refresh tokens, unrestricted table access, other Client data, private Professional notes, or external calendar event details.

## Identity and access model

### Professional

Professional administration requires a trusted server-verified identity. The current GO IRL production trust chain is Telegram `initData` verification followed by a server-issued session used with Supabase RLS.

BEAUTY003 does not authorize a second production authentication system. A non-Telegram Professional login would require a separate product and security decision.

Minimum Professional permissions:

- manage own public Beauty profile;
- manage own Services, Availability, Time Blocks, and Appointments;
- read Client contact data only for own Appointments;
- operate Google Calendar connection only for own account;
- access operational audit history only where explicitly required.

A Professional must not access another Professional's private records.

### Client

The Client does not create a GO IRL account in MVP.

Public Client capabilities are limited to:

- read one published Professional page and active Services;
- read derived available slots, not raw calendar or Appointment records;
- submit one Booking request through a controlled server boundary;
- view or change one Appointment through an opaque secure management link.

A secure management link is a bearer capability, not identity proof. It must be high-entropy, scoped to one Appointment, revocable, expiring, and safe against enumeration.

### Administrative access

Support, moderator, or administrator access to Client contact data is not granted by BEAUTY003. Any exceptional support access requires a separately reviewed role, purpose, audit trail, and least-privilege policy.

## Conceptual data domains

This section defines concepts, not SQL or migration instructions.

### Public Professional data

May include:

- public display name;
- approved profile photo;
- city and location summary;
- public description;
- active Services;
- price, duration, and preparation information;
- public booking status;
- approved WhatsApp contact link.

Exact address may remain confirmation-only.

### Private Professional data

May include:

- normalized contact number;
- private location details;
- Availability rules;
- Time Block labels;
- internal notes;
- integration configuration and token references;
- operational preferences.

### Client and Appointment data

Minimum required fields:

- Client preferred name;
- normalized phone number;
- selected Service reference;
- requested and current start/end time;
- timezone;
- Appointment status;
- source: public Booking or manual entry;
- timestamps required for administration and audit;
- cancellation or rescheduling state.

Not required in MVP:

- birth date;
- medical or health information;
- government identifiers;
- payment data;
- full message history;
- marketing profile;
- unnecessary email address;
- external calendar event title or description.

### Integration data

Google Calendar data must be reduced to the minimum needed for availability and export. External busy intervals should become anonymous availability exclusions. Client-facing surfaces must never expose external event titles, attendees, descriptions, conference links, or private notes.

WhatsApp Click-to-Chat does not require GO IRL to ingest or store conversation contents.

## Booking and conflict-control boundary

### Public Booking command

The Booking submission path must be server-mediated and must:

- validate Professional and Service are active;
- validate requested time and timezone;
- recompute availability at submission time;
- apply rate limits and abuse checks;
- reject duplicate or stale submissions;
- create no confirmed double booking;
- return only the minimum result state;
- avoid exposing internal failure details.

Client-side slot checks are advisory UX only and cannot be the authoritative conflict control.

### Slot protection

A pending Booking may temporarily protect a slot, but the exact mechanism and duration require technical feasibility review before implementation.

Required properties:

- bounded expiration;
- deterministic release after expiry, decline, cancellation, or failed creation;
- no permanent slot loss after interrupted requests;
- idempotent retry behavior;
- authoritative conflict rejection at the data boundary;
- observability for stuck or excessive pending holds.

No numeric hold duration is approved by this document.

### Confirmation

Professional confirmation must repeat the authoritative conflict check. If the slot is no longer available, confirmation is blocked and another time must be selected.

Manual Professional Appointments may start as confirmed only after the same authoritative conflict check.

### Rescheduling

A Client rescheduling request must not silently replace the existing confirmed Appointment. The existing confirmed time remains authoritative until the Professional accepts the new time, unless a separately reviewed rule proves safer.

## Status and state-transition rules

Core states:

- `pending`;
- `confirmed`;
- `declined`;
- `cancelled`;
- `completed`;
- `no-show`.

Required transition properties:

- transitions are explicit and auditable;
- repeated commands are idempotent;
- terminal states cannot be accidentally reopened;
- decline and cancellation release any protected interval;
- completed and no-show are Professional-only operational actions;
- inactive Services remain resolvable for historical Appointments;
- deletion must not break Appointment history.

## Privacy roles and legal review boundary

For pilot planning, the likely operating model is:

- the Professional determines the purpose and practical use of Client Appointment data for service administration;
- GO IRL provides the booking and Appointment system and may act as a processor or joint/independent controller for limited platform purposes depending on the final operating model;
- Google and Meta remain separate external providers under their own terms.

This classification is not a legal conclusion. A qualified human privacy review must confirm controller/processor roles, lawful bases, notices, agreements, international-transfer implications, and provider terms before Gate F.

Required privacy principles:

- purpose limitation;
- data minimization;
- storage limitation;
- accuracy and correction;
- confidentiality and integrity;
- privacy by design and default;
- demonstrable accountability.

Appointment administration must not rely on optional marketing consent. Optional WhatsApp messaging consent, where required, must be separate and revocable.

## Notice and consent model

Before Booking submission, the Client must receive concise notices covering:

- who the Professional is;
- GO IRL's role;
- what data is collected;
- why it is needed;
- who receives it;
- retention approach;
- how to correct, cancel, delete, or request access;
- whether WhatsApp contact is optional;
- that the Booking remains pending until confirmed.

Required Appointment administration data should be separated from optional communication or marketing consent.

No pre-checked optional consent is approved.

## Retention and deletion policy proposal

Retention must be configurable and confirmed by privacy/legal review before production.

Proposed minimum approach for pilot planning:

- active and future Appointments: retain while operationally necessary;
- recently completed, cancelled, declined, or no-show Appointments: retain for a bounded support and dispute period;
- expired secure-link tokens: revoke immediately and remove or irreversibly hash according to implementation design;
- Google synchronization metadata: retain only while the connection or mapped event exists;
- audit records: retain only the minimum event, actor, timestamp, and result necessary for security and support;
- free-text notes: avoid in MVP; where later approved, apply shorter retention and strict access.

No final retention duration is approved by this document. BEAUTY005 cannot start until durations, deletion triggers, legal obligations, and backup behavior are explicitly approved.

Deletion behavior must distinguish:

- deactivation of a Service or profile;
- Client cancellation;
- correction of inaccurate data;
- deletion or anonymization request;
- retention required for a legitimate dispute or legal obligation;
- technical backup expiry.

Hard deletion must not silently destroy required audit evidence or leave orphaned integration records.

## Secure management links

A Client management link must:

- contain no phone number, Client name, Appointment ID sequence, or other guessable identifier;
- use a high-entropy random token;
- be stored in a non-reversible form where feasible;
- be scoped to one Appointment and permitted actions;
- expire after a bounded period;
- support revocation and rotation;
- return a generic error for invalid, expired, revoked, or used tokens;
- be rate-limited;
- avoid logging the raw token;
- avoid leaking through analytics, referrers, screenshots, or support exports.

Whether cancellation links are single-use and whether rescheduling creates a rotated token must be decided in the technical design review.

## Rate limiting and abuse protection

Minimum reviewed controls:

- Booking submissions per IP, device signal, Professional, phone number, and time window;
- secure-link attempts;
- repeated slot scans where abuse is detected;
- duplicate submission idempotency;
- suspicious Professional actions;
- notification or WhatsApp-link abuse where later applicable.

Controls must avoid excessive fingerprinting. Any device or network signal must be justified, minimized, retained briefly, and reviewed for privacy impact.

CAPTCHA or equivalent friction is not mandatory by default; it may be introduced only when evidence shows abuse and accessibility impact is reviewed.

## Audit and observability

Audit events should capture only:

- actor class: Professional, Client capability, system, or approved support role;
- action type;
- Appointment or aggregate object reference;
- timestamp;
- previous and resulting status where needed;
- success or bounded error category;
- integration result without external private content.

Do not place Client phone number, raw secure tokens, Google event contents, WhatsApp conversation contents, or free-text private notes in analytics or general logs.

Operational alerts should cover:

- repeated conflict failures;
- stuck pending holds;
- unauthorized access attempts;
- secure-link abuse;
- Google synchronization failures;
- unusual export or support access;
- retention/deletion job failures.

## Google Calendar boundary

Google Calendar remains optional and non-canonical.

### Read-busy

Preferred product behavior:

- read only availability/busy intervals required for the selected calendar and time range;
- transform them into anonymous `Busy` blocks;
- do not import external titles, descriptions, attendees, or locations into Client-facing surfaces;
- communicate stale or disconnected state;
- fail closed for confirmation when freshness cannot be trusted, according to a later approved conflict policy.

### Appointment export

Confirmed GO IRL Appointments may be exported to a selected calendar after separate OAuth and provider approval.

Required design properties:

- GO IRL remains authoritative;
- store a provider event reference, not a second Appointment source of truth;
- retries are idempotent;
- cancellation and rescheduling behavior is explicit;
- provider failure does not corrupt GO IRL state;
- deletion or disconnect behavior is defined;
- duplicate export is prevented;
- timezone conversion is deterministic.

### OAuth and credentials

No OAuth scope, token-storage method, webhook, schedule, or secret is approved here.

Before implementation, BEAUTY003 requires a technical and security review of:

- least-privilege scopes;
- consent-screen requirements;
- token encryption and rotation;
- revocation and disconnect;
- refresh-token handling;
- provider quotas and retries;
- incremental synchronization or polling;
- webhook renewal and failure recovery;
- deletion and account-offboarding behavior.

Refresh tokens and client secrets must never be stored in browser-accessible storage or committed to Git.

## WhatsApp boundary

MVP uses only user-initiated Click-to-Chat, such as `wa.me`, with a prefilled message.

Required properties:

- Booking can be completed without WhatsApp;
- the user explicitly opens WhatsApp;
- no conversation content is ingested by GO IRL;
- the prefilled text contains no unnecessary private data;
- the Professional number is displayed only according to the approved public-contact policy;
- analytics record only that the link was opened, without Client identity or message contents.

WhatsApp Cloud API, automated confirmations, reminders, templates, inbound messaging, marketing, or chatbot Booking remain excluded. They require separate verification of Meta rules, consent, templates, pricing, operations, opt-out, delivery handling, and protected configuration.

## Browser Demo and prototype boundary

BEAUTY004 may use local or mock data only.

The prototype must not:

- write Beauty data to production Supabase;
- use production Client contact data;
- request real Google OAuth credentials;
- configure WhatsApp Cloud API;
- create real provider webhooks;
- depend on trusted production secrets;
- claim conflict safety from frontend-only behavior.

Prototype evidence should focus on usability, comprehension, task completion, and confusion points, not production security or concurrency proof.

## Data subject and support operations

Before Gate F, operating procedures must define:

- how a Client requests access, correction, deletion, or restriction;
- how identity is safely verified without creating an account;
- how a Professional corrects Client data;
- who handles support incidents;
- how compromised secure links are revoked;
- how provider disconnection is handled;
- how an Appointment is exported for a Client request;
- how deletion propagates to logs, integrations, and backups where applicable;
- escalation for suspected privacy or security incidents.

Support must not request raw secure tokens or unnecessary screenshots containing Client contact data.

## Threat and failure review

BEAUTY004 and any later technical design must address:

- slot race and confirmed double booking;
- repeated or replayed submission;
- enumeration of Professionals, slots, or Appointments;
- leaked secure management link;
- forged Professional identity;
- browser exposure of service-role or OAuth credentials;
- cross-Professional data access;
- stale Google busy data;
- duplicate calendar export;
- timezone mismatch;
- lost cancellation or rescheduling state;
- excessive retention;
- sensitive data in logs or analytics;
- support-role overreach;
- provider outage or revocation;
- automated spam Booking.

## Required technical reviews before implementation

BEAUTY003 does not itself approve implementation. The following reviews are required before any production work:

1. Tech Lead — minimal architecture and command boundaries.
2. Security Lead — auth, secure links, abuse, secrets, and provider credentials.
3. Supabase Steward — conceptual schema, RLS, atomic conflict control, migrations, and deletion behavior.
4. Privacy/legal reviewer — controller roles, lawful basis, notices, retention, data rights, provider terms, and transfer implications.
5. QA Lead — concurrency, authorization, privacy, failure, timezone, and integration test strategy.
6. Release Manager — environment separation, configuration, rollback, monitoring, and deployment evidence.

Each protected change requires separate explicit Product Owner approval.

## Test and evidence contract for later implementation

Minimum evidence expected before Gate F:

- concurrent Booking attempts cannot create two confirmed Appointments for one protected interval;
- Professional cannot access another Professional's Client data;
- public Client cannot query raw Appointment or calendar records;
- invalid or expired management links reveal no private data;
- logs and analytics contain no Client name, phone, raw token, or calendar content;
- Browser Demo does not write production Beauty data;
- Google disconnect and failure do not corrupt GO IRL Appointment state;
- duplicate calendar export is prevented;
- timezone tests cover Europe/Prague daylight-saving transitions;
- retention and deletion procedures are tested in a non-production environment;
- incident, support, and rollback owners are named.

## Open decisions

The following remain unresolved and require explicit review:

- exact data-controller and processor roles;
- Professional onboarding eligibility and role assignment;
- public versus confirmation-only address policy;
- exact pending-slot hold mechanism and duration;
- final retention durations;
- secure-link expiry, rotation, and single-use rules;
- lawful basis and final privacy notice text;
- support access model;
- Google OAuth scopes and synchronization method;
- behavior when Google busy data is stale;
- Appointment export deletion and disconnect semantics;
- whether phone number alone is sufficient for all support and data-rights verification;
- whether any pilot notification channel is required beyond in-app state and Click-to-Chat.

## BEAUTY003 acceptance criteria

BEAUTY003 may move from Draft only when the Product Owner confirms that:

- Services remain separate from Activities;
- Professional administration requires trusted identity;
- public guest Booking is server-mediated and rate-limited;
- authoritative conflict control is required at the data boundary;
- GO IRL remains the Appointment source of truth;
- Client contact data is private and scoped to the owning Professional;
- secure management links follow the defined capability-security requirements;
- Google Calendar is optional, least-privilege, and non-canonical;
- WhatsApp remains Click-to-Chat only in MVP;
- Browser Demo and BEAUTY004 remain local or mock-only;
- final legal roles, retention durations, OAuth scopes, schema, RLS, SQL, migrations, auth, secrets, deployment, and production data remain separately gated;
- required Tech, Security, Supabase, privacy/legal, QA, and Release reviews are accepted as implementation prerequisites.

## Current recommendation

Proceed to BEAUTY004 only as a local or mock-data clickable prototype using BEAUTY001, BEAUTY002, and this review. Do not start production data modeling, database work, auth changes, Google OAuth, provider configuration, WhatsApp Cloud API, deployment, or a real pilot before Gate F and individual protected-change approvals.

## Evidence ledger

Claim | Evidence | Scope
--- | --- | ---
Beauty follows the gated BEAUTY001–005 sequence and BEAUTY003 owns architecture, privacy, retention, integration, and data-boundary review | `GH:docs/roadmap/ROADMAP_PART_05_GROWTH_DECISION_GATES.md@f6659c73c113f4d29ab5db125b46d7190a44c91e` | Product sequencing and approval gates only
BEAUTY001 defines guest Booking, pending confirmation, GO IRL-owned Appointment state, optional Google Calendar, and WhatsApp Click-to-Chat | `GH:docs/GO_IRL_BEAUTY_PRODUCT_BRIEF.md@c8dcc128f41c1f68abe44b7ef376009c28be5c7d` | Product boundary for solo manicure and pedicure pilot planning
BEAUTY002 defines the browser-first Client and mobile-first Professional flows, secure-link UX, conflict states, and privacy-sensitive surfaces | `GH:docs/GO_IRL_BEAUTY_UX_SPEC.md@de5391372fdf797fee034c5628a43c514bf0054a` | UX and information architecture boundary
Current GO IRL production identity is designed around verified Telegram initData and server-issued trusted sessions; browser/demo identity is not a production trust source | `GH:src/authSession.ts@d175a057a1bb519138ed038747611e3b435cc574`; `GH:src/supabase.ts@386c5255d26438792660760b6ae08e9362c255fb` | Existing application auth/client boundary only
Current platform and database governance prohibit unapproved auth, RLS, SQL, migration, secret, and production-data changes | `GH:docs/bible/02-platform-architecture.md@8f463af22ae98aaad2d6077a31f1bfcb6724931e`; `GH:docs/bible/03-database-and-supabase-boundaries.md@c211853539fbf6d929b2d9e28911377f934ff07d`; `GH:docs/Security.md@21d6925c647b3200539016fe5d563abd6d22ee44` | Existing architecture and protected-change boundary
GDPR principles require purpose limitation, minimization, storage limitation, lawful processing, and data protection by design/default | Official EU GDPR and EDPB guidance reviewed on 2026-07-30 | General privacy-design basis; final legal classification requires human review
Google Calendar and Supabase provider details require least-privilege scopes, protected credentials, RLS, and server-side secret handling | Official Google Calendar API and Supabase documentation reviewed on 2026-07-30 | Provider-design input only; no configuration or implementation authorization
