import { getCity } from "../config/cities";
import { getTranslation } from "../i18n";
import type { Activity, Language } from "../types";
import { readUserPreferences, type CalendarProvider } from "../userPreferences";

const googleCalendarBaseUrl = "https://calendar.google.com/calendar/render";
const outlookCalendarBaseUrl = "https://outlook.live.com/calendar/0/deeplink/compose";
const defaultDurationMinutes = 90;

type CalendarOptions = {
  language?: Language;
  eventUrl?: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatCalendarDate = (date: Date) =>
  `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}00Z`;

const timeZoneOffsetMs = (date: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const zonedAsUtc = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );
  return zonedAsUtc - date.getTime();
};

const zonedDateTimeToUtc = (date: string, time: string, timeZone: string) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute || 0, 0));
  const firstOffset = timeZoneOffsetMs(utcGuess, timeZone);
  const firstUtc = new Date(utcGuess.getTime() - firstOffset);
  const secondOffset = timeZoneOffsetMs(firstUtc, timeZone);
  return new Date(utcGuess.getTime() - secondOffset);
};

const activityDurationMinutes = (activity: Activity) =>
  activity.metadata?.sport?.durationMinutes || defaultDurationMinutes;

const calendarLocation = (activity: Activity, language: Language) => {
  const cityName = getCity(activity.cityId).name[language];
  const address = activity.address.trim();
  if (!address) return cityName;
  if (address.toLocaleLowerCase().includes(cityName.toLocaleLowerCase())) return address;
  return `${cityName}, ${address}`;
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

const escapeIcs = (value: string) => value
  .replace(/\\/g, "\\\\")
  .replace(/\n/g, "\\n")
  .replace(/,/g, "\\,")
  .replace(/;/g, "\\;");

export function getCalendarDateRange(activity: Activity) {
  const city = getCity(activity.cityId);
  const start = zonedDateTimeToUtc(activity.date, activity.time, city.timezone);
  const end = new Date(start.getTime() + activityDurationMinutes(activity) * 60 * 1000);
  return {
    start,
    end,
    dates: `${formatCalendarDate(start)}/${formatCalendarDate(end)}`,
  };
}

export function buildRawGoogleCalendarUrl(activity: Activity, options: CalendarOptions = {}) {
  const language = options.language || "ru";
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: activity.title[language],
    dates: getCalendarDateRange(activity).dates,
    details: calendarDetails(activity, language, options.eventUrl),
    location: calendarLocation(activity, language),
  });
  return `${googleCalendarBaseUrl}?${params.toString()}`;
}

export function buildAppleCalendarUrl(activity: Activity, options: CalendarOptions = {}) {
  const language = options.language || "ru";
  const range = getCalendarDateRange(activity);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GO IRL//Event//EN",
    "BEGIN:VEVENT",
    `UID:${escapeIcs(`${activity.id}@go-irl`)}`,
    `DTSTAMP:${formatCalendarDate(new Date())}`,
    `DTSTART:${formatCalendarDate(range.start)}`,
    `DTEND:${formatCalendarDate(range.end)}`,
    `SUMMARY:${escapeIcs(activity.title[language])}`,
    `DESCRIPTION:${escapeIcs(calendarDetails(activity, language, options.eventUrl))}`,
    `LOCATION:${escapeIcs(calendarLocation(activity, language))}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`;
}

export function buildOutlookCalendarUrl(activity: Activity, options: CalendarOptions = {}) {
  const language = options.language || "ru";
  const range = getCalendarDateRange(activity);
  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    startdt: range.start.toISOString(),
    enddt: range.end.toISOString(),
    subject: activity.title[language],
    body: calendarDetails(activity, language, options.eventUrl),
    location: calendarLocation(activity, language),
  });
  return `${outlookCalendarBaseUrl}?${params.toString()}`;
}

export function buildCalendarProviderUrl(
  activity: Activity,
  provider: CalendarProvider,
  options: CalendarOptions = {},
) {
  if (provider === "apple") return buildAppleCalendarUrl(activity, options);
  if (provider === "outlook") return buildOutlookCalendarUrl(activity, options);
  return buildRawGoogleCalendarUrl(activity, options);
}

export function buildGoogleCalendarUrl(activity: Activity, options: CalendarOptions = {}) {
  const provider = readUserPreferences().calendarProvider || "google";
  return buildCalendarProviderUrl(activity, provider, options);
}
