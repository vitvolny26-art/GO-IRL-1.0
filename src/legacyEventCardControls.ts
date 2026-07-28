import { getCurrentChatIdentity, loadActivityChatMessages } from "./activityChatFeature";
import { activityChatUnreadChangedEvent, countUnreadActivityChatMessages, loadActivityChatReadAt } from "./activityChatUnread";
import { stripLeadingEmoji } from "./cardText";
import { useAppStore } from "./store";
import type { Activity, Language } from "./types";

const normalize = (value: string | null | undefined) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const language = (): Language => {
  const visible = document.querySelector<HTMLElement>(".language-control span")?.textContent?.trim().toLowerCase();
  return visible === "ru" || visible === "uk" || visible === "cs" || visible === "en"
    ? visible
    : useAppStore.getState().language;
};

const matchActivity = (card: HTMLElement, currentLanguage: Language) => {
  const heading = normalize(card.querySelector("h3")?.textContent);
  const subtitle = normalize(card.querySelector(".sport-card-main p")?.textContent);
  return useAppStore.getState().activities.find((activity: Activity) =>
    normalize(stripLeadingEmoji(activity.activity[currentLanguage] || activity.activity.en || activity.activity.ru)) === heading
    && normalize(stripLeadingEmoji(activity.title[currentLanguage] || activity.title.en || activity.title.ru)) === subtitle)
    || useAppStore.getState().activities.find((activity: Activity) =>
      normalize(stripLeadingEmoji(activity.activity[currentLanguage] || activity.activity.en || activity.activity.ru)) === heading)
    || null;
};

const chatIcon = () => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"></path></svg>';

const ensureLegacyChat = async (card: HTMLElement, activity: Activity) => {
  const topActions = card.querySelector<HTMLElement>(".sport-card-top-actions");
  if (!topActions || !useAppStore.getState().joinedIds.includes(activity.id)) return;
  if (card.dataset.legacyChatRefresh === "true") return;
  card.dataset.legacyChatRefresh = "true";

  try {
    const [identity, messages] = await Promise.all([
      getCurrentChatIdentity(),
      loadActivityChatMessages(activity.id),
    ]);
    const unread = countUnreadActivityChatMessages(messages, identity.userKey, loadActivityChatReadAt(activity.id, identity.userKey));
    let button = topActions.querySelector<HTMLButtonElement>(".event-chat-unread-alert");
    if (!unread) {
      button?.remove();
      return;
    }
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "event-chat-unread-alert legacy-event-chat-alert";
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        card.querySelector<HTMLButtonElement>(".compact-sport-actions .sport-coach-action")?.click();
      });
      topActions.append(button);
    }
    button.hidden = false;
    button.removeAttribute("aria-hidden");
    button.setAttribute("aria-label", `Непрочитанные сообщения: ${unread}`);
    button.innerHTML = `${chatIcon()}<span>${unread > 99 ? "99+" : unread}</span>`;
  } catch {
    // Leave the card usable when unread state cannot be loaded.
  } finally {
    delete card.dataset.legacyChatRefresh;
  }
};

const restoreLegacyControls = (card: HTMLElement, currentLanguage: Language) => {
  card.querySelectorAll<HTMLElement>(".runtime-card-control-stack").forEach((stack) => stack.remove());

  const participant = card.querySelector<HTMLElement>(".sport-chip-row .sport-card-participants-chip, .sport-chip-row .runtime-participants-chip");
  if (participant) {
    participant.hidden = false;
    participant.removeAttribute("aria-hidden");
    participant.removeAttribute("tabindex");
  }

  const activity = matchActivity(card, currentLanguage);
  if (activity) void ensureLegacyChat(card, activity);
};

const apply = () => {
  const currentLanguage = language();
  document.querySelectorAll<HTMLElement>(".unified-event-card").forEach((card) => restoreLegacyControls(card, currentLanguage));
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
  window.addEventListener(activityChatUnreadChangedEvent, schedule);
  schedule();
}
