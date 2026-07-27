import { stripLeadingEmoji } from "./cardText";
import { getTranslation } from "./i18n";
import { useAppStore } from "./store";
import type { Activity, Language } from "./types";

const normalize = (value: string | null | undefined) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const currentLanguage = (): Language => {
  const visible = document.querySelector<HTMLElement>(".language-control span")?.textContent?.trim().toLowerCase();
  return visible === "ru" || visible === "uk" || visible === "cs" || visible === "en"
    ? visible
    : useAppStore.getState().language;
};

const matchActivity = (card: HTMLElement, language: Language) => {
  const heading = normalize(card.querySelector("h3")?.textContent);
  const subtitle = normalize(card.querySelector(".sport-card-main p")?.textContent);
  const activities = useAppStore.getState().activities;
  return activities.find((activity: Activity) =>
    normalize(stripLeadingEmoji(activity.activity[language] || activity.activity.en || activity.activity.ru)) === heading
    && normalize(stripLeadingEmoji(activity.title[language] || activity.title.en || activity.title.ru)) === subtitle)
    || activities.find((activity: Activity) =>
      normalize(stripLeadingEmoji(activity.activity[language] || activity.activity.en || activity.activity.ru)) === heading)
    || null;
};

const icon = (kind: "participants" | "chat") => {
  const paths = kind === "participants"
    ? ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]
    : ["M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((path) => `<path d="${path}"></path>`).join("")}</svg>`;
};

const setContent = (button: HTMLElement, kind: "participants" | "chat", text: string) => {
  const key = `${kind}:${text}`;
  if (button.dataset.unifiedPrimaryControl === key) return;
  button.innerHTML = `${icon(kind)}<span>${text}</span>`;
  button.dataset.unifiedPrimaryControl = key;
};

const ensureControls = (card: HTMLElement, activity: Activity, language: Language) => {
  let stack = card.querySelector<HTMLElement>(".runtime-card-control-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "runtime-card-control-stack";
    card.querySelector(".sport-card-top-actions")?.insertAdjacentElement("afterend", stack);
  }

  let participants = stack.querySelector<HTMLButtonElement>(".runtime-card-participants-control");
  if (!participants) {
    participants = document.createElement("button");
    participants.type = "button";
    participants.className = "runtime-card-stack-control runtime-card-participants-control runtime-participants-chip";
    stack.prepend(participants);
  }
  participants.setAttribute("aria-label", `${getTranslation(language).participants}: ${activity.participants} / ${activity.capacity}`);
  setContent(participants, "participants", `${activity.participants}/${activity.capacity}`);

  const originalParticipants = card.querySelector<HTMLElement>(".sport-chip-row .sport-card-participants-chip");
  if (originalParticipants && originalParticipants !== participants) {
    originalParticipants.hidden = true;
    originalParticipants.setAttribute("aria-hidden", "true");
  }

  let chat = stack.querySelector<HTMLButtonElement>(".runtime-card-chat-control");
  const hasChatAccess = useAppStore.getState().joinedIds.includes(activity.id);
  if (!hasChatAccess) {
    chat?.remove();
    return;
  }
  if (!chat) {
    chat = document.createElement("button");
    chat.type = "button";
    chat.className = "runtime-card-stack-control runtime-card-chat-control";
    chat.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      card.querySelector<HTMLButtonElement>(".compact-sport-actions .sport-coach-action")?.click();
    });
    stack.append(chat);
  }
  chat.setAttribute("aria-label", getTranslation(language).cardOpenChat);
  setContent(chat, "chat", "");
};

const apply = () => {
  const language = currentLanguage();
  document.querySelectorAll<HTMLElement>(".unified-event-card").forEach((card) => {
    const activity = matchActivity(card, language);
    if (activity) ensureControls(card, activity, language);
  });
};

export function enableUnifiedEventPrimaryControls() {
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
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("focus", schedule);
  schedule();
}
