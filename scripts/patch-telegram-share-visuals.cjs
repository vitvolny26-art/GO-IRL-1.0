const fs = require("node:fs");

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function write(path, value) {
  fs.writeFileSync(path, value);
}

function replaceRequired(text, from, to, label) {
  if (!text.includes(from)) {
    throw new Error(`Не найден блок: ${label}`);
  }
  return text.replace(from, to);
}

// 1. Telegram caption: remove all emoji duplication.
{
  const path = "api/_shared/telegram-event-card.ts";
  let text = read(path);

  text = replaceRequired(
    text,
    `  const icon = clean(input.icon, 12);\n`,
    "",
    "telegram caption icon variable",
  );

  text = replaceRequired(
    text,
    `    \`<b>\${escapeHtml([icon, activity || title].filter(Boolean).join(" "))}</b>\${subtitle}\`,\n    dateTime ? \`📅 <b>\${labels.date}:</b> \${escapeHtml(dateTime)}\` : "",\n    address ? \`📍 <b>\${labels.place}:</b> \${escapeHtml(address)}\` : "",\n    capacity ? \`👥 <b>\${labels.people}:</b> \${participants} / \${capacity}\` : "",`,
    `    \`<b>\${escapeHtml(activity || title)}</b>\${subtitle}\`,\n    dateTime ? \`<b>\${labels.date}:</b> \${escapeHtml(dateTime)}\` : "",\n    address ? \`<b>\${labels.place}:</b> \${escapeHtml(address)}\` : "",\n    capacity ? \`<b>\${labels.people}:</b> \${participants} / \${capacity}\` : "",`,
    "telegram caption lines",
  );

  text = replaceRequired(
    text,
    `    title: [icon, activity || title].filter(Boolean).join(" ").slice(0, 256),`,
    `    title: (activity || title).slice(0, 256),`,
    "telegram native title",
  );

  write(path, text);
}

// 2. JPEG/SVG: replace unsupported Unicode glyphs with vector paths.
{
  const path = "api/_shared/telegram-share-card-svg.ts";
  let text = read(path);

  text = replaceRequired(
    text,
    `  return \`<text x="191" y="225" text-anchor="middle" fill="#dfff91" font-size="112" font-family="DejaVu Sans, sans-serif">\${xml(clean(icon, 12))}</text>\`;`,
    `  return \`<g fill="none" stroke="#c9ff3d" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="191" cy="191" r="60"/>
      <path d="M191 151v80M151 191h80"/>
    </g>\`;`,
    "fallback activity artwork",
  );

  const oldMetric = `const metric = (x: number, y: number, icon: string, value: string, lines = 1) => {
  const wrapped = wrap(value, lines === 1 ? 24 : 20, lines);
  return \`<g>
    <rect x="\${x}" y="\${y}" width="440" height="116" rx="30" fill="#171a1d" stroke="#303439" stroke-width="2"/>
    <text x="\${x + 38}" y="\${y + 70}" fill="#c9ff3d" font-size="38" font-family="DejaVu Sans, sans-serif">\${xml(icon)}</text>
    <text x="\${x + 98}" y="\${y + 58}" fill="#aeb3bd" font-size="31" font-weight="800" font-family="DejaVu Sans, sans-serif">\${textLines(wrapped, x + 98, y + (wrapped.length > 1 ? 43 : 68), 38)}</text>
  </g>\`;
};`;

  const newMetric = `type MetricIcon = "calendar" | "ticket" | "pin" | "status";

const metricIcon = (kind: MetricIcon, x: number, y: number) => {
  const left = x + 38;
  const top = y + 34;

  if (kind === "calendar") {
    return \`<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <rect x="\${left}" y="\${top}" width="42" height="40" rx="7"/>
      <path d="M\${left} \${top + 13}h42M\${left + 11} \${top - 5}v12M\${left + 31} \${top - 5}v12"/>
    </g>\`;
  }

  if (kind === "ticket") {
    return \`<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M\${left} \${top + 5}h43v11a10 10 0 0 0 0 20v11h-43v-11a10 10 0 0 0 0-20z"/>
      <path d="M\${left + 22} \${top + 7}v38" stroke-dasharray="4 8"/>
    </g>\`;
  }

  if (kind === "pin") {
    return \`<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
      <path d="M\${left + 21} \${top + 47}s19-19 19-31a19 19 0 1 0-38 0c0 12 19 31 19 31z"/>
      <circle cx="\${left + 21}" cy="\${top + 16}" r="6"/>
    </g>\`;
  }

  return \`<g fill="none" stroke="#c9ff3d" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="\${left + 21}" cy="\${top + 20}" r="18"/>
    <path d="M\${left + 21} \${top + 8}v13l9 7"/>
  </g>\`;
};

const metric = (x: number, y: number, icon: MetricIcon, value: string, lines = 1) => {
  const wrapped = wrap(value, lines === 1 ? 24 : 20, lines);
  return \`<g>
    <rect x="\${x}" y="\${y}" width="440" height="116" rx="30" fill="#171a1d" stroke="#303439" stroke-width="2"/>
    \${metricIcon(icon, x, y)}
    <text x="\${x + 98}" y="\${y + 58}" fill="#aeb3bd" font-size="31" font-weight="800" font-family="DejaVu Sans, sans-serif">\${textLines(wrapped, x + 98, y + (wrapped.length > 1 ? 43 : 68), 38)}</text>
  </g>\`;
};`;

  text = replaceRequired(text, oldMetric, newMetric, "metric renderer");

  text = replaceRequired(
    text,
    `<g><rect x="810" y="250" width="194" height="72" rx="32" fill="#1a2415" stroke="#3d571a" stroke-width="2"/><text x="907" y="297" text-anchor="middle" fill="#e5ffa7" font-size="28" font-weight="900" font-family="DejaVu Sans, sans-serif">👥 \${Math.max(0, Math.trunc(input.participants))} / \${Math.max(0, Math.trunc(input.capacity))}</text></g>`,
    `<g>
    <rect x="810" y="250" width="194" height="72" rx="32" fill="#1a2415" stroke="#3d571a" stroke-width="2"/>
    <g fill="none" stroke="#e5ffa7" stroke-width="4" stroke-linecap="round">
      <circle cx="848" cy="278" r="9"/><path d="M832 303c2-12 9-18 16-18s14 6 16 18"/>
    </g>
    <text x="922" y="297" text-anchor="middle" fill="#e5ffa7" font-size="28" font-weight="900" font-family="DejaVu Sans, sans-serif">\${Math.max(0, Math.trunc(input.participants))} / \${Math.max(0, Math.trunc(input.capacity))}</text>
  </g>`,
    "participants chip",
  );

  text = replaceRequired(
    text,
    `  \${metric(76, 374, "📅", dateTime)}
  \${metric(564, 374, "🎟", price)}
  \${metric(76, 510, "📍", place, 2)}
  \${metric(564, 510, "☆", status || environment, 2)}`,
    `  \${metric(76, 374, "calendar", dateTime)}
  \${metric(564, 374, "ticket", price)}
  \${metric(76, 510, "pin", place, 2)}
  \${metric(564, 510, "status", status || environment, 2)}`,
    "metric calls",
  );

  write(path, text);
}

// 3. Localize common stored sport enum values.
{
  const path = "api/_shared/telegram-share-event.ts";
  let text = read(path);

  const marker = `const text = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
const number = (value: unknown, fallback: number) => Number.isFinite(value) ? Number(value) : fallback;`;

  const replacement = `const text = (value: unknown, fallback: string) => typeof value === "string" && value.trim() ? value.trim() : fallback;
const number = (value: unknown, fallback: number) => Number.isFinite(value) ? Number(value) : fallback;

const sportValueCopy = {
  ru: {
    beginner: "Начальный",
    intermediate: "Любитель",
    advanced: "Продвинутый",
    casual: "Любительский",
    competitive: "Соревновательный",
    indoor: "В помещении",
    outdoor: "На улице",
  },
  uk: {
    beginner: "Початковий",
    intermediate: "Аматор",
    advanced: "Просунутий",
    casual: "Аматорський",
    competitive: "Змагальний",
    indoor: "У приміщенні",
    outdoor: "Надворі",
  },
  cs: {
    beginner: "Začátečník",
    intermediate: "Pokročilý",
    advanced: "Expert",
    casual: "Rekreační",
    competitive: "Soutěžní",
    indoor: "Uvnitř",
    outdoor: "Venku",
  },
  en: {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    casual: "Casual",
    competitive: "Competitive",
    indoor: "Indoor",
    outdoor: "Outdoor",
  },
} as const;

const localizedSportValue = (
  value: unknown,
  language: ShareLanguage,
  fallback: string,
) => {
  const raw = text(value, fallback);
  const key = raw.toLocaleLowerCase() as keyof typeof sportValueCopy.en;
  return sportValueCopy[language][key] || raw;
};`;

  text = replaceRequired(text, marker, replacement, "sport localization helpers");

  text = replaceRequired(
    text,
    `    level: text(sport?.level, generic.level),
    format: text(sport?.format, generic.format),
    environment: text(sport?.environment, generic.environment),`,
    `    level: localizedSportValue(sport?.level, language, generic.level),
    format: localizedSportValue(sport?.format, language, generic.format),
    environment: localizedSportValue(sport?.environment, language, generic.environment),`,
    "sport metadata output",
  );

  write(path, text);
}

console.log("Telegram share visuals patched.");
