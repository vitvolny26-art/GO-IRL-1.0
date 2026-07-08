# Sport Coach MVP 1.1

## Product decision

GO IRL 1.1 focuses on **Sport Coach** only.

A coach is not a universal helper for every event. In GO IRL, **Coach means sport**.

Future roles such as guide, language buddy, game master, host, referee, tutor, and moderator belong to a later **Event Roles** system. They must not be mixed into the Coach MVP.

## Why sport first

Sport is the strongest beta entry point because the social fear is high:

- a beginner may be afraid to look weak;
- people may not know the rules;
- teams may be chaotic;
- safety matters more than in a coffee meetup;
- users need confidence before showing up in real life.

The core hypothesis:

> Sport events with a confirmed coach should have a higher show-up rate than sport events without a coach.

## Product promise

The coach exists to make a sport event easier to join and easier to run.

The coach helps with:

- warm-up;
- basic rules;
- beginner support;
- team flow;
- safety;
- reducing the fear of arriving alone.

The coach does not replace the organizer. The organizer creates the event. The coach supports the event.

## MVP 1.1 scope

### In scope

- Sport events only.
- Button: **Need a coach** / **Нужен тренер**.
- Organizer note/message.
- Request status:
  - pending/requested;
  - confirmed.
- Event detail block: **Event Coach** / **Тренер события**.
- Sport card badge: **✨ Есть тренер** when the coach is confirmed.
- Browser demo mode with mock coach:
  - Alex;
  - Sport Coach;
  - Olomouc;
  - request is immediately confirmed;
  - no production Supabase writes.
- Beta feedback question:
  - “Did the coach help you feel comfortable if you came alone?”

### Out of scope for 1.1

- Payments.
- Marketplace.
- Universal event roles.
- City guides.
- Tutors.
- Language buddies.
- Social hosts.
- Game masters.
- Referees.
- Availability calendars.
- Complex matching.
- Verified coach badge.
- Role Choice bottom sheet.
- Review Flow.

Do not label coaches as verified unless there is a real verification workflow.

## Existing technical model

The current codebase already has a sport-oriented coach foundation:

- `coach_profiles`
- `coach_requests`
- `coach_reviews`
- `src/coachFeature.ts`
- `src/components/CoachRequestPanel.tsx`

The current model uses:

- `user_key`
- `activity_id`
- `coach_profile_id`

Do not replace it with `user_id`, `event_id`, or `coach_id` during MVP 1.1.

MVP 1.1 should extend the existing model safely and keep compatibility with current migrations and RLS.

## Фактическая реализация UI (v1.1)

Current shipped UI baseline is `src/components/CoachRequestPanel.tsx` rendered from the Sport activity details flow.

Current UI behavior:

- Shows whether a coach is needed for a sport event.
- Lets the organizer/requesting user create a coach request for the activity.
- Displays request status through the existing coach request status model.
- Uses the existing `coachFeature.ts` integration and current `coach_requests` table.

Not shipped in the current v1.1 UI baseline:

- Role Choice bottom sheet with Sport Coach / Beginner Helper / Team Captain.
- Full Review Flow after the event.
- Verified coach badge.
- Universal Event Roles.
- Payments or coach marketplace.

Status decision:

- `CoachRequestPanel.tsx` is the current implementation basis for MVP 1.1.
- Role Choice is moved to backlog as **[FUTURE VISION 1.2+]**.
- Review Flow is moved to backlog as **[FUTURE VISION 1.2+]**.
- Broader Event Roles remain **[FUTURE VISION 1.3+]**.

## UX rules

### Organizer copy

The organizer should not feel they must be a professional trainer.

Use copy like:

> Need a coach? Invite someone who can help run the sport event.

Avoid copy that implies:

> You are responsible for coaching people professionally.

### Participant copy

The participant should understand that the event is safer and easier to join.

Use copy like:

> A coach will help beginners, explain rules, and support the warm-up.

### Badge rule

Show **✨ Есть тренер** only when the coach assignment is confirmed.

Do not show the badge for pending requests.

## Status model

MVP can keep the current database statuses and map them to UX labels.

| DB status | UX meaning |
|---|---|
| `pending` | Coach requested |
| `matched` | Coach found |
| `confirmed` | Coach confirmed |
| `cancelled` | Request cancelled |
| `completed` | Event completed |
| `rejected` | Coach declined |

Avoid renaming database statuses in MVP 1.1 unless a separate migration is explicitly approved.

## Reviews and ratings

MVP review should stay simple, but the current v1.1 UI baseline does not ship the full review flow.

Future review fields:

- 1-5 rating;
- short comment;
- beginner comfort marker;
- one review per participant per coach per event.

Future sport-specific tags:

- helped beginners;
- explained rules clearly;
- good warm-up;
- safe event;
- arrived on time;
- good atmosphere.

## Beta metrics

Primary metric:

- Show-up Rate: joined users who actually came.

Supporting metrics:

- sport coach badge click/open rate;
- join -> chat message rate;
- join -> attendance confirmation rate;
- beginner comfort yes/no;
- repeat sport attendance;
- coach-request conversion from organizers.

The winning signal:

> Sport events with a confirmed coach outperform sport events without a coach on show-up rate and beginner comfort.

## Roadmap

### Phase 1 - Sport Coach MVP 1.1

- Keep Coach sport-only.
- Stabilize `CoachRequestPanel.tsx`.
- Keep request statuses compatible with current database model.
- Keep patches small and avoid auth/RLS rewrites.

### Phase 2 - Sport Roles 1.2

Expand sport roles after Coach MVP works:

- Beginner Helper;
- Team Captain;
- Referee;
- Safety Lead;
- Equipment Helper;
- minimal coach review flow.

Referee is a sport role, but it is not part of Coach MVP 1.1.

### Phase 3 - Event Roles Foundation 1.3+

Create a universal role layer only after sport proves the pattern.

Potential future tables:

- `event_role_profiles`
- `event_role_requests`
- `event_role_assignments`
- `event_role_reviews`

Future vertical roles:

- Board games -> Game Master;
- Language events -> Language Buddy / Conversation Mentor;
- City walks -> Guide;
- Social meetups -> Host / Icebreaker.

### Phase 4 - Payments 2.0+

Payments start only after role value is proven.

Safe order:

1. show pricing only;
2. manual payment outside the platform;
3. booking model;
4. payment provider;
5. refunds and disputes;
6. GO IRL commission.

## Guardrails

- Do not turn Coach into a generic role.
- Do not implement payments in MVP 1.1.
- Do not rewrite auth or RLS for Coach MVP.
- Do not create a marketplace before show-up rate improves.
- Do not build universal Event Roles until sport validates the pattern.
- Keep patches small and test after every code change.
