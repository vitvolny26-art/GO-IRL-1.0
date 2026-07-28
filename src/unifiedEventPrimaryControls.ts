const restoreLegacyControls = () => {
  document.querySelectorAll<HTMLElement>(".runtime-card-control-stack").forEach((stack) => stack.remove());

  document.querySelectorAll<HTMLElement>(".sport-chip-row .runtime-participants-chip, .sport-chip-row .sport-card-participants-chip").forEach((button) => {
    button.hidden = false;
    button.removeAttribute("aria-hidden");
    if (button instanceof HTMLButtonElement) button.tabIndex = 0;
  });

  document.querySelectorAll<HTMLElement>(".sport-card-top-actions > .event-chat-unread-alert").forEach((button) => {
    button.hidden = false;
    button.removeAttribute("aria-hidden");
    if (button instanceof HTMLButtonElement) button.tabIndex = 0;
  });
};

export function enableUnifiedEventPrimaryControls() {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.queueMicrotask(() => {
      scheduled = false;
      restoreLegacyControls();
    });
  };

  const observer = new MutationObserver(schedule);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "aria-hidden"] });
  window.addEventListener("focus", schedule);
  schedule();
}
