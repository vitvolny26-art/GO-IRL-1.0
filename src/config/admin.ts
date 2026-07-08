import { getTelegramWebApp } from "../telegram";
import type { UserRole } from "../types";

const configuredAdminKeys = (import.meta.env.VITE_GO_IRL_ADMIN_KEYS || "")
  .split(",")
  .map((item: string) => item.trim())
  .filter(Boolean);

// DEV/DEMO ONLY: VITE_* values are embedded into the public frontend bundle.
// Do not store real production admin Telegram IDs here. Public release must use
// trusted Telegram initData verification plus server-side roles/RLS.
export const sprintOneAdminAllowlist = new Set<string>(configuredAdminKeys);

export function getCurrentUserRole(userKey: string): UserRole {
  const telegramUser = getTelegramWebApp()?.initDataUnsafe?.user;
  const candidateKeys = [
    userKey,
    telegramUser?.id ? `telegram:${telegramUser.id}` : "",
    telegramUser?.username ? `telegram_username:${telegramUser.username.toLowerCase()}` : "",
  ].filter(Boolean);

  return candidateKeys.some((key) => sprintOneAdminAllowlist.has(key)) ? "admin" : "user";
}

export function isCurrentUserAdmin(userKey: string) {
  return getCurrentUserRole(userKey) === "admin";
}
