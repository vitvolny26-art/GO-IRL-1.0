import { stripLeadingEmoji } from "./cardText";
import { getTranslation } from "./i18n";
import { useAppStore } from "./store";
import type { Activity, ActivityMember, Language } from "./types";

const normalizeText = (value: string | null | undefined) =>
  String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const currentLanguage = (): Language => {
  const visible = document.querySelector<HTMLElement>(".language-control span")?.textContent?.trim().toUpperCase();
  if (visible === "RU" || visible === "UK" || visible === "CS" || visible === "EN") return visible.toLowerCase() as Language;
  return useAppStore.getState().language;
};

const activityLabel = (activity: Activity, language: Language) =>
  normalizeText(stripLeadingEmoji(activity.activity[language] || activity.activity.en || activity.activity.ru));

const findActivityForCard = (card: HTMLElement, language: Language) => {
  const heading = normalizeText(card.querySelector("h3")?.textContent);
  const candidates = useAppStore.getState().activities.filter((activity) => activity.type === "sport" || activity.categoryId === "sport");
  return candidates.find((activity) => activityLabel(activity, language) === heading)
    || candidates.find((activity) => activityLabel(activity, language).includes(heading) || heading.includes(activityLabel(activity, language)))
    || null;
};

export const joinedParticipants = (activity: Activity): ActivityMember[] =>
  activity.members.filter((member) => member.status === "joined");

const closeAllDropdowns = (except?: HTMLElement) => {
  document.querySelectorAll<HTMLElement>(".runtime-card-participants-dropdown").forEach((dropdown) => {
    if (dropdown !== except) dropdown.hidden = true;
  });
  document.querySelectorAll<HTMLElement>(".runtime-participants-chip").forEach((chip) => {
    const dropdown = chip.parentElement?.querySelector<HTMLElement>(".runtime-card-participants-dropdown");
    chip.setAttribute("aria-expanded", dropdown && !dropdown.hidden ? "true" : "false");
  });
};

const initials = (name: string) => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0] || "").join("").toUpperCase() || "GI";

const renderDropdown = (dropdown: HTMLElement, activity: Activity, language: Language) => {
  const t = getTranslation(language);
  const members = joinedParticipants(activity);
  dropdown.replaceChildren();

  const header = document.createElement("div");
  header.className = "runtime-card-participants-header";
  const title = document.createElement("strong");
  title.textContent = t.participants;
  const count = document.createElement("span");
  count.textContent = `${activity.participants} / ${activity.capacity}`;
  header.append(title, count);
  dropdown.append(header);

  const list = document.createElement("div");
  list.className = "runtime-card-participants-list";
  if (!members.length) {
    const empty = document.createElement("p");
    empty.textContent = t.noParticipants;
    list.append(empty);
  } else {
    members.forEach((member) => {
      const row = document.createElement("div");
      row.className = "runtime-card-participant-row";
      const avatar = document.createElement("span");
      avatar.className = "runtime-card-participant-avatar";
      avatar.textContent = initials(member.name);
      const name = document.createElement("strong");
      name.textContent = member.name;
      row.append(avatar, name);
      list.append(row);
    });
  }
  dropdown.append(list);
};

const ensureDropdown = (chip: HTMLElement, card: HTMLElement, activity: Activity, language: Language) => {
  let dropdown = chip.parentElement?.querySelector<HTMLElement>(".runtime-card-participants-dropdown") || null;
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "runtime-card-participants-dropdown";
    dropdown.hidden = true;
    dropdown.setAttribute("role", "region");
    chip.parentElement?.append(dropdown);
  }
  renderDropdown(dropdown, activity, language);
  chip.setAttribute("aria-haspopup", "true");
  chip.setAttribute("aria-expanded", dropdown.hidden ? "false" : "true");
  card.classList.add("has-runtime-participants-dropdown");
  return dropdown;
};

const handleParticipantsClick = (event: Event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const chip = target.closest<HTMLElement>(".runtime-participants-chip");
  if (!chip) return;
  const card = chip.closest<HTMLElement>(".compact-sport-card");
  if (!card) return;
  const language = currentLanguage();
  const activity = findActivityForCard(card, language);
  if (!activity) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const dropdown = ensureDropdown(chip, card, activity, language);
  const opening = dropdown.hidden;
  closeAllDropdowns(dropdown);
  dropdown.hidden = !opening;
  chip.setAttribute("aria-expanded", opening ? "true" : "false");
};

export function enableCardParticipantsDropdown() {
  document.addEventListener("click", handleParticipantsClick, true);
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest(".runtime-participants-chip, .runtime-card-participants-dropdown")) return;
    closeAllDropdowns();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });
}
