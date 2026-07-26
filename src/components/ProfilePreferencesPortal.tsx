import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Bell, CalendarDays, MapPin, Share2 } from "lucide-react";
import { useAppStore } from "../store";
import {
  readUserPreferences,
  updateUserPreferences,
  type CalendarProvider,
  type MapProvider,
  type ReminderProvider,
  type ShareProvider,
  type UserPreferences,
} from "../userPreferences";
import type { Language } from "../types";

const copy: Record<Language, { title: string; hint: string; automatic: string; unavailable: string; maps: string; calendar: string; share: string; reminders: string }> = {
  ru: { title: "Предпочтения", hint: "Выберите приложения по умолчанию. Сброс снова включает выбор при использовании.", automatic: "Спрашивать каждый раз", unavailable: "Недоступно", maps: "Карты", calendar: "Календарь", share: "Поделиться", reminders: "Напоминания" },
  uk: { title: "Налаштування", hint: "Оберіть програми за замовчуванням. Скидання знову вмикає вибір під час використання.", automatic: "Запитувати щоразу", unavailable: "Недоступно", maps: "Карти", calendar: "Календар", share: "Поділитися", reminders: "Нагадування" },
  cs: { title: "Předvolby", hint: "Vyberte výchozí aplikace. Reset znovu zobrazí volbu při použití.", automatic: "Vždy se zeptat", unavailable: "Nedostupné", maps: "Mapy", calendar: "Kalendář", share: "Sdílení", reminders: "Připomínky" },
  en: { title: "Preferences", hint: "Choose default apps. Reset shows the choice again when used.", automatic: "Ask every time", unavailable: "Unavailable", maps: "Maps", calendar: "Calendar", share: "Share", reminders: "Reminders" },
};

const mapOptions: Array<{ value: MapProvider; label: string }> = [
  { value: "google", label: "Google Maps" },
  { value: "apple", label: "Apple Maps" },
  { value: "mapy", label: "Mapy.com" },
];
const calendarOptions: Array<{ value: CalendarProvider; label: string }> = [
  { value: "google", label: "Google Calendar" },
  { value: "apple", label: "Apple Calendar" },
  { value: "outlook", label: "Outlook" },
];
const shareOptions: Array<{ value: ShareProvider; label: string; disabled?: boolean }> = [
  { value: "telegram", label: "Telegram" },
  { value: "messenger", label: "Messenger" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram", disabled: true },
];
const reminderOptions: Array<{ value: ReminderProvider; label: string; disabled?: boolean }> = [
  { value: "telegram", label: "Telegram" },
  { value: "messenger", label: "Messenger", disabled: true },
  { value: "whatsapp", label: "WhatsApp", disabled: true },
  { value: "instagram", label: "Instagram", disabled: true },
];

type PreferenceKey = "mapProvider" | "calendarProvider" | "shareProvider" | "reminderProvider";

type PreferenceRowProps = {
  icon: ReactNode;
  label: string;
  value: string | null | undefined;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  automatic: string;
  unavailable: string;
  onChange: (value: string | null) => void;
};

function PreferenceRow({ icon, label, value, options, automatic, unavailable, onChange }: PreferenceRowProps) {
  return (
    <label className="profile-preference-row">
      <span className="profile-preference-icon">{icon}</span>
      <span className="profile-preference-copy"><strong>{label}</strong></span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">{automatic}</option>
        {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}{option.disabled ? ` — ${unavailable}` : ""}</option>)}
      </select>
    </label>
  );
}

export function ProfilePreferencesPortal() {
  const language = useAppStore((state) => state.language);
  const [target, setTarget] = useState<Element | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(() => readUserPreferences());

  useEffect(() => {
    const locate = () => setTarget(document.querySelector(".profile-page"));
    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const refresh = () => setPreferences(readUserPreferences());
    window.addEventListener("storage", refresh);
    window.addEventListener("go-irl-user-preferences-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("go-irl-user-preferences-changed", refresh);
    };
  }, []);

  if (!target) return null;
  const labels = copy[language];
  const change = (key: PreferenceKey, value: string | null) => {
    setPreferences(updateUserPreferences({ [key]: value } as Partial<UserPreferences>));
  };

  return createPortal(
    <section className="profile-preferences" aria-labelledby="profile-preferences-title">
      <header><h2 id="profile-preferences-title">{labels.title}</h2><p>{labels.hint}</p></header>
      <div className="profile-preferences-list">
        <PreferenceRow icon={<MapPin />} label={labels.maps} value={preferences.mapProvider} options={mapOptions} automatic={labels.automatic} unavailable={labels.unavailable} onChange={(value) => change("mapProvider", value)} />
        <PreferenceRow icon={<CalendarDays />} label={labels.calendar} value={preferences.calendarProvider} options={calendarOptions} automatic={labels.automatic} unavailable={labels.unavailable} onChange={(value) => change("calendarProvider", value)} />
        <PreferenceRow icon={<Share2 />} label={labels.share} value={preferences.shareProvider} options={shareOptions} automatic={labels.automatic} unavailable={labels.unavailable} onChange={(value) => change("shareProvider", value)} />
        <PreferenceRow icon={<Bell />} label={labels.reminders} value={preferences.reminderProvider} options={reminderOptions} automatic={labels.automatic} unavailable={labels.unavailable} onChange={(value) => change("reminderProvider", value)} />
      </div>
    </section>,
    target,
  );
}
