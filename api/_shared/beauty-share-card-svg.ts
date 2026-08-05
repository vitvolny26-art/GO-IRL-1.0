import type { TelegramEventCardInput } from "./telegram-event-card.js";

const copy = {
  ru: { cta: "Услуги и запись", priceFrom: "от" },
  uk: { cta: "Послуги та запис", priceFrom: "від" },
  cs: { cta: "Služby a rezervace", priceFrom: "od" },
  en: { cta: "Services and booking", priceFrom: "from" },
} as const;

const slogan = "LESS SCROLLING. MORE LIFE.";

const xml = (value: string) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const clean = (value: string, max = 140) => value.trim().replace(/\s+/g, " ").slice(0, max);

const compactProfileLink = (value: string) => {
  try {
    const url = new URL(value);
    return clean(`${url.hostname}${url.pathname}`, 52).replace(/\/$/, "");
  } catch {
    return clean(value, 52);
  }
};

export const buildBeautyShareCardSvg = (input: TelegramEventCardInput) => {
  const labels = copy[input.language] || copy.en;
  const name = clean(input.activity || input.organizer || "GO IRL Beauty", 40);
  const subtitle = clean(input.level || input.title, 90);
  const initial = name.slice(0, 1).toUpperCase() || "G";
  const nameFontSize = name.length > 30 ? 48 : name.length > 20 ? 56 : 72;
  const services = (input.beautyServices?.length
    ? input.beautyServices
    : [{ name: input.title, priceCzk: input.price }])
    .filter((service) => clean(service.name))
    .slice(0, 3);
  const serviceRows = services.map((service, index) => {
    const y = 660 + index * 112;
    const serviceName = clean(service.name, 42);
    const serviceFontSize = serviceName.length > 34 ? 25 : serviceName.length > 25 ? 28 : 32;
    return `<g data-beauty-service-row="${index + 1}">
      <rect x="74" y="${y}" width="932" height="90" rx="24" fill="#24182b" fill-opacity=".82" stroke="#e2bd66" stroke-opacity=".46" stroke-width="2"/>
      <text x="104" y="${y + 57}" fill="#fff7fb" font-size="${serviceFontSize}" font-weight="750">${xml(serviceName)}</text>
      <text x="976" y="${y + 57}" text-anchor="end" fill="#f1cb72" font-size="31" font-weight="850">${xml(`${labels.priceFrom} ${Math.round(service.priceCzk)} Kč`)}</text>
    </g>`;
  }).join("");
  const location = clean(input.address || input.city, 80);
  const profileLink = compactProfileLink(input.publicProfileUrl || input.inviteUrl);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <defs>
    <linearGradient id="beautyTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d0812" stop-opacity=".78"/><stop offset="1" stop-color="#0d0812" stop-opacity="0"/></linearGradient>
    <linearGradient id="beautyShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#120a18" stop-opacity=".04"/><stop offset=".38" stop-color="#120a18" stop-opacity=".72"/><stop offset="1" stop-color="#0a060e" stop-opacity=".98"/></linearGradient>
    <linearGradient id="beautyLogo" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e2bd66"/><stop offset="1" stop-color="#9f73c8"/></linearGradient>
  </defs>
  <rect width="1080" height="540" fill="url(#beautyTop)"/>
  <rect y="300" width="1080" height="1050" fill="url(#beautyShade)"/>
  <rect x="28" y="28" width="1024" height="1294" rx="46" fill="none" stroke="#e0bc65" stroke-opacity=".92" stroke-width="3"/>
  <g font-family="DejaVu Sans, Arial, sans-serif">
    <text x="74" y="102" fill="#e2bd66" font-size="26" font-weight="800" letter-spacing="5">GO IRL BEAUTY</text>
    <rect x="74" y="142" width="150" height="150" rx="38" fill="url(#beautyLogo)" stroke="#fff4da" stroke-opacity=".8" stroke-width="3"/>
    <text x="149" y="244" text-anchor="middle" fill="#1a1020" font-size="72" font-weight="900">${xml(initial)}</text>
    <text x="74" y="540" fill="#fff9fb" font-size="${nameFontSize}" font-weight="900">${xml(name)}</text>
    <text x="76" y="600" fill="#e7dce9" font-size="38" font-weight="600">${xml(subtitle)}</text>
    ${serviceRows}
    <text x="76" y="1080" fill="#d9cddd" font-size="31" font-weight="650">⌖ ${xml(location)}</text>
    <rect x="74" y="1130" width="932" height="96" rx="26" fill="#e2bd66"/>
    <text x="112" y="1191" fill="#1b111f" font-size="34" font-weight="900">${xml(labels.cta)}</text>
    <text x="966" y="1191" text-anchor="end" fill="#1b111f" font-size="42" font-weight="900">→</text>
    <text x="76" y="1282" fill="#d4c7d6" font-size="25" font-weight="650">${xml(profileLink)}</text>
    <text x="1004" y="1282" text-anchor="end" fill="#e2bd66" font-size="23" font-weight="800">${xml(slogan)}</text>
  </g>
</svg>`;
};
