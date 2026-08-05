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
  const words = clean(value, 140).split(" ").filter(Boolean);
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1) || "";
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      if (current) lines[lines.length - 1] = candidate;
      else lines.push(candidate);
    } else if (lines.length < maxLines) {
      lines.push(word.slice(0, maxChars));
    } else {
      const last = lines.at(-1) || "";
      lines[lines.length - 1] = `${last.slice(0, Math.max(0, maxChars - 1))}…`;
      break;
    }
  }
  return lines.slice(0, maxLines);
};

const descriptionTspans = (value: string) => wrap(value).map((line, index) =>
  `<tspan x="232" y="${184 + index * 42}">${xml(line)}</tspan>`).join("");

const placeholderIcon = `<g data-beauty-photo-placeholder="true">
  <rect x="74" y="70" width="126" height="126" rx="30" fill="#24182b" fill-opacity=".82" stroke="#e2bd66" stroke-opacity=".8" stroke-width="3"/>
  <circle cx="166" cy="103" r="11" fill="#e2bd66"/>
  <path d="M96 164l29-31 22 21 14-15 23 25H96z" fill="none" stroke="#e2bd66" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;

export const buildBeautyShareCardSvg = (input: TelegramEventCardInput) => {
  const labels = copy[input.language] || copy.en;
  const name = clean(input.activity || input.organizer || "GO IRL Beauty", 48);
  const description = clean(input.description || input.level || input.title, 140);
  const nameFontSize = name.length > 34 ? 44 : name.length > 24 ? 50 : 60;
  const services = (input.beautyServices?.length
    ? input.beautyServices
    : [{ name: input.title, priceCzk: input.price }])
    .filter((service) => clean(service.name))
    .slice(0, 3);
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
  const location = clean(input.address || input.city, 80);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1020" viewBox="0 0 1080 1020">
  <defs>
    <linearGradient id="beautyTop" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0d0812" stop-opacity=".86"/><stop offset="1" stop-color="#0d0812" stop-opacity=".12"/></linearGradient>
    <linearGradient id="beautyShade" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#120a18" stop-opacity=".08"/><stop offset=".42" stop-color="#120a18" stop-opacity=".68"/><stop offset="1" stop-color="#0a060e" stop-opacity=".96"/></linearGradient>
  </defs>
  <rect width="1080" height="360" fill="url(#beautyTop)"/>
  <rect y="250" width="1080" height="770" fill="url(#beautyShade)"/>
  <rect x="28" y="28" width="1024" height="964" rx="44" fill="none" stroke="#e0bc65" stroke-opacity=".92" stroke-width="3"/>
  <g font-family="DejaVu Sans, Arial, sans-serif">
    ${placeholderIcon}
    <text x="232" y="124" fill="#fff9fb" font-size="${nameFontSize}" font-weight="900">${xml(name)}</text>
    <text fill="#e7dce9" font-size="30" font-weight="600">${descriptionTspans(description)}</text>
    ${serviceRows}
    <text x="76" y="782" fill="#d9cddd" font-size="30" font-weight="650">⌖ ${xml(location)}</text>
    <rect x="74" y="826" width="932" height="92" rx="25" fill="#e2bd66"/>
    <text x="112" y="884" fill="#1b111f" font-size="33" font-weight="900">${xml(labels.cta)}</text>
    <text x="966" y="884" text-anchor="end" fill="#1b111f" font-size="40" font-weight="900">→</text>
  </g>
</svg>`;
};