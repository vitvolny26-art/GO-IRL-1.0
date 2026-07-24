import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, MapPin, MessageCircle, Share2, UsersRound } from "lucide-react";
import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";
import { countUnreadActivityChatMessages, loadActivityChatReadAt, markActivityChatRead } from "../activityChatUnread";
import { getCurrentChatIdentity, loadActivityChatMessages } from "../activityChatFeature";
import { stripLeadingEmoji } from "../cardText";
import { CardShareAction } from "./CardShareAction";
import { getCity } from "../config/cities";
import { categories } from "../data";
import { buildEventMapProviderUrl, loadPreferredEventMapProvider, savePreferredEventMapProvider, type EventMapProvider } from "../eventMapProviders";
import { getEventBackground } from "../eventBackgrounds";
import { formatEventTime } from "../eventTime";
import { getTranslation, localeByLanguage } from "../i18n";
import { buildBrowserActivityInviteUrl, buildTelegramActivityInviteUrl } from "../invitationLink";
import { resolveOrganizerIdentity, type OrganizerIdentity } from "../profile/organizerIdentityResolver";
import { sharePreparedTelegramEvent } from "../telegramPreparedShare";
import { getTelegramWebApp } from "../telegram";
import { useAppStore } from "../store";
import type { Activity, Language } from "../types";
import { isOrganizerAvatarImage, organizerProfileEventName } from "./EventCardPrimitives";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "").replace(/^\//, "");

const copy: Record<Language, {
  map: string;
  openMap: string;
  organizer: string;
  participants: string;
  chat: string;
  unread: string;
  date: string;
  share: string;
}> = {
  ru: { map: "Карта", openMap: "Открыть", organizer: "Организатор", participants: "Участники", chat: "Чат", unread: "непрочитанных", date: "Дата", share: "Поделиться" },
  uk: { map: "Мапа", openMap: "Відкрити", organizer: "Організатор", participants: "Учасники", chat: "Чат", unread: "непрочитаних", date: "Дата", share: "Поділитися" },
  cs: { map: "Mapa", openMap: "Otevřít", organizer: "Organizátor", participants: "Účastníci", chat: "Chat", unread: "nepřečtených", date: "Datum", share: "Sdílet" },
  en: { map: "Map", openMap: "Open", organizer: "Organizer", participants: "Participants", chat: "Chat", unread: "unread", date: "Date", share: "Share" },
};

const normalizeText = (value: string) => stripLeadingEmoji(value).trim();

export const findActivityForDetailsSheet = (
  activities: Activity[],
  language: Language,
  title: string,
  description: string,
) => {
  const normalizedTitle = title.trim();
  const normalizedDescription = description.trim();
  const exact = activities.find((activity) => (
    normalizeText(activity.title[language]) === normalizedTitle
    && (!normalizedDescription || normalizeText(activity.description[language]) === normalizedDescription)
  ));
  if (exact) return exact;
  return activities.find((activity) => normalizeText(activity.title[language]) === normalizedTitle) || null;
};

const activityInviteUrl = (activity: Activity) => (
  buildTelegramActivityInviteUrl(activity.id, telegramBotUsername, telegramAppName)
  || buildBrowserActivityInviteUrl(activity.id, window.location.origin)
);

const formatDate = (activity: Activity, language: Language) => {
  const date = new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${activity.date}T12:00:00`));
  const time = formatEventTime(activity.time);
  return time ? `${date} · ${time}` : date;
};

const openExternal = (url: string) => {
  const webApp = getTelegramWebApp();
  if (webApp?.openLink) {
    webApp.openLink(url, { try_instant_view: false });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

type PortalState = {
  target: HTMLElement;
  sheet: HTMLElement;
  activity: Activity;
};

function UniversalEventDetails({ state, language }: { state: PortalState; language: Language }) {
  const { activity, sheet } = state;
  const labels = copy[language];
  const t = getTranslation(language);
  const category = categories.find((item) => item.id === activity.categoryId);
  const categoryName = category?.name[language] || t.category;
  const categoryIcon = category?.icon || "✨";
  const cityName = getCity(activity.cityId).name[language];
  const [provider, setProvider] = useState<EventMapProvider>(() => loadPreferredEventMapProvider());
  const [mapMenuOpen, setMapMenuOpen] = useState(false);
  const [organizer, setOrganizer] = useState<OrganizerIdentity | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const artwork = useMemo(() => {
    const code = resolveEventArtworkCode({
      icon: categoryIcon,
      activity: activity.activity[language],
      title: activity.title[language],
    });
    return getEventBackground(code);
  }, [activity.activity, activity.title, categoryIcon, language]);
  const dateLabel = formatDate(activity, language);
  const inviteUrl = activityInviteUrl(activity);

  useEffect(() => {
    let active = true;
    void resolveOrganizerIdentity(activity.organizerKey, activity.organizer).then((identity) => {
      if (active) setOrganizer(identity);
    });
    return () => { active = false; };
  }, [activity.organizer, activity.organizerKey]);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const [identity, messages] = await Promise.all([
          getCurrentChatIdentity(),
          loadActivityChatMessages(activity.id),
        ]);
        if (!active) return;
        setUnreadCount(countUnreadActivityChatMessages(
          messages,
          identity.userKey,
          loadActivityChatReadAt(activity.id),
        ));
      } catch {
        if (active) setUnreadCount(0);
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 30_000);
    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, [activity.id]);

  const chooseProvider = (nextProvider: EventMapProvider) => {
    setProvider(nextProvider);
    savePreferredEventMapProvider(nextProvider);
    setMapMenuOpen(false);
    openExternal(buildEventMapProviderUrl(activity, cityName, nextProvider));
  };

  const openChat = () => {
    markActivityChatRead(activity.id);
    setUnreadCount(0);
    const toggle = sheet.querySelector<HTMLButtonElement>(".activity-chat-toggle");
    if (toggle?.getAttribute("aria-expanded") !== "true") toggle?.click();
    window.requestAnimationFrame(() => {
      sheet.querySelector<HTMLElement>(".activity-chat-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const openParticipants = () => {
    const toggle = sheet.querySelector<HTMLButtonElement>(".detail-members-toggle");
    toggle?.click();
    window.requestAnimationFrame(() => toggle?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const openOrganizer = () => {
    if (!organizer) return;
    window.dispatchEvent(new CustomEvent(organizerProfileEventName, { detail: organizer }));
  };

  return (
    <section className="universal-event-details" aria-label={normalizeText(activity.title[language])}>
      <div className="universal-event-hero">
        {artwork ? <img src={artwork} alt="" decoding="async" /> : <span className="universal-event-hero-fallback">{categoryIcon}</span>}
        <div className="universal-event-hero-shade" />
        <div className="universal-event-hero-share">
          <CardShareAction
            title={normalizeText(activity.title[language])}
            date={dateLabel}
            address={activity.address}
            url={inviteUrl}
            label={labels.share}
            onTelegramShare={() => sharePreparedTelegramEvent(activity, language)}
          />
        </div>
        <div className="universal-event-hero-copy">
          <small>{categoryName} · {normalizeText(activity.activity[language])}</small>
          <h2>{normalizeText(activity.title[language])}</h2>
          <p>{normalizeText(activity.description[language])}</p>
        </div>
      </div>

      <div className="universal-event-quick-row">
        <div className="universal-event-map-action">
          <button type="button" onClick={() => openExternal(buildEventMapProviderUrl(activity, cityName, provider))}>
            <MapPin aria-hidden="true" />
            <span><small>{labels.map}</small><strong>{activity.address || cityName}</strong></span>
          </button>
          <button className="universal-event-map-menu-toggle" type="button" aria-expanded={mapMenuOpen} onClick={() => setMapMenuOpen((open) => !open)}>
            <ChevronDown aria-hidden="true" />
          </button>
          {mapMenuOpen ? (
            <div className="universal-event-map-menu" role="menu">
              <button type="button" role="menuitem" onClick={() => chooseProvider("mapy")}>Mapy.com</button>
              <button type="button" role="menuitem" onClick={() => chooseProvider("google")}>Google Maps</button>
              <button type="button" role="menuitem" onClick={() => chooseProvider("apple")}>Apple Maps</button>
            </div>
          ) : null}
        </div>

        <button className="universal-event-quick-button" type="button" onClick={openParticipants}>
          <UsersRound aria-hidden="true" />
          <span><small>{labels.participants}</small><strong>{activity.participants} / {activity.capacity}</strong></span>
        </button>

        <button className="universal-event-quick-button universal-event-chat-button" type="button" onClick={openChat}>
          <MessageCircle aria-hidden="true" />
          <span><small>{labels.chat}</small><strong>{unreadCount > 0 ? `${unreadCount} ${labels.unread}` : t.cardOpenChat}</strong></span>
          {unreadCount > 0 ? <b aria-label={`${unreadCount} ${labels.unread}`}>{unreadCount}</b> : null}
        </button>
      </div>

      <div className="universal-event-summary-row">
        <div><CalendarDays aria-hidden="true" /><span><small>{labels.date}</small><strong>{dateLabel}</strong></span></div>
        <button type="button" className="universal-event-organizer-card" onClick={openOrganizer}>
          <span className="universal-event-organizer-avatar">
            {organizer && isOrganizerAvatarImage(organizer.avatar) ? <img src={organizer.avatar} alt="" /> : (organizer?.avatar || activity.organizer.slice(0, 2).toUpperCase())}
          </span>
          <span><small>{labels.organizer}</small><strong>{organizer?.displayName || activity.organizer}</strong></span>
        </button>
      </div>
    </section>
  );
}

export function UniversalEventDetailsPortal() {
  const { activities, language } = useAppStore();
  const [portal, setPortal] = useState<PortalState | null>(null);

  useEffect(() => {
    const refresh = () => {
      const sheet = document.querySelector<HTMLElement>(".activity-sheet");
      const title = sheet?.querySelector("h2")?.textContent || "";
      const description = sheet?.querySelector(".sheet-description, .sport-sheet-hero p")?.textContent || "";
      const activity = sheet ? findActivityForDetailsSheet(activities, language, title, description) : null;

      if (!sheet || !activity) {
        setPortal((current) => {
          current?.sheet.classList.remove("has-universal-event-template");
          current?.target.remove();
          return null;
        });
        return;
      }

      setPortal((current) => {
        if (current?.sheet === sheet && current.activity.id === activity.id && current.target.isConnected) return current;
        current?.sheet.classList.remove("has-universal-event-template");
        current?.target.remove();
        const target = document.createElement("div");
        target.className = "universal-event-details-slot";
        const anchor = sheet.querySelector(".details-skeleton, .details-error") || sheet.firstElementChild;
        if (anchor?.nextSibling) sheet.insertBefore(target, anchor.nextSibling);
        else sheet.prepend(target);
        sheet.classList.add("has-universal-event-template");
        return { target, sheet, activity };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortal((current) => {
        current?.sheet.classList.remove("has-universal-event-template");
        current?.target.remove();
        return null;
      });
    };
  }, [activities, language]);

  if (!portal) return null;
  return createPortal(<UniversalEventDetails state={portal} language={language} />, portal.target);
}
