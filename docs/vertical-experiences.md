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
2. Sport Coach MVP 1.1
   - Coach is sport-only.
   - Validate show-up rate and beginner comfort in Olomouc.
   - Keep the existing coach model compatible.
   - Do not introduce universal Event Roles yet.
3. Performance
   - Lazy loading.
   - Code splitting.
   - Bundle optimization.
   - Telegram Mini App startup performance.
4. n8n Notifications
   - Server-side notification workflow.
   - Evening digest.
   - Working hours.
   - Quiet hours.
   - No Mini App background work.
5. AI Event Discovery
   - External sources.
   - Event collection.
   - AI normalization.
   - Duplicate detection.
   - Confidence scoring.
   - Save discovered events to the database.
6. Event Roles Foundation
   - Start only after Sport Coach proves value.
   - Future roles must use native vertical names, not Coach everywhere.
7. Friends Vertical
   - Start only after database and notification foundation is stable.
8. Travel Vertical
   - Start only after Friends and source discovery architecture is stable.
9. Dating Vertical
   - Start last because it requires privacy, safety, anonymous chat, mutual reveal, reporting, moderation, and abuse protection.

Do not implement Friends, Travel, Dating, or universal Event Roles until their prerequisites are complete.

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
- own role model later

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

## Sport Coach MVP 1.1

Sport Coach is the first role-like product pattern, but it is intentionally limited to sport.

Coach helps with:

- warm-up;
- rules;
- beginner support;
- team flow;
- safety;
- reducing the fear of arriving alone.

Coach does not replace the organizer. The organizer creates the event; the coach supports the sport activity.

MVP 1.1 must use the existing coach foundation:

- `coach_profiles`
- `coach_requests`
- `coach_reviews`

Do not rename or generalize these tables into Event Roles during MVP 1.1.

MVP status rules:

- pending/requested is not public proof that the event has a coach;
- only confirmed coach can show `✨ Есть тренер`;
- browser demo mode can immediately confirm Alex, Sport Coach, Olomouc;
- production writes must stay behind existing Supabase/auth/RLS rules.

Primary beta metric:

> Sport events with a confirmed coach should improve show-up rate and beginner comfort compared to sport events without a coach.

## Future Event Roles

Event Roles are a future architecture layer, not the Sport Coach MVP.

The rule:

> Use the role name that fits the vertical. Do not call every helper a coach.

Future examples:

- Sport -> Referee, Captain, Safety Lead.
- Board games -> Game Master.
- Language -> Language Buddy, Conversation Mentor.
- City walks -> Guide, Route Leader.
- Social meetups -> Host, Icebreaker.

Potential normalized tables later:

- `event_role_profiles`
- `event_role_requests`
- `event_role_assignments`
- `event_role_reviews`

Build this only after Sport Coach proves value through real beta metrics.

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
