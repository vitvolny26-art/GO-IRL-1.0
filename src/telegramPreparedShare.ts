import { getTelegramInitData, getTelegramWebApp } from "./telegram";
import type { Activity, Language } from "./types";
import { isValidInvitationEventId } from "./invitationLink";

export type PreparedTelegramShareResult = "shared" | "cancelled" | "unavailable";

export const canSharePreparedTelegramMessage = () => {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.shareMessage && getTelegram