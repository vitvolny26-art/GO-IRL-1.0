const minSwipeDistance = 70;
const maxVerticalDrift = 80;

let startX = 0;
let startY = 0;
let tracking = false;

const bottomNavButtons = () => Array.from(document.querySelectorAll<HTMLButtonElement>(".bottom-nav button"));

const activeIndex = (buttons: HTMLButtonElement[]) => {
  const index = buttons.findIndex((button) => button.classList.contains("active") || button.getAttribute("aria-current") === "page");
  return index >= 0 ? index : 0;
};

const switchTab = (direction: "next" | "prev") => {
  if (document.querySelector(".activity-sheet, .sheet-backdrop, .go-irl-share-panel, .go-irl-time-placeholder")) return;

  const buttons = bottomNavButtons();
  if (buttons.length < 2) return;

  const current = activeIndex(buttons);
  const next = direction === "next"
    ? Math.min(current + 1, buttons.length - 1)
    : Math.max(current - 1, 0);

  if (next !== current) buttons[next].click();
};

export const enableBottomNavSwipe = () => {
  if (typeof window === "undefined") return;

  window.addEventListener("touchstart", (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    startX = touch.clientX;
    startY = touch.clientY;
    tracking = true;
  }, { passive: true });

  window.addEventListener("touchend", (event) => {
    if (!tracking) return;
    tracking = false;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - startX;
    const deltaY = touch.clientY - startY;

    if (Math.abs(deltaX) < minSwipeDistance) return;
    if (Math.abs(deltaY) > maxVerticalDrift) return;

    if (deltaX < 0) switchTab("next");
    if (deltaX > 0) switchTab("prev");
  }, { passive: true });
};
