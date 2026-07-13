---
title: ADR — Web-First Cross-Platform Join
owner: GO IRL Technical Archivist
status: Review
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# ADR — Web-First Cross-Platform Join

## Status

Proposed for architectural approval. This document does not authorize runtime, Auth, RLS, SQL, migration, or secret changes.

## Context

GO IRL is Telegram-first, but the product must not require Telegram for first contact with an event. A local user may arrive from WhatsApp, Instagram, Messenger, a QR code, email, or a normal browser. Mandatory Telegram installation at this stage increases acquisition friction and weakens the Olomouc closed-beta funnel.

The Constitution already defines Telegram Mini App and responsive web as primary surfaces, requires API-first and backend-first architecture, and states that all clients share one database and platform rules.

## Decision

> Web is the universal entry point. Telegram is the preferred full experience, not a mandatory dependency.

The canonical event distribution URL is:

```text
https://go-irl-1-0.vercel.app/join/<share-token>
```

It opens a mobile web event page first. Telegram is offered as an explicit enhancement for event chat and the full Mini App experience.

The system must not use User-Agent detection as an authorization or primary routing mechanism. Client hints may improve presentation only.

## Canonical flow

```text
/join/<share-token>
        |
        v
Mobile web event card
        |
        +-- verified Telegram initData -> enhanced Mini App context
        +-- WhatsApp / Instagram / Messenger -> web join
        +-- normal browser / QR -> web join
        +-- explicit Open in Telegram action -> Telegram deep link
```

No automatic Telegram redirect is required for the user to view or join an event.

## Share-token contract

The public URL must use an opaque share token instead of exposing an internal activity identifier.

The token must be:

- generated server-side;
- mapped to exactly one activity;
- revocable;
- scoped by visibility and event lifecycle;
- rate-limited;
- non-authoritative for membership or permissions;
- safe to rotate without changing the activity identity.

The token may support aggregate attribution such as channel or campaign source, but must not enable invasive tracking or expose personal data.

Private and invite-only activities require server-side access checks. A token alone must not bypass visibility rules.

## Public event preview

The web entry page should expose only the minimum event data needed for a join decision:

- activity/category and title;
- date and time;
- public location or safe location summary;
- capacity and available places;
- organizer/host public identity;
- price if applicable;
- Join action;
- Calendar and Map actions;
- optional Open event chat in Telegram action.

The page should be Czech-first for the Olomouc beta and support CS, EN, UK, and RU.

Metadata should be rendered server-side or otherwise available to social crawlers for Open Graph previews. Preview metadata must respect private-event disclosure rules.

## Identity model

Viewing a public event may use an anonymous browser session.

Confirmed participation requires a verified identity. Recommended staged order:

1. email magic link for web users;
2. verified Telegram initData for Telegram users;
3. Google and Apple later;
4. SMS OTP later due to cost and operational complexity.

A temporary guest identity may preserve draft state, but must not become a confirmed member without verification.

Adding email magic link or another web-auth provider changes the authentication boundary and requires separate explicit approval before implementation.

## Provider-neutral Join Service

All clients must call one provider-neutral domain service.

```text
Telegram
WhatsApp
Instagram
Messenger
Web
   |
   v
Provider-neutral Join Service
   |
   v
activities / activity_members / app_users
```

The service owns:

- event visibility and lifecycle checks;
- identity verification;
- capacity and waiting-list rules;
- duplicate and idempotent requests;
- join/request/cancel transitions;
- moderation and blocking checks;
- audit metadata;
- notification events.

No provider-specific participant tables are allowed. Provider identity is an authentication attribute, not the membership domain model.

## Proposed API surface

Names are provisional and require implementation review:

```text
GET  /api/event-preview?token=<share-token>
POST /api/web-join
POST /api/web-cancel
```

Every mutation must be authenticated, idempotent, rate-limited, and enforced server-side.

The current `/join/:eventId` route remains a compatibility path only until tokenized links are available. Migration must preserve existing shared links during a defined transition period.

## Telegram role

Telegram remains the preferred full experience for:

- native Mini App context;
- event chat;
- Telegram-native sharing;
- organizer and participant notifications;
- low-friction identity for Telegram users.

Telegram prepared-message sharing is an enhancement layer. It must generate or reference the canonical web URL and must not create a separate source of event truth.

The Open in Telegram action must be user-initiated. Failure or absence of Telegram must never prevent the web join flow.

## Security and privacy

- Do not authorize by User-Agent.
- Resolve share tokens and event data on the server.
- Do not trust client-supplied title, capacity, organizer, visibility, or membership state.
- Minimize public event and identity data.
- Do not expose email, phone number, Telegram ID, or private profile fields.
- Apply rate limits to preview, identity, join, and cancel operations.
- Log security-relevant transitions without background behavioral tracking.
- Define token revocation for deleted, cancelled, private, or abused events.

## Failure behavior

The web page must provide explicit states for:

- invalid or revoked link;
- event not found;
- private event requiring access;
- event cancelled or finished;
- event full and waiting list available;
- identity verification required;
- join request pending;
- join confirmed;
- network or service failure.

Failure must not silently redirect to the home page or Telegram.

## Rollout

### Phase 0 — Documentation

- approve this ADR;
- reconcile PR #86 as a Telegram enhancement, not the canonical entry architecture;
- define data and Auth/RLS impact before code.

### Phase 1 — Read-only web entry

- token resolution;
- mobile event card;
- safe Open Graph metadata;
- Calendar, Map, and optional Telegram handoff;
- no new membership mutation.

### Phase 2 — Verified web join

Requires explicit approval for Auth/RLS/schema work:

- email magic link;
- provider-neutral Join Service;
- Join/Cancel state;
- idempotency, rate limits, and audit events.

### Phase 3 — Migration and measurement

- issue share tokens for new links;
- preserve legacy event-ID links temporarily;
- measure preview-to-join conversion by coarse channel attribution;
- remove legacy links only after compatibility evidence.

## Alternatives rejected

### Mandatory Telegram redirect

Rejected because it creates a platform-installation barrier before the user understands the event.

### User-Agent routing as the main mechanism

Rejected because User-Agent signals are unstable, spoofable, and unreliable in embedded browsers.

### Separate membership flows per channel

Rejected because they duplicate business rules and fragment activity membership truth.

### Public internal event IDs as the long-term sharing contract

Rejected because opaque revocable tokens provide better lifecycle, privacy, and attribution control.

## Consequences

Positive:

- lower acquisition friction;
- reliable cross-platform event links;
- Telegram retains its strongest capabilities;
- one domain model and Join Service;
- better privacy and link lifecycle control.

Costs:

- token lifecycle and server-rendered preview work;
- a new web identity path;
- Auth/RLS/schema review before confirmed web joins;
- migration support for existing UUID links;
- additional compatibility and abuse testing.

## Acceptance criteria

The ADR is implemented only when:

1. A user without Telegram can open a shared event and understand it immediately.
2. The user can complete a verified Join without installing Telegram.
3. Telegram users receive an enhanced Mini App experience through an explicit handoff.
4. All clients use one provider-neutral membership service and database truth.
5. Internal activity IDs are not the long-term public sharing contract.
6. Private-event, identity, capacity, moderation, idempotency, and rate-limit rules are server-enforced.
7. CS/EN/UK/RU and mobile embedded-browser behavior are verified.
8. Existing Telegram and legacy links have a tested migration path.
