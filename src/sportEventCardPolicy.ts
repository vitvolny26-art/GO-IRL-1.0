import { getTranslation } from "./i18n";
import { useAppStore } from "./store";
import type { Activity, Language, NewActivity, SportEnvironment, SportFormat, SportLevel, SportMetadata } from "./types";
import { sportEnvironmentLabel, sportFormatLabel, sportLevelLabel } from "./verticals/sport";

type Selection = { level?: SportLevel; format?: SportFormat; environment?: SportEnvironment };

const copy: Record<Language, { optional: string; required: string; choose: string }> = {
  ru: { optional: "Необязательно", required: "Обязательно", choose: "Выберите: на улице или в помещении" },
  uk: { optional: "Необов’язково", required: "Обов’язково", choose: "Оберіть: надворі або в приміщенні" },
  cs: { optional: "Volitelné", required: "Povinné", choose: "Vyberte: venku nebo uvnitř" },
  en: { optional: "Optional", required: "Required", choose: "Choose: outdoor or indoor" },
};

const norm = (value?: string | null) => String(value || "").normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().replace(/\s+/g, " ").trim();

const language = (): Language => {
  const code = document.querySelector<HTMLElement>(".language-control span")?.textContent?.trim().toLowerCase();
  return code === "ru" || code === "uk" || code === "cs" || code === "en"
    ? code
    : useAppStore.getState().language;
};

export const applySportFormSelection = (activity: NewActivity, selected: Selection): NewActivity => {
  if (activity.categoryId !== "sport" && activity.type !== "sport") return activity;
  const sport: SportMetadata = { ...(activity.metadata?.sport || {}) };
  if (selected.level) sport.level = selected.level; else delete sport.level;
  if (selected.format) sport.format = selected.format; else delete sport.format;
  if (selected.environment) sport.environment = selected.environment; else delete sport.environment;
  return { ...activity, metadata: { ...activity.metadata, sport } };
};

let pending: Selection | null = null;
let patched = false;

const patchWrites = () => {
  if (patched) return;
  patched = true;
  const { createActivity, updateActivity } = useAppStore.getState();
  useAppStore.setState({
    createActivity: async (activity: NewActivity) => {
      const selected = pending;
      pending = null;
      return createActivity(selected ? applySportFormSelection(activity, selected) : activity);
    },
    updateActivity: async (id: string, activity: NewActivity) => {
      const selected = pending;
      pending = null;
      return updateActivity(id, selected ? applySportFormSelection(activity, selected) : activity);
    },
  });
};

const option = (select: HTMLSelectElement, label: string, disabled = false) => {
  let empty = Array.from(select.options).find((item) => item.value === "");
  if (!empty) {
    empty = document.createElement("option");
    empty.value = "";
    select.prepend(empty);
  }
  if (empty.textContent !== label) empty.textContent = label;
  empty.disabled = disabled;
};

const marker = (select: HTMLSelectElement, text: string, kind: "optional" | "required") => {
  const label = select.closest<HTMLLabelElement>("label");
  const host = label?.querySelector(":scope > span");
  if (!host) return;
  let node = host.querySelector<HTMLElement>(`.sport-policy-${kind}-marker`);
  if (!node) {
    node = document.createElement("small");
    node.className = `sport-policy-field-marker sport-policy-${kind}-marker`;
    host.append(node);
  }
  if (node.textContent !== text) node.textContent = text;
};

const editingActivity = (form: HTMLFormElement, lang: Language) => {
  const title = norm(form.querySelector<HTMLInputElement>('input[name="titleText"]')?.defaultValue);
  if (!title) return null;
  return useAppStore.getState().activities.find((item: Activity) =>
    [item.title[lang], item.title.en, item.title.ru].some((value) => norm(value) === title)) || null;
};

const configureForm = (form: HTMLFormElement, lang: Language) => {
  const level = form.querySelector<HTMLSelectElement>('select[name="sportLevel"]');
  const format = form.querySelector<HTMLSelectElement>('select[name="sportFormat"]');
  const environment = form.querySelector<HTMLSelectElement>('select[name="sportEnvironment"]');
  if (!level || !format || !environment) return;

  option(level, copy[lang].optional);
  option(format, copy[lang].optional);
  option(environment, copy[lang].choose, true);
  level.required = false;
  format.required = false;
  environment.required = true;
  level.closest(".form-row")?.classList.add("sport-policy-optional-row");
  environment.closest(".form-row")?.classList.add("sport-policy-required-row");
  marker(level, copy[lang].optional, "optional");
  marker(format, copy[lang].optional, "optional");
  marker(environment, copy[lang].required, "required");

  if (environment.dataset.sportPolicyInitialized !== "true") {
    const sport = editingActivity(form, lang)?.metadata?.sport;
    level.value = sport?.level || "";
    format.value = sport?.format || "";
    environment.value = sport?.environment || "";
    level.dataset.sportPolicyInitialized = "true";
    format.dataset.sportPolicyInitialized = "true";
    environment.dataset.sportPolicyInitialized = "true";
  }
};

const selection = (form: HTMLFormElement): Selection | null => {
  const environment = form.querySelector<HTMLSelectElement>('select[name="sportEnvironment"]');
  if (!environment) return null;
  const level = form.querySelector<HTMLSelectElement>('select[name="sportLevel"]');
  const format = form.querySelector<HTMLSelectElement>('select[name="sportFormat"]');
  return {
    level: level?.value ? level.value as SportLevel : undefined,
    format: format?.value ? format.value as SportFormat : undefined,
    environment: environment.value ? environment.value as SportEnvironment : undefined,
  };
};

const activityForCard = (card: HTMLElement, lang: Language) => {
  const heading = norm(card.querySelector("h3")?.textContent);
  const subtitle = norm(card.querySelector(".sport-card-main p")?.textContent);
  const items = useAppStore.getState().activities.filter((item: Activity) =>
    item.type === "sport" || item.categoryId === "sport");
  return items.find((item: Activity) =>
    norm(item.activity[lang] || item.activity.en) === heading
    && norm(item.title[lang] || item.title.en) === subtitle)
    || items.find((item: Activity) => norm(item.activity[lang] || item.activity.en) === heading)
    || null;
};

const icon = (kind: "participants" | "chat") => {
  const paths = kind === "participants"
    ? ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", "M22 21v-2a4 4 0 0 0-3-3.87", "M16 3.13a4 4 0 0 1 0 7.75"]
    : ["M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"];
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths.map((path) => `<path d="${path}"></path>`).join("")}</svg>`;
};

const content = (button: HTMLElement, kind: "participants" | "chat", text: string) => {
  if (button.dataset.sportPolicyKind === kind && button.dataset.sportPolicyText === text) return;
  button.innerHTML = `${icon(kind)}<span>${text}</span>`;
  button.dataset.sportPolicyKind = kind;
  button.dataset.sportPolicyText = text;
};

const cardControls = (card: HTMLElement, activity: Activity, lang: Language) => {
  let stack = card.querySelector<HTMLElement>(".runtime-card-control-stack");
  if (!stack) {
    stack = document.createElement("div");
    stack.className = "runtime-card-control-stack";
    card.querySelector(".sport-card-top-actions")?.insertAdjacentElement("afterend", stack);
  }

  const originalParticipants = card.querySelector<HTMLButtonElement>(".sport-chip-row .runtime-participants-chip");
  if (originalParticipants) {
    originalParticipants.hidden = true;
    originalParticipants.tabIndex = -1;
    originalParticipants.setAttribute("aria-hidden", "true");
  }

  let participants = stack.querySelector<HTMLButtonElement>(".runtime-card-participants-control");
  if (!participants) {
    participants = document.createElement("button");
    participants.type = "button";
    participants.className = "runtime-card-stack-control runtime-card-participants-control runtime-participants-chip";
    stack.prepend(participants);
  }
  participants.setAttribute("aria-label", `${getTranslation(lang).participants}: ${activity.participants} / ${activity.capacity}`);
  content(participants, "participants", `${activity.participants}/${activity.capacity}`);

  const sourceUnread = card.querySelector<HTMLButtonElement>(".sport-card-top-actions > .event-chat-unread-alert");
  if (sourceUnread) {
    sourceUnread.hidden = true;
    sourceUnread.tabIndex = -1;
    sourceUnread.setAttribute("aria-hidden", "true");
  }

  let chat = stack.querySelector<HTMLButtonElement>(".runtime-card-chat-control");
  if (!useAppStore.getState().joinedIds.includes(activity.id)) {
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
      const unread = card.querySelector<HTMLButtonElement>(".sport-card-top-actions > .event-chat-unread-alert");
      if (unread) unread.click();
      else card.querySelector<HTMLButtonElement>(".compact-sport-actions .sport-coach-action")?.click();
    });
    stack.append(chat);
  }
  const unread = sourceUnread?.querySelector("span")?.textContent?.trim() || "";
  chat.setAttribute("aria-label", unread ? `${getTranslation(lang).cardOpenChat}: ${unread}` : getTranslation(lang).cardOpenChat);
  chat.classList.toggle("has-unread", Boolean(unread));
  content(chat, "chat", unread);
};

const metadata = (card: HTMLElement, activity: Activity, lang: Language) => {
  const row = card.querySelector<HTMLElement>(".sport-chip-row");
  if (!row) return;
  const sport = activity.metadata?.sport || {};
  const level = row.querySelector<HTMLElement>(".sport-level-chip");
  const environment = row.querySelector<HTMLElement>(".sport-environment-chip");
  const duration = row.querySelector<HTMLElement>(".sport-duration-chip");
  if (level) level.hidden = !sport.level;
  if (environment) environment.hidden = !sport.environment;
  if (duration) duration.hidden = !sport.durationMinutes;
  row.querySelector<HTMLElement>(".runtime-participants-chip")?.setAttribute("hidden", "");
  row.classList.add("sport-policy-metadata-row");
  row.setAttribute("aria-label", [
    sport.environment ? sportEnvironmentLabel(sport.environment, lang) : "",
    sport.durationMinutes ? String(sport.durationMinutes) : "",
    sport.level ? sportLevelLabel(sport.level, lang) : "",
    sport.format ? sportFormatLabel(sport.format, lang) : "",
  ].filter(Boolean).join(" | "));
};

const sheet = (lang: Language) => {
  const root = document.querySelector<HTMLElement>(".sport-sheet");
  const heading = norm(root?.querySelector("h2")?.textContent);
  if (!root || !heading) return;
  const activity = useAppStore.getState().activities.find((item: Activity) =>
    (item.type === "sport" || item.categoryId === "sport")
    && norm(item.title[lang] || item.title.en) === heading);
  if (!activity) return;
  const sport = activity.metadata?.sport || {};
  const chips = root.querySelectorAll<HTMLElement>(".sport-sheet-chips > span");
  if (chips[1]) chips[1].hidden = !sport.level;
  if (chips[2]) chips[2].hidden = !sport.environment;
  if (chips[3]) chips[3].hidden = !sport.durationMinutes;
  const format = root.querySelector<HTMLElement>(".sport-detail-list > div:first-child");
  if (format) format.hidden = !sport.format;
};

const apply = () => {
  const lang = language();
  document.querySelectorAll<HTMLFormElement>("form.create-form").forEach((form) => configureForm(form, lang));
  document.querySelectorAll<HTMLElement>(".compact-sport-card").forEach((card) => {
    const activity = activityForCard(card, lang);
    if (!activity) return;
    cardControls(card, activity, lang);
    metadata(card, activity, lang);
  });
  sheet(lang);
};

export function enableSportEventCardPolicy() {
  patchWrites();
  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const selected = selection(form);
    if (!selected) return;
    pending = selected;
    const captured = pending;
    window.setTimeout(() => { if (pending === captured) pending = null; }, 0);
  }, true);

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
