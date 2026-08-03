import "./post-save-action-spacing.css";
import type { AppView } from "./types";

export const tabViews: AppView[] = ["home", "discover", "explore", "create", "profile"];

export const isTabSwipeBlockedTarget = (_target: EventTarget | null) => true;

export const resolveSwipeDirection = (_deltaX: number, _deltaY: number): "next" | "prev" | null => null;

export const resolveAdjacentTab = (view: AppView, direction: "next" | "prev") => {
  const current = tabViews.indexOf(view);
  if (current < 0) return view;
  const next = direction === "next"
    ? Math.min(current + 1, tabViews.length - 1)
    : Math.max(current - 1, 0);
  return tabViews[next];
};
