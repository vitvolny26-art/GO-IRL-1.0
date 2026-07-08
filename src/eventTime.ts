export const formatEventTime = (value?: string | null) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const match = raw.match(/(?:T|^|\s)(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!match) return "";

  const hours = Number(match[1]);
  const minutes = Number(match[2]);

  if (!Number.isInteger(hours) || !Number.isInteger(minutes)) return "";
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return "";

  return String(hours).padStart(2, "0") + ":" + String(minutes).padStart(2, "0");
};
