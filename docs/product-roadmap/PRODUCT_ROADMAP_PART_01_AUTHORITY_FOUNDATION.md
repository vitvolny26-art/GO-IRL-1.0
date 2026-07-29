---
title: Product Roadmap Part 01 — Authority and Foundation
owner: Product Lead
status: Active
source_of_truth: false
canonical_index: docs/product-roadmap/PRODUCT_ROADMAP.md
source_document_id: 12VOnDP32ZmXKGWuytICZ06XUr5lOEmnt0gE4lERNKDw
source_revision_id: AIroW346eIu9snQFAYkAFasStCULkk2N0Q97H4Ah1K5hYdNuqeuUCTEoUXxs95EcEaCUSJBvfVxeyK4yTL66wgL5oPKoXGV1zPywI0M_W58
scope: Purpose, authority, executive state, guardrails, overview, and historical foundation
last_review: 2026-07-29
next_review: 2026-08-09
---

# Product Roadmap Part 01 — Authority and Foundation

Canonical index: [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

# GO IRL Product Roadmap — Owner-Designated Drive Mirror
## 1. Purpose and authority
GO IRL is a Telegram-first local meetup layer that helps people leave the chat and meet in real life.
This Google Drive document is an owner-designated product-roadmap mirror. GitHub `main` remains the project source of truth, GitHub `ROADMAP.md` controls current product sequencing, and `docs/release/CURRENT_PHASE.md` controls lifecycle phase. The following Drive content is advisory unless and until promoted through reviewed GitHub governance:
- product sequencing;
- phase definitions;
- product gates;
- authorization of future product scope.
It does not override domain-specific authority:
1. Verified runtime evidence and GitHub main control code, schemas, tests, migrations, implementation state, technical facts, and production configuration.
2. Active GitHub governance controls durable policy within its declared domain.
3. Active indexed Drive instructions control AI and Staff OS operation where they do not conflict with GitHub.
4. ClickUp controls operational task state, owners, blockers, and review status.
5. Draft, Review, Advisory, Legacy, Archived, and Historical material provides context only and cannot activate scope.
GitHub was not modified by the 2026-07-27 Drive cleanup.
## 2. Executive state
**Active phase:** Release Preparation and Stabilization.
Closed Beta was completed on 2026-07-20. Broad public launch is not claimed.
**Current priority order**
1. P0 — Release Preparation Readiness.
2. P1 — Infrastructure Hardening and security closure.
3. P1 — Core-loop UX stability and bounded Sport Coach MVP 1.1.
4. P1 — Knowledge Bible technical-finality evidence, only through separately authorized higher-authority work.
5. P2 — Notification scope only where Phase 2 entry gates are satisfied.
**Operational anchors**
- P0 — Release Preparation Readiness: https://app.clickup.com/t/869e3jw1q
- P1 — Infrastructure Hardening: https://app.clickup.com/t/869e3jw2r
- P1 — Documentation and Knowledge Debt: https://app.clickup.com/t/869e3jw44
Future ClickUp tasks for Trust/RLI, production growth, AI discovery, city expansion, Friends, Travel, and Dating remain Gated / Future. Their existence does not authorize implementation.
## 3. Product thesis and guardrails
The validated Olomouc loop is:
> Create a small local activity in 30–60 seconds, share it through Telegram, let people join with minimal friction, coordinate in event chat, and meet in real life.
Roadmap decisions prioritize:
- fast event creation;
- Telegram sharing;
- one-tap Join or a bounded request flow;
- participant count and capacity;
- event chat;
- organizer and host trust;
- real attendance.
Before adding a feature, ask:
> Does this make it easier for people to leave the chat and meet in real life?
If evidence does not support the answer, the feature remains future scope.
**Non-goals without a reviewed product decision**
- ticketing or payments;
- club CRM;
- subscriptions or premium plans;
- photo albums or a post-event social feed;
- public ratings or reviews;
- direct messages;
- a full recurring-event engine;
- a broad multi-city catalog;
- complex social profiles;
- Friends, Travel, Dating, or broad lifestyle verticals;
- AI recommendations presented as validated product value.
## 4. Roadmap at a glance
| Phase | State | Product outcome | Primary gate |
|---|---|---|---|
| Phase 0 — Foundation | Complete / Historical | Safe development and release foundation | Historical record only |
| Phase 1 — MVP Core | Complete / Historical | Clear create-share-join-chat-meet loop | Preserve and verify the loop |
| Active bridge — Release Preparation and Stabilization | Active / Partial | Prove release, infrastructure, product, and operational readiness | Current main and runtime evidence |
| Phase 2 — Telegram and Notifications | Draft / Gated | Native Telegram coordination without Mini App background work | Release gate green |
| Phase 3 — Trust and Real Attendance | Draft / Gated | Trust signals based on real participation | Stable loop and explicit trust approval |
| Phase 4 — Modules and Discovery | Draft / Gated | Modular product and evidence-based expansion | Olomouc and Sport evidence |
| Phase 5 — Production Growth | Draft / Gated | Safe broader public usage | Public-safety and operational readiness |
## 5. Historical foundation
### Phase 0 — Foundation
**State:** Complete / Historical.
Delivered foundation:
- GitHub repository and CI workflow established;
- build, TypeScript, lint, and tests configured;
- Supabase schema and RLS documented;
- deployment and verification checklists created;
- secrets excluded from the repository.
Historical completion is not current runtime evidence. Netlify references are historical; Vercel is the current deployment target.
Source record: https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_0.md
### Phase 1 — MVP Core
**State:** Complete / Historical.
Core loop:
create event → share through Telegram → participants join → event chat → people meet in real life
Delivered or preserved scope:
- event cards communicate what, when, where, who, price, capacity, and join state;
- home and discovery center on local activities and categories;
- activity creation and join/request flows remain fast and bounded;
- organizers can edit activities and review private requests;
- empty, loading, success, and error states are product requirements.
Guardrail: do not expand MVP Core into social feed, direct messages, ticketing, payments, or dating.
Source record: https://github.com/vitvolny26-art/GO-IRL-1.0/blob/main/docs/roadmap/SPRINT_1.md
