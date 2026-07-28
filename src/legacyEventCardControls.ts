const restoreCardControls = (card: HTMLElement) => {
  card.querySelectorAll<HTMLElement>(".runtime-card-control-stack").forEach((node) => node.remove());

  const participants = card.querySelector<HTMLElement>(".sport-chip-row .runtime-participants-chip, .sport-chip-row .sport-card-participants-chip");
  if (participants) {
    participants.hidden = false;
    participants.removeAttribute("hidden");
    participants.removeAttribute("aria-hidden");
    if (participants instanceof HTMLButtonElement) participants.tabIndex = 0;
  }

  const legacyChat = card.querySelector<HTMLElement>(".sport-card-top-actions > .event-chat-unread-alert");
  if (legacyChat) {
    legacyChat.hidden = false;
    legacyChat.removeAttribute("hidden");
    legacyChat.removeAttribute("aria-hidden");
    if (legacyChat instanceof HTMLButtonElement) legacyChat.tabIndex = 0;
  }

  card.querySelectorAll<HTMLElement>(".runtime-card-chat-control, .runtime-card-participants-control").forEach((node) => node.remove());

  if (!card.classList.contains("compact-sport-card")) return;
  card.querySelectorAll<HTMLElement>(".sport-level-chip, .sport-environment-chip").forEach((node) => {
    node.hidden = true;
    node.setAttribute("aria-hidden", "true");
  });

  const duration = card.querySelector<HTMLElement>(".sport-duration-chip");
  if (duration) {
    duration.hidden = false;
    duration.removeAttribute("hidden");
    duration.removeAttribute("aria-hidden");
  }
};

const apply = () => {
  document.querySelectorAll<HTMLElement>(".unified-event-card").forEach(restoreCardControls);
};

export function enableLegacyEventCardControls() {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.queueMicrotask(() => {
      scheduled = false;
      apply();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "aria-hidden", "class"] });
  window.addEventListener("focus", schedule);
  schedule();
}
