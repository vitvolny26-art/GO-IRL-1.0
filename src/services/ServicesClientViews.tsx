import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CircleUserRound, Compass, Heart, MapPin, Save, Sparkles } from "lucide-react";
import { getCity } from "../config/cities";
import type { Language } from "../types";
import { buildBeautyPublicProfile, type BeautyPublicProfile } from "../beauty/beautySetupModel";
import { loadBeautyWorkspace } from "../beauty/beautyWorkspaceStorage";
import "./services-client.css";

type ClientProfile = { name: string; preferences: string[] };

const profileKey = "go-irl-services-client-profile-v1";
const preferenceOptions = ["Маникюр", "Волосы", "Брови и ресницы", "Массаж", "Уход за лицом"];

const readProfile = (): ClientProfile => {
  try {
    const value = JSON.parse(localStorage.getItem(profileKey) || "{}") as Partial<ClientProfile>;
    return {
      name: typeof value.name === "string" ? value.name : "",
      preferences: Array.isArray(value.preferences) ? value.preferences.filter((item): item is string => typeof item === "string") : [],
    };
  } catch {
    return { name: "", preferences: [] };
  }
};

const copy = {
  ru: { forYou: "Для вас", forYouHint: "По предпочтениям в профиле", catalog: "Все мастера", profile: "Профиль клиента", name: "Имя", preferences: "Предпочтения", save: "Сохранить", saved: "Сохранено", empty: "Подходящих мастеров пока нет", catalogEmpty: "В выбранном городе пока нет мастеров" },
  uk: { forYou: "Для вас", forYouHint: "За вподобаннями у профілі", catalog: "Усі майстри", profile: "Профіль клієнта", name: "Ім’я", preferences: "Вподобання", save: "Зберегти", saved: "Збережено", empty: "Відповідних майстрів поки немає", catalogEmpty: "У вибраному місті поки немає майстрів" },
  cs: { forYou: "Pro vás", forYouHint: "Podle preferencí v profilu", catalog: "Všichni profesionálové", profile: "Profil klienta", name: "Jméno", preferences: "Preference", save: "Uložit", saved: "Uloženo", empty: "Zatím žádní odpovídající profesionálové", catalogEmpty: "Ve vybraném městě zatím nejsou profesionálové" },
  en: { forYou: "For you", forYouHint: "Based on your profile preferences", catalog: "All professionals", profile: "Client profile", name: "Name", preferences: "Preferences", save: "Save", saved: "Saved", empty: "No matching professionals yet", catalogEmpty: "No professionals in the selected city yet" },
} satisfies Record<Language, Record<string, string>>;

function useServicesClientData(language: Language, selectedCityId: string) {
  const [profile, setProfile] = useState<ClientProfile>(readProfile);
  const [professionals, setProfessionals] = useState<BeautyPublicProfile[]>([]);
  const city = getCity(selectedCityId);

  useEffect(() => {
    void loadBeautyWorkspace(language).then((workspace) => {
      const professional = buildBeautyPublicProfile(workspace);
      const selectedNames = Object.values(city.name).map((name) => name.toLocaleLowerCase());
      setProfessionals(workspace.published && selectedNames.includes(professional.city.toLocaleLowerCase()) ? [professional] : []);
    }).catch(() => setProfessionals([]));
  }, [city.name, language]);

  return { profile, setProfile, professionals, city };
}

function ProfessionalCards({ professionals, empty }: { professionals: BeautyPublicProfile[]; empty: string }) {
  if (!professionals.length) return <div className="services-client-empty"><Heart /><span>{empty}</span></div>;
  return <div className="services-professional-grid">{professionals.map((professional) => (
    <article className="services-professional-card" key={professional.publicLink}>
      <span className="services-professional-avatar">{professional.displayName.slice(0, 1).toUpperCase()}</span>
      <div><strong>{professional.displayName}</strong><span><MapPin />{professional.publicLocation}</span></div>
      <p>{professional.serviceName}</p>
      <b>{professional.priceCzk} Kč</b>
    </article>
  ))}</div>;
}

export function ServicesForYouView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const { profile, professionals } = useServicesClientData(language, selectedCityId);
  const text = copy[language];
  const matched = useMemo(() => professionals.filter((professional) => (
    profile.preferences.length === 0
    || profile.preferences.some((preference) => professional.serviceName.toLocaleLowerCase().includes(preference.toLocaleLowerCase()))
  )), [professionals, profile.preferences]);
  return <section className="page-section services-client-view"><div className="page-title"><Sparkles /><div><h1>{text.forYou}</h1><p>{text.forYouHint}</p></div></div><ProfessionalCards professionals={matched} empty={text.empty} /></section>;
}

export function ServicesCatalogView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const { professionals, city } = useServicesClientData(language, selectedCityId);
  const text = copy[language];
  return <section className="page-section services-client-view"><div className="page-title"><Compass /><div><h1>{text.catalog}</h1><p>{city.name[language]}</p></div></div><ProfessionalCards professionals={professionals} empty={text.catalogEmpty} /></section>;
}

export function ServicesClientProfileView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const { profile, setProfile, city } = useServicesClientData(language, selectedCityId);
  const [saved, setSaved] = useState(false);
  const text = copy[language];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next = { name: String(data.get("name") || "").trim(), preferences: data.getAll("preferences").map(String) };
    localStorage.setItem(profileKey, JSON.stringify(next));
    setProfile(next);
    setSaved(true);
  };
  return <section className="page-section services-client-view"><div className="page-title"><CircleUserRound /><div><h1>{text.profile}</h1><p>{city.name[language]}</p></div></div><form className="services-client-profile" onSubmit={submit}><label><span>{text.name}</span><input name="name" defaultValue={profile.name} /></label><fieldset><legend>{text.preferences}</legend>{preferenceOptions.map((option) => <label key={option}><input type="checkbox" name="preferences" value={option} defaultChecked={profile.preferences.includes(option)} /><span>{option}</span></label>)}</fieldset><button type="submit"><Save />{saved ? text.saved : text.save}</button></form></section>;
}
