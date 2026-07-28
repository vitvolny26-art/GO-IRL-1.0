import { getTranslation } from "./i18n";
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

const matchSportActivity = (card: HTMLElement, lang: Language) => {
  const heading = normalize(card.querySelector("h3")?.textContent);
  const subtitle = normalize(card.querySelector(".sport-card-main p")?.textContent);
  const candidates = useAppStore.getState().activities.filter((activity) =>
    activity.type === "sport" || activity.categoryId === "sport");
  return candidates.find((activity) =>
    normalize(activity.activity[lang] || activity.activity.en || activity.activity.ru) === heading
    && normalize(activity.title[lang] || activity.title.en || activity.title.ru) === subtitle)
    || candidates.find((activity) => normalize(activity.activity[lang] || activity.activity.en || activity.activity.ru) === heading)
    || null;
};

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "GI";

const renderMembers = (panel: HTMLElement, activity: Activity, lang: Language) => {
  const members = activity.members.filter((member) => member.status === "joined");
  panel.replaceChildren();
  if (!members.length) {
    const empty = document.createElement("div");
    empty.className = "sport-card-members-empty";
    empty.textContent = getTranslation(lang).noParticipants || "Пока никого нет";
    panel.append(empty);
    return;
  }
  members.forEach((member) => {
    const row = document.createElement("div");
    row.className = "sport-card-member-preview-row";
    const avatar = document.createElement("span");
    avatar.className = "sport-card-member-avatar";
    avatar.textContent = initials(member.name || "GO IRL User");
    const name = document.createElement("span");
    name.className = "sport-card-member-name";
    name.textContent = member.name || "GO IRL User";
    row.append(avatar, name);
    panel.append(row);
  });
};

const ensureLegacySportParticipants = (card: HTMLElement, activity: Activity, lang: Language) => {
  const row = card.querySelector<HTMLElement>(".sport-chip-row");
  if (!row) return;
  let button = row.querySelector<HTMLButtonElement>(".legacy-sport-participants");
  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.className = "sport-card-participants-chip legacy-sport-participants";
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg><span></span>';
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      let panel = card.querySelector<HTMLElement>(".legacy-sport-members-preview");
      if (!panel) {
        panel = document.createElement("div");
        panel.className = "sport-card-members-preview legacy-sport-members-preview";
        panel.hidden = true;
        card.append(panel);
      }
      renderMembers(panel, activity, lang);
      panel.hidden = !panel.hidden;
      button?.setAttribute("aria-expanded", panel.hidden ? "false" : "true");
    });
    row.prepend(button);
  }
  button.hidden = false;
  button.removeAttribute("aria-hidden");
  button.tabIndex = 0;
  button.querySelector("span")!.textContent = `${activity.participants} / ${activity.capacity}`;
  button.setAttribute("aria-label", `${getTranslation(lang).participants}: ${activity.participants} / ${activity.capacity}`);
};

const apply = () => {
  document.querySelectorAll<HTMLElement>(".runtime-card-control-stack").forEach((node) => node.remove());
  const lang = language();
  document.querySelectorAll<HTMLElement>(".compact-sport-card").forEach((card) => {
    const activity = matchSportActivity(card, lang);
    if (!activity) return;
    ensureLegacySportParticipants(card, activity, lang);
    card.querySelectorAll<HTMLElement>(".sport-level-chip, .sport-environment-chip").forEach((node) => { node.hidden = true; });
    const duration = card.querySelector<HTMLElement>(".sport-duration-chip");
    if (duration) duration.hidden = false;
  });
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
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  window.addEventListener("focus", schedule);
  schedule();
}
