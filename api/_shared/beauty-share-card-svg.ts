import type { TelegramEventCardInput } from "./telegram-event-card.js";

const copy = {
  ru: { cta: "Услуги и запись", priceFrom: "от" },
  uk: { cta: "Послуги та запис", priceFrom: "від" },
  cs: { cta: "Služby a rezervace", priceFrom: "od" },
  en: { cta: "Services and booking", priceFrom: "from" },
} as const;

const xml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const clean = (value: string, max = 140) => value.trim().replace(/\s+/g, " ").slice(0, max);

const wrap = (value: string, maxChars = 46, maxLines = 2) => {
  const words = clean(value, 180).split(" ").filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.length ? lines[lines.length - 1] : "";
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      if (current) lines[lines.length - 1] = candidate;
      else lines.push(candidate);
    } else if (lines.length < maxLines) {
      lines.push(word.slice(0, maxChars));
    } else {
      const last = lines.length ? lines[lines.length - 1] : "";
      lines[lines.length - 1] = `${last.slice(0, Math.max(0, maxChars - 1))}…`;
      break;
    }
  }
  return lines.slice(0, maxLines);
};

const descriptionTspans = (
  value: string,
  options: { x: number; startY: number; step: number; maxLines: number; maxChars: number },
) => wrap(value, options.maxChars, options.maxLines).map((line, index) =>
  `<tspan data-beauty-description-line="${index + 1}" x="${options.x}" y="${options.startY + index * options.step}">${xml(line)}</tspan>`).join("");

const placeholderIcon = `<g data-beauty-photo-placeholder="true">
  <rect x="74" y="70" width="126" height="126" rx="30" fill="#24182b" fill-opacity=".82" stroke="#e2bd66" stroke-opacity=".8" stroke-width="3"/>
  <circle cx="166" cy="103" r="11" fill="#e2bd66"/>
  <path d="M96 164l29-31 22 21 14-15 23 25H96z" fill="none" stroke="#e2bd66" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;

type BeautyShareCardVariant = "default" | "telegram";

const buildTelegramTitleTspans = (value: string, baseSize: number) => value
  .split(" ")
  .filter(Boolean)
  .map((word, index) => {
    const initial = word.slice(0, 1);
    const rest = word.slice(1);
    const spacer = index ? `<tspan font-size="${baseSize * 0.44}"> </tspan>` : "";
    return `${spacer}<tspan font-size="${baseSize + 14}">${xml(initial)}</tspan><tspan font-size="${baseSize}">${xml(rest)}</tspan>`;
  })
  .join("");

const buildBeautyShareCardSvgVariant = (input: TelegramEventCardInput, variant: BeautyShareCardVariant) => {
  const isTelegram = variant === "telegram";
  const labels = copy[input.language] || copy.en;
  const name = clean(input.activity || input.organizer || "GO IRL Beauty", 48);
  const description = clean(input.description || input.level || input.title, 180);
  const nameFontSize = isTelegram
    ? name.length > 34 ? 44 : name.length > 24 ? 52 : 64
    : name.length > 34 ? 44 : name.length > 24 ? 50 : 60;
  const services = (input.beautyServices?.length
    ? input.beautyServices
    : [{ name: input.title, priceCzk: input.price }])
    .filter((service) => clean(service.name))
    .slice(0, 3);
  const serviceStartY = isTelegram ? 380 : 430;
  const serviceGap = isTelegram ? 90 : 100;
  const serviceHeight = isTelegram ? 72 : 78;
  const serviceRows = services.map((service, index) => {
    const y = serviceStartY + index * serviceGap;
    const serviceName = clean(service.name, 44);
    const serviceFontSize = serviceName.length > 34 ? 25 : serviceName.length > 25 ? 28 : 31;
    return `<g data-beauty-service-row="${index + 1}">
      <rect x="74" y="${y}" width="932" height="${serviceHeight}" rx="22" fill="#24182b" fill-opacity=".82" stroke="#e2bd66" stroke-opacity=".46" stroke-width="2"/>
      <text x="104" y="${y + (isTelegram ? 46 : 50)}" fill="#fff7fb" font-size="${serviceFontSize}" font-weight="750">${xml(serviceName)}</text>
      <text x="976" y="${y + (isTelegram ? 46 : 50)}" text-anchor="end" fill="#f1cb72" font-size="29" font-weight="850">${xml(`${labels.priceFrom} ${Math.round(service.priceCzk)} Kč`)}</text>
    </g>`;
  }).join("");
  const location = clean(input.address || input.city, 80);
  const height = isTelegram ? 900 : 1020;
  const descriptionOptions = isTelegram
    ? { x: 232, startY: 204, step: 34, maxLines: 3, maxChars: 44 }
    : { x: 232, startY: 184, step: 42, maxLines: 2, maxChars: 46 };
  const locationY = isTelegram ? 730 : 782;
  const frame = isTelegram
    ? `<g data-beauty-telegram-frame="true" fill="none" stroke="url(#beautyGold)" stroke-linecap="round" stroke-linejoin="round">
      <rect data-beauty-telegram-frame-outer="true" x="18" y="18" width="1044" height="864" stroke-width="1.6" stroke-opacity=".92"/>
      <rect data-beauty-telegram-frame-inner="true" x="28" y="28" width="1024" height="844" stroke-width=".8" stroke-opacity=".5"/>
      <path data-beauty-telegram-frame-corner="true" d="M18 72h10c16 0 28-12 28-28V34h22V18" stroke-width="2.2"/>
      <path d="M18 72h10c16 0 28-12 28-28V34h22V18" transform="translate(1080 0) scale(-1 1)" stroke-width="2.2"/>
      <path d="M18 72h10c16 0 28-12 28-28V34h22V18" transform="translate(0 900) scale(1 -1)" stroke-width="2.2"/>
      <path d="M18 72h10c16 0 28-12 28-28V34h22V18" transform="translate(1080 900) scale(-1 -1)" stroke-width="2.2"/>
      <path d="M28 78h8c12 0 22-10 22-22v-8h20" stroke-width="1" stroke-opacity=".66"/>
      <path d="M28 78h8c12 0 22-10 22-22v-8h20" transform="translate(1080 0) scale(-1 1)" stroke-width="1" stroke-opacity=".66"/>
      <path d="M28 78h8c12 0 22-10 22-22v-8h20" transform="translate(0 900) scale(1 -1)" stroke-width="1" stroke-opacity=".66"/>
      <path d="M28 78h8c12 0 22-10 22-22v-8h20" transform="translate(1080 900) scale(-1 -1)" stroke-width="1" stroke-opacity=".66"/>
    </g>`
    : `<rect x="28" y="28" width="1024" height="${height - 56}" rx="44" fill="none" stroke="#e0bc65" stroke-opacity=".92" stroke-width="3"/>`;
  const title = isTelegram
    ? `<g data-beauty-telegram-wordmark="true">
      <text data-beauty-telegram-title="true" x="232" y="130" fill="url(#beautyGold)" stroke="#5b3512" stroke-width=".6" paint-order="stroke fill" filter="url(#beautyGoldGlow)" font-family="DejaVu Serif Condensed, DejaVu Serif, Georgia, serif" font-size="${nameFontSize}" font-style="italic" font-weight="400" letter-spacing="-1.8">${buildTelegramTitleTspans(name, nameFontSize)}</text>
      <path data-beauty-title-swash="true" d="M220 132c18-39 48-58 76-48-24 2-39 16-39 34 0 18 15 29 37 29" fill="none" stroke="url(#beautyGold)" stroke-width="1.5" stroke-linecap="round" stroke-opacity=".72"/>
    </g>
    <g data-beauty-title-flourish="true" data-beauty-title-ornament="true" fill="none" stroke="url(#beautyGold)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M232 164h238M610 164h232" stroke-width="1.2" stroke-opacity=".78"/>
      <path d="M470 164c18 0 24-18 39-18 10 0 17 7 17 16 0 8-6 14-14 14-7 0-12-4-12-9 0-4 3-7 7-7M610 164c-18 0-24-18-39-18-10 0-17 7-17 16 0 8 6 14 14 14 7 0 12-4 12-9 0-4-3-7-7-7" stroke-width="1.7"/>
      <path d="M540 159c-7-9-7-18 0-27 7 9 7 18 0 27zm0 10c-7 9-7 18 0 27 7-9 7-18 0-27z" fill="url(#beautyGold)" stroke="none"/>
      <circle cx="540" cy="164" r="3.2" fill="url(#beautyGold)" stroke="none"/>
    </g>`
    : `<text x="232" y="124" fill="#fff9fb" font-size="${nameFontSize}" font-weight="900">${xml(name)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
  <defs>
    <linearGradient id="beautyTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d0812" stop-opacity=".86"/><stop offset="1" stop-color="#0d0812" stop-opacity=".12"/></linearGradient>
    <linearGradient id="beautyShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#120a18" stop-opacity=".08"/><stop offset=".42" stop-color="#120a18" stop-opacity=".68"/><stop offset="1" stop-color="#0a060e" stop-opacity=".96"/></linearGradient>
    <linearGradient id="beautyGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff7d0"/><stop offset=".22" stop-color="#d8a84d"/><stop offset=".48" stop-color="#ffeb9e"/><stop offset=".74" stop-color="#a9681c"/><stop offset="1" stop-color="#efc66a"/></linearGradient>
    <filter id="beautyGoldGlow" x="-20%" y="-35%" width="140%" height="170%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="1.8" result="beautyTitleBlur"/>
      <feFlood flood-color="#c67c22" flood-opacity=".5" result="beautyTitleGlowColor"/>
      <feComposite in="beautyTitleGlowColor" in2="beautyTitleBlur" operator="in" result="beautyTitleGlow"/>
      <feMerge><feMergeNode in="beautyTitleGlow"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <rect width="1080" height="${isTelegram ? 330 : 360}" fill="url(#beautyTop)"/>
  <rect y="${isTelegram ? 220 : 250}" width="1080" height="${height - (isTelegram ? 220 : 250)}" fill="url(#beautyShade)"/>
  ${frame}
  <g font-family="DejaVu Sans, Arial, sans-serif">
    ${placeholderIcon}
    ${title}
    <text fill="#e7dce9" font-size="${isTelegram ? 27 : 30}" font-weight="600">${descriptionTspans(description, descriptionOptions)}</text>
    ${serviceRows}
    <text x="76" y="${locationY}" fill="#d9cddd" font-size="30" font-weight="650">⌖ ${xml(location)}</text>
    ${isTelegram ? "" : `<rect x="74" y="826" width="932" height="92" rx="25" fill="#e2bd66"/>
    <text x="112" y="884" fill="#1b111f" font-size="33" font-weight="900">${xml(labels.cta)}</text>
    <text x="966" y="884" text-anchor="end" fill="#1b111f" font-size="40" font-weight="900">→</text>`}
  </g>
</svg>`;
};

export const buildBeautyShareCardSvg = (input: TelegramEventCardInput) =>
  buildBeautyShareCardSvgVariant(input, "default");

export const buildTelegramBeautyShareCardSvg = (input: TelegramEventCardInput) =>
  buildBeautyShareCardSvgVariant(input, "telegram");
