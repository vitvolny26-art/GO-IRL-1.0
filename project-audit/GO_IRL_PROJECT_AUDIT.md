# GO IRL Project Audit

Generated: 2026-07-06T15:28:34.225Z

## Executive summary

Overall inferred completion: **71%**

This is a working MVP, not just a prototype. Core app pieces are present: Telegram auth, Supabase data, sport events, participants, coach requests, chat, share, calendar, demo mode, tests, and deployment. The main problem is not absence of features anymore. The main problem is polish, consistency, and trust-killing edge cases. Humanity has once again built a working thing and then made the buttons confusing, naturally.

## Current technical state

- Branch: `main`
- Files scanned: **118**
- Approx text lines scanned: **20753**
- Package scripts: `dev`, `typecheck`, `lint`, `test`, `build`, `preview`

## Checks

| Check | Result |
|---|---|
| lint | PASS |
| build | PASS |
| test | PASS |

## Roadmap completion

| Area | Detected | Completion | Notes |
|---|---:|---:|---|
| Telegram trusted auth | yes | 90% | Auth exists. Test only inside Telegram or demo mode. |
| Supabase data layer | yes | 85% | CRUD and migrations detected. Keep RLS/auth protected. |
| Sport vertical | yes | 85% | Main vertical is real. Needs UX polish and translation cleanup. |
| Participants and requests | yes | 80% | Join/pending/waiting flows detected. |
| Coach requests | yes | 65% | MVP exists. Needs localization, admin workflow, coach matching. |
| Event chat | yes | 70% | MVP exists. Needs expiry verification and moderation. |
| Share/invites | yes | 60% | Share exists. Telegram preview/deep-link UX still fragile. |
| Calendar | yes | 60% | Calendar hooks detected. Needs UX validation on mobile. |
| Maps/location | yes | 55% | Map/link support exists. Embedded map should be simplified. |
| Local visual demo mode | yes | 75% | Good for UI QA. Must stay isolated from production auth. |
| Translations/i18n | yes | 55% | Architecture exists. Content still mixed RU/UK/CS/EN. |
| Admin/moderation | yes | 65% | Admin delete/roles detected. Needs real moderation panels. |
| Tests | yes | 70% | Test suite exists. Needs component/e2e tests for Mini App flows. |
| Deployment | yes | 75% | Vercel/Supabase deployment signals detected. |

## Detected roadmap / setup files

- `BACKLOG.md`
- `old/README.md`
- `README.md`
- `ROADMAP.md`
- `SETUP.md`
- `SETUP_RU.md`
- `supabase/migration_ai_events_plan.sql`
- `supabase/README.md`

## Risks and bugs to resolve

- Unlocalized technical/English labels are still present.
- window.alert is used for UX feedback. Replace with in-app toast later.
- Demo mode exists. Verify it cannot affect production writes.

## Important TODO / suspicious strings

- `BACKLOG.md:56` - Add deeper tests for activity creation, join/leave, waiting list, private pending requests, organizer approvals, and edit permissions.
- `BACKLOG.md:107` - Chat RLS design: only organizer, confirmed participants, admin, and moderator can read chat; guests, pending users, rejected users, and blocked users cannot.
- `BACKLOG.md:277` - SRC-003 Add manual moderation queue for `pending_review`.
- `BACKLOG.md:308` - VERT-007 Sport skill matching.
- `CHANGELOG.md:15` - Participant states: joined, waiting, pending.
- `docs/ai-event-discovery.md:110` - `review_status`: `new`, `pending_review`, `approved`, `rejected`, `published`, `expired`
- `docs/ai-event-discovery.md:165` 4. Medium confidence candidates become `pending_review`.
- `docs/AI.md:33` Duplicates --> Moderation["Pending review / moderation"]
- `docs/Database.md:217` - guests, pending users, rejected users, and blocked users cannot read chat.
- `docs/Database.md:248` - pending Activity requests do not create chat membership.
- `docs/EventLifecycle.md:57` - Invite: pending request until organizer approval.
- `docs/n8n-workflows.md:26` 10. Move candidates to `pending_review`, `rejected`, or later `approved`.
- `docs/Notifications.md:84` - Do not notify guests, pending users, rejected users, blocked users, or users who left the chat.
- `docs/privacy.md:95` - Guests, pending users, rejected users, and blocked users cannot see the chat.
- `docs/RLS.md:95` - pending users do not see private chat;
- `docs/RLS.md:101` - Pending users are not chat members.
- `docs/Security.md:161` - Pending users cannot access chat.
- `docs/Security.md:172` - Pending Activity membership is not enough for chat membership.
- `docs/vertical-experiences.md:237` 2. User sends request or joins, depending on privacy.
- `README.md:70` - Participants list with joined, waiting, and pending states
- `RELEASE_NOTES.md:23` - Private events create pending requests that the organizer can approve or reject.
- `snapshot.txt:104` const { joinedIds, pendingIds } = useAppStore();
- `snapshot.txt:109` const pending = pendingIds.includes(activity.id);
- `snapshot.txt:112` const action = isOrganizer ? t.open : pending ? t.requested : joined ? t.joined : full ? t.eventFull : activity.visibility === "invite" ? t.request : t.join;
- `snapshot.txt:164` <button className={joined \|\| pending ? "card-join secondary" : "card-join"} onClick={() => isOrganizer ? onOpen(activity) : onJoin(activity)} type="button" disabled={!isOrganizer && full && !joined && !pending}>{action}</button>
- `snapshot.txt:185` const { joinedIds, pendingIds, userRole, reviewRequest } = useAppStore();
- `snapshot.txt:193` const pending = pendingIds.includes(activity.id);
- `snapshot.txt:195` const action = isOrganizer ? t.edit : pending ? t.cancelRequest : joined ? t.leave : full ? t.eventFull : activity.visibility === "invite" ? t.request : t.join;
- `snapshot.txt:198` const pendingMembers = activity.members.filter((member) => member.status === "pending");
- `snapshot.txt:267` {canManageActivity && pendingMembers.length > 0 && <div className="pending-heading">{t.requests} · {pendingMembers.length}</div>}
- `snapshot.txt:268` {canManageActivity && pendingMembers.map((member) => (
- `snapshot.txt:269` <div className="member-row pending-member" key={member.userKey}>
- `snapshot.txt:282` <button className="main-action" onClick={() => isOrganizer ? onEdit(activity) : onJoin(activity)} type="button" disabled={!isOrganizer && full && !joined && !pending}>{isOrganizer && <Pencil size={18} />}{action}</button>
- `snapshot.txt:535` : result === "pending"
- `snapshot.txt:859` const { joinedIds, pendingIds } = useAppStore();
- `snapshot.txt:863` const pending = pendingIds.includes(activity.id);
- `snapshot.txt:882` <button className={joined \|\| pending ? "card-join secondary" : "card-join"} onClick={() => isOrganizer ? onOpen(activity) : onJoin(activity)} type="button">
- `snapshot.txt:883` {isOrganizer ? t.open : pending ? t.requested : joined ? t.joined : activity.visibility === "invite" ? t.request : t.join}
- `snapshot.txt:1108` const { activities, joinedIds, pendingIds, loading, syncError, selectedCityId, setSelectedCity } = useAppStore();
- `snapshot.txt:1119` const pendingRequests = activities.filter((item) => pendingIds.includes(item.id));
- `snapshot.txt:1120` const activeEvents = activities.filter((item) => item.date >= today && (item.organizerKey === userKey \|\| joinedIds.includes(item.id) \|\| pendingIds.includes(item.id)));
- `snapshot.txt:1202` <Metric icon={<Clock3 />} value={String(pendingRequests.length)} label={t.pendingRequests} />
- `snapshot.txt:1208` <ProfileEventGroup title={t.waitingDecision} activities={pendingRequests} language={language} emptyText={t.noPendingRequests} onOpen={onOpen} onJoin={onJoin} />
- `snapshot.txt:1258` const { joinedIds, waitingIds, pendingIds } = useAppStore();
- `snapshot.txt:1264` const pending = pendingIds.includes(activity.id);
- `snapshot.txt:1269` : pending
- `snapshot.txt:1284` : pending
- `snapshot.txt:1324` <button className={joined \|\| waiting \|\| pending ? "card-join secondary" : "card-join"} onClick={() => isOrganizer ? onOpen(activity) : onJoin(activity)} type="button">
- `snapshot.txt:1372` const { joinedIds, waitingIds, pendingIds, reviewRequest, userRole } = useAppStore();
- `snapshot.txt:1384` const pending = pendingIds.includes(activity.id);
- `snapshot.txt:1388` : pending
- `snapshot.txt:1401` : pending
- `snapshot.txt:1417` const pendingMembers = activity.members.filter((member) => member.status === "pending");
- `snapshot.txt:1435` <span className={isOrganizer ? "details-status organizer" : pending ? "details-status pending" : joined ? "details-status joined" : full ? "details-status full" : "details-status"}>{status}</span>
- `snapshot.txt:1473` {isOrganizer && pendingMembers.length > 0 && <div className="pending-heading">{t.requests} · {pendingMembers.length}</div>}
- `snapshot.txt:1474` {isOrganizer && pendingMembers.map((member) => (
- `snapshot.txt:1475` <div className="member-row pending-member" key={member.userKey}>
- `snapshot.txt:1487` {!isOrganizer && (joined \|\| waiting \|\| pending) && <div className="status-banner">{joined ? <UserRoundCheck /> : <Clock3 />}<span>{joined ? t.joined : waiting ? t.waiting : t.requested}</span></div>}
- `snapshot.txt:1488` {!isOrganizer && activity.visibility === "private" && !joined && !waiting && !pending && <div className="status-banner neutral"><ShieldCheck /><span>{t.privateJoinInfo}</span></div>}
- `snapshot.txt:1489` {full && !joined && !waiting && !pending && !isOrganizer && <div className="status-banner danger"><UsersRound /><span>{t.eventFull}</span></div>}
- `snapshot.txt:1491` <button className="main-action" onClick={() => isOrganizer ? onEdit(activity) : onJoin(activity)} type="button" disabled={!isOrganizer && full && !joined && !waiting && !pending}>{isOrganizer && <Pencil size={18} />}{action}</button>
- `snapshot.txt:1609` type JoinResult = "joined" \| "pending" \| "left" \| "full" \| "private";
- `snapshot.txt:1641` status: "joined" \| "waiting" \| "pending";
- `snapshot.txt:1651` pendingIds: string[];
- `snapshot.txt:1862` pendingIds: members.filter((member) => member.user_key === userKey && member.status === "pending").map((member) => member.activity_id),
- `snapshot.txt:1877` pendingIds: [],
- `snapshot.txt:1900` console.error(error);
- `snapshot.txt:1929` const { joinedIds, waitingIds, pendingIds, activities } = get();
- `snapshot.txt:1931` if (joinedIds.includes(id) \|\| waitingIds.includes(id) \|\| pendingIds.includes(id)) {
- `snapshot.txt:1943` const status: DbMember["status"] = activity.visibility === "invite" ? "pending" : "joined";
- `snapshot.txt:2097` pendingIds: state.pendingIds.filter((activityId) => activityId !== id) }));
- `snapshot.txt:2369` export type CoachRequestStatus = "pending" \| "matched" \| "confirmed" \| "cancelled" \| "completed" \| "rejected";
- `snapshot.txt:2403` status: "joined" \| "waiting" \| "pending";
- `src/App.tsx:240` : result === "pending"
- `src/App.tsx:284` window.alert(t.copied);
- `src/App.tsx:565` const { joinedIds, pendingIds } = useAppStore();
- `src/App.tsx:569` const pending = pendingIds.includes(activity.id);
- `src/App.tsx:588` <button className={joined \|\| pending ? "card-join secondary" : "card-join"} onClick={() => isOrganizer ? onOpen(activity) : onJoin(activity)} type="button">
- `src/App.tsx:589` {isOrganizer ? t.open : pending ? t.requested : joined ? t.joined : activity.visibility === "invite" ? t.request : t.join}
- `src/App.tsx:814` const { activities, joinedIds, pendingIds, loading, syncError, selectedCityId, setSelectedCity } = useAppStore();

## Recommended next steps

1. Stabilize green baseline: lint/build/test must pass before each push.
2. Finish UX cleanup in event sheet: compact buttons, readable 2-column details, no embedded map junk.
3. Finish localization: remove pending, Skill match, Indoor/Outdoor, Casual/Outdoor leaks in RU/UK/CS.
4. Replace bug-report copy/alert MVP with in-app feedback form and Supabase feedback table.
5. Fix share properly with a dedicated /join/:id landing page and Open Graph image instead of t.me/share hacks.
6. Verify chat expiration from event date + time + 24h in database and UI.
7. Add component/e2e tests for create event, join, share, chat, coach request, delete.
8. Add moderation/admin screen: reports, delete/hide, user/event review.
9. Prepare private beta checklist: onboarding, city/language defaults, privacy, support flow.

## Product perspective

- GO IRL has a clear niche: turning local Telegram communities into real-world micro-events.
- The strongest wedge is sport and low-friction meetups, because users immediately understand join/capacity/place/time.
- The Telegram Mini App distribution is a real advantage, but it also makes sharing/auth/cache messy. Build robust fallbacks.
- The product should avoid becoming a generic event app. Focus on small trusted activities, friends-of-friends, and city communities.
- Near-term growth loop: create event -> share to chat -> people join in Telegram -> participants chat -> repeat.
- Main risk: UX bugs around auth/share/time will destroy trust faster than missing features. Polish beats feature spam now.

## Suggested beta milestone

### Beta 0.9.1: Trust and clarity
- All labels localized for RU/UK/CS/EN.
- Event sheet has clean compact actions.
- No expired events in main feed.
- Chat expiry matches event time.
- Share works or falls back to copy reliably.
- Bug report flow exists and stores feedback.

### Beta 0.9.2: Growth loop
- /join/:id landing page with OG image.
- Event invite previews with GO IRL branding.
- Better organizer tools.
- Participant reminders.
- Basic admin feedback queue.

### Beta 1.0: City launch
- One city focus, likely Olomouc.
- 20–50 seeded events.
- Clear onboarding for creators.
- Moderator/admin workflow.
- Analytics for create -> share -> join conversion.

## Raw git status

```
clean
```

## Recent commits

```
cc4750c fix: remove map preview and link address
c4244ea fix: replace embedded map with place card
ae8a5b9 fix: localize coach request status
34eb275 fix: improve compact event detail grid
c3a32b1 fix: compact event details and translations
8fe5e94 feat: add bug report copy action
61b729d fix: clarify bug report action
370fc66 fix: clarify report bug action
369cbd3 fix: remove unused share text variable
78a3b9f fix: improve share preview
441ce0f fix: improve activity sharing flow
09a82d4 fix: hide expired activities
```

## Failed check details

No failed check output.

<!-- GO_IRL_STABILIZATION_TASKS_5_8 -->
## Stabilization update: Tasks 5-8

Date: 2026-07-07

Closed stabilization scope:
- Task 5 Profile Fix
  - Profile edit action now saves user changes instead of acting like a close button.
  - Local avatar upload is supported.
- Task 6 Bug Report Fix
  - Bug report action opens support link.
  - Removed alert/copy-share behavior from bug reporting.
- Task 7 Weather Widget
  - Sport event details show Open-Meteo based weather summary and details.
  - Future events outside forecast range show a safe availability message.
- Task 8 Share Fix
  - Share links use Telegram Mini App startapp deep links.
  - Browser /join/:id opens the target activity.
  - Vercel SPA rewrite and Open Graph metadata are present.

Verification:
- pnpm run lint: PASS
- pnpm run build: PASS
- pnpm run test: PASS, 10 files / 51 tests

Related commits:
- cc67706 fix: save profile from edit button
- a021e10 fix: support local profile avatar upload
- dee51af fix: open bug report support link
- a61947d fix: show weather summary in sport sheet
- 7087b86 fix: show weather details in sport sheet
- e44152d fix: use telegram mini app share link
- ea63432 fix: open join route activity
