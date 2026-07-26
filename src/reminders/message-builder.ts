import type { Language } from "../types.js";
import type {
  ReminderAction,
  ReminderDelivery,
  ReminderMessage,
} from "./types.js";

const copy: Record<Language, {
  heading: (minutes: number) => string;
  open: string;
  calendar: string;
  map: string;
}> = {
  ru: {
    heading: (minutes) => minutes === 1440
      ? "Событие уже завтра"
      : `Событие начнётся через ${minutes < 60 ? `${minutes} мин` : `${minutes / 60} ч`}`,
    open: "Открыть событие",
    calendar: "В календарь",
    map: "Открыть карту",
  },
  uk: {
    heading: (minutes) => minutes === 1440
      ? "Подія вже завтра"
      : `Подія почнеться через ${minutes < 60 ? `${minutes} хв` : `${minutes / 60} год`}`,
    open: "Відкрити подію",
    calendar: "У календар",
    map: "Відкрити мапу",
  },
  cs: {
    heading: (minutes) => minutes === 1440
      ? "Událost je už zítra"
      : `Událost začne za ${minutes < 60 ? `${minutes} min` : `${minutes / 60} h`}`,
    open: "Otevřít událost",
    calendar: "Do kalendáře",
    map: "Otevřít mapu",
  },
  en: {
    heading: (minutes) => minutes === 1440
      ? "Your event is tomorrow"
      : `Your event starts in ${minutes < 60 ? `${minutes} min` : `${minutes / 60} hr`}`,
    open: "Open event",
    calendar: "Add to calendar",
    map: "Open map",
  },
};

const buildActions = (delivery: ReminderDelivery): ReminderAction[] => {
  const labels = copy[delivery.language];
  return [
    { kind: "open", label: labels.open, url: delivery.event.openUrl },
    ...(delivery.event.calendarUrl
      ? [{ kind: "calendar" as const, label: labels.calendar, url: delivery.event.calendarUrl }]
      : []),
    ...(delivery.event.mapUrl
      ? [{ kind: "map" as const, label: labels.map, url: delivery.event.mapUrl }]
      : []),
  ];
};

export function buildReminderMessage(delivery: ReminderDelivery): ReminderMessage {
  const labels = copy[delivery.language];
  return {
    heading: labels.heading(delivery.leadMinutes),
    body: [
      delivery.event.title,
      delivery.event.dateTime,
      delivery.event.location,
    ].filter(Boolean).join("\n"),
    actions: buildActions(delivery),
  };
}

export function isSafeReminderActionUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

export function validateReminderMessage(message: ReminderMessage) {
  return message.heading.trim().length > 0
    && message.body.trim().length > 0
    && message.actions.length >= 1
    && message.actions.every((action) =>
      action.label.trim().length > 0 && isSafeReminderActionUrl(action.url));
}
