import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Bell, CircleUserRound, Settings2, ShieldCheck } from "lucide-react";
import { transitionProfilePanel } from "../profile/profilePanelNavigation";
import type { ProfilePanelSection, ProfilePanelState } from "../profile/profilePanelTypes";
import { useAppStore } from "../store";
import type { Language } from "../types";

export type ProfileHubSection = "identity" | "preferences" | "my-go-irl" | "diagnostics";

export const profileHubSections: readonly ProfileHubSection[] = [
  "identity",
  "preferences",
  "my-go-irl",
  "diagnostics",
];

const panelToLegacySection: Readonly<Record<ProfilePanelSection, ProfileHubSection>> = {
  profile: "identity",
  activities: "my-go-irl",
  preferences: "preferences",
  notifications: "my-go-irl",
  privacy: "identity",
  support: "diagnostics",
  diagnostics: "diagnostics",
};

const copy: Record<Language, {
  title: string;
  hint: string;
  identity: string;
  identityHint: string;
  preferences: string;
  preferencesHint: string;
  myGoIrl: string;
  myGoIrlHint: string;
  diagnostics: string;
  diagnosticsHint: string;
  editing: string;
}> = {
  ru: {
    title: "Мой профиль",
    hint: "Управляйте личностью, приложениями по умолчанию и своей активностью GO IRL.",
    identity: "Личность",
    identityHint: "Имя, фото, город и интересы",
    preferences: "Предпочтения",
    preferencesHint: "Карты, календарь, отправка и напоминания",
    myGoIrl: "Мой GO IRL",
    myGoIrlHint: "Статистика, события и заявки",
    diagnostics: "Диагностика",
    diagnosticsHint: "Состояние синхронизации и выход в Telegram",
    editing: "Сначала завершите редактирование профиля",
  },
  uk: {
    title: "Мій профіль",
    hint: "Керуйте особистістю, типовими застосунками та своєю активністю GO IRL.",
    identity: "Особистість",
    identityHint: "Ім’я, фото, місто та інтереси",
    preferences: "Налаштування",
    preferencesHint: "Карти, календар, поширення та нагадування",
    myGoIrl: "Мій GO IRL",
    myGoIrlHint: "Статистика, події та заявки",
    diagnostics: "Діагностика",
    diagnosticsHint: "Стан синхронізації та повернення до Telegram",
    editing: "Спочатку завершіть редагування профілю",
  },
  cs: {
    title: "Můj profil",
    hint: "Spravujte identitu, výchozí aplikace a svou aktivitu v GO IRL.",
    identity: "Identita",
    identityHint: "Jméno, fotografie, město a zájmy",
    preferences: "Předvolby",
    preferencesHint: "Mapy, kalendář, sdílení a připomínky",
    myGoIrl: "Moje GO IRL",
    myGoIrlHint: "Statistiky, události a žádosti",
    diagnostics: "Diagnostika",
    diagnosticsHint: "Stav synchronizace a návrat do Telegramu",
    editing: "Nejprve dokončete úpravu profilu",
  },
  en: {
    title: "My profile",
    hint: "Manage identity, default apps and your GO IRL activity.",
    identity: "Identity",
    identityHint: "Name, photo, city and interests",
    preferences: "Preferences",
    preferencesHint: "Maps, calendar, sharing and reminders",
    myGoIrl: "My GO IRL",
    myGoIrlHint: "Stats, events and requests",
    diagnostics: "Diagnostics",
    diagnosticsHint: "Sync state and return to Telegram",
    editing: "Finish editing your profile first",
  },
};

export function ProfileHubPortal() {
  const language = useAppStore((state) => state.language);
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [panelSection, setPanelSection] = useState<ProfilePanelSection>("profile");
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const locate = () => setTarget(document.querySelector<HTMLElement>(".profile-page"));
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!target) return;
    const sync = () => setEditing(target.classList.contains("is-editing"));
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(target, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [target]);

  const legacySection = panelToLegacySection[panelSection];

  useEffect(() => {
    if (!target) return;
    target.classList.add("profile-hub-enabled");
    target.dataset.profileHubSection = legacySection;
    target.dataset.profilePanelSection = panelSection;
    return () => {
      target.classList.remove("profile-hub-enabled");
      delete target.dataset.profileHubSection;
      delete target.dataset.profilePanelSection;
    };
  }, [legacySection, panelSection, target]);

  if (!target) return null;
  const labels = copy[language];
  const items: Array<{ id: ProfilePanelSection; icon: ReactNode; label: string; hint: string }> = [
    { id: "profile", icon: <CircleUserRound />, label: labels.identity, hint: labels.identityHint },
    { id: "preferences", icon: <Settings2 />, label: labels.preferences, hint: labels.preferencesHint },
    { id: "activities", icon: <Bell />, label: labels.myGoIrl, hint: labels.myGoIrlHint },
    { id: "diagnostics", icon: <ShieldCheck />, label: labels.diagnostics, hint: labels.diagnosticsHint },
  ];

  const selectSection = (requested: ProfilePanelSection) => {
    const current: ProfilePanelState = { activeSection: panelSection, editing };
    const next = transitionProfilePanel(current, requested, true);
    setPanelSection(next.activeSection);
  };

  return createPortal(
    <nav className="profile-hub-navigation" aria-label={labels.title} data-profile-panel-bridge="legacy">
      <header>
        <h2>{labels.title}</h2>
        <p>{labels.hint}</p>
      </header>
      <div className="profile-hub-grid">
        {items.map((item) => (
          <button
            key={item.id}
            className={panelSection === item.id ? "profile-hub-card is-active" : "profile-hub-card"}
            type="button"
            aria-current={panelSection === item.id ? "page" : undefined}
            disabled={editing && item.id !== "profile"}
            title={editing && item.id !== "profile" ? labels.editing : undefined}
            onClick={() => selectSection(item.id)}
          >
            <span className="profile-hub-card-icon">{item.icon}</span>
            <span><strong>{item.label}</strong><small>{item.hint}</small></span>
          </button>
        ))}
      </div>
    </nav>,
    target,
  );
}
