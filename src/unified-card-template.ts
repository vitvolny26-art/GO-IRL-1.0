const processedAttr = "data-go-irl-unified-card";

const text = (el: Element | null) => el?.textContent?.trim() || "";
const compactSpaces = (value: string) => value.replace(/\s+/g, " ").trim();
const stripEmoji = (value: string) => compactSpaces(value.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, ""));

const iconForTitle = (title: string, fallback: string) => {
  const value = title.toLowerCase();
  if (/run|running|бег|běh/.test(value)) return "🏃";
  if (/walk|walking|прогул|ходь|proch/.test(value)) return "🚶";
  if (/board|game|игр|hra/.test(value)) return "🎲";
  if (/coffee|кафе|кофе|káva/.test(value)) return "☕";
  if (/language|язык|jazyk/.test(value)) return "💬";
  if (/party|вечерин|párty/.test(value)) return "🎉";
  return fallback || "✨";
};

const fieldKind = (value: string) => {
  const lower = value.toLowerCase();
  if (/\d{1,2}:\d{2}/.test(value)) return "time";
  if (/\d{1,2}\s*(июл|jul|янв|фев|мар|апр|май|июн|авг|сен|окт|ноя|дек)|сегодня|завтра|today|tomorrow/.test(lower)) return "date";
  if (/free|zdarma|бесплатно|kč|czk/.test(lower)) return "price";
  if (/\d+\s*\/\s*\d+|осталось|left|zb/.test(lower)) return "participants";
  if (/olomouc|sad|sady|zs |zš|demlova|zeyerova|адрес|address/.test(lower)) return "address";
  return "other";
};

const pickFields = (items: HTMLElement[]) => {
  const values = items.map((item) => stripEmoji(text(item))).filter(Boolean);
  const byKind = (kind: string) => values.find((value) => fieldKind(value) === kind) || "";
  const date = byKind("date");
  const time = byKind("time");
  return {
    date: date && time ? `${date} · ${time}` : date || time,
    price: byKind("price"),
    address: byKind("address"),
    participants: byKind("participants"),
  };
};

const eventDuration = (title: string) => {
  const value = title.toLowerCase();
  if (/run|running|бег|běh/.test(value)) return "45 мин";
  if (/walk|walking|прогул|ходь|proch/.test(value)) return "60 мин";
  if (/board|game|игр|hra/.test(value)) return "120 мин";
  if (/coffee|кафе|кофе|káva/.test(value)) return "60 мин";
  return "90 мин";
};

const genericStatus = (title: string, spotsText: string) => {
  const value = title.toLowerCase();
  if (/walk|walking|прогул|ходь|proch/.test(value)) return "Новичок\nНа улице";
  if (/run|running|бег|běh/.test(value)) return "Новичок\nНа улице";
  if (/board|game|игр|hra/.test(value)) return "Новичок\nВнутри";
  return stripEmoji(spotsText) || "Новичок\nGO IRL";
};

const svg = {
  bell: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/><path d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/></svg>`,
  share: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 15c2-6 7-8 13-8"/><path d="M14 3l5 4-5 4"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>`,
  ticket: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>`,
  map: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  users: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  shield: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"/><path d="m9 12 2 2 4-5"/></svg>`,
  star: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01Z"/></svg>`,
};

const normalizeGenericCard = (card: HTMLElement) => {
  if (card.classList.contains("compact-sport-card")) return;
  if (card.getAttribute(processedAttr) === "1") return;

  const main = card.querySelector<HTMLElement>(".activity-card-main");
  const icon = card.querySelector<HTMLElement>(".category-icon");
  const title = text(card.querySelector("h3"));
  const subtitle = text(card.querySelector("p"));
  const detailItems = Array.from(card.querySelectorAll<HTMLElement>(".activity-card-details > div"));
  const footer = card.querySelector<HTMLElement>(".activity-card-footer");
  const join = footer?.querySelector<HTMLButtonElement>(".card-join");
  const spots = footer?.querySelector<HTMLElement>(".spots");

  if (!main || !icon || !title || detailItems.length < 3 || !footer || !join || !spots) return;

  const fields = pickFields(detailItems);
  const spotsText = text(spots);
  const participants = fields.participants || stripEmoji(spotsText).replace(/[^0-9/ ]/g, "").trim() || "1 / 8";
  const duration = eventDuration(title);
  const status = genericStatus(title, spotsText);

  card.setAttribute(processedAttr, "1");
  card.classList.add("compact-sport-card", "unified-event-card");

  const avatar = iconForTitle(title, text(icon));
  icon.textContent = avatar;
  icon.classList.add("sport-card-symbol");
  icon.innerHTML = `<span class="sport-avatar-glyph">${avatar}</span>`;

  main.className = "sport-card-main";
  main.innerHTML = `
    ${icon.outerHTML}
    <div>
      <h3>${title}</h3>
      <p>${subtitle || title}</p>
    </div>
  `;

  const topActions = document.createElement("div");
  topActions.className = "sport-card-top-actions";
  topActions.innerHTML = `
    <button class="sport-card-icon-action" type="button" aria-label="Напоминание">${svg.bell}</button>
    <button class="sport-card-icon-action" type="button" aria-label="Поделиться">${svg.share}</button>
  `;
  card.insertBefore(topActions, main);

  const chips = document.createElement("div");
  chips.className = "sport-chip-row";
  chips.innerHTML = `
    <span class="sport-card-chip sport-duration-chip">${svg.calendar}<span>${duration}</span></span>
    <span class="sport-card-participants-chip">${svg.users}<span>${participants}</span></span>
  `;
  main.after(chips);

  const details = card.querySelector<HTMLElement>(".activity-card-details");
  if (details) {
    details.classList.add("sport-details-grid");
    details.innerHTML = `
      <div>${svg.calendar}<span>${fields.date || "Сегодня"}</span></div>
      <div>${svg.ticket}<span>${fields.price || "Бесплатно"}</span></div>
      <div>${svg.map}<span>${fields.address || "Olomouc"}</span></div>
      <div class="unified-status-cell">${svg.shield}${svg.star}<span>${status}</span></div>
    `;
  }

  footer.classList.add("compact-sport-actions");
  footer.innerHTML = "";
  const left = document.createElement("button");
  left.className = "sport-coach-action";
  left.type = "button";
  left.innerHTML = `${svg.users}<span>Тренер</span>`;
  left.addEventListener("click", (event) => {
    event.stopPropagation();
    main.click();
  });
  join.classList.add("card-join");
  footer.append(left, join);
};

export const enableUnifiedCardTemplate = () => {
  if (typeof window === "undefined") return;

  const apply = () => {
    document.querySelectorAll<HTMLElement>(".activity-stack .activity-card:not(.compact-sport-card)").forEach(normalizeGenericCard);
  };

  window.requestAnimationFrame(apply);
  const observer = new MutationObserver(apply);
  observer.observe(document.body, { childList: true, subtree: true });
};
