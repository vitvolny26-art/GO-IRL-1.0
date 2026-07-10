---
title: Continuous Competitor Intelligence
owner: Market Analyst
status: Active
source_of_truth: true
last_review: 2026-07-09
next_review: 2026-08-09
---

# Continuous Competitor Intelligence

## Purpose

Continuous Competitor Intelligence keeps GO IRL aware of the market without letting competitor features expand MVP scope blindly.

The process is designed for recurring lightweight research, not one-time analysis.

## Monitoring scope

Track competitors and adjacent products in these groups:

1. Local event calendars.
2. Telegram community organizers.
3. Meetup and community platforms.
4. Sport meetup apps.
5. Invite and RSVP tools.
6. Ticketing platforms.
7. Social discovery apps.
8. Local Facebook groups and public event channels.
9. University and city event sources.

## What to collect

For each competitor or signal, capture:

- product name;
- URL or source;
- target user;
- main use case;
- onboarding flow;
- event creation flow;
- sharing flow;
- join/RSVP flow;
- trust mechanism;
- chat or coordination mechanism;
- monetization;
- growth loop;
- strengths;
- weaknesses;
- relevance to GO IRL;
- MVP implication.

## Monthly workflow

1. Review existing competitor list.
2. Add new direct and adjacent competitors.
3. Re-check top 5 active competitors.
4. Record meaningful product changes.
5. Extract patterns, not feature requests.
6. Map each insight to one of:
   - MVP now;
   - beta later;
   - future scope;
   - reject.
7. Update `docs/COMPETITOR_WATCH.md` if a signal is stable enough.
8. Update `docs/audit/KNOWLEDGE_DEBT.md` if competitor knowledge becomes stale.

## Quarterly workflow

1. Re-run full competitor landscape scan.
2. Validate GO IRL positioning against current alternatives.
3. Review whether the Olomouc beta thesis still holds.
4. Revisit non-goals only with evidence.
5. Produce a market memo for Product Lead and Executive Council.

## Decision filter

A competitor insight may become MVP scope only if it passes all checks:

- It supports the real-life event loop.
- It reduces friction to create, share, join, chat, or attend.
- It does not turn GO IRL into a feed, ticketing platform, dating product, or generic calendar.
- It can be implemented without destabilizing current MVP.
- It can be measured during beta.

## Output format

Use `COMPETITOR_ANALYSIS_TEMPLATE.md` for individual competitors.

Use short market memos for monthly summaries:

```text
Date:
Reviewer:
Scope:
New signals:
Main patterns:
Risks:
Recommended actions:
Rejected ideas:
Docs to update:
```

## Escalation

Escalate to Product Lead when:

- a direct Telegram-first local meetup competitor appears;
- a competitor has a better share/join loop;
- a local Olomouc source becomes strategically important;
- a competitor pattern challenges GO IRL positioning;
- a feature appears repeatedly across competitors and directly supports real attendance.

## Anti-patterns

Do not:

- copy competitor roadmaps;
- add features because competitors have them;
- treat ticketing, payments, public ratings, or feeds as beta scope;
- overfit to global platforms before validating Olomouc;
- replace user evidence with competitor screenshots.
