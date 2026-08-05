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
  const words = clean(value, 220).split(" ").filter(Boolean);
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

const serviceNameTspans = (value: string) => wrap(value, 29, 2).map((line, index) =>
  `<tspan x="22" y="${38 + index * 27}">${xml(line)}</tspan>`).join("");

const defaultPlaceholderIcon = `<g data-beauty-photo-placeholder="true">
  <rect x="74" y="70" width="126" height="126" rx="30" fill="#24182b" fill-opacity=".82" stroke="#e2bd66" stroke-opacity=".8" stroke-width="3"/>
  <circle cx="166" cy="103" r="11" fill="#e2bd66"/>
  <path d="M96 164l29-31 22 21 14-15 23 25H96z" fill="none" stroke="#e2bd66" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;

const telegramLogoPlaceholder = `<g data-beauty-telegram-logo-slot="true" transform="translate(835 65)">
  <rect width="170" height="170" rx="18" fill="#180b1f" fill-opacity=".92" stroke="url(#beautyGold)" stroke-width="2.5"/>
  <rect x="6" y="6" width="158" height="158" rx="12" fill="none" stroke="url(#beautyGold)" stroke-width="1" stroke-opacity=".5"/>
  <g data-beauty-photo-placeholder="true" fill="none" stroke="url(#beautyGold)" stroke-linecap="round" stroke-linejoin="round" filter="url(#beautyGoldGlow)">
    <circle cx="124" cy="51" r="10" fill="url(#beautyGold)" stroke="none"/>
    <path d="M42 126l36-40 27 27 18-20 31 33H42z" stroke-width="8"/>
  </g>
</g>`;

type BeautyShareCardVariant = "default" | "telegram";

const buildBeautyShareCardSvgVariant = (input: TelegramEventCardInput, variant: BeautyShareCardVariant) => {
  const isTelegram = variant === "telegram";
  const labels = copy[input.language] || copy.en;
  const name = clean(input.activity || input.organizer || "GO IRL Beauty", 48);
  const description = clean(input.description || input.level || input.title, 220);
  const nameFontSize = isTelegram
    ? name.length > 34 ? 58 : name.length > 24 ? 72 : 88
    : name.length > 34 ? 44 : name.length > 24 ? 50 : 60;
  const services = (input.beautyServices?.length
    ? input.beautyServices
    : [{ name: input.title, priceCzk: input.price }])
    .filter((service) => clean(service.name))
    .slice(0, 3);
  const location = clean(input.address || input.city, isTelegram ? 46 : 80);
  const height = isTelegram ? 900 : 1020;

  if (isTelegram) {
    const serviceRows = services.map((service, index) => {
      const y = 330 + index * 115;
      const serviceName = clean(service.name, 58);
      return `<g data-beauty-service-row="${index + 1}" transform="translate(80 ${y})">
        <rect width="520" height="90" rx="14" fill="#180b1f" fill-opacity=".92" stroke="url(#beautyGold)" stroke-width="2"/>
        <rect x="5" y="5" width="510" height="80" rx="10" fill="none" stroke="url(#beautyGold)" stroke-width=".8" stroke-opacity=".4"/>
        <text fill="#fff" font-size="24" font-weight="500" font-family="DejaVu Serif, Georgia, serif">${serviceNameTspans(serviceName)}</text>
        <text x="495" y="54" text-anchor="end" fill="#e8bc59" font-family="DejaVu Serif, Georgia, serif">
          <tspan font-size="22" font-weight="700">${xml(labels.priceFrom)} </tspan><tspan font-size="30" font-weight="800">${Math.round(service.priceCzk)} Kč</tspan>
        </text>
      </g>`;
    }).join("");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="900" viewBox="0 0 1080 900">
      <defs>
        <linearGradient id="beautyLeftShade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#0a030d" stop-opacity=".98"/>
          <stop offset="55%" stop-color="#0a030d" stop-opacity=".88"/>
          <stop offset="80%" stop-color="#0a030d" stop-opacity=".35"/>
          <stop offset="100%" stop-color="#0a030d" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="beautyGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fff8d6"/>
          <stop offset="25%" stop-color="#e2b453"/>
          <stop offset="50%" stop-color="#ffea9f"/>
          <stop offset="75%" stop-color="#a87122"/>
          <stop offset="100%" stop-color="#f5d685"/>
        </linearGradient>
        <filter id="beautyGoldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur"/>
          <feFlood flood-color="#c48528" flood-opacity=".6" result="color"/>
          <feComposite in="color" in2="blur" operator="in" result="glow"/>
          <feMerge><feMergeNode in="glow"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <rect width="1080" height="900" fill="url(#beautyLeftShade)"/>
      <g data-beauty-telegram-frame="true" stroke="url(#beautyGold)" fill="none">
        <path data-beauty-telegram-frame-outer="true" d="M32 60A28 28 0 0 0 60 32H1020A28 28 0 0 0 1048 60V840A28 28 0 0 0 1020 868H60A28 28 0 0 0 32 840Z" stroke-width="2.5" stroke-opacity=".9"/>
        <path data-beauty-telegram-frame-inner="true" d="M42 64A22 22 0 0 0 64 42H1016A22 22 0 0 0 1038 64V836A22 22 0 0 0 1016 858H64A22 22 0 0 0 42 836Z" stroke-width="1" stroke-opacity=".45"/>
      </g>
      ${telegramLogoPlaceholder}
      <text data-beauty-telegram-title="true" x="80" y="140" fill="url(#beautyGold)" filter="url(#beautyGoldGlow)" font-family="Great Vibes" font-size="${nameFontSize}" font-weight="400">${xml(name)}</text>
      <text fill="#ebdbe8" font-size="26" font-family="DejaVu Serif, Georgia, serif">${descriptionTspans(description, { x: 80, startY: 215, step: 37, maxLines: 3, maxChars: 39 })}</text>
      ${serviceRows}
      <g data-beauty-location="bottom-right" transform="translate(1006 835)">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="url(#beautyGold)" transform="translate(-410 -23) scale(1.15)"/>
        <text x="0" y="0" text-anchor="end" fill="#e6d8eb" font-size="28" font-family="DejaVu Serif, Georgia, serif">${xml(location)}</text>
      </g>
    </svg>`;
  }

  const serviceRows = services.map((service, index) => {
    const y = 430 + index * 100;
    const serviceName = clean(service.name, 44);
    const serviceFontSize = serviceName.length > 34 ? 25 : serviceName.length > 25 ? 28 : 31;
    return `<g data-beauty-service-row="${index + 1}">
      <rect x="74" y="${y}" width="932" height="78" rx="22" fill="#24182b" fill-opacity=".82" stroke="#e2bd66" stroke-opacity=".46" stroke-width="2"/>
      <text x="104" y="${y + 50}" fill="#fff7fb" font-size="${serviceFontSize}" font-weight="750">${xml(serviceName)}</text>
      <text x="976" y="${y + 50}" text-anchor="end" fill="#f1cb72" font-size="29" font-weight="850">${xml(`${labels.priceFrom} ${Math.round(service.priceCzk)} Kč`)}</text>
    </g>`;
  }).join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="${height}" viewBox="0 0 1080 ${height}">
    <defs>
      <linearGradient id="beautyTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d0812" stop-opacity=".86"/><stop offset="1" stop-color="#0d0812" stop-opacity=".12"/></linearGradient>
      <linearGradient id="beautyShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#120a18" stop-opacity=".08"/><stop offset=".42" stop-color="#120a18" stop-opacity=".68"/><stop offset="1" stop-color="#0a060e" stop-opacity=".96"/></linearGradient>
    </defs>
    <rect width="1080" height="360" fill="url(#beautyTop)"/>
    <rect y="250" width="1080" height="${height - 250}" fill="url(#beautyShade)"/>
    <rect x="28" y="28" width="1024" height="${height - 56}" rx="44" fill="none" stroke="#e0bc65" stroke-opacity=".92" stroke-width="3"/>
    <g font-family="DejaVu Sans, Arial, sans-serif">
      ${defaultPlaceholderIcon}
      <text x="232" y="124" fill="#fff9fb" font-size="${nameFontSize}" font-weight="900">${xml(name)}</text>
      <text fill="#e7dce9" font-size="30" font-weight="600">${descriptionTspans(description, { x: 232, startY: 184, step: 42, maxLines: 2, maxChars: 46 })}</text>
      ${serviceRows}
      <text x="76" y="782" fill="#d9cddd" font-size="30" font-weight="650">⌖ ${xml(location)}</text>
      <rect x="74" y="826" width="932" height="92" rx="25" fill="#e2bd66"/>
      <text x="112" y="884" fill="#1b111f" font-size="33" font-weight="900">${xml(labels.cta)}</text>
      <text x="966" y="884" text-anchor="end" fill="#1b111f" font-size="40" font-weight="900">→</text>
    </g>
  </svg>`;
};

export const buildBeautyShareCardSvg = (input: TelegramEventCardInput) =>
  buildBeautyShareCardSvgVariant(input, "default");

export const buildTelegramBeautyShareCardSvg = (input: TelegramEventCardInput) =>
  buildBeautyShareCardSvgVariant(input, "telegram");
