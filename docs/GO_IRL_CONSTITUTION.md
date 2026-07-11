---
title: GO IRL Constitution
owner: Product Lead
status: Active
source_of_truth: true
last_review: 2026-07-11
next_review: 2026-07-18
---

# GO IRL Constitution

Before reading the Constitution, read:

[docs/PRODUCT_PHILOSOPHY.md](PRODUCT_PHILOSOPHY.md)

The Product Philosophy explains why GO IRL exists.
The Constitution explains how GO IRL must be built.

This document is the product and architecture source of truth for GO IRL. All major product, design, technical, and roadmap decisions must follow it.

## 1. Vision

GO IRL is a real-life platform.

Mission: Less scrolling. More living.

The main product question is:

> What interesting thing can I do today with other people?

## 2. Product Rule #1

Every new feature must answer:

> Does this help people meet more often in real life?

If the answer is no, do not add it.

## 3. Core Principles

- Offline First: the product exists to move people from screen time to real meetings.
- Mobile First: Telegram Mini App and mobile web are primary surfaces.
- Community First: features should strengthen local trust and participation.
- API First: product capabilities must be reusable by Telegram, web, future Android, and future iOS clients.
- Backend First: core business rules belong on the backend/platform layer.
- Event Driven: important activity changes should be observable by notifications, digest, analytics, and safety systems.
- Privacy First: collect the minimum data required and expose the minimum data publicly.
- Safety First: moderation, reports, blocking, rate limits, and identity protection are product requirements, not extras.
- Vertical Experiences: different real-life domains need their own UX, rules, recommendations, and safety model.

## 4. Positioning

GO IRL is not a social network.

GO IRL is not a calendar.

GO IRL is not a sport-only app.

GO IRL is a platform for organizing offline activities.

## 5. Main Entity

The main entity is `Activity`.

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

## 6. Vertical Experiences

Each vertical can own its own logic, UI, filters, recommendations, and safety rules.

Initial vertical model:

- Generic Activity: fallback flow for activities without a dedicated vertical.
- Sport: sport type, skill level, equipment, duration, indoor/outdoor, sport-specific matching.
- Friends: casual hangouts, group social matching, invite/request flow.
- Travel: trips, routes, time windows, location radius, source discovery later.
- Dating: separate consent-first flow, not a normal event.
- Food: cuisine, budget, reservation, meeting format.
- Culture: concerts, cinema, exhibitions, public events.
- Local Life: neighborhood and city activities.

Dating is not a normal event. Dating is a separate vertical:

`discover -> like/pass -> match -> anonymous chat -> mutual reveal`

Dating must not launch without privacy, safety, reporting, moderation, anonymous chat, and abuse protection.

## 7. Categories

Categories should live in the database and be managed through an admin surface.

Initial groups:

- Sport
- Activities
- Parties
- Nature
- Social
- Travel
- Dating

Hardcoded categories are acceptable only as an early compatibility layer, not as the permanent architecture.

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
- canonical activity state

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

The Mini App must not stay alive in the background to power notifications.

## 13. AI Platform

AI can be used for:

- event discovery
- event normalization
- duplicate detection
- recommendations
- moderation support
- summaries

AI must not receive unnecessary personal data.

Do not send Telegram ID, phone, email, or private profile details to AI APIs when anonymized interests or public event data are enough.

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

Public surfaces should show only what is needed to join or evaluate an Activity safely.

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

## 16. Reputation System

GO IRL needs trust, but must not become a popularity contest.

Reputation exists to make real-life meetings safer and healthier. It must never become a public shame score, financial token, or social ranking.

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

## 19. Notification Philosophy

The Mini App must not work in the background.

All background notifications go through backend/n8n.

Notifications should respect working hours, quiet hours, opt-in preferences, and privacy rules.

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

## 21. Roadmap Principles

Friends, Travel, and Dating come after foundation:

- Supabase
- RLS
- roles
- notifications
- performance
- safety

Sport remains the reference vertical until the foundation is stable.

## 22. Non-Negotiables

- No feature that does not support real-life meetings.
- No hidden background tracking.
- No unsafe Dating launch without privacy/safety.
- No business logic in frontend.
- No hardcoded categories forever.
- No uncontrolled access to user data.
- No permanent Activity Chat that turns GO IRL into a generic messenger.
