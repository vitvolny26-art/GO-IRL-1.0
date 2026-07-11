---
title: Agent Report — GO IRL Strategic Review
owner: Technical Archivist
status: Review
source_of_truth: false
last_review: 2026-07-11
next_review: 2026-07-18
---

# Agent Report — GO IRL Strategic Review

## Task

Review the uploaded strategic analysis, correct conflicts with current repository source-of-truth documents, and preserve the verified result as a non-authoritative reference report.

## Files inspected

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `docs/MARKET_POSITIONING.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/performance.md`
- `docs/n8n-workflows.md`
- `supabase/schema.sql`
- uploaded document: `Анализ и улучшение проекта GO IRL.docx`

## Findings

The original document contained useful strategic directions, but mixed verified facts with unsupported market claims, current beta scope with future monetization, and safe review guidance with SQL/RLS fragments that must not be applied directly.

The corrected conclusion is:

> GO IRL is a viable testable hypothesis for an Olomouc closed beta, not yet a proven scalable business.

The immediate validation target is not market size or monetization. It is whether the product reliably converts Telegram intent into attended real-life meetings.

## Changes made

- Reframed market viability as a testable hypothesis rather than a proven outcome.
- Removed unsupported revenue, valuation, and investment claims.
- Moved ticketing, premium placement, marketplace, ratings, and broad monetization outside the current beta scope.
- Corrected Telegram `initData` validation wording.
- Removed copy-paste SQL/RLS recommendations incompatible with the current identity and schema model.
- Recorded existing code splitting as implemented rather than missing.
- Classified n8n as automation glue, not an agent or core backend.
- Removed blockchain/token framing from RLI.
- Rebuilt priorities around quality gates, Telegram/Supabase smoke tests, Olomouc density, and measurable attendance.

## Corrected strategic position

### Product thesis

GO IRL is not an event calendar, ticketing platform, social feed, dating app, or sport-only product.

It is a Telegram-first local meetup layer for small real-life activities:

```text
create event -> share in Telegram -> join/request -> event chat -> attend IRL
```

Closed beta remains limited to Olomouc and six canonical categories:

1. Volleyball
2. Running
3. Walking
4. Coffee meetup
5. Board games
6. Language exchange

### Why Olomouc remains a rational pilot

Official Palacký University 2024 statistics support the existence of a concentrated student and international audience:

- 22,764 students in accredited programmes;
- 3,125 international students from 91 countries;
- 4,774 dormitory beds;
- 34,829 applications for study.

These figures support the audience-density hypothesis, but do not prove product demand. Demand must be validated through manual community seeding and observed beta behaviour.

### Metrics that matter

- events created per active organizer;
- share -> open conversion;
- open -> join conversion;
- time to first join;
- events reaching minimum viable group size;
- join -> chat activation;
- show-up rate and no-show rate;
- repeat organizers and repeat participants within 30 days.

## Monetization boundary

Monetization is not part of the current beta implementation plan.

Current source-of-truth documents explicitly defer:

- ticketing and payments;
- subscriptions and premium plans;
- paid event-card boosting;
- coach marketplace commissions;
- public ratings and reviews;
- branded categories;
- broad B2B marketplace functionality.

Allowed now:

- manual venue partnerships outside the product;
- community-host relationships;
- offline promo codes or arrangements that do not alter ranking or the core event loop.

Possible only after beta evidence:

- a transparent sponsored-venue pilot;
- organizer tools for repeat local groups;
- B2B experiments supported by retention and repeat-organizer data.

Ticketing or payment commissions require a separate legal, support, refund, tax, and operations review.

## Architecture and security correction

### Telegram identity

The current production direction remains:

```text
Telegram.WebApp.initData
-> verifyTelegramInitData Edge Function
-> verified session/JWT
-> Supabase RLS
```

The review confirms these boundaries:

- use `initData`, not `initDataUnsafe`, as the server-verification input;
- construct the sorted data-check-string excluding `hash`;
- use the Telegram constant `WebAppData` in the HMAC verification process;
- compare signatures safely;
- validate `auth_date` freshness;
- do not redesign JWT or RLS identity mapping from this report.

### RLS and SQL

The original copy-paste SQL must not be applied.

Reasons:

- the current `organizer_key` and `user_key` fields are text-based;
- generic `auth.uid()` examples commonly assume UUID identity;
- current schema still contains compatibility functions that must be reconciled with trusted auth through a separate approved task;
- all RLS, SQL, auth, and migration changes require explicit approval, usage inspection, verification SQL, and security review.

Supabase documents `(select auth.uid())` as a valid performance technique when the function result is row-independent. This is review guidance only, not an automatic migration for GO IRL.

## Performance correction

Code splitting is already implemented and documented:

- `React.lazy()` and `Suspense` are in use;
- Vite/Rollup `manualChunks` are configured;
- the Sport vertical is separated from the generic experience;
- the latest documented build had no production JavaScript chunk above the 500 kB raw warning threshold.

Therefore the next step is measurement, not automatic dependency additions.

Do not add `rollup-plugin-visualizer`, Terser, webpack chunk comments, or deeper splitting without measured need.

Measure:

- production build size on latest `main`;
- usable-screen startup time on real Telegram Android and iOS devices;
- chunk-loading failures on unstable networks;
- regressions after Create, Profile, Discover, or other heavy screens grow.

## n8n boundary

n8n is automation glue only.

It is not:

- an AI agent;
- the source of truth;
- the core backend;
- the permission model;
- the auth authority;
- the canonical activity-state owner;
- an autonomous code push or merge system.

Appropriate n8n work includes:

- reminders;
- evening digest;
- delivery logs;
- source-health checks;
- lifecycle automation;
- report transfer and notifications;
- temporary Activity Chat archival after retention rules are approved.

Transactional workflows should remain deterministic:

```text
Schedule/Webhook -> query -> IF/Switch -> send -> delivery log
```

AI may later be used for isolated processing of minimized public data, such as event normalization, duplicate detection, summaries, or moderation support.

## RLI correction

RLI must not be implemented as a blockchain ledger, currency, financial token, public shame score, or pay-to-participate barrier.

Under the Constitution, RLI is a future trust signal for real-life participation. Any penalty or reputation mechanism requires auditability, appeals, privacy review, and anti-bias safeguards.

## Corrected priority order

### P0 — release gate

- run `pnpm run typecheck`;
- run `pnpm run lint`;
- run `pnpm run build`;
- run `pnpm run test`;
- complete real Telegram smoke tests;
- complete production Supabase table/RLS verification.

### P0 — closed beta loop

Stabilize:

- six-category create flow;
- Telegram sharing;
- public join;
- private/invite request handling;
- event chat;
- organizer trust;
- real attendance.

### P0 — Olomouc supply

Seed real events manually through students, expats, community hosts, and local groups. Avoid an empty multi-city catalogue.

### P1 — measurement

Collect minimal join, chat, attendance, and repeat-use evidence before expanding product scope.

### P1 — performance

Optimize only after current build and device measurements identify a real bottleneck.

### P2 — n8n notifications

Enable only after required preference/log tables, retention rules, test instance, retries, and idempotency are ready.

### Deferred

- Prague or broad multi-city expansion;
- payments and ticketing;
- premium event cards;
- ratings and marketplace;
- broad AI recommendations;
- blockchain reputation;
- promises such as no-show below 5% without a baseline.

## Checks

Checks: NOT RUN — docs-only.

Static review completed against current repository source-of-truth documents and official external sources.

## Risks

- External market statistics and vendor capabilities can become stale and must be reverified before investor or public use.
- Security, auth, RLS, SQL, and migration recommendations remain review criteria only and require separate approved tasks.
- This report must not override canonical product, architecture, roadmap, schema, or release documents.

## Not touched

- runtime code
- dependencies or lockfiles
- environment files or secrets
- auth implementation
- Supabase RLS or SQL
- migrations
- deployment configuration
- live n8n workflows

## Next step

Use this report as a reference during beta planning. Any accepted recommendation must be promoted separately into the relevant source-of-truth document through a focused task.

## Sources

Repository:

- `DOCS_INDEX.md`
- `README.md`
- `ROADMAP.md`
- `docs/MARKET_POSITIONING.md`
- `docs/GO_IRL_CONSTITUTION.md`
- `docs/performance.md`
- `docs/n8n-workflows.md`
- `supabase/schema.sql`

Official external references:

- Palacký University Olomouc, Basic Information: https://www.upol.cz/en/university/basic-information/
- Timeleft Locations: https://timeleft.com/locations/
- Telegram Mini Apps validation: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- n8n Execute Sub-workflow: https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.executeworkflow/
