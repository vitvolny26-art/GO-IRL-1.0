import { readEnv } from "../_shared/env.js";
import { isShareEventId, isShareLanguage, loadTrustedTelegramEventCard } from "../_shared/telegram-share-event.js";

type VercelRequest = {
  method?: string;
  query?: Record<string, string | string[] | undefined>;
};

type VercelResponse = {
  end(body?: string): void;
  setHeader(name: string, value: string): void;
  status(code: number): VercelResponse;
};

const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const pad = (value: number) => String(value).padStart(2, "0");
const compactLocal = (date: string, time: string) => `${date.replaceAll("-", "")}T${time.replace(":", "")}00`;
const escapeIcs = (value: string) => value
  .replaceAll("\\", "\\\\")
  .replaceAll(";", "\\;")
  .replaceAll(",", "\\,")
  .replaceAll("\n", "\\n");

const publicOrigin = () => {
  const host = readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  return host ? `https://${host.replace(/^https?:\/\//, "")}` : "https://go-irl-1-0.vercel.app";
};

const addMinutes = (date: string, time: string, minutes: number) => {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, hour, minute));
  value.setUTCMinutes(value.getUTCMinutes() + minutes);
  return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(value.getUTCDate())}T${pad(value.getUTCHours())}${pad(value.getUTCMinutes())}00`;
};

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).end("method_not_allowed");
  }

  const eventId = first(request.query?.event);
  const language = first(request.query?.language) || "ru";
  if (!isShareEventId(eventId) || !isShareLanguage(language)) return response.status(404).end("not_found");

  try {
    const card = await loadTrustedTelegramEventCard(eventId, language);
    if (!card) return response.status(404).end("not_found");

    const duration = Math.min(480, Math.max(15, Math.round(card.durationMinutes || 90)));
    const detailsUrl = `${publicOrigin()}/api/meta/event-preview?event=${encodeURIComponent(card.eventId)}&language=${encodeURIComponent(card.language)}`;
    const start = compactLocal(card.eventDate, card.time);
    const end = addMinutes(card.eventDate, card.time, duration);
    const title = card.title || card.activity || "GO IRL";
    const body = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//GO IRL//Meta Event//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${escapeIcs(card.eventId)}@go-irl-1-0.vercel.app`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
      `DTSTART;TZID=Europe/Prague:${start}`,
      `DTEND;TZID=Europe/Prague:${end}`,
      `SUMMARY:${escapeIcs(title)}`,
      `DESCRIPTION:${escapeIcs(`${card.activity}\n\n${detailsUrl}`)}`,
      `LOCATION:${escapeIcs(card.address || card.city)}`,
      `URL:${escapeIcs(detailsUrl)}`,
      "END:VEVENT",
      "END:VCALENDAR",
      "",
    ].join("\r\n");

    response.setHeader("Content-Type", "text/calendar; charset=utf-8");
    response.setHeader("Content-Disposition", `attachment; filename="go-irl-${card.eventId}.ics"`);
    response.setHeader("Cache-Control", "private, max-age=300");
    return response.status(200).end(body);
  } catch {
    return response.status(503).end("calendar_unavailable");
  }
}
