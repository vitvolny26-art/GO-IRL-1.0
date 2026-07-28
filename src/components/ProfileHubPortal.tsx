import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ProfilePanel, type ProfilePanelLabels } from "./ProfilePanel";
import type { ProfilePanelSection } from "../profile/profilePanelTypes";
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

const copy: Record<Language, ProfilePanelLabels> = {
  ru: {
    navigationLabel: "Разделы профиля",
    editingBlockedLabel: "Сначала завершите редактирование профиля",
    profile: "Личность",
    activities: "Мой GO IRL",
    preferences: "Предпочтения",
    notifications: "Уведомления",
    privacy: "Приватность",
    support: "Поддержка",
    diagnostics: "Диагностика",
  },
  uk: {
    navigationLabel: "Розділи профілю",
    editingBlockedLabel: "Спочатку завершіть редагування профілю",
    profile: "Особистість",
    activities: "Мій GO IRL",
    preferences: "Налаштування",
    notifications: "Сповіщення",
    privacy: "Приватність",
    support: "Підтримка",
    diagnostics: "Діагностика",
  },
  cs: {
    navigationLabel: "Sekce profilu",
    editingBlockedLabel: "Nejprve dokončete úpravu profilu",
    profile: "Identita",
    activities: "Moje GO IRL",
    preferences: "Předvolby",
    notifications: "Oznámení",
    privacy: "Soukromí",
    support: "Podpora",
    diagnostics: "Diagnostika",
  },
  en: {
    navigationLabel: "Profile sections",
    editingBlockedLabel: "Finish editing your profile first",
    profile: "Identity",
    activities: "My GO IRL",
    preferences: "Preferences",
    notifications: "Notifications",
    privacy: "Privacy",
    support: "Support",
    diagnostics: "Diagnostics",
  },
};

export function ProfileHubPortal() {
  const language = useAppStore((state) => state.language);
  const [target, setTarget] = useState<HTMLElement | null>(null);
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

  useEffect(() => {
    if (!target) return;
    target.classList.add("profile-hub-enabled");
    target.dataset.profilePanelSection = "profile";
    target.dataset.profileHubSection = "identity";
    return () => {
      target.classList.remove("profile-hub-enabled");
      delete target.dataset.profilePanelSection;
      delete target.dataset.profileHubSection;
    };
  }, [target]);

  if (!target) return null;

  return createPortal(
    <ProfilePanel
      labels={copy[language]}
      editing={editing}
      hasOwnerContext
      onSectionChange={(section) => {
        target.dataset.profilePanelSection = section;
        target.dataset.profileHubSection = panelToLegacySection[section];
      }}
      renderSection={() => null}
    />,
    target,
  );
}
