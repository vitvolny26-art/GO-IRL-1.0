import { getCity } from "../config/cities";
import { getTranslation } from "../i18n";
import type { Activity, Language } from "../types";

const googleCalendarBaseUrl = "https://calendar.google.com/calendar/render";
const defaultDurationMinutes = 90;

type CalendarOptions = {
  language?: Language;
  eventUrl?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

const compactGoogleDateTime = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00`;

const activityDurationMinutes = (activity: Activity) =>
  activity.metadata?.sport?.durationMinutes || defaultDurationMinutes;

const calendarLocation = (activity: Activity, language: Language) => {
  const cityName = getCity(activity.cityId).name[language];
  const address = activity.address.trim();
  if (!address) return cityName;
  if (address.toLocaleLowerCase().includes(cityName.toLocaleLowerCase())) return address;
  return `${address}, ${cityName}`;
};

const calendarDetails = (activity: Activity, language: Language, eventUrl?: string) => {
  const t = getTranslation(language);
  const lines = [
    activity.description[language],
    activity.participantNote ? `${t.participantNote}: ${activity.participantNote}` : "",
    eventUrl ? `${t.openCreatedEvent}: ${eventUrl}` : "",
    `GO IRL - ${t.tagline}`,
  ].filter(Boolean);
  return lines.join("\n\n");
};

export function getCalendarDateRange(activity: Activity) {
  const [year, month, day] = activity.date.split("-").map(Number);
  const [hour, minute] = activity.time.split(":").map(Number);
  const start = new Date(Date.UTC(year, month - 1, day, hour, minute || 0, 0));
  const end = new Date(start.getTime() + activityDurationMinutes(activity) * 60 * 1000);
  return {
    start,
    end,
    dates: `${compactGoogleDateTime(start)}/${compactGoogleDateTime(end)}`,
  };
}

export function buildGoogleCalendarUrl(activity: Activity, options: CalendarOptions = {}) {
  const language = options.language || "ru";
  const city = getCity(activity.cityId);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title[language],
    dates: getCalendarDateRange(activity).dates,
    details: calendarDetails(activity, language, options.eventUrl),
    location: calendarLocation(activity, language),
    ctz: city.timezone,
  });
  return `${googleCalendarBaseUrl}?${params.toString()}`;
}
