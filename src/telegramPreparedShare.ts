import { activityIconFor } from "./activityIcon";
import { getCity } from "./config/cities";
import { buildEventLocationUrl } from "./eventLocations";
import { formatEventTime } from "./eventTime";
import { localeByLanguage } from "./i18n";
import { getTelegramInitData, getTelegramWebApp } from "./telegram";
import type { Activity, Language } from "./types";
import { stripLeadingEmoji } from "./cardText";
import { isValidInvitationEventId } from "./invitationLink";
import { sportEnvironmentLabel, sportFormatLabel, sportLevelLabel } from "./verticals/sport";

const genericLabels = {
  ru: { level: "Для всех", format: "Открыто", environment: "В городе" },
  uk: { level: "Для всіх", format: "Відкрито", environment: "У місті" },
  cs: { level: "Pro všechny", format: "Otevřené", environment: "Ve městě" },
  en: { level: "All levels", format: "Open", environment: "In the city" },
} as const;

const compactDate = (value: string, language: Language) => {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(localeByLanguage[language], { day: "numeric", month: "short" })
    .format(date)
    .replace(/\.$/, "");
};

export const canSharePreparedTelegramMessage = () => {
  const webApp = getTelegramWebApp();
  return Boolean(webApp?.shareMessage && getTelegramInitData());
};

export async function sharePreparedTelegramEvent(activity: Activity, language: Language, inviteUrl: string) {
  const webApp = getTelegramWebApp();
  const initData = getTelegramInitData();
  if (!webApp?.shareMessage || !initData || !isValidInvitationEventId(activity.id)) return false;

  try {
    const city = getCity(activity.cityId).name[language];
    const sport = activity.metadata?.sport;
    const fallback = genericLabels[language];
    const mapUrl = activity.locationUrl?.trim() || buildEventLocationUrl(activity.address, city);
    const response = await fetch("/api/telegram/prepared-event-share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        initData,
        card: {
          eventId: activity.id,
          title: stripLeadingEmoji(activity.title[language]),
          activity: stripLeadingEmoji(activity.activity[language]),
          address: activity.address,
          participants: activity.participants,
          capacity: activity.capacity,
          icon: activityIconFor(activity, language, "✨"),
          inviteUrl,
          mapUrl,
          city,
          durationMinutes: sport?.durationMinutes,
          price: activity.price,
          level: sport ? sportLevelLabel(sport.level, language) : fallback.level,
          format: sport ? sportFormatLabel(sport.format, language) : fallback.format,
          environment: sport ? sportEnvironmentLabel(sport.environment, language) : fallback.environment,
          isSport: Boolean(sport || activity.type === "sport" || activity.categoryId === "sport"),
          date: compactDate(activity.date, language),
          time: formatEventTime(activity.time),
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
