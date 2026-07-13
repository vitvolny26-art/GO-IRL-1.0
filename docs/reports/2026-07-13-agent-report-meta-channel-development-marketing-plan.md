---
title: Agent Report — Meta Channel Development and Growth Plan
owner: GO IRL Technical Archivist
status: Draft
source_of_truth: false
last_review: 2026-07-13
next_review: 2026-07-20
---

# Agent Report

## Task

Prepare a technical-lead plan for GO IRL messaging channels after the WhatsApp, Instagram Direct, and Messenger scaffold and production backend work. Cover development sequencing, release gates, marketing, advertising, channel roles, metrics, and the questions that the next Codex run must answer.

## Files inspected

- `docs/MARKET_POSITIONING.md`
- `docs/reports/2026-07-13-agent-report-meta-provider-production.md`
- GitHub Issue `#75` — WhatsApp event join MVP
- Recent Meta provider commits on `main`
- ClickUp task `Design and implement a polished 4-network share card`

## Current state

The remote repository already contains:

- WhatsApp, Instagram Direct, and Messenger webhook handlers;
- Meta request signature verification;
- provider-specific send adapters;
- provider identity resolution through shared `app_users`;
- atomic provider join RPC and capacity-safe outcomes;
- calendar and map confirmation actions;
- production Vercel endpoints and Meta callback verification;
- test WhatsApp credentials stored outside the repository;
- green lint, build, test, typecheck, database lint, webhook verification, and credential smoke checks.

The known local verification commit `498a09e` is reported as green but was not yet pushed when this report was prepared. Do not write directly to remote `main` until that local/remote state is reconciled.

## Strategic decision

Keep the product architecture asymmetric:

| Channel | Product role |
|---|---|
| Telegram | Full GO IRL product: discovery, creation, join, participants, event chat, attendance loop |
| WhatsApp | Primary external conversion channel: invitation, join, confirmation, reminders, calendar/map |
| Instagram Direct | Discovery and creator/community acquisition channel; DM conversion into a specific event |
| Messenger | Secondary Page-based messaging fallback; do not invest equally before demand is proven |

This preserves the current Telegram-first positioning while using Meta channels to increase reach and reduce join friction. The Meta channels should share events, capacity, moderation, and user records with Telegram; they must not become separate products or separate event databases.

## Development plan

### Phase 0 — repository reconciliation

1. Confirm that local commit `498a09e` is based on the latest remote `main`.
2. Push it or rebase it without force-push.
3. Verify that the verification report contains no secrets or local-only paths intended as durable references.
4. Re-run the standard gates after reconciliation.
5. Merge this planning report only after the branch state is clean.

Exit gate: local and remote `main` match, all checks green, no uncommitted provider changes.

### Phase 1 — live channel smoke tests

Execute one real inbound and outbound path per available provider:

1. receive a real message or button interaction;
2. validate Meta signature;
3. parse provider identity and event reference;
4. execute idempotent join;
5. return joined, duplicate, pending, waitlist, closed, private, and missing-event responses;
6. open calendar and map actions;
7. verify logs contain no access tokens, phone numbers, App Secret, or raw sensitive payloads.

Required order:

1. WhatsApp test number;
2. Instagram professional test account;
3. Messenger test Page.

Exit gate: one recorded end-to-end smoke result per connected channel.

### Phase 2 — production account readiness

WhatsApp:

- connect a production business number;
- replace the temporary test token with a permanent system-user token;
- create and approve event invitation, reminder, cancellation, and attendance templates;
- define the 24-hour customer-service-window behavior;
- document opt-in and opt-out handling.

Instagram:

- obtain explicit owner approval before converting or connecting an account;
- connect one professional account only;
- request the minimum messaging permissions;
- test message-request and non-follower limitations.

Messenger:

- connect one dedicated GO IRL Facebook Page;
- avoid broad access to unrelated current and future Pages;
- request only the permissions required for Page messaging.

Shared:

- complete business verification and App Review only for the selected release channels;
- rotate credentials after setup;
- document credential owner, expiry, rotation, and emergency-disable procedure.

Exit gate: permanent credentials, approved assets, minimum permissions, and an operational rollback path.

### Phase 3 — product entry points

Add the smallest user-facing integration:

- share sheet: Telegram, WhatsApp, Instagram, Messenger, Copy link;
- channel-specific payload generated from one provider-neutral event model;
- event-specific referral token, not a public raw provider identifier;
- clear success/failure state after share;
- no automatic account linking;
- no duplicate participant records for retries;
- no full Mini App clone inside Meta channels.

The product should expose two actions only at first:

1. `Join event`
2. `Open details`

After successful join:

- `Add to calendar`
- `Open map`
- `Cancel participation`
- optional `Open full event in Telegram`

Exit gate: share-to-join works from the GO IRL UI for one real event without changing the Telegram flow.

### Phase 4 — identity linking only after evidence

Do not build automatic Telegram/Meta account merging now. Measure duplicate-person incidents first.

If needed later, add an explicit account-link flow using a short-lived one-time code. Provider identities should map to one internal GO IRL user only after user confirmation.

Exit gate: documented duplicate rate or support demand justifies the work.

## Marketing and channel plan

### Positioning

Do not market GO IRL as another event calendar or as four different messenger bots.

Primary message:

> Find a simple local activity, join in one tap, and meet in real life.

Local beta message:

> Small events in Olomouc: volleyball, running, walks, coffee, board games, and language exchange.

### Funnel

```text
Local content or community post
-> event-specific message or ad
-> WhatsApp / Instagram DM / Messenger conversation
-> event summary
-> Join
-> calendar and reminder
-> attendance
-> repeat participant or host
```

### Organic acquisition first

Before paid ads, seed enough supply:

- recruit 8–12 reliable hosts;
- maintain at least 2–3 upcoming events per active category;
- post event-specific content, not generic brand announcements;
- partner with Olomouc university, expat, language-exchange, sport, board-game, and newcomer communities;
- use Instagram Reels/Stories for discovery;
- use Facebook groups and Pages for local reach;
- use WhatsApp for direct invitations and high-intent follow-up;
- keep Telegram as the complete product and event-chat destination.

Do not buy traffic into an empty event catalogue.

### Paid advertising pilot

Use ads only after supply and live join tracking are ready.

Recommended first test:

- geography: Olomouc and a narrow surrounding radius;
- destination: click-to-message, primarily WhatsApp; Instagram Direct as the second test;
- creative: one real event per creative;
- categories: start with the two strongest supplied categories, not all six;
- audience: broad local adults plus language variants supported by the product; avoid sensitive targeting;
- duration: short controlled test with a fixed loss limit;
- Messenger: keep as a low-priority comparison cell, not equal budget.

Creative structure:

```text
Activity + concrete time
Location
Current free places
One social-proof line
Join in WhatsApp
```

Example:

> Volleyball in Olomouc this Thursday at 18:30. Three places left. Tap to join and add it to your calendar.

### Retargeting and reminders

Retarget only consented, first-party engagement:

- started conversation but did not join;
- joined but did not add calendar;
- attended once but did not return;
- organizer created one event but did not create another.

Do not add tracking pixels, broad cross-platform audience sharing, or automated promotional messaging before privacy review and explicit owner approval.

### Metrics

North-star beta metric:

- confirmed real-world attendance per event.

Acquisition metrics:

- cost per conversation start;
- event-summary delivery rate;
- join-intent rate;
- confirmed join rate;
- cost per confirmed join.

Activation and quality:

- calendar action rate;
- reminder delivery rate;
- cancellation/no-show rate;
- attendance confirmation;
- repeat participant rate;
- repeat host rate.

Channel comparison:

- Telegram share -> join;
- WhatsApp conversation -> join;
- Instagram DM -> join;
- Messenger conversation -> join.

Do not optimize on impressions, followers, or message volume alone.

## Analytics contract

Record only the minimum provider-neutral lifecycle events:

- `invite_created`
- `invite_delivered`
- `conversation_started`
- `join_requested`
- `join_confirmed`
- `join_waitlisted`
- `join_cancelled`
- `calendar_opened`
- `map_opened`
- `reminder_delivered`
- `attendance_confirmed`

Recommended dimensions:

- provider;
- event ID;
- category;
- campaign/referral ID;
- creative ID;
- city;
- outcome;
- timestamp.

Never store access tokens, App Secret, message bodies, raw phone numbers, or raw provider IDs in analytics.

## Questions for the next Codex run

Codex must answer these before the next production patch:

1. Is commit `498a09e` based on remote head `11ec66c`, and is the worktree clean?
2. What exact files and behavior changed in `498a09e`?
3. Which provider credentials are temporary and which are production-grade?
4. Which Meta assets are actually connected: WhatsApp number, Facebook Page, Instagram professional account?
5. Which webhook fields are subscribed for each provider?
6. Is outbound invitation sending reachable from product UI, an admin tool, or only internal server helpers?
7. Which WhatsApp templates and Flow schemas exist, and which are approved by Meta?
8. What retry, idempotency, timeout, and dead-letter behavior exists for failed sends?
9. What structured monitoring exists for webhook failures and provider API errors?
10. Are provider joins covered by privacy policy, data-retention policy, and user opt-out handling?
11. What is the smallest next patch that completes one real invitation-to-join path without expanding scope?
12. Which live smoke tests remain unexecuted and what exact owner action blocks each one?

Codex should save the answers in a new report under `docs/reports/` and reference Issue `#75`.

## Risks

- Meta temporary WhatsApp credentials expire.
- Production WhatsApp templates and business verification may delay release.
- Instagram and Messenger permissions can be broader than GO IRL needs.
- Running paid acquisition before event supply creates poor conversion and damages trust.
- Building equal feature parity across all channels would expand beta scope and create support debt.
- Account linking can create identity and privacy risk if implemented before real duplicate-user evidence.

## Decisions required from Technical/Product Lead

1. Approve WhatsApp as the first production Meta channel.
2. Decide whether to connect an existing Instagram account or create a dedicated GO IRL professional account.
3. Decide whether to create a dedicated GO IRL Facebook Page for Messenger.
4. Approve a narrow organic launch before paid ads.
5. Approve the first paid experiment only after live join analytics and event supply gates pass.
6. Keep Telegram as the only full product during closed beta.

## Checks

This is a documentation-only planning report. No runtime, auth, RLS, migration, secret, or production configuration changes were made in this report branch.

## Next step

Reconcile and push local commit `498a09e`, answer the Codex questions above, then execute one real WhatsApp invitation -> join -> calendar smoke test before enabling any advertising spend.

## References

- `docs/MARKET_POSITIONING.md`
- `docs/reports/2026-07-13-agent-report-meta-provider-production.md`
- GitHub Issue `#75`
- Meta WhatsApp Cloud API Get Started documentation
- Meta WhatsApp message templates and customer-service-window documentation
- Meta Messenger Platform and Instagram Messaging API documentation
- Meta click-to-message advertising documentation
