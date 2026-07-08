# Vertical Experiences Architecture

GO IRL is not a single generic event list. It is a platform of vertical experience modules. Each vertical can have its own data, UI, matching, safety, privacy, and notification rules.

The current Sprint 1 product remains a generic event MVP. Vertical modules must be added gradually without breaking the generic fallback.

## Strategic Order

Vertical work must follow the platform strategy, not excitement around new product surfaces.

Current priority:

1. Infrastructure Hardening
   - Supabase production readiness.
   - Migrations.
   - RLS.
   - Roles.
   - Database verification.
   - Remove dependency on local fallback where possible.
2. Performance
   - Lazy loading.
   - Code splitting.
   - Bundle optimization.
   - Telegram Mini App startup performance.
3. n8n Notifications
   - Server-side notification workflow.
   - Evening digest.
   - Working hours.
   - Quiet hours.
   - No Mini App background work.
4. AI Event Discovery
   - External sources.
   - Event collection.
   - AI normalization.
   - Duplicate detection.
   - Confidence scoring.
   - Save discovered events to the database.
5. Friends Vertical
   - Start only after database and notification foundation is stable.
6. Travel Vertical
   - Start only after Friends and source discovery architecture is stable.
7. Dating Vertical
   - Start last because it requires privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection.

Do not implement Friends, Travel, or Dating until their prerequisites are complete.

## Principle

Each activity vertical can define:

- own fields
- own filters
- own cards
- own create form
- own details screen
- own join/request or match flow
- own privacy rules
- own recommendation algorithm
- own UI components
- own safety rules
- own notification rules

Shared platform layer should contain only:

- User
- Profile
- City
- Interest
- Activity
- Event
- Notification
- Trust/Safety
- Common UI primitives

Do not force sport, dating, friends, food, local events, and generic activities through one universal product flow.

## Activity Types

Target `activity_type` values:

- `sport`
- `dating`
- `friends`
- `food`
- `travel`
- `culture`
- `local`
- `custom`

Generic `custom` / fallback events use the current base model until a specialized module exists.

## Shared Event Layer

Every Activity/Event has a common layer:

- `id`
- `type`
- `title`
- `description`
- `city`
- `starts_at`
- `created_by`
- `visibility`
- `status`

Vertical-specific data lives in metadata at the early stage:

- `sport_meta`
- `dating_meta`
- `friends_meta`
- `food_meta`
- `custom_meta`

JSONB metadata is acceptable for early iterations, but mature verticals should be normalized into dedicated tables when fields become stable and query-heavy.

## Sport Vertical

Sport is the first Sprint 2 vertical MVP and the reference implementation for future verticals. It is not just a category. It owns sport-specific metadata, cards, details, create fields, and recommendations while the generic flow remains the fallback.

Fields:

- sport type
- skill level: `beginner`, `intermediate`, `advanced`
- format: `casual`, `training`, `competition`
- participants / team size
- indoor/outdoor environment
- equipment needed
- what to bring
- requirements
- organizer tips
- duration in minutes
- place
- price
- weather dependency, if needed

Examples:

- football
- running
- inline skating
- cycling
- volleyball
- tennis
- fitness
- yoga

Flow:

1. Choose sport.
2. Select level and format.
3. Add place, time, capacity, equipment, price.
4. Users join/request based on visibility and capacity.
5. Matching prioritizes city, sport type, skill level, free spots, and time.

Sport can use the event join/request model, but the create form, filters, card, and recommendations should be sport-specific.

Current Sprint 2 implementation:

- `ActivityRendererRegistry` routes sport activities to `SportActivityCard` and `SportActivitySheet`.
- `GenericActivityCard` and `GenericActivitySheet` remain the fallback for all non-sport activities.
- `SportRecommendationEngine` runs separately from `GenericRecommendationEngine`.
- Sport create flow stores vertical-specific fields in `metadata.sport`.
- Supabase stores early vertical data in `activities.activity_type` and `activities.metadata`.

Sport matching rules for MVP:

1. Same city gets the strongest boost.
2. Matching sport type gets an additional boost.
3. Matching user skill level gets an additional boost.
4. Events with free places rank above full events.

This is intentionally deterministic. AI recommendations can later replace the engine behind the same interface without rewriting UI.

## Dating Vertical

Dating is a separate product vertical, not a normal event category.

Dating is intentionally last in the vertical roadmap. It must not start before privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection are designed and implemented.

It may learn from common mechanics in dating products such as swipe discovery, mutual match, anonymous chat, and safety-first identity reveal, but it must not copy brand design or proprietary flows directly.

Dating profile fields:

- age gate / age range later
- city
- interests
- what the user is looking for
- communication format
- anonymous mode
- avatar/photo later
- visibility
- privacy controls

Matching flow:

1. Discover dating profiles.
2. Like or pass.
3. Mutual match unlocks anonymous chat.
4. Identity reveal only by mutual consent.
5. Telegram username remains hidden unless the user agrees.
6. User can block or report at any time.

Safety:

- report
- block
- moderation
- rate limits
- anti-spam
- age gate
- consent-first reveal
- no public contact leakage

Dating must not use the generic event join flow. Its flow is:

`discover -> like/pass -> match -> anonymous chat -> mutual reveal`

## Friends Vertical

Friends / social hangouts focus on casual group meetings.

Friends is deferred until database and notification foundation is stable.

Examples:

- find company
- walk
- coffee
- board games
- language exchange
- shared trip
- casual meetup

Flow:

1. Create meetup.
2. User sends request or joins, depending on privacy.
3. Organizer approves when needed.
4. Group participant/chat layer later.

Recommendations prioritize city, shared interests, time window, event format, and organizer trust.

## Food Vertical

Food needs food-specific fields and decisions.

Examples:

- cafe
- restaurant
- bar
- breakfast
- dinner
- tasting

Fields:

- cuisine
- average check
- place
- reservation status
- who pays
- meeting format

Recommendations prioritize city, cuisine preference, budget, time, reservation confidence, and group size.

Food remains a future vertical and should not take priority over infrastructure, performance, n8n notifications, or AI event discovery.

## Travel Vertical

Travel is a future vertical and must start only after Friends and source discovery architecture are stable.

Potential examples:

- day trips
- weekend trips
- hiking trips
- city visits
- shared transport
- group travel planning

Travel will likely depend on external sources, availability windows, location radius, and richer planning data. That makes it a later vertical, not an MVP priority.

## Generic Event Fallback

Generic Activity/Event remains as a fallback when no vertical is implemented.

Rules:

- use base Activity/Event fields
- use generic card/details/create form
- use generic join/request flow
- keep compatibility with current Dashboard, Discover, Create Event, Event Details, and Profile

A vertical can replace fallback behavior later through renderer and flow registries.

## UI Architecture

Introduce an `ActivityRendererRegistry`.

Conceptual renderers:

- `SportActivityCard`
- `DatingProfileCard`
- `FriendsEventCard`
- `FoodEventCard`
- `TravelEventCard`
- `GenericActivityCard`

The registry selects UI by `activity.type`.

The same registry pattern applies to:

- create form
- details screen
- filters
- join/match flow
- recommendation section
- notification template

Example shape:

```ts
type ActivityRendererRegistry = {
  sport: SportExperienceModule;
  dating: DatingExperienceModule;
  friends: FriendsExperienceModule;
  food: FoodExperienceModule;
  travel: GenericExperienceModule;
  culture: GenericExperienceModule;
  local: GenericExperienceModule;
  custom: GenericExperienceModule;
};
```

## Recommendation Architecture

Each vertical owns its matching logic.

Engines:

- `SportRecommendationEngine`
- `DatingMatchingEngine`
- `FriendsRecommendationEngine`
- `FoodRecommendationEngine`
- `TravelRecommendationEngine`
- `GenericRecommendationEngine`

The shared recommendation layer coordinates engines but must not force identical rules on every vertical.

Dating matching is separate from event recommendation. It must account for consent, safety, age gate, privacy settings, blocks, reports, and mutual reveal state.

## Notification Rules

Notification templates should be vertical-aware:

- sport: game level, missing players, weather, equipment
- dating: match, anonymous chat, reveal consent
- friends: request approval, group plans
- food: reservation, budget, place/time changes

Mini App still does not run in the background. All notifications remain server/n8n driven.

## Migration Path

1. Keep current generic event MVP.
2. Keep Sport as the reference vertical.
3. Harden Supabase production readiness, migrations, RLS, roles, and database verification.
4. Remove dependency on local fallback where possible after production schema is verified.
5. Improve performance through lazy loading, code splitting, bundle optimization, and Telegram Mini App startup checks.
6. Build n8n server-side notifications, evening digest, working hours, and quiet hours.
7. Build AI Event Discovery with public sources, event collection, AI normalization, duplicate detection, confidence scoring, and database persistence.
8. Add Friends only after database and notification foundation is stable.
9. Add Travel only after Friends and source discovery architecture is stable.
10. Build Dating last with safety and privacy architecture before launch.
11. Normalize JSONB metadata into stable vertical tables when usage proves the shape.
