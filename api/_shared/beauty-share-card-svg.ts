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

const buildBeautyShareCardSvgVariant = (input: TelegramEventCardInput, variant: BeautyShareCardVariant) => {
  const isTelegram = variant === "telegram";
  const labels = copy[input.language] || copy.en;
  const name = clean(input.activity || input.organizer || "GO IRL Beauty", 48);
  const description = clean(input.description || input.level || input.title, 180);
  const nameFontSize = isTelegram
    ? name.length > 34 ? 44 : name.length > 24 ? 50 : 58
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
    ? { x: 232, startY: 188, step: 34, maxLines: 3, maxChars: 44 }
    : { x: 232, startY: 184, step: 42, maxLines: 2, maxChars: 46 };
  const locationY = isTelegram ? 730 : 782;
  const frame = isTelegram
    ? `<g data-beauty-telegram-frame="true" fill="none" stroke="url(#beautyGold)" stroke-linecap="round" stroke-linejoin="round">
      <rect x="24" y="24" width="1032" height="852" rx="16" stroke-width="3"/>
      <rect x="40" y="40" width="1000" height="820" rx="10" stroke-width="1.4" stroke-opacity=".7"/>
      <path d="M24 102h18V68c0-15 11-26 26-26h34V24M978 24v18h34c15 0 26 11 26 26v34h18M24 798h18v34c0 15 11 26 26 26h34v18M978 876v-18h34c15 0 26-11 26-26v-34h18" stroke-width="3"/>
    </g>`
    : `<rect x="28" y="28" width="1024" height="${height - 56}" rx="44" fill="none" stroke="#e0bc65" stroke-opacity=".92" stroke-width="3"/>`;
  const title = isTelegram
    ? `<text data-beauty-telegram-title="true" x="232" y="122" fill="url(#beautyGold)" font-family="DejaVu Serif, Georgia, serif" font-size="${nameFontSize}" font-style="italic" font-weight="650" letter-spacing=".6">${xml(name)}</text>
    <g data-beauty-title-flourish="true" fill="none" stroke="url(#beautyGold)" stroke-linecap="round" stroke-linejoin="round">
      <path d="M232 148h122c28 0 32-18 52-18 18 0 24 18 50 18h120" stroke-width="2.6"/>
      <path d="M576 148h92c22 0 28-13 44-13 15 0 22 13 43 13h87" stroke-width="1.8" stroke-opacity=".78"/>
      <path d="M445 148l11-8 11 8-11 8z" fill="url(#beautyGold)" stroke="none"/>
    </g>`
    : `<text x="232" y="124" fill="#fff9fb" font-size="${nameFontSize}" font-weight="900">${xml(name)}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
  <defs>
    <linearGradient id="beautyTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d0812" stop-opacity=".86"/><stop offset="1" stop-color="#0d0812" stop-opacity=".12"/></linearGradient>
    <linearGradient id="beautyShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#120a18" stop-opacity=".08"/><stop offset=".42" stop-color="#120a18" stop-opacity=".68"/><stop offset="1" stop-color="#0a060e" stop-opacity=".96"/></linearGradient>
    <linearGradient id="beautyGold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff0b5"/><stop offset=".34" stop-color="#d6a94d"/><stop offset=".68" stop-color="#f7d884"/><stop offset="1" stop-color="#b77925"/></linearGradient>
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
