import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Bell,
  BellRing,
  CalendarPlus,
  ChevronDown,
  CircleUserRound,
  Clock3,
  Compass,
  Heart,
  Info,
  MapPin,
  Save,
  Search,
  Share2,
  Sparkles,
  Ticket,
  X,
} from "lucide-react";
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
const bookingKey = "go-irl-services-bookings-v1";
const reminderKey = "go-irl-services-reminders-v1";
const preferenceOptions = ["Маникюр", "Волосы", "Брови и ресницы", "Массаж", "Уход за лицом"];

const readStringList = (key: string) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]") as unknown;
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
};

const writeStringList = (key: string, values: string[]) => localStorage.setItem(key, JSON.stringify(values));

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
  ru: { forYou: "Для вас", forYouHint: "По предпочтениям в профиле", catalog: "Все мастера", profile: "Профиль клиента", name: "Имя", preferences: "Предпочтения", save: "Сохранить", saved: "Сохранено", empty: "Подходящих мастеров пока нет", catalogEmpty: "В выбранном городе пока нет мастеров", loading: "Загружаем мастеров…", error: "Каталог мастеров временно недоступен", details: "Подробнее", hide: "Свернуть", book: "Записаться", booked: "Записано", share: "Поделиться", reminder: "Напомнить", reminded: "Напоминание", location: "Адрес", duration: "Длительность", price: "Цена", service: "Услуга", openMap: "Открыть карту" },
  uk: { forYou: "Для вас", forYouHint: "За вподобаннями у профілі", catalog: "Усі майстри", profile: "Профіль клієнта", name: "Ім’я", preferences: "Вподобання", save: "Зберегти", saved: "Збережено", empty: "Відповідних майстрів поки немає", catalogEmpty: "У вибраному місті поки немає майстрів", loading: "Завантажуємо майстрів…", error: "Каталог майстрів тимчасово недоступний", details: "Докладніше", hide: "Згорнути", book: "Записатися", booked: "Записано", share: "Поділитися", reminder: "Нагадати", reminded: "Нагадування", location: "Адреса", duration: "Тривалість", price: "Ціна", service: "Послуга", openMap: "Відкрити мапу" },
  cs: { forYou: "Pro vás", forYouHint: "Podle preferencí v profilu", catalog: "Všichni profesionálové", profile: "Profil klienta", name: "Jméno", preferences: "Preference", save: "Uložit", saved: "Uloženo", empty: "Zatím žádní odpovídající profesionálové", catalogEmpty: "Ve vybraném městě zatím nejsou profesionálové", loading: "Načítáme profesionály…", error: "Katalog profesionálů je dočasně nedostupný", details: "Podrobnosti", hide: "Skrýt", book: "Rezervovat", booked: "Rezervováno", share: "Sdílet", reminder: "Připomenout", reminded: "Připomínka", location: "Adresa", duration: "Délka", price: "Cena", service: "Služba", openMap: "Otevřít mapu" },
  en: { forYou: "For you", forYouHint: "Based on your profile preferences", catalog: "All professionals", profile: "Client profile", name: "Name", preferences: "Preferences", save: "Save", saved: "Saved", empty: "No matching professionals yet", catalogEmpty: "No professionals in the selected city yet", loading: "Loading professionals…", error: "The professional directory is temporarily unavailable", details: "Details", hide: "Collapse", book: "Book", booked: "Booked", share: "Share", reminder: "Remind me", reminded: "Reminder set", location: "Location", duration: "Duration", price: "Price", service: "Service", openMap: "Open map" },
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

function ProfessionalCards({ professionals, state, empty, loading, error, language }: {
  professionals: ServicesProfessional[];
  state: DirectoryState;
  empty: string;
  loading: string;
  error: string;
  language: Language;
}) {
  if (state !== "ready") {
    const message = state === "loading" ? loading : state === "error" ? error : empty;
    return <div className="services-client-empty"><Heart /><span>{message}</span></div>;
  }
  return <div className="services-professional-grid">{professionals.map((professional) => (
    <ProfessionalCard key={professional.profileId} professional={professional} language={language} />
  ))}</div>;
}

function ProfessionalCard({ professional, language }: { professional: ServicesProfessional; language: Language }) {
  const text = copy[language];
  const [expanded, setExpanded] = useState(false);
  const [booked, setBooked] = useState(() => readStringList(bookingKey).includes(professional.profileId));
  const [reminded, setReminded] = useState(() => readStringList(reminderKey).includes(professional.profileId));
  const artwork = getServiceArtwork(professional.serviceName);
  const url = new URL(professional.publicLink, window.location.origin).toString();

  const toggleStoredState = (key: string, active: boolean, setter: (next: boolean) => void) => {
    const values = new Set(readStringList(key));
    if (active) values.delete(professional.profileId);
    else values.add(professional.profileId);
    writeStringList(key, [...values]);
    setter(!active);
  };

  const share = async () => {
    if (navigator.share) {
      const data: ShareData = { title: `${professional.displayName} · ${professional.serviceName}`, url };
      if (artwork && navigator.canShare) {
        try {
          const response = await fetch(artwork.share);
          const file = new File([await response.blob()], "service.webp", { type: "image/webp" });
          if (navigator.canShare({ files: [file] })) data.files = [file];
        } catch { /* Link sharing remains available. */ }
      }
      await navigator.share(data);
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  const openMap = () => window.open(`https://mapy.cz/zakladni?q=${encodeURIComponent(professional.publicLocation)}`, "_blank", "noopener,noreferrer");

  return <article className={expanded ? "services-professional-card is-expanded" : "services-professional-card"}>
    <div className="services-professional-artwork" aria-hidden="true">
      {artwork ? <img src={artwork.sheet} alt="" decoding="async" /> : <span>{professional.displayName.slice(0, 1).toUpperCase()}</span>}
    </div>

    <div className="services-professional-top-actions">
      <button className={reminded ? "is-active" : ""} type="button" onClick={() => toggleStoredState(reminderKey, reminded, setReminded)} aria-label={reminded ? text.reminded : text.reminder} title={reminded ? text.reminded : text.reminder}>{reminded ? <BellRing /> : <Bell />}</button>
      <button type="button" onClick={() => { void share().catch(() => undefined); }} aria-label={text.share} title={text.share}><Share2 /></button>
    </div>

    <button className="services-professional-main" type="button" onClick={() => setExpanded(true)} aria-expanded={expanded}>
      <strong>{professional.displayName}</strong>
      <span>{professional.serviceName}</span>
    </button>

    <div className="services-professional-summary">
      <span><Clock3 />{professional.durationMinutes} min</span>
      <span><Ticket /><b>{professional.priceCzk}</b> {professional.currency}</span>
    </div>

    <div className="services-professional-meta">
      <button type="button" onClick={openMap}><MapPin /><span><small>{text.location}</small><strong>{professional.publicLocation}</strong></span></button>
      <div><Clock3 /><span><small>{text.duration}</small><strong>{professional.durationMinutes} min</strong></span></div>
      <div><Ticket /><span><small>{text.price}</small><strong>{professional.priceCzk} {professional.currency}</strong></span></div>
    </div>

    <div className="services-professional-actions">
      <button className="secondary" type="button" onClick={() => setExpanded((current) => !current)}><Info />{expanded ? text.hide : text.details}</button>
      <button className={booked ? "primary is-active" : "primary"} type="button" onClick={() => toggleStoredState(bookingKey, booked, setBooked)}><CalendarPlus />{booked ? text.booked : text.book}</button>
    </div>

    {expanded && <div className="services-professional-details">
      <div><MapPin /><span>{professional.publicLocation}</span></div>
      <div><Clock3 /><span>{professional.serviceName} · {professional.durationMinutes} min</span></div>
      {artwork && <img className="services-professional-portfolio" src={artwork.portfolio} alt="" decoding="async" />}
      <button className="services-professional-share" type="button" onClick={() => { void share().catch(() => undefined); }}><Share2 />{text.share}</button>
      <a href={professional.publicLink}><Sparkles />{text.service}</a>
      <button type="button" onClick={() => setExpanded(false)}><X />{text.hide}</button>
    </div>}
  </article>;
}

function ProfessionalSection({ title, professionals, language }: { title: string; professionals: ServicesProfessional[]; language: Language }) {
  if (!professionals.length) return null;
  return <section className="discover-section"><div className="section-title"><h2>{title}</h2></div><ProfessionalCards professionals={professionals} state="ready" empty="" loading="" error="" language={language} /></section>;
}

export function ServicesForYouView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const profile = useMemo(readProfile, []);
  const { professionals, state } = useProfessionalDirectory(selectedCityId);
  const text = copy[language];
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [locationState, setLocationState] = useState<"idle" | "ready" | "blocked">("idle");
  const interestMatches = useMemo(() => professionals.filter((professional) => profile.preferences.length === 0 || profile.preferences.some((preference) => professional.serviceName.toLocaleLowerCase().includes(preference.toLocaleLowerCase()))), [professionals, profile.preferences]);
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
    {(query || activeFilters.length > 0) && <section className="discover-section"><div className="section-title"><h2>{labels.matched}</h2></div><ProfessionalCards professionals={matched} state={matchedState} empty={text.empty} loading={text.loading} error={text.error} language={language} /></section>}
    {state !== "ready" ? <ProfessionalCards professionals={[]} state={state} empty={text.empty} loading={text.loading} error={text.error} language={language} /> : <>
      <ProfessionalSection title={labels.interests} professionals={interestMatches.slice(0, 8)} language={language} />
      <ProfessionalSection title={labels.nearest} professionals={professionals.slice(0, 8)} language={language} />
      <ProfessionalSection title={labels.newest} professionals={newest} language={language} />
      <section className="discover-section"><div className="section-title discover-section-title"><MapPin /><h2>{labels.nearMe}</h2>{locationState === "idle" && <button onClick={enableLocation} type="button">{labels.location}</button>}</div>{locationState === "blocked" && <div className="nearby-note">{labels.blocked}</div>}{locationState === "ready" && <ProfessionalCards professionals={professionals.slice(0, 8)} state="ready" empty={text.empty} loading={text.loading} error={text.error} language={language} />}</section>
    </>}
  </section>;
}

export function ServicesCatalogView({ language, selectedCityId }: { language: Language; selectedCityId: string }) {
  const { professionals, state } = useProfessionalDirectory(selectedCityId);
  const city = getCity(selectedCityId);
  const text = copy[language];
  return <section className="page-section services-client-view"><div className="page-title"><Compass /><div><h1>{text.catalog}</h1><p>{city.name[language]}</p></div></div><ProfessionalCards professionals={professionals} state={state} empty={text.catalogEmpty} loading={text.loading} error={text.error} language={language} /></section>;
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
