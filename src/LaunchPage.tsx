import { ArrowLeft } from "lucide-react";
import activityCardImage from "./assets/activity-card.svg";
import servicesCardImage from "./assets/services-card.svg";
import { cities, getCity } from "./config/cities";
import type { Language } from "./types";
import "./launch-page.css";

type LaunchPageProps = {
  language: Language;
  selectedCityId: string;
  surface: "launch" | "services";
  onLanguageChange: (language: Language) => void;
  onCityChange: (cityId: string) => void;
  onOpenActivities: () => void;
  onOpenServices: () => void;
  onBack: () => void;
};

const languageNames: Record<Language, string> = { ru: "RU", uk: "UA", cs: "CS", en: "EN" };

const copy = {
  ru: {
    description: "Выберите направление, найдите людей рядом и закройте телефон.",
    choose: "С чего начнём?",
    city: "Город",
    language: "Язык",
    activities: "Активности",
    activitiesInfo: "Встречайтесь, двигайтесь и проводите время вместе.",
    services: "Сервисы",
    servicesInfo: "Находите локальных специалистов и полезные услуги.",
    back: "Назад",
    placeholder: "Раздел будет добавлен следующим независимым шагом.",
    cityStatus: "Сейчас в городе",
    today: "Что делаем сегодня?",
    nearby: "ближайших",
    directions: "направления",
    urgent: "срочных",
    slogan: "Меньше скролла. Больше жизни.",
  },
  uk: {
    description: "Оберіть напрямок, знайдіть людей поруч і закрийте телефон.",
    choose: "З чого почнемо?",
    city: "Місто",
    language: "Мова",
    activities: "Активності",
    activitiesInfo: "Зустрічайтеся, рухайтеся та проводьте час разом.",
    services: "Сервіси",
    servicesInfo: "Знаходьте локальних фахівців і корисні послуги.",
    back: "Назад",
    placeholder: "Розділ буде додано наступним незалежним кроком.",
    cityStatus: "Зараз у місті",
    today: "Що робимо сьогодні?",
    nearby: "найближчих",
    directions: "напрямки",
    urgent: "термінових",
    slogan: "Менше скролу. Більше життя.",
  },
  cs: {
    description: "Vyberte směr, najděte lidi poblíž a odložte telefon.",
    choose: "Kde začneme?",
    city: "Město",
    language: "Jazyk",
    activities: "Aktivity",
    activitiesInfo: "Setkávejte se, hýbejte se a trávíte čas společně.",
    services: "Služby",
    servicesInfo: "Najděte místní specialisty a užitečné služby.",
    back: "Zpět",
    placeholder: "Tato část bude přidána v dalším samostatném kroku.",
    cityStatus: "Právě ve městě",
    today: "Co podnikneme dnes?",
    nearby: "nejbližší",
    directions: "směry",
    urgent: "naléhavé",
    slogan: "Méně scrollování. Více života.",
  },
  en: {
    description: "Choose a direction, find people nearby, and put the phone away.",
    choose: "Where should we start?",
    city: "City",
    language: "Language",
    activities: "Activities",
    activitiesInfo: "Meet people, get moving, and spend time together.",
    services: "Services",
    servicesInfo: "Find local specialists and useful services.",
    back: "Back",
    placeholder: "This section will be added in the next independent step.",
    cityStatus: "Now in the city",
    today: "What are we doing today?",
    nearby: "nearby",
    directions: "directions",
    urgent: "urgent",
    slogan: "Less scrolling. More life.",
  },
} satisfies Record<Language, Record<string, string>>;

function Brand() {
  return (
    <div className="launch-brand" aria-label="GO IRL">
      <span className="launch-brand-mark" aria-hidden="true"><span>GO</span><strong>IRL</strong></span>
      <span className="launch-brand-copy"><strong>GO IRL</strong><small>Less scrolling. More life.</small></span>
    </div>
  );
}

export function LaunchPage({
  language,
  selectedCityId,
  surface,
  onLanguageChange,
  onCityChange,
  onOpenActivities,
  onOpenServices,
  onBack,
}: LaunchPageProps) {
  const t = copy[language];
  const currentCity = getCity(selectedCityId);

  if (surface === "services") {
    return (
      <main className="launch-root launch-centered">
        <section className="launch-services-panel">
          <Brand />
          <button className="launch-back" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />{t.back}
          </button>
          <span className="launch-domain-icon" aria-hidden="true">◆</span>
          <p className="launch-eyebrow">GO IRL 1.1</p>
          <h1>{t.services}</h1>
          <p>{t.placeholder}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="launch-root launch-home">
      <header className="launch-topbar">
        <Brand />
        <div className="launch-selectors" aria-label="Application preferences">
          <label className="launch-select-control">
            <span className="launch-control-icon" aria-hidden="true">⌖</span>
            <span className="launch-sr-only">{t.city}</span>
            <select aria-label={t.city} value={selectedCityId} onChange={(event) => onCityChange(event.target.value)}>
              {cities.map((city) => <option key={city.id} value={city.id}>{city.name[language]}</option>)}
            </select>
          </label>
          <label className="launch-select-control launch-language-control">
            <span className="launch-control-icon" aria-hidden="true">◎</span>
            <span className="launch-sr-only">{t.language}</span>
            <select aria-label={t.language} value={language} onChange={(event) => onLanguageChange(event.target.value as Language)}>
              {(Object.keys(languageNames) as Language[]).map((id) => <option key={id} value={id}>{languageNames[id]}</option>)}
            </select>
          </label>
        </div>
      </header>

      <section className="launch-intro" aria-labelledby="launch-home-title">
        <p className="launch-city-status"><span aria-hidden="true">⌖</span>{t.cityStatus} · {currentCity.name[language]}</p>
        <h1 id="launch-home-title">{t.today}</h1>
        <p className="launch-description">{t.description}</p>
        <p className="launch-slogan">{t.slogan}</p>
        <div className="launch-stats" aria-label="Current overview">
          <div><strong>0</strong><span>{t.nearby}</span></div>
          <div><strong>2</strong><span>{t.directions}</span></div>
          <div><strong>0</strong><span>{t.urgent}</span></div>
        </div>
      </section>

      <section className="launch-domain-section" aria-labelledby="launch-domain-title">
        <h2 id="launch-domain-title">{t.choose}</h2>
        <div className="launch-domain-grid">
          <button className="launch-domain-card launch-activities-card" type="button" onClick={onOpenActivities}>
            <img src={activityCardImage} alt="" aria-hidden="true" />
            <span className="launch-card-shade" aria-hidden="true" />
            <span className="launch-domain-copy"><strong>{t.activities}</strong><small>{t.activitiesInfo}</small></span>
            <span className="launch-card-arrow" aria-hidden="true">›</span>
          </button>
          <button className="launch-domain-card launch-services-card" type="button" onClick={onOpenServices}>
            <img src={servicesCardImage} alt="" aria-hidden="true" />
            <span className="launch-card-shade" aria-hidden="true" />
            <span className="launch-domain-copy"><strong>{t.services}</strong><small>{t.servicesInfo}</small></span>
            <span className="launch-card-arrow" aria-hidden="true">›</span>
          </button>
        </div>
      </section>
    </main>
  );
}

