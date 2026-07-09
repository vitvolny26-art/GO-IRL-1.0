const shareIcon = "↗";

const isEmojiLike = (value: string) => /\p{Extended_Pictographic}/u.test(value.trim());

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
