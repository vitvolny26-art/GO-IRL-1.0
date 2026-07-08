# GO IRL Beta Readiness Audit

Date: 2026-07-07

## Summary

GO IRL MVP is ready for closed beta preparation after stabilization Tasks 1-9.

Current status:
- Core Telegram Mini App flow is working.
- Browser mock/demo mode is working and isolated from production writes.
- Coach and event chat MVP are restored.
- Event time rendering is normalized.
- Profile save and local avatar upload are fixed.
- Bug report action opens support link.
- Weather widget MVP is available in sport event details.
- Share links use Telegram Mini App startapp deep links.
- Browser /join/:id opens target activity.
- Documentation updated for Tasks 5-8.

## Verification

Latest local verification:
- git status: clean
- pnpm run lint: PASS
- pnpm run build: PASS
- pnpm run test: PASS, 10 files / 51 tests

## Closed stabilization commits

- 9eb296b docs: record tasks 5-8 stabilization
- ea63432 fix: open join route activity
- e44152d fix: use telegram mini app share link
- 7087b86 fix: show weather details in sport sheet
- a61947d fix: show weather summary in sport sheet
- dee51af fix: open bug report support link
- a021e10 fix: support local profile avatar upload
- cc67706 fix: save profile from edit button
- 92997d5 fix: normalize event time rendering
- 32213b9 fix: support demo coach and chat

## Beta readiness checklist

### Ready for closed beta

- [x] App opens in Telegram Mini App.
- [x] App opens in browser demo mode.
- [x] Demo user and demo events are available.
- [x] Create event flow works.
- [x] Join/request flow works.
- [x] Event details and time display are stable.
- [x] Coach request MVP is restored.
- [x] Activity chat MVP is restored.
- [x] Weather info is shown safely.
- [x] Share and join deep links are stable.
- [x] Documentation reflects stabilization state.
- [x] lint/build/test pass.

### Must verify manually before inviting beta users

- [ ] Telegram bot production deep link uses correct BOT_USERNAME and APP_NAME env values.
- [ ] Vercel production deployment points to latest main.
- [ ] Supabase production tables exist and RLS was not changed during stabilization.
- [ ] Browser demo writes do not touch production Supabase.
- [ ] iOS Telegram share/join flow opens Mini App directly.
- [ ] Android Telegram share/join flow opens Mini App directly.
- [ ] Event chat visibility is acceptable for closed beta.
- [ ] Bug report support link opens correct Telegram support destination.
- [ ] Weather widget degrades gracefully when network/geocoding fails.

## Remaining risks

- Open Graph is static in index.html, not per-event dynamic. Good enough for closed beta, not final viral sharing.
- Chat and coach features are MVP-level and need moderation/admin polish later.
- Weather depends on third-party public APIs and can fail due to network or geocoding.
- No full e2e Telegram Mini App test suite yet.
- Supabase RLS/auth must remain untouched unless explicitly audited in a separate task.

## Recommendation

Proceed to closed beta with a small trusted user group in Olomouc.

Suggested beta size:
- 5-10 internal testers first.
- Then 20-30 local users after Telegram/Vercel/Supabase manual checks.

Focus of beta:
- create event -> share -> join/request -> chat -> real attendance.
- Collect bugs through the support link.
- Do not add new feature scope until core beta flow is stable.
