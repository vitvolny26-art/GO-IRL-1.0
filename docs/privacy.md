# Privacy Architecture

GO IRL is privacy-first by default. The app should help people meet in real life without collecting unnecessary personal data.

## Principles

### Data Minimization

- Store only fields required for events, interests, safety, and notifications.
- Do not store unnecessary action history.
- Do not store raw Telegram init data longer than needed.

### Privacy by Default

- Profiles are not fully public by default.
- Public surfaces show only display name, city, public bio, interests, and trust signals.
- Internal IDs, Telegram IDs, phone, email, and exact private location are hidden.

### User Control

Users should be able to:

- edit profile
- disable notifications
- delete account
- delete or anonymize activity history
- export data

### No Background Tracking

- Mini App does not track users in the background.
- No hidden trackers.
- No geolocation without explicit consent.

### Server-Side Notifications

- Notifications are backend/n8n driven.
- Mini App does not run in the background to send notifications.

## Data Collected

Planned minimal data:

- app user ID
- city
- language
- display name or pseudonym
- public bio
- interests
- event participation state
- notification preferences
- digest delivery log

## Data Not Collected by Default

- phone number
- email
- exact GPS location
- contact list
- raw private chats
- hidden browsing behavior
- Telegram username exposure without consent

## Anonymity Features

Planned:

- anonymous mode with pseudonym
- masked profiles
- mutual contact reveal
- private/invite-only event controls
- hidden location until approved
- anonymous chat later

## Optional Activity Chat Privacy

Activity Chat is optional and temporary.

Purpose:

- help confirmed participants meet offline
- coordinate exact meeting point
- agree who brings what
- handle delays, time changes, and quick participant questions

Non-goal:

- GO IRL must not become a permanent messenger or social network.

Rules:

- Chat is created only when the organizer enables it for a specific Activity.
- Chat exists only around that Activity.
- Chat is visible only to the organizer, confirmed participants, admin, and moderator.
- Guests, pending users, rejected users, and blocked users cannot see the chat.
- Default retention is archive 24 hours after the Activity ends.
- Archived chat messages are hidden from normal UI.
- Hard delete requires a privacy review.
- Open complaints or moderation hold can extend limited retention for safety review.
- Users can report a message.
- Users can block a participant.
- Chat content must not be used for AI training, AI recommendations, or AI summaries without explicit user consent.
- Chat notification delivery must respect opt-in, quiet hours, and Activity end/archive state.

## Dating Privacy

Dating is a separate vertical with stronger privacy defaults.

Rules:

- no public Telegram username leakage
- contacts revealed only by mutual consent
- anonymous chat before identity reveal
- block/report available in every step
- rate limits and anti-spam required before public launch
- age gate required before public launch
- dating profile visibility separate from generic event profile visibility

## AI Data Use

AI should analyze public external events, not private user profiles.

Allowed:

- public event text
- public source URL
- city/category hints
- anonymized interest categories
- source trust metadata

Not allowed:

- Telegram ID
- email
- phone
- exact private profile data
- private notification delivery identifiers
- personal Facebook account data
- private or closed group content
- login credentials or session cookies

Users should later have opt-out from AI recommendations.

## Reputation Privacy

RLI, Trust Score, Community Contribution, and Life Map must follow privacy-by-default principles.

Rules:

- Trust Score is internal and hidden.
- Users must not be publicly ranked by Trust Score.
- RLI can be public or semi-public, but should expose only minimal, helpful trust context.
- Community Contribution should recognize help without creating a social leaderboard.
- Life Map is personal history, not a public competition.
- Raw geolocation is never stored as movement history.
- Geolocation confirmation is opt-in only.
- Geolocation checks happen only in a limited time window and allowed radius.
- Only the verification result is stored.
- Raw coordinates are deleted immediately or never persisted.
- Users should later be able to request reputation audit/export.
- Abuse prevention and appeal process are required before trust penalties become significant.

## External Source Privacy

Event discovery must use public and permitted sources only.

Allowed MVP source types:

- public websites
- RSS feeds
- official APIs
- public Telegram channels
- public calendars
- manual moderator-added sources
- user-submitted event suggestions

Facebook Groups are future-only and must use official API access or manual review. GO IRL must not automate a personal Facebook account or store Facebook credentials.

## Mini App Background Policy

The Mini App does not run background discovery or notifications.

Reasons:

- user control and transparency
- lower battery use
- Telegram WebView lifecycle can suspend the app
- no hidden tracking
- no service secrets in frontend code

Server-side n8n/backend jobs handle discovery, digest, and notification delivery.

## Deletion

Future deletion flow:

- delete or anonymize user profile
- remove notification preferences
- anonymize old event participation where needed
- delete chat history when chats exist
- keep only legally/safety-required audit records with minimization

Activity Chat deletion policy:

- MVP should archive chats by default instead of hard deleting immediately.
- `activity_chats.status = archived` hides messages from normal UI.
- moderation/audit metadata can be retained for a short, documented period.
- hard delete can be added after privacy and safety review.
