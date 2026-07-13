import { activityIconFor } from "./activityIcon";
import { getTelegramInitData, getTelegramWebApp } from "./telegram";
import type { Activity, Language } from "./types";
import { stripLeadingEmoji } from "./cardText";
import { isValidInvitationEventId } from "./invitationLink";

export const canSharePreparedTelegramMessage = () => {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.shareMessage && getTelegramInitData());
};

export async function sharePreparedTelegramEvent(activity: Activity, language: Language, inviteUrl: string) {
  const webApp = getTelegramWebApp();
  const initData = getTelegramInitData();
  if (!webApp?.shareMessage || !initData || !isValidInvitationEventId(activity.id)) return false;

  try {
    const response = await fetch("/api/telegram/prepared-event-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        card: {
          eventId: activity.id,
          title: stripLeadingEmoji(activity.title[language]),
          activity: stripLeadingEmoji(activity.activity[language]),
          date: activity.date,
          time: activity.time,
          address: activity.address,
          participants: activity.participants,
          capacity: activity.capacity,
          icon: activityIconFor(activity, language, "✨"),
          inviteUrl,
          language,
        },
      }),
    });
    if (!response.ok) return false;
    const payload = await response.json() as { preparedMessageId?: unknown };
    if (typeof payload.preparedMessageId !== "string" || !payload.preparedMessageId) return false;

    return await new Promise<boolean>((resolve) => {
      let settled = false;
      const finish = (success: boolean) => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timeout);
        resolve(success);
      };
      const timeout = window.setTimeout(() => finish(false), 20_000);
      webApp.shareMessage?.(payload.preparedMessageId as string, finish);
    });
  } catch {
    return false;
  }
}
