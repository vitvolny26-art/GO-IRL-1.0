import { ArrowLeft, ArrowRight, CalendarDays, Sparkles, Wrench } from "lucide-react";
import type { Language } from "./types";
import "./launch-page.css";

type LaunchPageProps = {
  language: Language;
  surface: "launch" | "services";
  onOpenActivities: () => void;
  onOpenServices: () => void;
  onBack: () => void;
};

const copy = {
  ru: {
    eyebrow: "Olomouc · закрытая бета",
    title: "Меньше скролла.",
    accent: "Больше жизни.",
    lead: "Выбери, что тебе нужно прямо сейчас.",
    activities: "Активности",
    activitiesText: "Найди событие рядом, присоединись или создай своё.",
    open: "Открыть",
    services: "Сервисы",
    servicesText: "Локальные специалисты и полезные услуги рядом.",
    soon: "Скоро",
    servicesTitle: "Сервисы готовятся",
    servicesLead: "Этот раздел появится следующим. Сейчас весь рабочий функционал находится в «Активностях».",
    back: "Вернуться",
  },
  uk: {
    eyebrow: "Olomouc · закрита бета",
    title: "Менше скролу.",
    accent: "Більше життя.",
    lead: "Обери, що тобі потрібно просто зараз.",
    activities: "Активності",
    activitiesText: "Знайди подію поруч, приєднайся або створи свою.",
    open: "Відкрити",
    services: "Сервіси",
    servicesText: "Місцеві фахівці та корисні послуги поруч.",
    soon: "Скоро",
    servicesTitle: "Сервіси готуються",
    servicesLead: "Цей розділ з’явиться наступним. Зараз увесь робочий функціонал знаходиться в «Активностях».",
    back: "Повернутися",
  },
  cs: {
    eyebrow: "Olomouc · uzavřená beta",
    title: "Méně scrollování.",
    accent: "Více života.",
    lead: "Vyber si, co právě teď potřebuješ.",
    activities: "Aktivity",
    activitiesText: "Najdi akci poblíž, přidej se nebo vytvoř vlastní.",
    open: "Otevřít",
    services: "Služby",
    servicesText: "Místní odborníci a užitečné služby ve tvém okolí.",
    soon: "Brzy",
    servicesTitle: "Služby připravujeme",
    servicesLead: "Tato sekce bude následovat. Veškeré současné funkce najdeš v Aktivitách.",
    back: "Zpět",
  },
  en: {
    eyebrow: "Olomouc · closed beta",
    title: "Less scrolling.",
    accent: "More life.",
    lead: "Choose what you need right now.",
    activities: "Activities",
    activitiesText: "Find something nearby, join in, or create your own event.",
    open: "Open",
    services: "Services",
    servicesText: "Local professionals and useful services near you.",
    soon: "Coming soon",
    servicesTitle: "Services are on the way",
    servicesLead: "This section is next. For now, all working features are available under Activities.",
    back: "Back",
  },
} satisfies Record<Language, Record<string, string>>;

export function LaunchPage({
  language,
  surface,
  onOpenActivities,
  onOpenServices,
  onBack,
}: LaunchPageProps) {
  const t = copy[language];

  if (surface === "services") {
    return (
      <main className="launch-page">
        <div className="launch-glow launch-glow-top" />
        <section className="launch-services-panel">
          <button className="launch-back" type="button" onClick={onBack}>
            <ArrowLeft aria-hidden="true" />
            {t.back}
          </button>
          <div className="launch-services-icon"><Wrench aria-hidden="true" /></div>
          <span className="launch-status">{t.soon}</span>
          <h1>{t.servicesTitle}</h1>
          <p>{t.servicesLead}</p>
          <button className="launch-primary-action" type="button" onClick={onOpenActivities}>
            {t.activities}
            <ArrowRight aria-hidden="true" />
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="launch-page">
      <div className="launch-glow launch-glow-top" />
      <div className="launch-glow launch-glow-bottom" />
      <section className="launch-shell">
        <header className="launch-header">
          <img src="/brand/logo-square.png" alt="" />
          <div>
            <strong>GO IRL</strong>
            <span>LESS SCROLLING. MORE LIFE.</span>
          </div>
        </header>

        <div className="launch-intro">
          <span className="launch-eyebrow"><Sparkles aria-hidden="true" />{t.eyebrow}</span>
          <h1>{t.title}<br /><em>{t.accent}</em></h1>
          <p>{t.lead}</p>
        </div>

        <div className="launch-options">
          <button className="launch-card launch-card-activities" type="button" onClick={onOpenActivities}>
            <span className="launch-card-icon"><CalendarDays aria-hidden="true" /></span>
            <span className="launch-card-copy">
              <strong>{t.activities}</strong>
              <small>{t.activitiesText}</small>
              <span className="launch-card-link">{t.open}<ArrowRight aria-hidden="true" /></span>
            </span>
          </button>

          <button className="launch-card launch-card-services" type="button" onClick={onOpenServices}>
            <span className="launch-card-icon"><Wrench aria-hidden="true" /></span>
            <span className="launch-card-copy">
              <span className="launch-card-title"><strong>{t.services}</strong><i>{t.soon}</i></span>
              <small>{t.servicesText}</small>
            </span>
          </button>
        </div>
      </section>
    </main>
  );
}

