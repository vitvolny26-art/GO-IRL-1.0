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

const twemojiVolleyballPath = "M32.809 7.779c-2.156-.087-5.324.186-8.21 1.966-.009.005-.019.004-.028.009-.02.011-.031.03-.05.042-2.148 1.348-4.131 3.539-5.411 7.054-2.395-.049-4.569-.286-6.488-.715C16.789 4.13 25.77 3.83 29.699 4.337c-.91-.78-1.894-1.473-2.948-2.061-5.071.24-12.398 2.611-16.065 13.335-1.797-.578-3.319-1.35-4.534-2.312.051-.075.098-.155.128-.246C9.604 2.972 18.478.735 21.108.286 20.097.11 19.062 0 18 0c-1.037 0-2.046.107-3.035.275C11.227 2.109 6.884 5.52 4.609 11.794 3.499 10.42 3.071 9.078 2.91 8.206c-.501.771-.943 1.583-1.323 2.43.425.984 1.077 2.074 2.096 3.137 3.168 3.307 8.495 5.01 15.807 5.088.641 2.235.969 4.287 1.064 6.152-11.714.419-17.645-4.414-20.49-8.277C.035 17.155 0 17.573 0 18c0 .589.033 1.171.088 1.746 3.422 3.627 9.303 7.297 19.114 7.297.445 0 .907-.016 1.368-.032-.07 1.93-.382 3.629-.817 5.094-9.528-.256-14.941-3.361-17.932-6.255.931 1.915 2.182 3.641 3.698 5.102 3.275 1.666 7.681 2.906 13.566 3.029-.316.757-.654 1.429-.99 2.014.8-.004 1.583-.076 2.356-.181 1.828-3.749 3.305-9.756.842-17.938l-.197-.613c.91-2.363 2.181-4.011 3.592-5.144 4.465 9.084 2.105 17.699-.101 22.62.94-.37 1.837-.82 2.692-1.336 2.027-5.501 3.435-13.744-.906-22.383 1.404-.729 2.848-1.075 4.144-1.213.008.014.008.031.017.045 4.295 6.693 2.406 15.067-.073 21.119 1.599-1.536 2.906-3.364 3.853-5.399 1.399-6.064.893-11.461-1.516-15.822.486.027.91.073 1.248.122-.369-.726-.777-1.428-1.237-2.093z";

const activityArtwork = (icon: string) => {
  if (icon.includes("🏐")) {
    // Twemoji volleyball (U+1F3D0), CC BY 4.0. See docs/THIRD_PARTY_NOTICES.md.
    return `<g>
      <g transform="translate(118 118) scale(4.0555556)">
        <circle fill="#E6E7E8" cx="18" cy="18" r="18"/>
        <path fill="#99AAB5" d="${twemojiVolleyballPath}"/>
      </g>
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

const buildShareCardSvg = (input: TelegramEventCardInput) => {
  const labels = copy[input.language] || copy.en;
  const canvasHeight = 900;
  const cardHeight = 832;
  const actionsY = 682;
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

  <rect x="76" y="${actionsY}" width="440" height="120" rx="42" fill="url(#secondaryAction)" stroke="#54751d" stroke-width="2"/>
  <text x="296" y="${actionsY + 72}" text-anchor="middle" fill="#c9ff3d" font-size="32" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(input.isSport ? labels.coach : labels.details)}</text>
  <rect x="564" y="${actionsY}" width="440" height="120" rx="42" fill="#bdff32"/>
  <text x="784" y="${actionsY + 72}" text-anchor="middle" fill="#090b0d" font-size="36" font-weight="900" font-family="DejaVu Sans, sans-serif">${xml(labels.open)}</text>
  </svg>`;
};

export const buildTelegramShareCardSvg = (input: TelegramEventCardInput) => buildShareCardSvg(input);

export const buildMetaInvitationCardSvg = (input: TelegramEventCardInput) => buildShareCardSvg(input);
