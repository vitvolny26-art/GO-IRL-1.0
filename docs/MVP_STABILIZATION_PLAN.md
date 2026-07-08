# GO IRL MVP Stabilization Plan

Generated: 2026-07-07T14:00:40.297Z

## Goal

Stabilize the GO IRL MVP for closed beta without rewriting the existing architecture.

## Rules

- Preserve current React + TypeScript + Vite + Supabase + Telegram Mini App architecture.
- Fix one feature at a time.
- Before each commit, run: pnpm run lint, pnpm run build, pnpm run test.
- Do not touch .env, secrets, Supabase RLS, or destructive database logic without explicit approval.
- Prefer small patches over big rewrites.
- Read dependencies before changing shared components.

## Current beta priorities

1. Restore and stabilize Coach and Activity Chat with Weather enabled.
2. Add safe Browser Demo / Mock mode for UI testing outside Telegram.
3. Fix event card time rendering across all lists.
4. Fix profile save flow and avatar upload.
5. Replace bug report clipboard/alert with support Telegram link or proper feedback flow.
6. Integrate Open-Meteo weather safely.
7. Fix share links and prepare /join/:id Open Graph landing page.

## Acceptance criteria for Beta 0.9.1

- Production Mini App opens in Telegram.
- Local browser/demo mode opens without Telegram initData.
- Event creation/edit/delete works in demo without Supabase writes.
- Sport event detail screen is readable and compact.
- Coach, chat, weather, share, profile, and bug report flows do not conflict.
- lint/build/test are green.
