# GO IRL Constitution

Before reading the Constitution, read:

[docs/bible/01-foundation/01-product-philosophy.md](bible/01-foundation/01-product-philosophy.md)

The Product Philosophy explains why GO IRL exists.
The Constitution explains how GO IRL must be built.

This document is the product and architecture source of truth for GO IRL. All major product, design, technical, and roadmap decisions must follow it.

## 1. Vision

GO IRL is a real-life platform.

Mission: Less scrolling. More living.

The future platform question is:

> What meaningful real-life thing can I do today, and what is the simplest trusted path to make it happen?

For the current Activities-first release, the concrete product question remains:

> What interesting thing can I do today with other people?

The intended future platform contains two separately governed product domains:

1. `Activities` — people organize or join shared real-life activities.
2. `Services` — people discover, select, and schedule real-life services with professionals.

This future structure does not change the current release priority. Until `ROADMAP.md` explicitly authorizes a Services pilot, GO IRL remains Activities-first and Telegram-first.

## 2. Product Rule #1

Every new feature must answer:

> Does this help people complete meaningful real-life participation more reliably?

For Activities, this means helping people meet more often in real life.

For future Services, this means helping clients complete trusted real-world appointments with less coordination friction.

If the answer is no, do not add it.

## 3. Core Principles

- Offline First: the product exists to move people from screen time to completed real-world participation.
- Mobile First: Telegram Mini App and mobile web are primary current surfaces.
- Community First: features should strengthen local trust and participation.
- API First: product capabilities must be reusable by Telegram, web, future Android, and future iOS clients.
- Backend First: core business rules belong on the backend/platform layer.
- Event Driven: important domain changes should be observable by notifications, digest, analytics, and safety systems.
- Privacy First: collect the minimum data required and expose the minimum data publicly.
- Safety First: moderation, reports, blocking, rate limits, and identity protection are product requirements, not extras.
- Vertical Experiences: different real-life domains need their own UX, rules, recommendations, privacy, and safety model.
- Domain Separation: Activities and Services may share platform capabilities but must not be forced through one overloaded domain model.
- Evidence Before Expansion: future domains, verticals, and commercial models require explicit roadmap gates and Product Owner approval.

## 4. Positioning

GO IRL is not a social network.

GO IRL is not a calendar.

GO IRL is not a sport-only app.

GO IRL is a platform for converting online intent into completed real-life participation through Activities and, when separately authorized, Services.

Current release positioning remains:

> GO IRL is a Telegram-first local meetup layer for small real-life activities.

Services positioning must not be used as current release marketing until a pilot is explicitly approved in the roadmap.

## 5. Product Domains and Main Entities

### Activities

The main entity of the Activities domain is `Activity`.

Do not use `game` as the domain foundation.

Any real-life meeting can be an Activity:

- volleyball
- coffee
- hike
- PIVO
- cinema
- walk
- date
- trip

Core Activities concepts include:

- Activity;
- Organizer;
- Host;
- Participant;
- Capacity;
- Join Request;
- Invitation;
- Waiting List;
- Activity Chat;
- Attendance;
- Visibility;
- Location;
- Activity Status.

### Services

Services is a separate future product domain.

Core terminology:

- `Service` — a specific professional offer;
- `Booking` — the process of selecting and requesting a Service and time;
- `Appointment` — the resulting scheduled record;
- `Availability` — rules and blocks used to calculate available time;
- `Professional` — the Service provider;
- `Client` — the person receiving the Service.

Services must not reuse Activity participants, public Activity Chat, Activity capacity, or join-request logic as its primary model.

Beauty is the first and only approved future Services vertical. Coaching, Lessons, Wellness, and Other Services are strategic placeholders only and require separate approval.

## 6. Vertical Experiences

Each vertical can own its own logic, UI, filters, recommendations, and safety rules.

### Activities vertical model

- Generic Activity: fallback flow for activities without a dedicated vertical.
- Sport: sport type, skill level, equipment, duration, indoor/outdoor, sport-specific matching.
- Friends: casual hangouts, group social matching, invite/request flow.
- Travel: trips, routes, time windows, location radius, source discovery later.
- Dating: separate consent-first flow, not a normal Activity.
- Food: cuisine, budget, reservation, meeting format.
- Culture: concerts, cinema, exhibitions, public events.
- Local Life: neighborhood and city activities.

Dating is not a normal Activity. Dating is a separate vertical:

`discover -> like/pass -> match -> anonymous chat -> mutual reveal`

Dating must not launch without privacy, safety, reporting, moderation, anonymous chat, and abuse protection.

### Services vertical model

- Beauty: the first and only approved Services vertical.
- Coaching, Lessons, Wellness, and Other Services: unapproved strategic placeholders only.

Beauty evidence does not automatically authorize another Services vertical.

## 7. Categories

Categories should live in the database and be managed through an admin surface.

Initial Activities groups:

- Sport
- Activities
- Parties
- Nature
- Social
- Travel
- Dating

Hardcoded categories are acceptable only as an early compatibility layer, not as the permanent architecture.

Services categories must be governed separately from Activities categories and must not be added to production without an approved Services roadmap stage.

## 8. Platform Architecture

GO IRL platform surfaces and systems:

- Telegram Mini App
- Responsive Web
- Future Android/iOS
- REST API / WebSocket
- Backend
- Supabase PostgreSQL
- Event Bus
- n8n
- AI
- Notifications

All clients must use the same platform rules and database source of truth.

Shared platform capabilities may include:

- identity and profiles;
- cities and localization;
- trust and safety;
- reporting and moderation;
- notifications and reminders;
- analytics;
- public links and sharing;
- provider integrations;
- privacy, consent, retention, deletion, and audit controls.

Shared capability does not mean shared domain behavior. Activities and Services require domain-specific state, permissions, privacy, success measures, and workflows.

## 9. Frontend Rule

Frontend displays data and calls APIs.

Business logic should live on the backend/platform layer.

The frontend may keep small UX helpers, validation previews, and compatibility fallbacks, but it must not become the authority for:

- identity
- permissions
- moderation
- roles
- notifications
- recommendations that affect safety
- canonical Activity state
- canonical Appointment state
- Availability
- Booking decisions

## 10. Backend Rule

Backend is the source of business logic:

- auth
- activities
- invitations
- waiting list
- RLI
- moderation
- notifications
- roles
- API
- WebSocket

When Services are separately authorized, backend ownership must also include:

- Services;
- Availability;
- Booking;
- Appointments;
- cancellation and rescheduling;
- consent and contact policy;
- provider integrations.

## 11. Database

GO IRL uses PostgreSQL / Supabase.

There is one database for all clients.

Important product data must be stored in the database, not only in `localStorage`.

Examples:

- activities
- cities
- categories
- user profiles
- interests
- notification preferences
- participation
- roles
- reports
- moderation state
- RLI signals

Future Services data may include Services, Availability, Booking Requests, Appointments, reminders, cancellations, rescheduling, and consent records only after the appropriate roadmap and protected-change approvals.

Activities and Services must use separate domain tables or otherwise clearly separated schemas and policies. One universal event record must not become the authority for both domains.

## 12. n8n

n8n is used for automation, not for core business logic.

n8n jobs:

- Telegram notifications
- WhatsApp/email later
- evening digest
- reminders
- waiting list notifications
- AI event discovery workflows
- backups
- analytics

Future Services automation may support Appointment reminders and approved provider integrations, but only after the Services roadmap and privacy model are approved.

The Mini App must not stay alive in the background to power notifications.

## 13. AI Platform

AI can be used for:

- event discovery
- event normalization
- duplicate detection
- recommendations
- moderation support
- summaries

Future Services AI may support bounded catalog normalization or scheduling assistance only after explicit review.

AI must not receive unnecessary personal data.

Do not send Telegram ID, phone, email, private profile details, private Appointment details, or client contact data to AI APIs when anonymized interests or public domain data are enough.

## 14. Privacy

Privacy principles:

- data minimization
- no background tracking
- user data deletion
- user data export
- hidden Telegram identity
- anonymous mode later
- mutual reveal
- privacy by default

Public Activities surfaces should show only what is needed to join or evaluate an Activity safely.

Public Services surfaces should show only what is needed to evaluate a Professional and Service. Client contact details, Appointment state, and private communication must remain protected.

Activities and Services require separate privacy boundaries, retention rules, and consent models.

## 15. Safety

Safety requirements:

- reports
- block user
- rate limits
- moderation
- ban system
- audit logs
- anti-spam
- age gate for Dating

Safety must be implemented before high-risk verticals such as Dating.

Future Services safety must distinguish client misconduct, professional misconduct, cancellation, no-show, and ordinary scheduling changes. These must not be collapsed into one reputation signal.

## 16. Reputation System

GO IRL needs trust, but must not become a popularity contest.

Reputation exists to make real-life participation safer and healthier. It must never become a public shame score, financial token, paid placement, or social ranking.

### Real Life Index (RLI)

RLI is a public or semi-public signal of offline activity.

It reflects:

- participation;
- organizing Activities;
- confirmed real meetings;
- contribution to people meeting in real life.

RLI is not:

- currency;
- likes;
- a game level;
- a leaderboard position;
- a financial reward promise.

RLI is currently an Activities trust concept. It must not automatically score Service clients or Professionals without a separate approved trust model.

### Trust Score

Trust Score is hidden and internal.

It is used by the system for:

- anti-spam;
- moderation support;
- confirmation weighting;
- report weighting;
- access to future community roles.

Trust Score must not be shown publicly as a rating. Users must not be ranked or shamed by Trust Score.

Before Trust Score penalties become significant, GO IRL must have auditability, appeal paths, and anti-bias review.

Domain-specific trust signals must remain separate where behavior differs.

### Community Contribution

Community Contribution is separate from RLI.

It reflects help given to the community, not only activity volume:

- organizing quality Activities;
- helping newcomers;
- filling activities regularly;
- receiving positive community feedback;
- building healthy local groups.

It can later support:

- ambassadors;
- moderators;
- trusted organizers;
- community builders.

### Life Map

Life Map is personal activity history, not a competition.

It can show:

- categories tried;
- cities visited;
- new connections;
- active weeks;
- organized Activities.

Life Map must not become a leaderboard.

## 17. Real Life Index

RLI is reputation for real meetings.

It is not likes.

It is not currency.

It is not a game.

RLI increases for:

- participation
- organization
- confirmed meetings
- helping the community

RLI decreases for:

- no-show
- spam
- fake events
- confirmed reports

Services must not reuse this calculation without a separate approved model for Appointment completion, cancellations, client conduct, and professional conduct.

## 18. Activity Attendance Confirmation

No QR codes at the start.

After an Activity:

- organizer confirms participants
- participants can confirm each other
- majority confirmation marks the Activity as completed

Optional geolocation confirmation can be added later only when:

- it is opt-in;
- it happens in a limited time window;
- it checks a reasonable radius around the Activity location;
- raw coordinates are deleted immediately or never stored;
- only the verification result is saved.

Appointment completion requires a separate Services design and must not reuse Activity majority confirmation.

## 19. Notification Philosophy

The Mini App must not work in the background.

All background notifications go through backend/n8n.

Notifications should respect working hours, quiet hours, opt-in preferences, and privacy rules.

Activities may use join, decision, change, chat, and attendance reminders.

Future Services may use Appointment confirmation, change, cancellation, and reminder notifications after privacy, consent, and provider behavior are approved.

## 20. Activity Chat Philosophy

Activity Chat is optional and temporary.

It is created only when the organizer enables it for a specific Activity.

It exists only around that Activity.

It must not become a permanent messenger.

The main goal of Activity Chat is to help people meet offline:

- exact meeting point
- who brings what
- delays
- time or location changes
- quick participant questions

By default, Activity Chat should be archived 24 hours after the Activity ends.

Services must not reuse public Activity Chat as their primary communication model. Appointment communication requires a separate consent-first and privacy-safe design.

## 21. Monetization Governance

`Offline Enabler` is a future cross-domain commercial category for a person or organization that receives repeat operational or commercial value by bringing people into completed offline participation.

Potential Offline Enablers may include:

- professional or recurring Activity organizers;
- Beauty and other approved Service Professionals;
- trainers, coaches, instructors, and teachers;
- guides and tour operators;
- studios, clubs, local communities, and small venues when they actively organize participation.

Commercial guardrails:

- ordinary participants and clients are not the primary payer merely for participating;
- casual community organizers must retain a free path for occasional Activities;
- payment must not buy trust, ranking, reviews, moderation exceptions, or paid placement;
- free community activity must remain possible;
- fees must be transparent and correspond to measurable operational value;
- Activities and Services may require different pricing mechanics.

This Constitution does not authorize any price, tariff, commission, subscription, billing system, payment processing, invoicing, tax configuration, refund policy, or public commercial commitment.

Each requires separate Product Owner, product, legal, finance, security, and technical approval.

## 22. Roadmap Principles

Friends, Travel, and Dating come after foundation:

- Supabase
- RLS
- roles
- notifications
- performance
- safety

Sport remains the reference Activities vertical until the foundation is stable.

Services and Beauty remain a separate future gated track. They must not silently displace the current Activities release gate.

Offline Enabler monetization remains a validation track until real usage proves repeat value and willingness to pay.

## 23. Non-Negotiables

- No feature that does not support completed real-life participation.
- No hidden background tracking.
- No unsafe Dating launch without privacy/safety.
- No business logic in frontend.
- No hardcoded categories forever.
- No uncontrolled access to user data.
- No permanent Activity Chat that turns GO IRL into a generic messenger.
- No overloaded universal entity for Activities and Services.
- No Services production pilot without explicit roadmap authorization.
- No public pricing, billing, payment processing, or subscriptions without separate approval.
- No paid trust, paid ranking, pay-to-win discovery, or safety exceptions.
