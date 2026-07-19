import { getTelegramInitData, getTelegramWebApp } from "./telegram";
import type { Activity, Language } from "./types";
import { isValidInvitationEventId } from "./invitationLink";

export type PreparedTelegramShareResult =
  | "shared"
  | "cancelled"
  | "unavailable";

const MAX_PROFILE_AVATAR_LENGTH = 500_000;

const loadProfileAvatarForShare = () => {
  try {
    const stored = window.localStorage.getItem("go-irl-profile");
    const parsed = stored ? JSON.parse(stored) as { avatar?: unknown } : null;
    const avatar = typeof parsed?.avatar === "string" ? parsed.avatar.trim() : "";
    return /^data:image\/(?:jpeg|jpg|png|webp);base64,/i.test(avatar)
      && avatar.length <= MAX_PROFILE_AVATAR_LENGTH
      ? avatar
      : undefined;
  } catch {
    return undefined;
  }
};

export const canSharePreparedTelegramMessage = () => {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.shareMessage && getTelegramInitData());
};

export async function sharePreparedTelegramEvent(
  activity: Activity,
  language: Language,
): Promise<PreparedTelegramShareResult> {
  const webApp = getTelegramWebApp();
  const initData = getTelegramInitData();

  if (
    !webApp?.shareMessage
    || !initData
    || !isValidInvitationEventId(activity.id)
  ) {
    return "unavailable";
  }

  try {
    const organizerAvatar = loadProfileAvatarForShare();
    const response = await fetch("/api/telegram/prepared-event-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        eventId: activity.id,
        language,
        ...(organizerAvatar ? { organizerAvatar } : {}),
      }),
    });

    if (!response.ok) return "unavailable";

    const payload = await response.json() as {
      preparedMessageId?: unknown;
    };

    const preparedMessageId = payload.preparedMessageId;
    if (typeof preparedMessageId !== "string" || !preparedMessageId) {
      return "unavailable";
    }

    return await new Promise<PreparedTelegramShare