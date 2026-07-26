# GO IRL — Messaging, Reminders and Meta Channels Handoff

Status date: 2026-07-21  
Repository: `vitvolny26-art/GO-IRL-1.0`  
Base branch: `main` at `444f7eb`  
Active branch: `feat/user-messaging-reminders`  
Branch head: `8509125`

## Executive status

The Telegram-first event product and the shared Meta invitation foundation are present. The most recent production work fixed private-event join requests: organizers receive a notification, the event card shows a request indicator, and the organizer can explicitly accept or reject the applicant.

The active feature branch adds an event reminder bell and fixes mobile Messenger sharing. It is pushed but not merged into `main`. The reminder UI is functional, but production bot delivery is not yet scheduled server-side. Do not describe the reminder as sent until the backend phase below is complete.

## Completed and already in main

- Telegram Mini App event experience.
- WhatsApp, Instagram Direct and Messenger provider webhook/adaptor foundation.
- Meta webhook signature validation.
- Provider-neutral join handling and atomic join path.
- Dynamic event invitation previews and event-specific artwork.
- Google Calendar action instead of an unexplained ICS download for the main calendar action.
- Messenger invitation preview page with event, calendar and Telegram actions.
- Private-event join request creation.
- Organizer notification for pending requests.
- Per-event pending-request indicator.
- Explicit **Accept** and **Reject** controls for organizers.
- Duplicate join protection and shared activity membership model.

Important production merges:

- PR #285 — calendar/open-event corrections.
- PR #286 — Messenger share path iteration.
- PR #287 — organizer pending-request notifications.
- PR #288 — per-event request indicator and accept/reject actions.

## Active branch changes

### Commit `a4af084` — event reminder channel picker

- Restores a reminder bell on generic and sport event cards.
- Offers lead times: 15 minutes, 1 hour, 3 hours, 1 day.
- Offers Telegram, WhatsApp, Instagram and Messenger.
- Shows an active ringing bell after saving.
- Allows editing and removing the preference.
- Distinguishes the organizer request indicator with `BellDot`.
- Uses a mobile bottom sheet so the save action does not sit under bottom navigation.
- Stores the current Phase 1 choice locally per event.
- Adds provider-neutral reminder preference types and unit tests.
- Adds `docs/architecture/USER_MESSAGING_WORKFLOW.md`.

### Commit `8509125` — mobile Messenger app launch

- Replaces the unsupported mobile Facebook `dialog/send` path.
- Android launches the Messenger package through an intent URL.
- iOS launches the `fb-messenger://` URL scheme.
- Desktop retains the Facebook Send Dialog.
- Adds Android, iOS and desktop routing tests.

## Verification

Latest branch verification:

- TypeScript typecheck: green.
- ESLint: green.
- Unit tests: 317 passed.
- Vite production build: green.
- Local visual smoke test: reminder control and four-channel picker render correctly.

Physical-device verification still required after preview deployment:

- Android: Messenger button opens the installed Messenger app and the exact event preview is shareable.
- iOS: Messenger URL scheme opens Messenger.
- Telegram Android/iOS: reminder bottom sheet remains above native/bottom navigation.
- All four reminder choices persist after reopening the Mini App.

## Messaging workflow

The canonical workflow is documented in `docs/architecture/USER_MESSAGING_WORKFLOW.md`.

Bot communication triggers:

1. Private-event join request → organizer.
2. Request accepted/rejected → applicant.
3. Event date/time/location/cancellation changed → confirmed participants.
4. User-configured event reminder → that user through the selected connected provider.
5. Capacity becomes available → eligible waitlisted users.

Every delivery must resolve an internal `user_key` to an explicitly linked provider identity. Provider secrets remain server-side. Delivery must respect opt-in, quiet hours, provider messaging windows/templates and event visibility.

## Release roadmap

### Gate 1 — merge the current UI branch

1. Open a PR from `feat/user-messaging-reminders` to `main`.
2. Confirm the diff contains only commits `a4af084` and `8509125` above `444f7eb`.
3. Wait for GitHub CI and Vercel Preview.
4. Perform the Android Messenger smoke test.
5. Perform the reminder bottom-sheet mobile check.
6. Merge only when all checks are green.

### Gate 2 — durable reminder backend

Implement a protected `event_reminders` model keyed by `(user_key, activity_id)` with:

- provider;
- lead time;
- calculated `scheduled_for`;
- status (`scheduled`, `sending`, `sent`, `failed`, `cancelled`);
- attempt count and next retry;
- idempotency/delivery key;
- created/updated/sent timestamps.

Requirements:

- authenticated owner-only writes;
- service-role-only dispatch reads/updates;
- no tokens or provider IDs in client-visible rows;
- event access checked again immediately before delivery;
- event edits recalculate unsent reminders;
- cancellation/deletion cancels unsent reminders;
- unique delivery key prevents duplicate bot messages.

Do not apply migration or RLS changes without running linked database lint and the project verification scripts.

### Gate 3 — linked provider identities

- Telegram: use the trusted Telegram identity/chat relationship already established by Mini App authentication.
- WhatsApp: require explicit opt-in and a usable WhatsApp recipient identity.
- Instagram: require a permitted Direct conversation/identity; do not promise delivery outside Meta policy.
- Messenger: require a Page-scoped user identity and active permitted messaging relationship.
- UI must show **Connect channel** instead of **Saved** when the selected provider cannot receive messages.
- Never silently fall back to a different messenger.

### Gate 4 — due-reminder worker and outbound messages

1. Poll or schedule due reminders server-side; the Mini App is never the worker.
2. Reload the event and current access/membership.
3. Enforce quiet hours and provider rules.
4. Build one provider-neutral reminder result.
5. Dispatch through Telegram/WhatsApp/Instagram/Messenger adapters.
6. Record sent, retryable failure or permanent failure.
7. Retry only transient `429`/`5xx` failures with bounded exponential backoff.
8. Do not log tokens or full private message payloads.

Reminder content:

- exact event title;
- current date/time and location;
- dynamic event artwork where supported;
- **Open event**;
- **Calendar**;
- **Map**;
- cancellation/change warning when applicable.

### Gate 5 — transactional bot communication

Add server-originated messages in this order:

1. Applicant receives accepted/rejected result.
2. Organizer receives private-event join request.
3. Confirmed participants receive event cancellation or material changes.
4. Personal event reminders.
5. Waitlist/capacity availability.

Each message type needs unit payload tests, webhook/outbound integration tests, duplicate-send protection and one physical channel smoke test.

### Gate 6 — production channel readiness

For each provider independently verify:

- real inbound webhook;
- valid Meta/Telegram signature or trusted auth;
- real outbound message;
- exact event opens;
- Join is stored once;
- calendar and map actions work;
- opt-out/reminder removal works;
- tokens do not appear in client bundles, URLs or logs.

Recommended rollout order:

1. Telegram reminders and transactional messages.
2. WhatsApp reminders using approved templates where required.
3. Messenger transactional messages.
4. Instagram Direct only within verified policy constraints.

## Known blockers and risks

- The reminder selection is currently local UI state, not a server delivery promise.
- Messenger mobile app launching must be validated on a physical Android device after deployment.
- Instagram and Messenger cannot behave exactly like Telegram Mini Apps; Meta messaging windows and account relationships apply.
- WhatsApp outbound notifications outside the service window require approved templates.
- The Facebook Send Dialog fails inside some mobile WebViews with API error `4202`; the active branch bypasses it on mobile.
- Provider accounts, permissions, subscriptions and production credentials must be verified in Meta before claiming a channel is production-ready.
- Do not expose access tokens, app secrets, verify tokens or phone identifiers in screenshots, chat, client code or logs.

## Immediate next command sequence

```text
git fetch origin
git switch feat/user-messaging-reminders
git log --oneline origin/main..HEAD
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
```

Expected branch commits:

```text
8509125 fix: open Messenger app on mobile share
a4af084 feat: add event reminder channel picker
```

## Stop conditions

Stop and do not merge when:

- branch contains unrelated commits;
- any CI/build/test check is red;
- Messenger still opens Facebook error `4202` on Android;
- reminder panel is clipped by navigation;
- UI claims a bot reminder is scheduled before server persistence succeeds;
- a migration weakens RLS or exposes provider identifiers/tokens;
- an outbound path can send the same message twice.

## Final handoff

The safest next action is a clean PR for the two active-branch commits, followed by Android physical QA. After merge, build Telegram server-side reminders first using the provider-neutral workflow, then connect WhatsApp, Messenger and Instagram one provider at a time behind explicit capability checks.
