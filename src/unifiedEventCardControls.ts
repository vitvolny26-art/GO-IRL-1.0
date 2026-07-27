import { getTranslation } from "./i18n";
import { useAppStore } from "./store";
import type { Activity, Language } from "./types";
import { stripLeadingEmoji } from "./cardText";

const normalize = (value: string | null | undefined) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .toLocaleLowerCase()
  .replace(/\s+/g, " ")
  .trim();

const language = (): Language => {
  const code = document.querySelector<HTMLElement>(".language-control span")?.textContent?.trim().toLowerCase();
  return code === "ru" || code === "uk" || code === "cs" || code === "en"
    ? code
    : useAppStore.getState().language;
};

const findActivity = (card: HTMLElement, lang: Language) => {
  const heading = normalize(card.querySelector("h3")?.textContent);
  const subtitle = normalize(card.querySelector(".sport-card-main p")?.textContent);
  const activities = useAppStore.getState().activities;
  return activities.find((activity) =>
    normalize(stripLeadingEmoji(activity.activity[lang] || activity.activity.en)) === heading
    && normalize(stripLeadingEmoji(activity.title[lang] || activity.title.en)) === subtitle)
    || activities.find((activity) => normalize(stripLeadingEmoji(activity.activity[lang] || activity.activity.en)) === heading)
    || null;
};

const icon = (kind: "participants" | "chat") => {
  const paths = kind === "participants"
    ? ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]
    : ["M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((path) => `<path d="${path}"></path>`).join("")}</svg>`;
};

const setContent = (button: HTMLElement, kind: "participants" | "chat", text: string) => {
  if (button.dataset.unifiedControl === kind && button.dataset.unifiedText === text) return;
  button.innerHTML = `${icon(kind)}<span>${text}</span>`;
  button.dataset.unifiedControl = kind;
  button.dataset.unifiedText = text;
};

const ensureControls = (card: HTMLElement, activity: Activity, lang: Language) => {
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
  participants.setAttribute("aria-label", `${getTranslation(lang).participants}: ${activity.participants} / ${activity.capacity}`);
  setContent(participants, "participants", `${activity.participants}/${activity.capacity}`);

  card.querySelectorAll<HTMLElement>(".sport-chip-row .sport-card-participants-chip").forEach((control) => {
    if (control !== participants) {
      control.hidden = true;
      control.setAttribute("aria-hidden", "true");
    }
  });

  let chat = stack.querySelector<HTMLButtonElement>(".runtime-card-chat-control");
  const joined = useAppStore.getState().joinedIds.includes(activity.id);
  if (!joined) {
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
  chat.setAttribute("aria-label", getTranslation(lang).cardOpenChat);
  setContent(chat, "chat", "");
};

const apply = () => {
  const lang = language();
  document.querySelectorAll<HTMLElement>(".unified-event-card").forEach((card) => {
    const activity = findActivity(card, lang);
    if (activity) ensureControls(card, activity, lang);
  });
};

export function enableUnifiedEventCardControls() {
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    window.queueMicrotask(() => {
      scheduled = false;
      apply();
    });
  };
  new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("focus", schedule);
  schedule();
}
