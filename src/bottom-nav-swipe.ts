import type { AppView } from "./types";

const minSwipeDistance = 70;
const maxVerticalDrift = 80;

export const tabViews: AppView[] = ["home", "discover", "explore", "create", "profile"];

export const isTabSwipeBlockedTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(
    ".horizontal-events, form, input, textarea, select, [contenteditable='true'], [data-no-tab-swipe]",
  ));

export const resolveSwipeDirection = (deltaX: number, deltaY: number): "next" | "prev" | null => {
  if (Math.abs(deltaX) < minSwipeDistance) return null;
  if (Math.abs(deltaY) > maxVerticalDrift || Math.abs(deltaY) >= Math.abs(deltaX)) return null;
  return deltaX < 0 ? "next" : "prev";
};

export const resolveAdjacentTab = (view: AppView, direction: "next" | "prev") => {
  const current = tabViews.indexOf(view);
  if (current < 0) return view;
  const next = direction === "next"
    ? Math.min(current + 1, tabViews.length - 1)
    : Math.max(current - 1, 0);
  return tabViews[next];
};
