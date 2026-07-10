type MessengerKind = "telegram" | "whatsapp" | "messenger" | "viber";

type SheetAction = {
  kind: MessengerKind;
  label: string;
  action: () => void;
};

const messengerIconUrl: Record<MessengerKind, string> = {
  telegram: "https://cdn.simpleicons.org/telegram",
  whatsapp: "https://cdn.simpleicons.org/whatsapp",
  messenger: "https://cdn.simpleicons.org/messenger",
  viber: "https://cdn.simpleicons.org/viber",
};

const triggerIdAttr = "data-card-action-trigger-id";
let triggerIdSeed = 0;

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const getTriggerId = (trigger?: HTMLElement) => {
  if (!trigger) return "global";
  if (!trigger.getAttribute(triggerIdAttr)) {
    trigger.setAttribute(triggerIdAttr, `card-action-${triggerIdSeed++}`);
  }
  return trigger.getAttribute(triggerIdAttr) || "global";
};

const positionFlyout = (sheet: HTMLElement, trigger?: HTMLElement) => {
  if (!trigger) return;

  const rect = trigger.getBoundingClientRect();
  const flyoutWidth = 56;
  const flyoutHeight = 248;
  const gap = 8;
  const canOpenRight = rect.right + gap + flyoutWidth <= window.innerWidth;
  const left = canOpenRight ? rect.right + gap : rect.left - flyoutWidth - gap;
  const safeLeft = Math.max(8, Math.min(left, window.innerWidth - flyoutWidth - 8));
  const safeTop = Math.max(8, Math.min(rect.top, window.innerHeight - flyoutHeight - 8));

  sheet.style.setProperty("top", `${safeTop}px`, "important");
  sheet.style.setProperty("left", `${safeLeft}px`, "important");
  sheet.style.setProperty("right", "auto", "important");
  sheet.style.setProperty("bottom", "auto", "important");
};

const showCardActionSheet = (actions: SheetAction[], trigger?: HTMLElement) => {
  const triggerId = getTriggerId(trigger);
  const current = document.querySelector<HTMLElement>(".unified-card-mini-sheet");
  if (current?.dataset.triggerId === triggerId) {
    current.remove();
    return;
  }
  current?.remove();

  const sheet = document.createElement("div");
  sheet.className = "unified-card-mini-sheet unified-card-icon-sheet unified-card-icon-flyout";
  sheet.dataset.triggerId = triggerId;

  actions.slice(0, 4).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `unified-card-icon-option unified-card-icon-option--${item.kind}`;
    button.setAttribute("aria-label", item.label);
    button.innerHTML = `<span class="unified-card-icon-circle"><img src="${messengerIconUrl[item.kind]}" alt="" loading="lazy" decoding="async" /></span>`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      sheet.remove();
      item.action();
    });
    sheet.append(button);
  });

  document.body.append(sheet);
  positionFlyout(sheet, trigger);
};

const shareText = (title: string, date: string, address: string, url: string) =>
  `GO IRL: ${title}\n${date}\n${address}\n${url}`;

export const openCardShareSheet = (title: string, date = "", address = "", trigger?: HTMLElement) => {
  const url = window.location.href.split("?")[0];
  const message = shareText(title, date, address, url);
  const encoded = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(url);

  showCardActionSheet([
    { kind: "telegram", label: "Telegram", action: () => openUrl(`https://t.me/share/url?url=${encodedUrl}&text=${encoded}`) },
    { kind: "whatsapp", label: "WhatsApp", action: () => openUrl(`https://wa.me/?text=${encoded}`) },
    { kind: "messenger", label: "Messenger", action: () => openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`) },
    { kind: "viber", label: "Viber", action: () => openUrl(`viber://forward?text=${encoded}`) },
  ], trigger);
};

export const openCardReminderSheet = (trigger?: HTMLElement) => {
  showCardActionSheet([
    { kind: "telegram", label: "Telegram", action: () => undefined },
    { kind: "whatsapp", label: "WhatsApp", action: () => undefined },
    { kind: "messenger", label: "Messenger", action: () => undefined },
    { kind: "viber", label: "Viber", action: () => undefined },
  ], trigger);
};

export const enableSportCardActionSheets = () => {
  if (typeof document === "undefined") return;

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    const actionButton = target?.closest<HTMLButtonElement>(".sport-card:not(.unified-event-card) .sport-card-top-actions .sport-card-icon-action");
    if (!actionButton) return;

    const card = actionButton.closest<HTMLElement>(".sport-card");
    const title = card?.querySelector("h3")?.textContent?.trim() || "GO IRL";
    const date = card?.querySelector(".activity-card-details span")?.textContent?.trim() || "";
    const address = card?.querySelector(".activity-card-details div:first-child span")?.textContent?.trim() || "Olomouc";
    const isShare = actionButton.matches(".sport-card-top-actions .sport-card-icon-action:nth-child(2)");

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    if (isShare) {
      openCardShareSheet(title, date, address, actionButton);
      return;
    }

    openCardReminderSheet(actionButton);
  }, true);
};
