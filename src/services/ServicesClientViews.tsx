import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ChevronDown, CircleUserRound, Clock3, Compass, Heart, MapPin, Save, Search, Share2, Sparkles, X } from "lucide-react";
import { getCity } from "../config/cities";
import type { Language } from "../types";
import {
  loadProfessionalDirectory,
  type ServicesProfessional,
} from "./servicesProfessionalDirectory";
import { getServiceArtwork, manicureArtwork } from "./serviceArtwork";
import "./services-client.css";
import "./service-artwork.css";

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
    <ProfessionalCard key={professional.profileId} professional={professional} />
  ))}</div>;
}

function ProfessionalCard({ professional }: { professional: ServicesProfessional }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = () => setExpanded((current) => !current);
  const artwork = getServiceArtwork(professional.serviceName);
  const share = async () => {
    const url = new URL(professional.publicLink, window.location.origin).toString();
    if (navigator.share) {
      const data: ShareData = { title: `${professional.displayName} · ${professional.serviceName}`, url };
      if (artwork && navigator.canShare) {
        try {
          const response = await fetch(artwork.share);
          const file = new File([await response.blob()], "s-01-manicure.webp", { type: "image/webp" });
          if (navigator.canShare({ files: [file] })) data.files = [file];
        } catch { /* Link sharing remains available when the image cannot be loaded. */ }
      }
      await navigator.share(data);
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  return <article className={expanded ? "services-professional-card is-expanded" : "services-professional-card"}>
    <div className="services-professional-artwork" aria-hidden="true">
      {artwork ? <img src={artwork.sheet} alt="" decoding="async" /> : <span>{professional.displayName.slice(0, 1).toUpperCase()}</span>}
    </div>
    <button className="services-professional-main" type="button" onClick={toggle} aria-expanded={expanded}>
      <strong>{professional.displayName}</strong>
      <span>{professional.serviceName}</span>
    </button>
    <button className="services-professional-expand" type="button" onClick={toggle} aria-label={expanded ? "Закрыть подробности" : "Открыть подробности"} aria-expanded={expanded}>
      {expanded ? <X /> : <ChevronDown />}
    </button>
    <div className="services-professional-summary">
      <span><Clock3 />{professional.durationMinutes} мин</span>
      <span><b>{professional.priceCzk}</b> {professional.currency}</span>
    </div>
    {expanded && <div className="services-professional-details">
      <div><MapPin /><span>{professional.publicLocation}</span></div>
      <div><Clock3 /><span>{professional.serviceName} · {professional.durationMinutes} мин</span></div>
      {artwork && <img className="services-professional-portfolio" src={artwork.portfolio} alt="" decoding="async" />}
      <button className="services-professional-share" type="button" onClick={() => { void share().catch(() => undefined); }}><Share2 />Поделиться</button>
      <button type="button" onClick={toggle}>Свернуть карточку</button>
    </div>}
  </article>;
}

function ProfessionalSection({ title, professionals }: { title: string; professionals: ServicesProfessional[] }) {
  if (!professionals.length) return null;
  return <section className="discover-section"><div className="section-title"><h2>{title}</h2></div><ProfessionalCards professionals={professionals} state="ready" empty="" loading="" error="" /></section>;
}

export function ServicesForYouView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const profile = useMemo(readProfile, []);
  const { professionals, state } = useProfessionalDirectory(selectedCityId);
  const text = copy[language];
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [locationState, setLocationState] = useState<"idle" | "ready" | "blocked">("idle");
  const interestMatches = useMemo(() => professionals.filter((professional) => (
    profile.preferences.length === 0
    || profile.preferences.some((preference) => professional.serviceName.toLocaleLowerCase().includes(preference.toLocaleLowerCase()))
  )), [professionals, profile.preferences]);
  const matched = useMemo(() => professionals.filter((professional) => {
    const service = professional.serviceName.toLocaleLowerCase();
    const searchValue = `${professional.displayName} ${service} ${professional.publicLocation}`.toLocaleLowerCase();
    return searchValue.includes(query.trim().toLocaleLowerCase()) && activeFilters.every((filter) => service.includes(filter.toLocaleLowerCase()));
  }), [activeFilters, professionals, query]);
  const matchedState = state === "ready" && matched.length === 0 ? "empty" : state;
  const labels = language === "ru"
    ? { search: "Найти мастера или услугу", filters: "Быстрые фильтры", matched: "Подходит вам", interests: "По вашим интересам", nearest: "Ближайшие мастера", newest: "Новые мастера", nearMe: "Рядом со мной", location: "Включить геолокацию", blocked: "Не удалось получить геолокацию" }
    : language === "uk"
      ? { search: "Знайти майстра або послугу", filters: "Швидкі фільтри", matched: "Підходить вам", interests: "За вашими інтересами", nearest: "Найближчі майстри", newest: "Нові майстри", nearMe: "Поруч зі мною", location: "Увімкнути геолокацію", blocked: "Не вдалося отримати геолокацію" }
      : language === "cs"
        ? { search: "Najít profesionála nebo službu", filters: "Rychlé filtry", matched: "Pro vás", interests: "Podle vašich zájmů", nearest: "Nejbližší profesionálové", newest: "Noví profesionálové", nearMe: "V mém okolí", location: "Povolit polohu", blocked: "Polohu se nepodařilo získat" }
        : { search: "Find a professional or service", filters: "Quick filters", matched: "Matched for you", interests: "Based on your interests", nearest: "Nearest professionals", newest: "New professionals", nearMe: "Near me", location: "Enable location", blocked: "Location is unavailable" };
  const newest = [...professionals].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
  const toggleFilter = (filter: string) => setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  const enableLocation = () => {
    if (!navigator.geolocation) return setLocationState("blocked");
    navigator.geolocation.getCurrentPosition(() => setLocationState("ready"), () => setLocationState("blocked"), { maximumAge: 300_000, timeout: 5000 });
  };
  return <section className="page-section services-client-view discover-page">
    <div className="page-title"><Sparkles /><div><h1>{text.forYou}</h1><p>{text.forYouHint}</p></div></div>
    <label className="discover-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} /></label>
    <div className="discover-filter-block"><span>{labels.filters}</span><div className="filter-row discover-filters">{preferenceOptions.map((filter) => <button className={activeFilters.includes(filter) ? "filter active" : "filter"} key={filter} onClick={() => toggleFilter(filter)} type="button">{filter === "Маникюр" && <img className="service-filter-icon" src={manicureArtwork.icon} alt="" />}{filter}</button>)}</div></div>
    {(query || activeFilters.length > 0) && <section className="discover-section"><div className="section-title"><h2>{labels.matched}</h2></div><ProfessionalCards professionals={matched} state={matchedState} empty={text.empty} loading={text.loading} error={text.error} /></section>}
    {state !== "ready" ? <ProfessionalCards professionals={[]} state={state} empty={text.empty} loading={text.loading} error={text.error} /> : <>
      <ProfessionalSection title={labels.interests} professionals={interestMatches.slice(0, 8)} />
      <ProfessionalSection title={labels.nearest} professionals={professionals.slice(0, 8)} />
      <ProfessionalSection title={labels.newest} professionals={newest} />
      <section className="discover-section"><div className="section-title discover-section-title"><MapPin /><h2>{labels.nearMe}</h2>{locationState === "idle" && <button onClick={enableLocation} type="button">{labels.location}</button>}</div>{locationState === "blocked" && <div className="nearby-note">{labels.blocked}</div>}{locationState === "ready" && <ProfessionalCards professionals={professionals.slice(0, 8)} state="ready" empty={text.empty} loading={text.loading} error={text.error} />}</section>
    </>}
  </section>;
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
