import type { TelegramEventCardInput } from "./telegram-event-card.js";

const copy = {
  ru: { free: "Бесплатно", minutes: "мин", coach: "Нужен тренер", details: "Подробнее", open: "Открыть", forecast: "Погода появится ближе к событию" },
  uk: { free: "Безкоштовно", minutes: "хв", coach: "Потрібен тренер", details: "Докладніше", open: "Відкрити", forecast: "Погода з'явиться ближче до події" },
  cs: { free: "Zdarma", minutes: "min", coach: "Potřebujeme trenéra", details: "Podrobnosti", open: "Otevřít", forecast: "Počasí se zobrazí blíže k události" },
  en: { free: "Free", minutes: "min", coach: "Coach needed", details: "Details", open: "Open", forecast: "Weather appears closer to the event" },
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

const activityArtwork = (icon: string) => {
  if (icon.includes("🏐")) {
    return `<g>
      <circle cx="191" cy="191" r="73" fill="url(#volleyball)"/>
      <path d="M142 137c30 6 55 22 73 48M184 120c11 34 8 65-10 94M236 132c-8 30-27 52-57 66M131 191c31-5 59 2 85 23M212 251c-1-27-12-51-34-72" fill="none" stroke="#ffffff" stroke-opacity=".9" stroke-width="7" stroke-linecap="round"/>
    </g>`;
  }
  if (icon.includes("🛼")) {
    return `<g>
      <path d="M126 137h61c8 0 14 6 14 14v33c0 9 7 17 16 19l25 6c10 2 17 11 17 21v8H126z" fill="#bce9ff" stroke="#f4fbff" stroke-width="6" stroke-linejoin="round"/>
      <path d="M126 137v-31h57l4 31M127 218h130" fill="none" stroke="#ff7cab" stroke-width="10" stroke-linecap="round"/>
      <circle cx="151" cy="249" r="15" fill="#c9ff3d"/><circle cx="195" cy="249" r="15" fill="#c9ff3d"/><circle cx="238" cy="249" r="15" fill="#c9ff3d"/>
    </g>`;
  }
  return `<g fill="none" stroke="#c9ff3d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="191" cy="191" r="60"/>
      <path d="M191 151v80M151 191h80"/>
    </g>`;
};

type MetricIcon = "calendar" | "ticket" | "pin" | "status";

const metricIcon = (kind: MetricIcon, x: number, y: number) => {
  const left = x + 38;
  const top = y + 34;

  if (kind === "calendar") {
    return `<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="${left}" y="${top}" width="42" height="40" rx="7"/>
      <path d="M${left} ${top + 13}h42M${left + 11} ${top - 5}v12M${left + 31} ${top - 5}v12"/>
    </g>`;
  }

  if (kind === "ticket") {
    return `<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${left} ${top + 5}h43v11a10 10 0 0 0 0 20v11h-43v-11a10 10 0 0 0 0-20z"/>
      <path d="M${left + 22} ${top + 7}v38" stroke-dasharray="4 8"/>
    </g>`;
  }

  if (kind === "pin") {
    return `<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M${left + 21} ${top + 47}s19-19 19-31a19 19 0 1 0-38 0c0 12 19 31 19 31z"/>
      <circle cx="${left + 21}" cy="${top + 16}" r="6"/>
    </g>`;
  }

  return `<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="${left + 21}" cy="${top + 20}" r="18"/>
    <path d="M${left + 21} ${top + 8}v13l9 7"/>
  </g>`;
};

const metric = (x: number, y: number, icon: MetricIcon, value: string, lines = 1) => {
  const wrapped = wrap(value, lines === 1 ? 24 : 20, lines);
  return `<g>
    <rect x="${x}" y="${y}" width="440" height="116" rx="30" fill="#171a1d" stroke="#303439" stroke-width="2"/>
    ${metricIcon(icon, x, y)}
    <text x="${x + 98}" y="${y + 58}" fill="#aeb3bd" font-size="31" font-weight="800" font-family="DejaVu Sans, sans-serif">${textLines(wrapped, x + 98, y + (wrapped.length > 1 ? 43 : 68), 38)}</text>
  </g>`;
};

const weatherStrip = (input: TelegramEventCardInput, forecast: string) => {
  const weather = input.weather;
  if (!weather) {
    return `<g>
      <rect x="76" y="666" width="928" height="116" rx="42" fill="#151d17" stroke="#3d571a" stroke-width="2"/>
      <circle cx="136" cy="724" r="19" fill="none" stroke="#c9ff3d" stroke-width="5"/>
      <path d="M136 689v13M136 746v13M101 724h13M158 724h13M111 699l9 9M152 740l9 9M111 749l9-9M152 708l9-9" stroke="#c9ff3d" stroke-width="5" stroke-linecap="round"/>
      <text x="188" y="736" fill="#aeb3bd" font-size="29" font-weight="700" font-family="DejaVu Sans, sans-serif">${xml(forecast)}</text>
    </g>`;
  }

  return `<g>
    <rect x="76" y="666" width="928" height="116" rx="42" fill="#151d17" stroke="#3d571a" stroke-width="2"/>
    <g fill="none" stroke="#c9ff3d" stroke-width="5" stroke-linecap="round">
      <circle cx="136" cy="724" r="19"/><path d="M136 689v13M136 746v13M101 724h13M158 724h13"/>
    </g>
    <text x="178" y="736" fill="#e7ebef" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${Math.round(weather.temperature)}°C</text>
    <line x1="374" y1="692" x2="374" y2="756" stroke="#343a3f" stroke-width="2"/>
    <path d="M438 704c20 0 36 14 38 34h-76c2-20 18-34 38-34zM438 738v18" fill="none" stroke="#8ad6ff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="494" y="736" fill="#e7ebef" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${Math.round(weather.rain)}%</text>
    <line x1="680" y1="692" x2="680" y2="756" stroke="#343a3f" stroke-width="2"/>
    <path d="M740 707h46c13 0 13-18 0-18M740 725h65c13 0 13 18 0 18M740 743h34" fill="none" stroke="#bce9ff" stroke-width="6" stroke-linecap="round"/>
    <text x="828" y="736" fill="#e7ebef" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${Math.round(weather.wind)} km/h</text>
  </g>`;
};

const buildShareCardSvg = (input: TelegramEventCardInput, variant: "telegram" | "meta") => {
  const labels = copy[input.language] || copy.en;
  const isMeta = variant === "meta";
  const canvasHeight = isMeta ? 1080 : 900;
  const cardHeight = isMeta ? 1012 : 832;
  const actionsY = isMeta ? 824 : 682;
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${canvasHeight}" viewBox="0 0 1080 ${canvasHeight}">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080b0d"/><stop offset="1" stop-color="#0f1511"/></linearGradient>
    <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#314416"/><stop offset="1" stop-color="#132019"/></linearGradient>
    <radialGradient id="volleyball" cx="35%" cy="25%" r="75%"><stop stop-color="#f1eaff"/><stop offset=".55" stop-color="#cdbce9"/><stop offset="1" stop-color="#9e85ca"/></radialGradient>
    <linearGradient id="secondaryAction" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#263414"/><stop offset="1" stop-color="#172111"/></linearGradient>
  </defs>
  <rect width="1080" height="${canvasHeight}" fill="url(#page)"/>
  <rect x="34" y="34" width="1012" height="${cardHeight}" rx="58" fill="#101314" stroke="#314514" stroke-width="3"/>

  <rect x="76" y="76" width="230" height="230" rx="58" fill="url(#avatar)" stroke="#678d28" stroke-width="2"/>
  ${activityArtwork(input.icon)}

  <text fill="#f5f7f8" font-size="58" font-weight="900" font-family="DejaVu Sans, sans-serif">${textLines(headlineLines, 344, 142, 60)}</text>
  <text fill="#969ca7" font-size="34" font-weight="500" font-family="DejaVu Sans, sans-serif">${textLines(subtitleLines, 344, 260, 42)}</text>

  <g>
    <rect x="914" y="60" width="90" height="90" rx="28" fill="#171a1d" stroke="#343a3f" stroke-width="2"/>
    <path d="M947 102l24-14M947 108l24 14" fill="none" stroke="#bdff32" stroke-width="6" stroke-linecap="round"/>
    <circle cx="941" cy="105" r="8" fill="#171a1d" stroke="#bdff32" stroke-width="5"/><circle cx="977" cy="84" r="8" fill="#171a1d" stroke="#bdff32" stroke-width="5"/><circle cx="977" cy="126" r="8" fill="#171a1d" stroke="#bdff32" stroke-width="5"/>
  </g>
  <g><rect x="810" y="166" width="194" height="72" rx="32" fill="#1a2415" stroke="#3d571a" stroke-width="2"/><text x="907" y="213" text-anchor="middle" fill="#e5ffa7" font-size="28" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(duration)}</text></g>
  <g>
    <rect x="810" y="250" width="194" height="72" rx="32" fill="#1a2415" stroke="#3d571a" stroke-width="2"/>
    <g fill="none" stroke="#e5ffa7" stroke-width="4" stroke-linecap="round">
      <circle cx="848" cy="278" r="9"/><path d="M832 303c2-12 9-18 16-18s14 6 16 18"/>
    </g>
    <text x="922" y="297" text-anchor="middle" fill="#e5ffa7" font-size="28" font-weight="900" font-family="DejaVu Sans, sans-serif">${Math.max(0, Math.trunc(input.participants))} / ${Math.max(0, Math.trunc(input.capacity))}</text>
  </g>

  <line x1="76" y1="340" x2="1004" y2="340" stroke="#2b2e32" stroke-width="2"/>
  ${metric(76, 374, "calendar", dateTime)}
  ${metric(564, 374, "ticket", price)}
  ${metric(76, 510, "pin", place, 2)}
  ${metric(564, 510, "status", status || environment, 2)}

  ${isMeta ? weatherStrip(input, labels.forecast) : ""}
  <rect x="76" y="${actionsY}" width="440" height="120" rx="42" fill="url(#secondaryAction)" stroke="#54751d" stroke-width="2"/>
  <text x="296" y="${actionsY + 72}" text-anchor="middle" fill="#c9ff3d" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(input.isSport ? labels.coach : labels.details)}</text>
  <rect x="564" y="${actionsY}" width="440" height="120" rx="42" fill="#bdff32"/>
  <text x="784" y="${actionsY + 72}" text-anchor="middle" fill="#090b0d" font-size="36" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(labels.open)}</text>
  </svg>`;
};

export const buildTelegramShareCardSvg = (input: TelegramEventCardInput) => buildShareCardSvg(input, "telegram");

export const buildMetaInvitationCardSvg = (input: TelegramEventCardInput) => buildShareCardSvg(input, "meta");
