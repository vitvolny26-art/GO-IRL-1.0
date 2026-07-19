---
title: AI Fix Report — PLAN1157
owner: AI Fixer
status: Draft
source_of_truth: false
last_review: 2026-07-19
next_review: 2026-07-26
---

# AI Fix Report — PLAN1157

## Summary

Made the camera button the only control that opens avatar selection in the profile editor.

## Root cause

The whole avatar preview was implemented as a file-input label, so tapping anywhere on the photo opened the picker. The camera control also sat partially outside the preview.

## Files changed

- `src/profile-avatar-proportions.css`

## Fix applied

- Disabled pointer handling on the photo area.
- Restricted the file input hit area to the 44×44 camera control.
- Moved the camera fully inside the lower-right corner.
- Preserved the full 320×320 image preview and keyboard focus indication.

## Verification

```text
pnpm run test       PASS
pnpm run typecheck  PASS
pnpm run lint       PASS
pnpm run build      PASS
```

## Risks

Final Telegram Android visual smoke remains required after production deployment.

## Not touched

- Profile persistence
- Avatar upload processing
- Auth
- Supabase RLS or schema
- Telegram Share card

## Follow-up

Verify that tapping the photo does nothing and tapping only the camera opens the image picker.
