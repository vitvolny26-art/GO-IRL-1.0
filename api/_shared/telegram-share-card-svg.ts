import type { TelegramEventCardInput } from "./telegram-event-card.js";
import { buildEventArtworkSvg } from "./event-artwork.js";

const copy = {
  ru: { free: "Бесплатно", minutes: "мин", coach: "Нужен тренер", details: "Подробнее", open: "Открыть" },
  uk: { free: "Безкоштовно", minutes: "хв", coach: "Потрібен тренер", details: "Докладніше", open: "Відкрити" },
  cs: { free: "Zdarma", minutes: "min", coach: "Potřebujeme trenéra", details: "Podrobnosti", open: "Otevřít" },
  en: { free: "Free", minutes: "min", coach: "Coach needed", details: "Details", open: "Open" },
} as const;

const xml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const clean = (value: string, max = 160) => value.trim().replace(/\s+/g, " ").slice(0, max);

const wrap = (value: string, maxChars: number, maxLines = 2) => {
  const words = clean(value).split(" ").filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1) || "";
    if (!current || `${current} ${word}`.length <= maxChars) {
      if (current) lines[lines.length - 1] = `${current} ${word}`;
      else lines.push(word);
    } else if (lines.length < maxLines) {
      lines.push(word);
    } else {
      lines[lines.length - 1] = `${lines.at(-1) || ""}…`.slice(0, maxChars);
      break;
    }
  }
  return lines.slice(0, maxLines);
};

const textLines = (lines: string[], x: number, y: number, lineHeight: number) =>
  lines.map((line, index) => `<tspan x="${x}" y="${y + index * lineHeight}">${xml(line)}</tspan>`).join("");

type MetricIcon = "calendar" | "ticket" | "pin" | "status";

const metricIcon = (kind: MetricIcon,