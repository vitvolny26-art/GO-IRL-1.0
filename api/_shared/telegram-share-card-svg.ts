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
const cleanEventText = (value: string, max = 160) => clean(
  value.replace(/^(?:\s|\u200d|\ufe0f|\p{Extended_Pictographic})+/u, ""),
  max,
);

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

const buildShareCardSvg = (input: TelegramEventCardInput) => {
  const labels = copy[input.language] || copy.en;
  const canvasHeight = 900;
  const cardHeight = 832;
  const actionsY = 682;
  const headline = cleanEventText(input.activity || input.title, 80) || "GO IRL";
  const subtitle = cleanEventText(input.title, 120);
  const dateTime = [clean(input.date, 40), clean(input.time, 20)].filter(Boolean).join(" · ");
  const place = clean(input.address || input.city, 140);
  const status = [clean(input.level, 50), clean(input.format, 50)].filter(Boolean).join(" · ");
  const price = input.price > 0 ? `${Math.round(input.price)} Kč` : labels.free;
  const duration = `${Math.max(15, Math.round(input.durationMinutes || 90))} ${labels.minutes}`;
  const headlineLines = wrap(headline, 15, 2);
  const subtitleLines = subtitle.toLocaleLowerCase() === headline.toLocaleLowerCase() ? [] : wrap(subtitle, 24, 2);
  const environment = clean(input.environment, 60);
  const eventArtwork = buildEventArtworkSvg(input);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${canvasHeight}" viewBox="0 0 1080 ${canvasHeight}">
  <defs>
    <linearGradient id="page" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#080b0d"/><stop offset="1" stop-color="#0f1511"/></linearGradient>
    <linearGradient id="avatar" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#26351c"/><stop offset="0.48" stop-color="#111817"/><stop offset="1" stop-color="#070a0c"/></linearGradient>
    <linearGradient id="avatarEdge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#d9ff70"/><stop offset="0.45" stop-color="#7ea62b"/><stop offset="1" stop-color="#324016"/></linearGradient>
    <radialGradient id="avatarHalo" cx="0.34" cy="0.22" r="0.9"><stop stop-color="#dfff8c" stop-opacity="0.22"/><stop offset="0.42" stop-color="#8fcf29" stop-opacity="0.08"/><stop offset="1" stop-color="#0a0d0e" stop-opacity="0"/></radialGradient>
    <linearGradient id="secondaryAction" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#263414"/><stop offset="1" stop-color="#172111"/></linearGradient>
    <clipPath id="eventIconHighlight"><rect x="105" y="103" width="172" height="88" rx="40"/></clipPath>
    <filter id="badgeShadow" x="-30%" y="-30%" width="160%" height="170%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="10" result="blur"/>
      <feOffset dy="9" result="offset"/>
      <feFlood flood-color="#000000" flood-opacity="0.72" result="shadowColor"/>
      <feComposite in="shadowColor" in2="offset" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="eventIconShadow" x="-50%" y="-50%" width="200%" height="220%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4" result="blur"/>
      <feOffset dy="6" result="offset"/>
      <feFlood flood-color="#000000" flood-opacity="0.8" result="shadowColor"/>
      <feComposite in="shadowColor" in2="offset" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="eventIconHighlightColor" color-interpolation-filters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 1 0"/>
    </filter>
  </defs>
  <rect width="1080" height="${canvasHeight}" fill="url(#page)"/>
  <rect x="34" y="34" width="1012" height="${cardHeight}" rx="58" fill="#101314" stroke="#314514" stroke-width="3"/>

  <g filter="url(#badgeShadow)">
    <rect x="76" y="76" width="230" height="230" rx="58" fill="#070a0c" stroke="url(#avatarEdge)" stroke-width="5"/>
    <rect x="84" y="84" width="214" height="214" rx="50" fill="url(#avatar)" stroke="#23301a" stroke-width="2"/>
    <rect x="90" y="90" width="202" height="202" rx="45" fill="url(#avatarHalo)"/>
    <path d="M104 105c34-20 86-24 132-7" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0.12"/>
  </g>
  <g transform="translate(191 191) scale(1.16) translate(-191 -191)" filter="url(#eventIconShadow)">${eventArtwork}</g>
  <g transform="translate(191 191) scale(1.16) translate(-191 -191)" clip-path="url(#eventIconHighlight)" filter="url(#eventIconHighlightColor)" opacity="0.72">${eventArtwork}</g>

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

  <rect x="76" y="${actionsY}" width="440" height="120" rx="42" fill="url(#secondaryAction)" stroke="#54751d" stroke-width="2"/>
  <text x="296" y="${actionsY + 72}" text-anchor="middle" fill="#c9ff3d" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(input.isSport ? labels.coach : labels.details)}</text>
  <rect x="564" y="${actionsY}" width="440" height="120" rx="42" fill="#bdff32"/>
  <text x="784" y="${actionsY + 72}" text-anchor="middle" fill="#090b0d" font-size="36" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(labels.open)}</text>
  </svg>`;
};

export const buildTelegramShareCardSvg = (input: TelegramEventCardInput) => buildShareCardSvg(input);

export const buildMetaInvitationCardSvg = (input: TelegramEventCardInput) => buildShareCardSvg(input);
