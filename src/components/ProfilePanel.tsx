import { useEffect, useState, type ReactNode } from "react";
import { Bell, CircleUserRound, Settings2, ShieldCheck } from "lucide-react";
import {
  defaultProfilePanelSection,
  profilePanelSections,
  transitionProfilePanel,
} from "../profile/profilePanelNavigation";
import type { ProfilePanelSection, ProfilePanelState } from "../profile/profilePanelTypes";
import type { Language } from "../types";

type ProfilePanelCopy = {
  title: string;
  hint: string;
  editing: string;
  sections: Record<ProfilePanelSection, { label: string; hint: string }>;
};

const copy: Record<Language, ProfilePanelCopy> = {
  ru: {
    title: "Мой профиль",
    hint: "Управляйте личностью, приложениями по умолчанию и своей активностью GO IRL.",
    editing: "Сначала завершите редактирование профиля",
    sections: {
      identity: { label: "Личность", hint: "Имя, фото, город и интересы" },
      preferences: { label: "Предпочтения", hint: "Карты, календарь, отправка и напоминания" },
      "my-go-irl": { label: "Мой GO IRL", hint: "Статистика, события и заявки" },
      diagnostics: { label: "Диагностика", hint: "Состояние синхронизации и выход в Telegram" },
    },
  },
  uk: {
    title: "Мій профіль",
    hint: "Керуйте особистістю, типовими застосунками та своєю активністю GO IRL.",
    editing: "Спочатку завершіть редагування профілю",
    sections: {
      identity: { label: "Особистість", hint: "Ім’я, фото, місто та інтереси" },
      preferences: { label: "Налаштування", hint: "Карти, календар, поширення та нагадування" },
      "my-go-irl": { label: "Мій GO IRL", hint: "Статистика, події та заявки" },
      diagnostics: { label: "Діагностика", hint: "Стан синхронізації та повернення до Telegram" },
    },
  },
  cs: {
    title: "Můj profil",
    hint: "Spravujte identitu, výchozí aplikace a svou aktivitu v GO IRL.",
    editing: "Nejprve dokončete úpravu profilu",
    sections: {
      identity: { label: "Identita", hint: "Jméno, fotografie, město a zájmy" },
      preferences: { label: "Předvolby", hint: "Mapy, kalendář, sdílení a připomínky" },
      "my-go-irl": { label: "Moje GO IRL", hint: "Statistiky, události a žádosti" },
      diagnostics: { label: "Diagnostika", hint: "Stav synchronizace a návrat do Telegramu" },
    },
  },
  en: {
    title: "My profile",
    hint: "Manage identity, default apps and your GO IRL activity.",
    editing: "Finish editing your profile first",
    sections: {
      identity: { label: "Identity", hint: "Name, photo, city and interests" },
      preferences: { label: "Preferences", hint: "Maps, calendar, sharing and reminders" },
      "my-go-irl": { label: "My GO IRL", hint: "Stats, events and requests" },
      diagnostics: { label: "Diagnostics", hint: "Sync state and return to Telegram" },
    },
  },
};

const icons: Record<ProfilePanelSection, ReactNode> = {
  identity: <CircleUserRound />,
  preferences: <Settings2 />,
  "my-go-irl": <Bell />,
  diagnostics: <ShieldCheck />,
};

type ProfilePanelProps = {
  language: Language;
  editing: boolean;
  renderSection: (section: ProfilePanelSection) => ReactNode;
  onSectionChange?: (section: ProfilePanelSection) => void;
};

export function ProfilePanel({
  language,
  editing,
  renderSection,
  onSectionChange,
}: ProfilePanelProps) {
  const [activeSection, setActiveSection] = useState<ProfilePanelSection>(
    defaultProfilePanelSection,
  );
  const labels = copy[language];

  useEffect(() => {
    if (editing && activeSection !== defaultProfilePanelSection) {
      setActiveSection(defaultProfilePanelSection);
      onSectionChange?.(defaultProfilePanelSection);
    }
  }, [activeSection, editing, onSectionChange]);

  const selectSection = (requested: ProfilePanelSection) => {
    const current: ProfilePanelState = { activeSection, editing };
    const next = transitionProfilePanel(current, requested);
    if (next.activeSection === activeSection) return;
    setActiveSection(next.activeSection);
    onSectionChange?.(next.activeSection);
  };

  return (
    <div className="profile-panel" data-profile-panel-section={activeSection}>
      <header className="profile-panel-header">
        <h2>{labels.title}</h2>
        <p>{labels.hint}</p>
      </header>
      <nav className="profile-panel-navigation" aria-label={labels.title}>
        {profilePanelSections.map(({ id }) => {
          const blocked = editing && id !== defaultProfilePanelSection;
          return (
            <button
              key={id}
              className={activeSection === id ? "profile-panel-card is-active" : "profile-panel-card"}
              type="button"
              aria-current={activeSection === id ? "page" : undefined}
              disabled={blocked}
              title={blocked ? labels.editing : undefined}
              onClick={() => selectSection(id)}
            >
              <span className="profile-panel-card-icon">{icons[id]}</span>
              <span>
                <strong>{labels.sections[id].label}</strong>
                <small>{labels.sections[id].hint}</small>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="profile-panel-content" data-profile-panel-content={activeSection}>
        {renderSection(activeSection)}
      </div>
    </div>
  );
}
