---
title: Product Roadmap Part 03 — Future Phases and Gates
owner: Product Lead
status: Active
source_of_truth: false
canonical_index: docs/product-roadmap/PRODUCT_ROADMAP.md
source_document_id: 12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw
source_revision_id: AIroW346eIu9snQFAYkAFasStCULkk2N0Q97H4Ah1K5hYdNuqeuUCTEoUXxs95EcEaCUSJBvfVxeyK4yTL66wgL5oPKoXGV1zPywI0M_W58
scope: Future phases and decision gates
last_review: 2026-07-29
next_review: 2026-08-09
---

# Product Roadmap Part 03 — Future Phases and Gates

Canonical index: [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

## 7. Future phases
### Phase 2 — Telegram and Notifications
**State:** Draft / Gated.
**Goal:** Make GO IRL feel native inside Telegram without violating Mini App runtime boundaries.
Planned scope:
- verify BotFather menu button and Mini App URL;
- verify Telegram startapp share links;
- add backend-triggered Telegram notifications;
- notify organizers about private join requests;
- notify participants about approve/reject decisions;
- add reminders before activity start.
Runtime boundaries:
- Mini App lifecycle remains explicit;
- closing is user-triggered;
- no Mini App background polling;
- browser demo mode must not touch production Supabase.
Entry gate:
- Release Preparation exit criteria are green;
- notification architecture and provider behavior are reviewed;
- required production configuration has explicit approval.
Deferred:
- evening digest;
- quiet hours and working hours;
- broad n8n notification automation;
- autonomous engagement campaigns.
### Phase 3 — Trust and Real Attendance
**State:** Draft / Gated.
**Goal:** Build trust around real attendance without unsafe or unproven reputation mechanics.
Planned scope:
- attendance confirmation;
- organizer-to-participant verification;
- participant-to-participant verification only after privacy and abuse review;
- RLI history and basic profile reputation;
- achievements tied to real participation.
Entry gate:
- current product loop is stable;
- attendance evidence can be collected safely;
- product, privacy, moderation, and abuse decisions are explicitly approved.
Not authorized by this roadmap:
- public Trust Score;
- public ratings or leaderboard;
- token or reward mechanics;
- geolocation attendance confirmation;
- complex reputation UI.
### Phase 4 — Modules and Discovery
**State:** Draft / Gated.
**Goal:** Evolve the stable core into a modular platform and expand only where product evidence supports it.
Planned scope:
- keep Sport as the reference module;
- add module-specific cards, filters, and creation fields;
- prepare Activities, Nature, Parties, Creative, and Learning as independently governed modules;
- add search, quick filters, and simple matching by city, interest, date, and free spots;
- expand cities through configuration rather than hard-coded forks.
Entry gate:
- release readiness is proven;
- Olomouc usage and attendance evidence justify expansion;
- Sport Coach evidence supports or rejects the event-role hypothesis;
- new module ownership, safety, and success metrics are defined.
Deferred:
- Friends, Travel, and Dating;
- full city catalog;
- broad lifestyle expansion;
- AI recommendations without validated product evidence.
### Phase 5 — Production Growth
**State:** Draft / Gated.
**Goal:** Prepare for broader public usage after the core loop, release operations, and safety controls are stable.
Planned scope:
- activation, join, share, and completed-activity analytics;
- reporting and moderation;
- abuse protection;
- referral loop;
- web parity with Telegram Mini App behavior.
Entry gate:
- latest quality checks pass on the reviewed release commit;
- real Telegram smoke verification passes;
- Supabase production tables and RLS behavior are verified;
- second-account Telegram share/join flow is verified;
- production does not depend on demo-only identity;
- support, monitoring, moderation, analytics, and public-safety review are complete.
Not authorized before review:
- referral incentives;
- public moderation tooling;
- analytics-driven growth loops;
- large-scale city expansion;
- paid growth experiments.
## 8. Decision gates
### Gate A — Release readiness
Evidence required:
- latest main quality checks;
- real Telegram smoke verification;
- production Supabase verification;
- deployment and operational readiness.
### Gate B — Product-loop stability
Evidence required:
- reliable create, share, join, chat, participant, and attendance flow;
- no unresolved release blocker in the core loop;
- sufficient organizer and participant trust signals.
### Gate C — Trust approval
Evidence required:
- reviewed trust model;
- privacy, moderation, and abuse controls;
- explicit scope approval;
- safe attendance evidence model.
### Gate D — Expansion evidence
Evidence required:
- Olomouc retention and attendance signals;
- Sport Coach validation results;
- clear module or city owner;
- measurable expansion success criteria.
### Gate E — Public growth readiness
Evidence required:
- moderation and abuse protection;
- analytics and support readiness;
- public-safety review;
- stable operations under broader usage.
