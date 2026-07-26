import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, MapPin, Star, X, Zap } from "lucide-react";
import { stripLeadingEmoji } from "../cardText";
import { getCity } from "../config/cities";
import { formatEventTime } from "../eventTime";
import { localeByLanguage } from "../i18n";
import { useAppStore } from "../store";
import type { Language } from "../types";
import { isOrganizerAvatarImage, organizerProfileEventName, type OrganizerProfileDetail } from "./EventCardPrimitives";

const copy: Record<Language, {
  title: string;
  events: string;
  activeEvents: string;
  organizedEvents: string;
  noEvents: string;
  close: string;
}> = {
  ru: { title: "Профиль организатора", events: "Всего событий", activeEvents: "Активные", organizedEvents: "События организатора", noEvents: "Опубликованных событий пока нет", close: "Закрыть" },
  uk: { title: "Профіль організатора", events: "Усього подій", activeEvents: "Активні", organizedEvents: "Події організатора", noEvents: "Опублікованих подій поки немає", close: "Закрити" },
  cs: { title: "Profil organizátora", events: "Všechny události", activeEvents: "Aktivní", organizedEvents: "Události organizátora", noEvents: "Zatím žádné zveřejněné události", close: "Zavřít" },
  en: { title: "Organizer profile", events: "Total events", activeEvents: "Active", organizedEvents: "Organizer events", noEvents: "No published events yet", close: "Close" },
};

const eventDateLabel = (date: string, time: string, language: Language) => {
  const dateLabel = new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));
  const timeLabel = formatEventTime(time);
  return timeLabel ? `${dateLabel} · ${timeLabel}` : dateLabel;
};

export function OrganizerProfilePortal() {
  const { activities, language } = useAppStore();
  const [profile, setProfile] = useState<OrganizerProfileDetail | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const events = useMemo(() => profile ? activities.filter((item) => item.organizerKey === profile.organizerKey && item.visibility === "public") : [], [activities, profile]);
  const sortedEvents = useMemo(() => [...events].sort((left, right) => `${left.date}T${left.time}`.localeCompare(`${right.date}T${right.time}`)), [events]);
  const activeEvents = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return events.filter((event) => event.date >= today).length;
  }, [events]);

  const closeProfile = useCallback(() => {
    setProfile(null);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }, []);

  useEffect(() => {
    const open = (event: Event) => {
      const detail = (event as CustomEvent<OrganizerProfileDetail>).detail;
      if (!detail?.organizerKey) return;
      triggerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setProfile(detail);
    };
    window.addEventListener(organizerProfileEventName, open);
    return () => window.removeEventListener(organizerProfileEventName, open);
  }, []);

  useEffect(() => {
    if (!profile) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeProfile();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeProfile, profile]);

  if (!profile || typeof document === "undefined") return null;
  const labels = copy[language];
  const fallbackCityId = events[0]?.cityId || "";
  const cityId = profile.cityId || fallbackCityId;
  const city = cityId ? getCity(cityId).name[language] : "";

  return createPortal(
    <div className="organizer-profile-backdrop" role="presentation" onClick={closeProfile}>
      <section className="organizer-profile-sheet" role="dialog" aria-modal="true" aria-label={labels.title} onClick={(event) => event.stopPropagation()}>
        <button className="organizer-profile-close" type="button" aria-label={labels.close} onClick={closeProfile}><X aria-hidden="true" /></button>
        <header className="organizer-profile-header">
          <div className="organizer-profile-avatar-large">{isOrganizerAvatarImage(profile.avatar) ? <img src={profile.avatar} alt="" /> : <span>{profile.avatar}</span>}</div>
          <div className="organizer-profile-header-copy">
            <small>{labels.title}</small>
            <h2>{profile.displayName}</h2>
            {city ? <p><MapPin aria-hidden="true" />{city}</p> : null}
          </div>
        </header>
        {profile.bio ? <p className="organizer-profile-bio">{profile.bio}</p> : null}
        <div className="organizer-profile-stats">
          <div><Star aria-hidden="true" /><strong>{events.length}</strong><span>{labels.events}</span></div>
          <div><Zap aria-hidden="true" /><strong>{activeEvents}</strong><span>{labels.activeEvents}</span></div>
        </div>
        <section className="organizer-profile-events-section">
          <h3>{labels.organizedEvents}</h3>
          {sortedEvents.length ? (
            <div className="organizer-profile-events">
              {sortedEvents.map((activity) => (
                <article className="organizer-profile-event" key={activity.id}>
                  <CalendarDays aria-hidden="true" />
                  <div>
                    <strong>{stripLeadingEmoji(activity.title[language])}</strong>
                    <span>{eventDateLabel(activity.date, activity.time, language)}</span>
                    <small>{getCity(activity.cityId).name[language]}</small>
                  </div>
                </article>
              ))}
            </div>
          ) : <p className="organizer-profile-empty">{labels.noEvents}</p>}
        </section>
      </section>
    </div>, document.body,
  );
}
