# Beta Testing Quick Start

## Local Helper Checks
```bash
node beta-test.cjs
```

This local helper verifies:
- ✓ Required environment variable names are present in `.env.local`
- ✓ Required source files exist
- ✓ Manual Supabase table checklist is printed
- ✓ Demo mode links are printed

**Important:** this script does not call Vercel, Telegram, or Supabase APIs. Those checks remain manual and must be completed through the dashboards/devices listed below.

---

## Manual Testing Workflow

### 1. Start Dev Server
```bash
pnpm run dev
```

The dev server is pinned to:

```text
http://localhost:5178
```

### 2. Test Normal Mode
- [ ] View activity list
- [ ] Open sport activity card (should show details)
- [ ] Try to join activity
- [ ] Check members panel
- [ ] Verify no console errors

### 3. Test Browser Demo Mode
```bash
# In browser, go to:
http://localhost:5178?demo=true
```

Browser Demo Mode is a beta safety surface for testing outside Telegram.

Expected demo boundaries:

- Browser without Telegram should open the app and not show a black screen.
- Demo identity must be treated as fake/local, not trusted Telegram auth.
- Expected fake user:
  - id: `999999`
  - name: `Vit_Test`
- Expected Olomouc demo event set:
  - Volleyball
  - Board games
  - Running
  - Walking
  - Coffee meetup
  - Language exchange
- Demo writes must not touch production Supabase.
- Demo-only writes should show a clear success message such as:

```text
Изменения сохранены (Демо-режим)
```

Manual checks:

- [ ] View demo activities
- [ ] Open sport activity card
- [ ] Try to join or save in demo mode
- [ ] Verify no production Supabase write is required
- [ ] Verify message is helpful and not a black screen
- [ ] Open console (F12) and check there are no uncaught auth errors

### 4. Test on Mobile (iOS/Android)

#### Share Link Test
1. Find sport activity in Telegram Mini App.
2. Tap share button.
3. Copy/share the generated link.
4. Open link from another Telegram account.
5. Confirm it opens the same target activity in the Mini App.
6. Try to join.

#### Expected Telegram Mini App Link Format

```text
https://t.me/[BOT_USERNAME]/[APP_NAME]?startapp=[ACTIVITY_ID]
```

Expected behavior:

- Link opens the GO IRL Telegram Mini App.
- Target activity opens directly when possible.
- iOS must not redirect to the App Store instead of opening Telegram/Mini App.
- Public event joins directly if capacity is available.
- Private/invite event follows request/approval rules.
- Full event follows waiting-state behavior where supported.

#### Browser Join Fallback Test

1. Open local or deployed web app route:

```text
/join/[ACTIVITY_ID]
```

2. Confirm the browser route opens the target activity.
3. Confirm it does not behave like a ticketing page, event website, or external landing page.
4. Confirm Open Graph preview uses GO IRL metadata and an absolute image URL.

#### Share Guardrails

- [ ] Share flow must not be reused for bug report.
- [ ] Bug report must open support/feedback flow, not copy share text.
- [ ] Share text should focus on joining the event, not downloading an app store package.

### 5. Check Vercel Deployment
1. Go to the current Vercel project for GO IRL
2. Check latest deployment status (should be green)
3. Open preview URL
4. Verify same functionality as localhost

If Vercel shows `upgradeToPro=build-rate-limit`, treat it as an operational quota issue, not an app regression.

### 6. Supabase Verification
1. Open Supabase dashboard
2. Check `Tables` section → verify all tables exist
3. Check `SQL Editor` → run verification queries if needed
4. **DO NOT modify RLS policies** (just verify they're there)

---

## Quick Issue Template

If you find a bug:

```
## Issue: [Short title]

**Steps to reproduce:**
1. ...
2. ...
3. ...

**Expected behavior:**
[What should happen]

**Actual behavior:**
[What actually happens]

**Environment:**
- Device: iOS / Android / Browser
- Version: [App version if available]
- Screenshot/video: [Attach if possible]
```

---

## Ready to Test?

1. ✓ Run `node beta-test.cjs`
2. ✓ Start `pnpm run dev`
3. ✓ Open `BETA_CHECKLIST.md`
4. ✓ Go through each test systematically
5. ✓ Document any issues
