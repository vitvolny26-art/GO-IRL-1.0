type MessengerKind = "telegram" | "whatsapp" | "messenger" | "viber";

type SheetAction = {
  kind: MessengerKind;
  label: string;
  action: () => void;
};

const messengerSvg: Record<MessengerKind, string> = {
  telegram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21.7 4.4 18.4 20c-.2 1-.8 1.2-1.6.7l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.9.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L6.9 14 2.4 12.6c-1-.3-1-1 .2-1.4L20.1 4c.8-.3 1.5.2 1.6.4Z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.6a9.3 9.3 0 0 0-8 14l-1 3.7 3.8-1A9.3 9.3 0 1 0 12 2.6Z"/><path d="M8.8 7.6c-.2-.4-.4-.4-.7-.4h-.6c-.2 0-.6.1-.9.4-.3.4-1.1 1.1-1.1 2.6s1.1 3 1.3 3.2c.2.2 2.2 3.4 5.4 4.6 2.7 1.1 3.2.9 3.8.8.6-.1 1.9-.8 2.2-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.7-.5l-2.2-1.1c-.3-.1-.6-.2-.8.2l-.9 1.1c-.2.3-.4.3-.8.1-.3-.2-1.4-.5-2.7-1.7-1-.9-1.7-2-1.9-2.3-.2-.4 0-.6.1-.7l.6-.7c.2-.2.2-.4.3-.6.1-.2.1-.4 0-.7L8.8 7.6Z"/></svg>`,
  messenger: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.7c-5.4 0-9.6 3.9-9.6 9.1 0 2.8 1.4 5.3 3.5 6.9v3.4l3.2-1.8c.9.2 1.9.4 2.9.4 5.4 0 9.6-3.9 9.6-9.1S17.4 2.7 12 2.7Z"/><path d="m6.5 14.5 4.1-4.3 3.1 3.2 3.8-4.1-4.1 7-3.1-3.2-3.8 1.4Z"/></svg>`,
  viber: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 3.5h9.6A3.7 3.7 0 0 1 20.5 7v6.8a3.7 3.7 0 0 1-3.7 3.7h-3.1l-3.4 3.1v-3.1H7.2a3.7 3.7 0 0 1-3.7-3.7V7a3.7 3.7 0 0 1 3.7-3.5Z"/><path d="M8.4 7.3c-.4.2-.7.9-.6 1.5.5 3.1 2.9 5.5 6 6 .6.1 1.3-.2 1.5-.6l.4-.7c.2-.4.1-.8-.3-1l-1.3-.8c-.4-.2-.8-.1-1 .2l-.4.5a5.2 5.2 0 0 1-2.6-2.6l.5-.4c.3-.3.4-.7.2-1l-.8-1.3c-.2-.4-.7-.5-1-.3l-.7.4Z"/><path d="M13.5 7.2c1.8.4 2.9 1.5 3.3 3.3M13.7 9.4c.7.2 1.1.6 1.3 1.3"/></svg>`,
};

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const showCardActionSheet = (title: string, subtitle: string, actions: SheetAction[]) => {
  document.querySelector(".unified-card-mini-sheet")?.remove();

  const sheet = document.createElement("div");
  sheet.className = "unified-card-mini-sheet unified-card-icon-sheet";
  sheet.innerHTML = `<strong>${title}</strong><span class="unified-card-sheet-subtitle">${subtitle}</span>`;

  const grid = document.createElement("div");
  grid.className = "unified-card-icon-grid";

  actions.slice(0, 4).forEach((item) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `unified-card-icon-option unified-card-icon-option--${item.kind}`;
    button.innerHTML = `<span class="unified-card-icon-circle">${messengerSvg[item.kind]}</span><span>${item.label}</span>`;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      sheet.remove();
      item.action();
    });
    grid.append(button);
  });

  const close = document.createElement("button");
  close.type = "button";
  close.className = "unified-card-sheet-close";
  close.textContent = "Закрыть";
  close.addEventListener("click", (event) => {
    event.stopPropagation();
    sheet.remove();
  });

  sheet.append(grid, close);
  document.body.append(sheet);
};

const shareText = (title: string, date: string, address: string, url: string) =>
  `GO IRL: ${title}\n${date}\n${address}\n${url}`;

export const openCardShareSheet = (title: string, date = "", address = "") => {
  const url = window.location.href.split("?")[0];
  const message = shareText(title, date, address, url);
  const encoded = encodeURIComponent(message);
  const encodedUrl = encodeURIComponent(url);

  showCardActionSheet("Поделиться", "Куда отправить приглашение", [
    { kind: "telegram", label: "Telegram", action: () => openUrl(`https://t.me/share/url?url=${encodedUrl}&text=${encoded}`) },
    { kind: "whatsapp", label: "WhatsApp", action: () => openUrl(`https://wa.me/?text=${encoded}`) },
    { kind: "messenger", label: "Messenger", action: () => openUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`) },
    { kind: "viber", label: "Viber", action: () => openUrl(`viber://forward?text=${encoded}`) },
  ]);
};

export const openCardReminderSheet = () => {
  showCardActionSheet("Напоминание", "Где напомнить о событии", [
    { kind: "telegram", label: "Telegram", action: () => undefined },
    { kind: "whatsapp", label: "WhatsApp", action: () => undefined },
    { kind: "messenger", label: "Messenger", action: () => undefined },
    { kind: "viber", label: "Viber", action: () => undefined },
  ]);
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
      openCardShareSheet(title, date, address);
      return;
    }

    openCardReminderSheet();
  }, true);
};
