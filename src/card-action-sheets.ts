type MessengerKind = "telegram" | "whatsapp" | "messenger" | "viber";

type SheetAction = {
  kind: MessengerKind;
  label: string;
  action: () => void;
};

const messengerSvg: Record<MessengerKind, string> = {
  telegram: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 4 3 11l7 2 2 7 9-16Z"/><path d="m10 13 5-4"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 19.5 6 15.7A8 8 0 1 1 8.3 18Z"/><path d="M9.2 8.8c.2 3 2.2 5 5.5 5.8l1.2-1.2c.3-.3.3-.8 0-1.1l-1.1-1c-.3-.3-.7-.3-1 0l-.6.6c-1.3-.6-2.3-1.5-2.9-2.9l.6-.6c.3-.3.3-.8 0-1.1l-1-1.1c-.3-.3-.8-.3-1.1 0Z"/></svg>`,
  messenger: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.8 3 3 6.5 3 11.2c0 2.7 1.3 5.1 3.4 6.6V21l3.1-1.7c.8.2 1.6.3 2.5.3 5.2 0 9-3.5 9-8.2S17.2 3 12 3Z"/><path d="m7.8 13.4 3-3.2 2.3 2.4 3.2-3.4"/></svg>`,
  viber: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.5A12 12 0 0 1 20 17.5"/><path d="M7.5 8A8 8 0 0 1 16 16.5"/><path d="M8.5 11.5A4 4 0 0 1 12.5 15.5"/><path d="M6.2 6.5c-.7.4-1 1.4-.8 2.3 1 4.8 4.8 8.6 9.6 9.6.9.2 1.9-.1 2.3-.8l.6-1c.3-.5.2-1.2-.3-1.5l-2.1-1.3c-.5-.3-1.1-.2-1.5.2l-.7.8a8.3 8.3 0 0 1-4.2-4.2l.8-.7c.4-.4.5-1 .2-1.5L8.8 6.3c-.3-.5-1-.6-1.5-.3Z"/></svg>`,
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
