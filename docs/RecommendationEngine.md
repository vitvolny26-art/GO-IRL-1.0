# Recommendation Engine Architecture

Recommendations help users answer the product question:

> What interesting thing can I do today with other people?

They must stay modular so future AI can replace simple ranking without rewriting UI.

## Current Model

Current engines:

- `GenericRecommendationEngine`
- `SportRecommendationEngine`

Shared interface:

- receives Activities and user context
- returns ranked Activities
- does not own UI
- does not mutate data

## Recommendation Engine v2

Future interface should support:

- vertical-specific engines
- explainable ranking reasons
- privacy-aware context
- feature flags
- AI fallback/replacement
- testable deterministic scoring

## Ranking Signals

Generic signals:

- same city
- favorite activities
- nearest date
- free spots
- public/open access
- organizer trust/RLI later

Sport signals:

- same city
- sport type match
- skill level match
- free spots
- time proximity
- indoor/outdoor preference later

Digest signals:

- notification preferences
- quiet hours
- working hours
- already-sent guard
- price limit
- source trust for discovered events

## AI Replacement

AIRecommendationEngine can be added later behind the same interface.

AI must not receive:

- Telegram ID
- email
- phone
- private profile fields
- private chat contents without explicit consent

## Not Implemented Now

No new recommendation runtime is added by this document.
