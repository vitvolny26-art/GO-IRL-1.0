const restoreLegacyControls = (card: HTMLElement) => {
  card.querySelectorAll<HTMLElement>(".runtime-card-control-stack").forEach((stack) => stack.remove());

  const participant = card.querySelector<HTMLElement>(".sport-chip-row .sport-card-participants-chip, .sport-chip-row .runtime-participants-chip");
  if (participant) {
    participant.hidden = false;
    participant.removeAttribute("aria-hidden");
    participant.removeAttribute("tabindex");
  }

  const chat = card.querySelector<HTMLElement>(".sport-card-top-actions .event-chat-unread-alert");
  if (chat) {
    chat.hidden = false;
    chat.removeAttribute("aria-hidden");
    chat.removeAttribute("tabindex");
  }
};

const apply = () => {
  document.querySelectorAll<HTMLElement>(".unified-event-card").forEach(restoreLegacyControls);
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
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "aria-hidden"] });
  window.addEventListener("focus", schedule);
  schedule();
}
