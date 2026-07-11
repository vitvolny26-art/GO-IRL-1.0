const minSwipeDistance = 70;
const maxVerticalDrift = 80;

let startX = 0;
let startY = 0;
let tracking = false;
let enabled = false;

const blockedSwipeTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(
    ".horizontal-events, input, textarea, select, [contenteditable='true'], [data-no-tab-swipe]",
  ));

export const resolveSwipeDirection = (deltaX: number, deltaY: number): "next" | "prev" | null => {
  if (Math.abs(deltaX) < minSwipeDistance) return null;
  if (Math.abs(deltaY) > maxVerticalDrift || Math.abs(deltaY) >= Math.abs(deltaX)) return null;
  return deltaX < 0 ? "next" : "prev";
};

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
  if (typeof window === "undefined" || enabled) return;
  enabled = true;

  window.addEventListener("touchstart", (event) => {
    if (blockedSwipeTarget(event.target)) {
      tracking = false;
      return;
    }
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

    const direction = resolveSwipeDirection(deltaX, deltaY);
    if (direction) switchTab(direction);
  }, { passive: true });
};
