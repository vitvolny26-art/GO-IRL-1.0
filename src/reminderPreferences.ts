export type ReminderChannel = "telegram" | "whatsapp" | "instagram" | "messenger";
export type ReminderLeadMinutes = 15 | 60 | 180 | 1440;

export type EventReminderPreference = {
  activityId: string;
  channel: ReminderChannel;
  leadMinutes: ReminderLeadMinutes;
  eventStartsAt: string;
  updatedAt: string;
};

const storageKey = "go-irl-event-reminders-v1";

export const eventReminderChangedEvent = "go-irl-event-reminder-changed";

const isPreference = (value: unknown): value is EventReminderPreference => {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<EventReminderPreference>;
  return typeof item.activityId === "string"
    && ["telegram", "whatsapp", "instagram", "messenger"].includes(item.channel || "")
    && [15, 60, 180, 1440].includes(item.leadMinutes || 0)
    && typeof item.eventStartsAt === "string"
    && typeof item.updatedAt === "string";
};

export function readEventReminder(activityId: string) {
  if (typeof localStorage === "undefined") return null;
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (!Array.isArray(parsed)) return null;
    return parsed.find((item) => isPreference(item) && item.activityId === activityId) || null;
  } catch {
    return null;
  }
}

export function saveEventReminder(preference: EventReminderPreference) {
  if (typeof localStorage === "undefined") return;
  let existing: EventReminderPreference[] = [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(parsed)) existing = parsed.filter(isPreference);
  } catch {
    existing = [];
  }
  localStorage.setItem(storageKey, JSON.stringify([
    preference,
    ...existing.filter((item) => item.activityId !== preference.activityId),
  ]));
  window.dispatchEvent(new CustomEvent(eventReminderChangedEvent, { detail: preference }));
}

export function removeEventReminder(activityId: string) {
  if (typeof localStorage === "undefined") return;
  let existing: EventReminderPreference[] = [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(parsed)) existing = parsed.filter(isPreference);
  } catch {
    return;
  }
  localStorage.setItem(storageKey, JSON.stringify(existing.filter((item) => item.activityId !== activityId)));
  window.dispatchEvent(new CustomEvent(eventReminderChangedEvent, { detail: { activityId } }));
}

export const eventStartsAt = (date: string, time: string) => `${date}T${time || "00:00"}:00`;
