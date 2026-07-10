const shareIcon = "⤴";

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

const closeTransientPanels = () => {
  document.querySelector(".go-irl-share-panel")?.remove();
  document.querySelector(".go-irl-time-placeholder")?.remove();
};

const openTimePlaceholder = () => {
  closeTransientPanels();

  const panel = document.createElement("div");
  panel.className = "go-irl-time-placeholder";
  panel.innerHTML = `
    <strong>Уведомления скоро</strong>
    <span>Здесь будет выбор мессенджера для напоминания.</span>
    <button type="button">Понятно</button>
  `;
  panel.querySelector("button")?.addEventListener("click", () => panel.remove());
  document.body.appendChild(panel);
};

const shareUrl = () => window.location.href.split("#")[0];

const openMessengerShare = (target: string, title: string) => {
  const text = encodeURIComponent(`${title}\n${shareUrl()}`);
  const url = encodeURIComponent(shareUrl());

  if (target === "telegram") openExternal(`https://t.me/share/url?url=${url}&text=${encodeURIComponent(title)}`);
  if (target === "whatsapp") openExternal(`https://wa.me/?text=${text}`);
  if (target === "messenger") openExternal(`fb-messenger://share?link=${url}`);
  if (target === "viber") openExternal(`viber://forward?text=${text}`);
};

const openSharePanel = (title: string) => {
  closeTransientPanels();

  const panel = document.createElement("div");
  panel.className = "go-irl-share-panel";
  panel.innerHTML = `
    <div class="go-irl-share-head">
      <strong>Поделиться</strong>
      <button type="button" aria-label="Закрыть">×</button>
    </div>
    <button type="button" data-share="telegram">Telegram</button>
    <button type="button" data-share="whatsapp">WhatsApp</button>
    <button type="button" data-share="messenger">Messenger</button>
    <button type="button" data-share="viber">Viber</button>
  `;

  panel.querySelector(".go-irl-share-head button")?.addEventListener("click", () => panel.remove());
  panel.querySelectorAll<HTMLButtonElement>("button[data-share]").forEach((button) => {
    button.addEventListener("click", () => {
      openMessengerShare(button.dataset.share || "telegram", title);
      panel.remove();
    });
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

const sportAvatar = (text: string) => {
  const value = text.toLowerCase();
  if (/volley|волей|volej/.test(value)) return "🏐";
  if (/football|футбол|fotbal/.test(value)) return "⚽";
  if (/basket|баскет/.test(value)) return "🏀";
  if (/tennis|теннис|tenis/.test(value)) return "🎾";
  if (/running|run|бег|běh/.test(value)) return "🏃";
  if (/bike|cycle|velo|велосипед|kolo/.test(value)) return "🚴";
  if (/swim|плав|plav/.test(value)) return "🏊";
  if (/badminton|бадминтон/.test(value)) return "🏸";
  if (/gym|зал|posil/.test(value)) return "🏋️";
  if (/yoga|йога|jóga/.test(value)) return "🧘";
  return "🏆";
};

const normalizeSportLogo = (root: ParentNode = document) => {
  root.querySelectorAll<HTMLElement>(".sport-card, .sport-sheet").forEach((container) => {
    const text = container.textContent || "";
    const avatar = sportAvatar(text);
    container.querySelectorAll<HTMLElement>(".sport-card-symbol").forEach((symbol) => {
      symbol.textContent = avatar;
      symbol.dataset.normalized = "true";
    });
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
    openSharePanel(cardTitle(card));
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

    if (/\d{1,2}:\d{2}/.test(text)) {
      item.classList.add("is-clickable-meta");
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openTimePlaceholder();
      });
      return;
    }

    if (/завтра|сегодня|пон|вт|ср|чт|пт|сб|вс|jul|июл/i.test(text)) {
      item.classList.add("is-clickable-meta");
      item.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        openGoogleCalendar(cardTitle(card));
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
