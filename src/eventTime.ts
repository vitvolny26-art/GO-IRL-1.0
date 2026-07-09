const parseEventTimeParts = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  const match = raw.match(/(?:T|^|\s)(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d{1,6})?)?(?:Z|[+-]\d{2}:?\d{2})?(?:\s|$)/);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

  return { hours, minutes };
};

export const formatEventTime = (value?: string | null) => {
  const time = parseEventTimeParts(value);
  if (!time) return "";

  return String(time.hours).padStart(2, "0") + ":" + String(time.minutes).padStart(2, "0");
};

export const hasEventTime = (value?: string | null) => Boolean(formatEventTime(value));

export const formatEventDateTime = (dateLabel: string, time?: string | null) => {
  const formattedTime = formatEventTime(time);
  return formattedTime ? `${dateLabel} · ${formattedTime}` : dateLabel;
};
