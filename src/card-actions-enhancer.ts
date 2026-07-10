const shareIcon = "↗";

const isEmojiLike = (value: string) => /\p{Extended_Pictographic}/u.test(value.trim());

const appLanguage = () => document.documentElement.lang || document.querySelector("[data-language]")?.getAttribute("data-language") || "ru";

const openExternal = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const openMap = (query: string) => {
  const value = query.trim();
  if (!value) return;

  const isCzech = appLanguage().toLowerCase().startsWith("cs");
  const url = isCzech
    ? `https://mapy.cz/zakladni?q=${encodeURIComponent(value)}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}`;

  openExternal(url);
};

const openGoogleCalendar = (title: string) => {
  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.set("action", "TEMPLATE");
  url.searchParams.set("text", title || "GO IRL event");
  url.searchParams.set("details", "GO IRL — Less scrolling. More living.");
  openExternal(url.toString());
};

const createReminderPanel = () => {
  const existing = document.querySelector<HTMLElement>(".go-irl-reminder-panel");
  if (existing) {
    existing.remove();
    return;
  }

  const panel = document.createElement("div");
  panel.className = "go-irl-reminder-panel";
  panel.innerHTML = `
    <strong>Напомнить</strong>
    <button type="button" data-reminder="15">За 15 мин</button>
    <button type="button" data-reminder="60">За 1 час</button>
    <button type="button" data-reminder="1440">За день</button>
  `;

  panel.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const button = target?.closest<HTMLButtonElement>("button[data-reminder]");
    if (!button) return;

    const minutes = button.dataset.reminder || "15";
    window.localStorage.setItem("go-irl:last-reminder", minutes);
    panel.innerHTML = `<strong>Напоминание сохранено</strong><span>За ${minutes} мин.</span>`;
    window.setTimeout(() => panel.remove(), 1400);
  });

  document.body.appendChild(panel);
};

const openCardDetails = (card: HTMLElement) => {
  const main = card.querySelector<HTMLButtonElement>(".activity-card-main, .sport-card-main, .discover-card-main");
  main?.click();
};

const openMembers = (card: HTMLElement) => {
  openCardDetails(card);
  window.setTimeout(() => {
    const sheet = document.querySelector<HTMLElement>(".activity-sheet");
    const toggle = sheet?.querySelector<HTMLButtonElement>(".detail-members-toggle");
    if (!toggle) return;
    if (!sheet?.querySelector(".members-section")) toggle.click();
  }, 160);
};

const normalizeSportLogo = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLElement>(".sport-card-symbol").forEach((symbol) => {
    const text = symbol.textContent?.trim() || "";
    if (!text || isEmojiLike(text)) return;
    symbol.textContent = "🏆";
    symbol.dataset.normalized = "true";
  });
};

const cardTitle = (card: HTMLElement) => card.querySelector("h3")?.textContent?.trim() || "GO IRL event";

const enhanceCard = (card: HTMLElement) => {
  if (card.dataset.actionsEnhanced === "true") return;
  card.dataset.actionsEnhanced = "true";

  const main = card.querySelector<HTMLElement>(".activity-card-main, .sport-card-main, .discover-card-main");
  if (!main) return;

  const share = document.createElement("button");
  share.type = "button";
  share.className = "card-share-corner";
  share.setAttribute("aria-label", "Поделиться");
  share.textContent = shareIcon;
  share.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openCardDetails(card);
    window.setTimeout(() => {
      const shareButton = document.querySelector<HTMLButtonElement>(".event-more-menu button:first-child, .sheet-actions button[aria-label='Поделиться']");
      shareButton?.click();
    }, 180);
  });
  card.appendChild(share);

  const footer = card.querySelector<HTMLElement>(".activity-card-footer");
  const join = footer?.querySelector<HTMLButtonElement>(".card-join");
  if (footer && join && !footer.querySelector(".card-details-action")) {
    const details = document.createElement("button");
    details.type = "button";
    details.className = "card-details-action";
    details.textContent = "Детали";
    details.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openCardDetails(card);
    });
    footer.appendChild(details);
  }

  const participants = card.querySelector<HTMLElement>(".spots, .sport-card-participants-chip, .activity-card-details > div:nth-child(4)");
  participants?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openMembers(card);
  });

  card.querySelectorAll<HTMLElement>(".activity-card-details > div, .discover-card-meta > span").forEach((item) => {
    const text = item.textContent || "";

    if (/оломоуц|olomouc|praha|адрес|zs|nám|nam|street|ul\./i.test(text)) {
      item.classList.add("is-clickable-meta");
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openMap(text);
      });
    }

    if (/завтра|сегодня|\d{1,2}:\d{2}|пон|вт|ср|чт|пт|сб|вс|jul|июл/i.test(text)) {
      item.classList.add("is-clickable-meta");
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (/\d{1,2}:\d{2}/.test(text)) createReminderPanel();
        else openGoogleCalendar(cardTitle(card));
      });
    }
  });
};

const enhanceCards = () => {
  normalizeSportLogo();
  document.querySelectorAll<HTMLElement>(".activity-card, .sport-card, .discover-card").forEach(enhanceCard);
};

export const enableCardActionsEnhancer = () => {
  if (typeof window === "undefined") return;

  enhanceCards();
  const observer = new MutationObserver(() => enhanceCards());
  observer.observe(document.body, { childList: true, subtree: true });
};
