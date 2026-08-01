import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CircleUserRound, Compass, Heart, MapPin, Save, Sparkles } from "lucide-react";
import { getCity } from "../config/cities";
import type { Language } from "../types";
import {
  loadProfessionalDirectory,
  type ServicesProfessional,
} from "./servicesProfessionalDirectory";
import "./services-client.css";

type ClientProfile = { name: string; preferences: string[] };
type DirectoryState = "loading" | "ready" | "empty" | "error";

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
  ru: { forYou: "Для вас", forYouHint: "По предпочтениям в профиле", catalog: "Все мастера", profile: "Профиль клиента", name: "Имя", preferences: "Предпочтения", save: "Сохранить", saved: "Сохранено", empty: "Подходящих мастеров пока нет", catalogEmpty: "В выбранном городе пока нет мастеров", loading: "Загружаем мастеров…", error: "Каталог мастеров временно недоступен" },
  uk: { forYou: "Для вас", forYouHint: "За вподобаннями у профілі", catalog: "Усі майстри", profile: "Профіль клієнта", name: "Ім’я", preferences: "Вподобання", save: "Зберегти", saved: "Збережено", empty: "Відповідних майстрів поки немає", catalogEmpty: "У вибраному місті поки немає майстрів", loading: "Завантажуємо майстрів…", error: "Каталог майстрів тимчасово недоступний" },
  cs: { forYou: "Pro vás", forYouHint: "Podle preferencí v profilu", catalog: "Všichni profesionálové", profile: "Profil klienta", name: "Jméno", preferences: "Preference", save: "Uložit", saved: "Uloženo", empty: "Zatím žádní odpovídající profesionálové", catalogEmpty: "Ve vybraném městě zatím nejsou profesionálové", loading: "Načítáme profesionály…", error: "Katalog profesionálů je dočasně nedostupný" },
  en: { forYou: "For you", forYouHint: "Based on your profile preferences", catalog: "All professionals", profile: "Client profile", name: "Name", preferences: "Preferences", save: "Save", saved: "Saved", empty: "No matching professionals yet", catalogEmpty: "No professionals in the selected city yet", loading: "Loading professionals…", error: "The professional directory is temporarily unavailable" },
} satisfies Record<Language, Record<string, string>>;

function useProfessionalDirectory(selectedCityId: string) {
  const [professionals, setProfessionals] = useState<ServicesProfessional[]>([]);
  const [state, setState] = useState<DirectoryState>("loading");

  useEffect(() => {
    let active = true;
    setState("loading");
    void loadProfessionalDirectory(selectedCityId)
      .then((items) => {
        if (!active) return;
        setProfessionals(items);
        setState(items.length ? "ready" : "empty");
      })
      .catch(() => {
        if (!active) return;
        setProfessionals([]);
        setState("error");
      });
    return () => { active = false; };
  }, [selectedCityId]);

  return { professionals, state };
}

function ProfessionalCards({
  professionals,
  state,
  empty,
  loading,
  error,
}: {
  professionals: ServicesProfessional[];
  state: DirectoryState;
  empty: string;
  loading: string;
  error: string;
}) {
  if (state !== "ready") {
    const message = state === "loading" ? loading : state === "error" ? error : empty;
    return <div className="services-client-empty"><Heart /><span>{message}</span></div>;
  }
  return <div className="services-professional-grid">{professionals.map((professional) => (
    <article className="services-professional-card" key={professional.profileId}>
      <span className="services-professional-avatar">{professional.displayName.slice(0, 1).toUpperCase()}</span>
      <div><strong>{professional.displayName}</strong><span><MapPin />{professional.publicLocation}</span></div>
      <p>{professional.serviceName}</p>
      <b>{professional.priceCzk} {professional.currency}</b>
    </article>
  ))}</div>;
}

export function ServicesForYouView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const profile = useMemo(readProfile, []);
  const { professionals, state } = useProfessionalDirectory(selectedCityId);
  const text = copy[language];
  const matched = useMemo(() => professionals.filter((professional) => (
    profile.preferences.length === 0
    || profile.preferences.some((preference) => professional.serviceName.toLocaleLowerCase().includes(preference.toLocaleLowerCase()))
  )), [professionals, profile.preferences]);
  const matchedState = state === "ready" && matched.length === 0 ? "empty" : state;
  return <section className="page-section services-client-view"><div className="page-title"><Sparkles /><div><h1>{text.forYou}</h1><p>{text.forYouHint}</p></div></div><ProfessionalCards professionals={matched} state={matchedState} empty={text.empty} loading={text.loading} error={text.error} /></section>;
}

export function ServicesCatalogView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const { professionals, state } = useProfessionalDirectory(selectedCityId);
  const city = getCity(selectedCityId);
  const text = copy[language];
  return <section className="page-section services-client-view"><div className="page-title"><Compass /><div><h1>{text.catalog}</h1><p>{city.name[language]}</p></div></div><ProfessionalCards professionals={professionals} state={state} empty={text.catalogEmpty} loading={text.loading} error={text.error} /></section>;
}

export function ServicesClientProfileView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const [profile, setProfile] = useState<ClientProfile>(readProfile);
  const [saved, setSaved] = useState(false);
  const city = getCity(selectedCityId);
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
