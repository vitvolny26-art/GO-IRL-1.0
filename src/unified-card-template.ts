const processedAttr = "data-go-irl-unified-card";

const text = (el: Element | null) => el?.textContent?.trim() || "";

const iconForTitle = (title: string, fallback: string) => {
  const value = title.toLowerCase();
  if (/walk|walking|прогул|ходь|proch/.test(value)) return "🚶";
  if (/board|game|игр|hra/.test(value)) return "🎲";
  if (/coffee|кафе|кофе|káva/.test(value)) return "☕";
  if (/language|язык|jazyk/.test(value)) return "💬";
  if (/party|вечерин|párty/.test(value)) return "🎉";
  return fallback || "✨";
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

  const date = text(detailItems[0]);
  const time = text(detailItems[1]);
  const address = text(detailItems[2]);
  const participants = text(detailItems[3]);
  const price = text(detailItems[4]);

  card.setAttribute(processedAttr, "1");
  card.classList.add("compact-sport-card", "unified-event-card");

  icon.textContent = iconForTitle(title, text(icon));
  icon.classList.add("sport-card-symbol");
  icon.innerHTML = `<span class="sport-avatar-glyph">${icon.textContent || "✨"}</span>`;

  main.className = "sport-card-main";
  main.innerHTML = `
    ${icon.outerHTML}
    <div>
      <h3>${title}</h3>
      <p>${subtitle || title}</p>
    </div>
  `;

  const safeTime = time || "90 мин";
  const safeParticipants = participants || text(spots).replace(/[^0-9/ ]/g, "").trim() || "1 / 8";

  const topActions = document.createElement("div");
  topActions.className = "sport-card-top-actions";
  topActions.innerHTML = `
    <button class="sport-card-icon-action" type="button" aria-label="Напоминание">🔔</button>
    <button class="sport-card-icon-action" type="button" aria-label="Поделиться">↗</button>
  `;
  card.insertBefore(topActions, main);

  const chips = document.createElement("div");
  chips.className = "sport-chip-row";
  chips.innerHTML = `
    <span class="sport-card-chip sport-duration-chip">📅 ${safeTime}</span>
    <span class="sport-card-participants-chip">👥 ${safeParticipants}</span>
  `;
  main.after(chips);

  const details = card.querySelector<HTMLElement>(".activity-card-details");
  if (details) {
    details.classList.add("sport-details-grid");
    details.innerHTML = `
      <div><span aria-hidden="true">📅</span><span>${date}${time && date !== time ? ` · ${time}` : ""}</span></div>
      <div><span aria-hidden="true">🎟️</span><span>${price || "Бесплатно"}</span></div>
      <div><span aria-hidden="true">📍</span><span>${address}</span></div>
      <div><span aria-hidden="true">☆</span><span>${text(spots)}</span></div>
    `;
  }

  footer.classList.add("compact-sport-actions");
  footer.innerHTML = "";
  const left = document.createElement("button");
  left.className = "sport-coach-action";
  left.type = "button";
  left.innerHTML = "👥 Тренер";
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
