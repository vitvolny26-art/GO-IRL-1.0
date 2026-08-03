import { stripLeadingEmoji } from "./cardText";
import { getTranslation } from "./i18n";
import { organizerInitials, resolveOrganizerIdentity } from "./profile/organizerIdentityResolver";
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

const activityTitle = (activity: Activity, language: Language) =>
  normalizeText(stripLeadingEmoji(activity.title[language] || activity.title.en || activity.title.ru));

const findActivityForCard = (card: HTMLElement, language: Language) => {
  const heading = normalizeText(card.querySelector("h3")?.textContent);
  const subtitle = normalizeText(card.querySelector(".sport-card-main p")?.textContent);
  const candidates = useAppStore.getState().activities;
  return candidates.find((activity) => activityLabel(activity, language) === heading && activityTitle(activity, language) === subtitle)
    || candidates.find((activity) => activityLabel(activity, language) === heading)
    || candidates.find((activity) => activityLabel(activity, language).includes(heading) || heading.includes(activityLabel(activity, language)))
    || null;
};

const findActivityForSheet = (sheet: HTMLElement, language: Language) => {
  const heading = normalizeText(sheet.querySelector("h2")?.textContent);
  if (!heading) return null;
  const candidates = useAppStore.getState().activities;
  return candidates.find((activity) => activityTitle(activity, language) === heading)
    || candidates.find((activity) => Object.values(activity.title).some((title) => normalizeText(title) === heading))
    || null;
};

export const joinedParticipants = (activity: Activity): ActivityMember[] =>
  activity.members.filter((member) => member.status === "joined");

const closeAllDropdowns = (except?: HTMLElement) => {
  document.querySelectorAll<HTMLElement>(".runtime-card-participants-dropdown, .runtime-sheet-participants-dropdown").forEach((dropdown) => {
    if (dropdown !== except) dropdown.hidden = true;
  });
  document.querySelectorAll<HTMLElement>(".runtime-participants-chip").forEach((chip) => {
    const dropdown = chip.parentElement?.querySelector<HTMLElement>(".runtime-card-participants-dropdown");
    chip.setAttribute("aria-expanded", dropdown && !dropdown.hidden ? "true" : "false");
  });
  document.querySelectorAll<HTMLElement>(".runtime-sheet-participants-dropdown").forEach((dropdown) => {
    const toggle = dropdown.previousElementSibling;
    if (toggle instanceof HTMLElement && toggle.matches(".detail-members-toggle")) {
      toggle.setAttribute("aria-expanded", dropdown.hidden ? "false" : "true");
    }
  });
};

const isImageAvatar = (value: string) => value.startsWith("data:image/") || /^https?:\/\//.test(value);

const loadParticipantIdentity = async (avatar: HTMLElement, name: HTMLElement, member: ActivityMember) => {
  const fallback = organizerInitials(member.name);
  avatar.textContent = fallback;
  name.textContent = member.name;
  const identity = await resolveOrganizerIdentity(member.userKey, member.name);
  if (!avatar.isConnected || !name.isConnected) return;

  name.textContent = identity.displayName || member.name;
  if (!isImageAvatar(identity.avatar)) {
    avatar.textContent = identity.avatar || fallback;
    return;
  }

  const image = document.createElement("img");
  image.alt = "";
  image.src = identity.avatar;
  image.addEventListener("error", () => image.replaceWith(fallback), { once: true });
  avatar.replaceChildren(image);
};

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
      const name = document.createElement("strong");
      name.textContent = member.name;
      row.append(avatar, name);
      list.append(row);
      void loadParticipantIdentity(avatar, name, member);
    });
  }
  dropdown.append(list);
};

const ensureCardDropdown = (chip: HTMLElement, card: HTMLElement, activity: Activity, language: Language) => {
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

const ensureSheetDropdown = (toggle: HTMLElement, activity: Activity, language: Language) => {
  const next = toggle.nextElementSibling;
  let dropdown: HTMLElement | null = next instanceof HTMLElement && next.matches(".runtime-sheet-participants-dropdown") ? next : null;
  if (!dropdown) {
    dropdown = document.createElement("div");
    dropdown.className = "runtime-sheet-participants-dropdown";
    dropdown.hidden = true;
    dropdown.setAttribute("role", "region");
    toggle.insertAdjacentElement("afterend", dropdown);
  }
  renderDropdown(dropdown, activity, language);
  toggle.setAttribute("aria-haspopup", "true");
  toggle.setAttribute("aria-expanded", dropdown.hidden ? "false" : "true");
  return dropdown;
};

const toggleDropdown = (trigger: HTMLElement, dropdown: HTMLElement) => {
  const opening = dropdown.hidden;
  closeAllDropdowns(dropdown);
  dropdown.hidden = !opening;
  trigger.setAttribute("aria-expanded", opening ? "true" : "false");
};

const handleParticipantsClick = (event: Event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;

  const chip = target.closest<HTMLElement>(".runtime-participants-chip");
  if (chip) {
    const card = chip.closest<HTMLElement>(".compact-sport-card");
    if (!card) return;
    const language = currentLanguage();
    const activity = findActivityForCard(card, language);
    if (!activity) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    toggleDropdown(chip, ensureCardDropdown(chip, card, activity, language));
    return;
  }

  const toggle = target.closest<HTMLElement>(".activity-sheet .detail-members-toggle");
  if (!toggle) return;
  const sheet = toggle.closest<HTMLElement>(".activity-sheet");
  if (!sheet) return;
  const language = currentLanguage();
  const activity = findActivityForSheet(sheet, language);
  if (!activity) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  toggleDropdown(toggle, ensureSheetDropdown(toggle, activity, language));
};

const removeCompetingChipListeners = () => {
  document.querySelectorAll<HTMLElement>(".runtime-participants-chip:not([data-participants-dropdown-ready])").forEach((chip) => {
    const clean = chip.cloneNode(true) as HTMLElement;
    clean.dataset.participantsDropdownReady = "true";
    chip.replaceWith(clean);
  });
};

export function enableCardParticipantsDropdown() {
  const observer = new MutationObserver(removeCompetingChipListeners);
  observer.observe(document.body, { childList: true, subtree: true });
  removeCompetingChipListeners();

  document.addEventListener("click", handleParticipantsClick, true);
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element) || target.closest(".runtime-participants-chip, .runtime-card-participants-dropdown, .detail-members-toggle, .runtime-sheet-participants-dropdown")) return;
    closeAllDropdowns();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });
}
