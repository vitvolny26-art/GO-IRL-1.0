---
title: Agent Report
owner: AI Fixer
status: Complete
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-08-19
---

# Agent Report

## Task

Complete PROFILE-001: inventory current consumers and sources of profile identity data without changing runtime behavior.

## Files inspected

- `src/App.tsx`
- `src/types.ts`
- `src/store.ts`
- `src/authSession.ts`
- `src/profile/profileTypes.ts`
- `src/profile/profileRepository.ts`
- `src/profile/localProfileRepository.ts`
- `src/profile/supabaseProfileRepository.ts`
- `src/profileAvatar.ts`
- `src/components/EventCardPrimitives.tsx`
- `src/components/OrganizerProfilePortal.tsx`
- `src/components/ActivityChatPanel.tsx`
- `src/activityChatFeature.ts`
- `src/telegramPreparedShare.ts`
- `api/telegram/prepared-event-share.ts`
- `api/_shared/telegram-share-event.ts`

## Findings

### Canonical own-profile path

- `ProfileView` creates a `ProfileRepository` selected from trusted Telegram identity.
- Trusted users read and write `user_profiles` plus `user_profile_interests` through `SupabaseProfileRepository`.
- Demo or legacy users use `LocalProfileRepository` and the `go-irl-profile` localStorage key.
- The current editable profile contract contains display name, bio, city, avatar path/code, visibility, favorite visibility, and favorite activity IDs.

### Current identity sources

1. `user_profiles.display_name` and `avatar_path` for the own profile.
2. Trusted Telegram session first/last name through `getCurrentDisplayName`.
3. Activity snapshots: `activities.organizer` and `activities.organizer_key`.
4. Membership snapshots: `activity_members.display_name`.
5. Chat snapshots: `activity_chat_messages.sender_display_name`.
6. Coach-specific identity: `coach_profiles.display_name`.
7. Legacy localStorage profile: `go-irl-profile`.
8. Telegram `photo_url` fallback inside prepared Share generation.

### Current consumers

| Surface | Name source | Avatar source | Status |
| --- | --- | --- | --- |
| Own profile | `ProfileRepository` | signed profile avatar or local data URL | canonical for self |
| Profile editor | `ProfileRepository` draft | upload/crop through repository | canonical for self |
| New activity organizer | auth `getCurrentDisplayName` | none stored | snapshot, not profile-backed |
| Activity card organizer | `activity.organizer` | localStorage match or own-profile repository only | partial fallback |
| Organizer profile sheet | activity snapshot | avatar passed by card action | not public-profile-backed |
| Participant preview | `activity_members.display_name` | initials only | snapshot |
| Chat | `sender_display_name` | none | snapshot |
| Telegram Share | activity organizer snapshot | `user_profiles.avatar_path`, then Telegram `photo_url` fallback | server-side partial profile use |
| Coach surfaces | `coach_profiles.display_name` | separate coach model | separate reputation domain |

### Key gaps

- `ProfileRepository` only exposes `loadOwnProfile`; there is no public profile read contract by `userKey`.
- Event cards can load the repository only when the organizer is the current trusted user. Other organizers fall back to initials.
- `resolveOrganizerAvatar` still reads the legacy `go-irl-profile` object and matches by organizer name.
- Creating an activity stores the auth display name rather than the current canonical profile display name.
- Joining an activity stores the auth display name rather than the current canonical profile display name.
- Chat messages store the auth display name at send time.
- Organizer profile portal derives city and event count from activities rather than a public profile projection.
- Telegram Share reads only `avatar_path` from `user_profiles`; organizer name remains the activity snapshot.
- Avatar upload logic exists both in the profile repository and in legacy `profileAvatar.ts` helpers.
- Historical snapshots are useful and should remain as fallbacks after a canonical public-profile resolver is introduced.

## Changes made

- Added this docs-only inventory report.
- No runtime code, schema, RLS, auth, migration, or secret changes were made.

## Checks

- Repository consumers were inspected statically.
- No code checks were required because this change is documentation-only.
- The report identifies current sources, consumers, fallbacks, and migration boundaries.

## Next step

Implement PROFILE-002 as a small design-first task:

1. Define a read-only `PublicProfile` type.
2. Define `loadPublicProfile(userKey)` or an equivalent resolver contract.
3. Preserve activity/member/chat snapshots as historical fallbacks.
4. Do not yet replace consumers or change schema/RLS.
5. Add contract tests before wiring event cards, participants, chat, or Share.