# Manual Beta Checklist

## 0. Local Helper Check

- [ ] Run local helper:

```bash
node beta-test.cjs
```

- [ ] Confirm required source files are present.
- [ ] Confirm local `.env.local` contains required Supabase variable names if Supabase-backed flows are being tested.
- [ ] Continue with the manual checks below.

**Expected:** Helper completes without runtime errors. Dashboard/device checks are still manual.

---

## 1. Vercel: Latest Deployment

- [ ] Go to the current Vercel project for GO IRL.
- [ ] Check latest deployment from `main`.
- [ ] Click deployment and open Preview URL.
- [ ] Note deployment time and commit hash.

**Expected:** Green status, no errors.

If Vercel shows `upgradeToPro=build-rate-limit`, treat it as an operational quota issue, not an app regression.

---

## 2. Telegram: Bot Configuration

- [ ] Open Telegram bot settings: `@BotFather`.
- [ ] Check bot name.
- [ ] Check Mini App name.
- [ ] Verify Mini App URL points to current Vercel production URL.

**Expected:** Bot responds to `/start`, Mini App link works.

---

## 3. iOS: Share & Join Link

- [ ] Open Telegram on iPhone.
- [ ] Find a sport activity card.
- [ ] Tap share button.
- [ ] Select copy/share link.
- [ ] Verify link format: `https://t.me/[BOT_NAME]/[APP_NAME]?startapp=[ACTIVITY_ID]`.
- [ ] Tap link and confirm Mini App opens with activity loaded.
- [ ] Check if you can join/request.
- [ ] Confirm no App Store redirect happens instead of opening Telegram/Mini App.

**Expected:** Link works, activity loads, no black screen.

---

## 4. Android: Share & Join Link

- [ ] Same as iOS but on Android device/emulator.
- [ ] Verify link opens Mini App.
- [ ] Check join/request works.

**Expected:** Same behavior as iOS.

---

## 5. Browser: Demo Mode

- [ ] Start dev server:

```bash
pnpm run dev
```

- [ ] Open local app in a normal browser, not inside Telegram.
- [ ] Open Vercel app in a normal browser, not inside Telegram.
- [ ] Confirm demo user is active: `Vit_Test` / `telegram:999999`.
- [ ] Confirm Olomouc demo events are visible:
  - [ ] Volleyball
  - [ ] Board games
  - [ ] Running
  - [ ] Walking
  - [ ] Coffee meetup
  - [ ] Language exchange
- [ ] Create a demo activity.
- [ ] Confirm message appears: `Изменения сохранены (Демо-режим)`.
- [ ] Refresh the page.
- [ ] Confirm the demo activity persists from local browser state.
- [ ] Join/leave a demo activity.
- [ ] Open sport event details.
- [ ] Check Coach request flow.
- [ ] Confirm Coach demo requests persist in localStorage key `go-irl-demo-coach-requests-v1`.
- [ ] Check Event Chat message flow.
- [ ] Confirm Event Chat demo messages persist in localStorage key `go-irl-demo-activity-chat-v1`.
- [ ] Open Supabase dashboard and confirm browser demo writes do **not** appear in production tables:
  - [ ] `activities`
  - [ ] `activity_members`
  - [ ] `coach_requests`
  - [ ] `activity_chats`
  - [ ] `activity_chat_messages`

**Expected:** Browser without Telegram uses local demo state. Demo writes are allowed locally and must not touch production Supabase.

---

## 6. Event Cards: Time Rendering

- [ ] Open Home.
- [ ] Compare generic cards and sport cards.
- [ ] Confirm sport cards show event start time, not duration.
- [ ] Confirm cards with invalid/empty time do not show an empty time badge.
- [ ] Open sport event detail and confirm duration remains visible in details metadata.

**Expected:** Card time rendering is consistent and no empty time badge appears.

---

## 7. Weather Widget

- [ ] Open a sport event within 7 days.
- [ ] Confirm weather text appears after loading.
- [ ] Expand weather details.
- [ ] Confirm temperature bars are visible.
- [ ] Confirm rain and wind values are visible.
- [ ] Open/create sport event more than 7 days ahead.
- [ ] Confirm forecast-available-later message appears.

**Expected:** Weather works without API keys and does not break sport details.

---

## 8. Bug Report

- [ ] Open event details.
- [ ] Open more menu.
- [ ] Tap `Сообщить о баге`.
- [ ] Confirm Telegram support link opens.
- [ ] Confirm share text is not copied.
- [ ] Confirm no alert popup appears.

**Expected:** Bug report opens support link only.

---

## 9. Supabase: Table Integrity

- [ ] Open Supabase dashboard.
- [ ] Check tables exist without manual changes:
  - [ ] `activities`
  - [ ] `activity_members`
  - [ ] `user_roles`
  - [ ] `coach_profiles`
  - [ ] `coach_requests`
  - [ ] `activity_chats` if migrations ran
  - [ ] `activity_chat_messages` if migrations ran

RLS policies check:

- [ ] View RLS policies on each table.
- [ ] Verify helper functions exist.
- [ ] **DO NOT modify RLS policies**.

**Expected:** Tables intact, RLS policies unchanged, data looks valid.

---

## Sign-off

- [ ] Tester name: ________________
- [ ] Date: ________________
- [ ] All tests passed: YES / NO
- [ ] Ready for production: YES / NO

---

## Notes

Document any issues, performance problems, screenshots, or red error blocks here.
