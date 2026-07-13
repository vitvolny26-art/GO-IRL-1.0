import type { TelegramEventCardInput } from "./telegram-event-card.js";

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

const iconPath = (kind: "calendar" | "ticket" | "pin" | "star" | "users", x: number, y: number) => {
  const common = `fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"`;
  if (kind === "calendar") return `<g transform="translate(${x} ${y})" ${common}><rect x="2" y="7" width="38" height="34" rx="6"/><path d="M11 2v10M31 2v10M2 18h38M11 27h1M21 27h1M31 27h1M11 35h1M21 35h1"/></g>`;
  if (kind === "ticket") return `<g transform="translate(${x} ${y})" ${common}><path d="M4 9h36v9a7 7 0 0 0 0 14v9H4v-9a7 7 0 0 0 0-14zM22 10v5M22 23v5M22 36v4"/></g>`;
  if (kind === "pin") return `<g transform="translate(${x} ${y})" ${common}><path d="M22 42S7 29 7 18a15 15 0 1 1 30 0c0 11-15 24-15 24z"/><circle cx="22" cy="18" r="5"/></g>`;
  if (kind === "users") return `<g transform="translate(${x} ${y})" ${common}><circle cx="16" cy="15" r="8"/><circle cx="34" cy="18" r="6"/><path d="M3 40c1-10 7-15 13-15s12 5 13 15M29 29c7 0 12 4 13 11"/></g>`;
  return `<g transform="translate(${x} ${y})" ${common}><path d="m22 3 6 12 13 2-10 10 3 14-12-7-12 7 3-14L3 17l13-2z"/></g>`;
};

const activityArtwork = (input: TelegramEventCardInput) => {
  const identity = `${input.icon} ${input.activity} ${input.title}`.toLocaleLowerCase();
  if (identity.includes("🏐") || identity.includes("волейбол") || identity.includes("volleyball") || identity.includes("volejbal")) {
    return `<g>
      <circle cx="191" cy="191" r="73" fill="#f4f5f7" stroke="#d7dbe0" stroke-width="4"/>
      <path d="M142 137c30 6 55 22 73 48M184 120c11 34 8 65-10 94M236 132c-8 30-27 52-57 66M131 191c31-5 59 2 85 23M212 251c-1-27-12-51-34-72" fill="none" stroke="#8d939d" stroke-width="7" stroke-linecap="round"/>
    </g>`;
  }
  if (identity.includes("🛼") || identity.includes("ролик") || identity.includes("inline skating")) {
    return `<g>
      <path d="M126 137h61c8 0 14 6 14 14v33c0 9 7 17 16 19l25 6c10 2 17 11 17 21v8H126z" fill="#bce9ff" stroke="#f4fbff" stroke-width="6" stroke-linejoin="round"/>
      <path d="M126 137v-31h57l4 31M127 218h130" fill="none" stroke="#ff7cab" stroke-width="10" stroke-linecap="round"/>
      <circle cx="151" cy="249" r="15" fill="#c9ff3d"/><circle cx="195" cy="249" r="15" fill="#c9ff3d"/><circle cx="238" cy="249" r="15" fill="#c9ff3d"/>
    </g>`;
  }
  const monogram = clean(input.activity || input.title, 1).toLocaleUpperCase() || "G";
  return `<circle cx="191" cy="191" r="73" fill="#263b18"/><text x="191" y="218" text-anchor="middle" fill="#dfff91" font-size="74" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(monogram)}</text>`;
};

const metric = (x: number, y: number, kind: "calendar" | "ticket" | "pin" | "star", value: string, lines = 1) => {
  const wrapped = wrap(value, lines === 1 ? 24 : 20, lines);
  return `<g>
    <rect x="${x}" y="${y}" width="440" height="116" rx="30" fill="#171a1d" stroke="#303439" stroke-width="2"/>
    ${iconPath(kind, x + 34, y + 35)}
    <text x="${x + 98}" y="${y + 58}" fill="#aeb3bd" font-size="31" font-weight="800" font-family="DejaVu Sans, sans-serif">${textLines(wrapped, x + 98, y + (wrapped.length > 1 ? 43 : 68), 38)}</text>
  </g>`;
};

export function buildTelegramShareCardSvg(input: TelegramEventCardInput) {
  const labels = copy[input.language] || copy.en;
  const headline = clean(input.activity || input.title, 80) || "GO IRL";
  const subtitle = clean(input.title, 120);
  const dateTime = [clean(input.date, 40), clean(input.time, 20)].filter(Boolean).join(" · ");
  const place = clean(input.address || input.city, 140);
  const status = [clean(input.level, 50), clean(input.format, 50)].filter(Boolean).join(" · ");
  const price = input.price > 0 ? `${Math.round(input.price)} Kč` : labels.free;
  const duration = `${Math.max(15, Math.round(input.durationMinutes || 90))} ${labels.minutes}`;
  const headlineLines = wrap(headline, 15, 2);
  const subtitleLines = subtitle.toLocaleLowerCase() === headline.toLocaleLowerCase() ? [] : wrap(subtitle, 24, 2);
  const environment = clean(input.environment, 60);
  const participants = `${Math.max(0, Math.trunc(input.participants))} / ${Math.max(0, Math.trunc(input.capacity))}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="900" viewBox="0 0 1080 900">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080b0d"/><stop offset="1" stop-color="#0f1511"/></linearGradient>
    <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#314416"/><stop offset="1" stop-color="#132019"/></linearGradient>
    <linearGradient id="secondaryAction" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#263414"/><stop offset="1" stop-color="#172111"/></linearGradient>
  </defs>
  <rect width="1080" height="900" fill="url(#page)"/>
  <rect x="34" y="34" width="1012" height="832" rx="58" fill="#101314" stroke="#314514" stroke-width="3"/>

  <rect x="76" y="76" width="230" height="230" rx="58" fill="url(#avatar)" stroke="#678d28" stroke-width="2"/>
  ${activityArtwork(input)}

  <text fill="#f5f7f8" font-size="58" font-weight="900" font-family="DejaVu Sans, sans-serif">${textLines(headlineLines, 344, 142, 60)}</text>
  <text fill="#969ca7" font-size="34" font-weight="500" font-family="DejaVu Sans, sans-serif">${textLines(subtitleLines, 344, 260, 42)}</text>

  <g>
    <rect x="914" y="60" width="90" height="90" rx="28" fill="#171a1d" stroke="#343a3f" stroke-width="2"/>
    <path d="M947 102l24-14M947 108l24 14" fill="none" stroke="#bdff32" stroke-width="6" stroke-linecap="round"/>
    <circle cx="941" cy="105" r="8" fill="#171a1d" stroke="#bdff32" stroke-width="5"/><circle cx="977" cy="84" r="8" fill="#171a1d" stroke="#bdff32" stroke-width="5"/><circle cx="977" cy="126" r="8" fill="#171a1d" stroke="#bdff32" stroke-width="5"/>
  </g>
  <g><rect x="810" y="166" width="194" height="72" rx="32" fill="#1a2415" stroke="#3d571a" stroke-width="2"/><text x="907" y="213" text-anchor="middle" fill="#e5ffa7" font-size="28" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(duration)}</text></g>
  <g><rect x="810" y="250" width="194" height="72" rx="32" fill="#1a2415" stroke="#3d571a" stroke-width="2"/>${iconPath("users", 827, 263)}<text x="925" y="297" text-anchor="middle" fill="#e5ffa7" font-size="28" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(participants)}</text></g>

  <line x1="76" y1="340" x2="1004" y2="340" stroke="#2b2e32" stroke-width="2"/>
  ${metric(76, 374, "calendar", dateTime)}
  ${metric(564, 374, "ticket", price)}
  ${metric(76, 510, "pin", place, 2)}
  ${metric(564, 510, "star", status || environment, 2)}

  <rect x="76" y="682" width="440" height="120" rx="42" fill="url(#secondaryAction)" stroke="#54751d" stroke-width="2"/>
  <text x="296" y="754" text-anchor="middle" fill="#c9ff3d" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(input.isSport ? labels.coach : labels.details)}</text>
  <rect x="564" y="682" width="440" height="120" rx="42" fill="#bdff32"/>
  <text x="784" y="754" text-anchor="middle" fill="#090b0d" font-size="36" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(labels.open)}</text>
  </svg>`;
}
