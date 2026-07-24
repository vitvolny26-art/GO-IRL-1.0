import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronRight, MapPin, MessageCircle, UsersRound } from "lucide-react";
import { resolveEventArtworkCode } from "../../api/_shared/event-artwork.js";
import { activityIconFor } from "../activityIcon";
import { getCurrentChatIdentity, loadActivityChatMessages } from "../activityChatFeature";
import { stripLeadingEmoji } from "../cardText";
import { getCity } from "../config/cities";
import {
  buildEventMapProviderUrl,
  loadPreferredEventMapProvider,
  savePreferredEventMapProvider,
  type EventMapProvider,
} from "../eventMapProviders";
import { getEventBackground } from "../eventBackgrounds";
import { localeByLanguage } from "../i18n";
import { buildBrowserActivityInviteUrl, buildTelegramActivityInviteUrl } from "../invitationLink";
import { useAppStore } from "../store";
import { getUserKey } from "../supabase";
import { getTelegramWebApp } from "../telegram";
import { sharePreparedTelegramEvent } from "../telegramPreparedShare";
import type { Activity, Language } from "../types";
import { CardShareAction } from "./CardShareAction";
import { OrganizerDetailAction } from "./EventCardPrimitives";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "").replace(/^\//, "");
const unreadStoragePrefix = "go-irl-event-chat-read-v1:";

const copy: Record<Language, {
  map: string;
  participants: string;
  chat: string;
  share: string;
  organizer: string;
  mapTitle: string;
  mapHint: string;
  mapy: string;
  google: string;
  apple: string;
  unread: string;
}> = {
  ru: { map: "Карта", participants: "Участники", chat: "Чат", share: "Поделиться", organizer: "Организатор", mapTitle: "Открыть место", mapHint: "Выберите приложение для карты", mapy: "Mapy.com", google: "Google Maps", apple: "Apple Maps", unread: "новых" },
  uk: { map: "Мапа", participants: "Учасники", chat: "Чат", share: "Поділитися", organizer: "Організатор", mapTitle: "Відкрити місце", mapHint: "Оберіть застосунок для мапи", mapy: "Mapy.com", google: "Google Maps", apple: "Apple Maps", unread: "нових" },
  cs: { map: "Mapa", participants: "Účastníci", chat: "Chat", share: "Sdílet", organizer: "Organizátor", mapTitle: "Otevřít místo", mapHint: "Vyberte mapovou aplikaci", mapy: "Mapy.com", google: "Google Maps", apple: "Apple Maps", unread: "nových" },
  en: { map: "Map", participants: "Participants", chat: "Chat", share: "Share", organizer: "Organizer", mapTitle: "Open location", mapHint: "Choose a map app", mapy: "Mapy.com", google: "Google Maps", apple: "Apple Maps", unread: "new" },
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
  return activities.find((activity) => (
    normalizeText(activity.title[language]) === normalizedTitle
    && (!normalizedDescription || normalizeText(activity.description[language]) === normalizedDescription)
  )) || activities.find((activity) => normalizeText(activity.title[language]) === normalizedTitle) || null;
};

type PortalState = {
  target: HTMLElement;
  sheet: HTMLElement;
  activity: Activity;
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
  return [date, activity.time].filter(Boolean).join(" · ");
};

const markChatRead = (activityId: string) => {
  localStorage.setItem(`${unreadStoragePrefix}${activityId}`, new Date().toISOString());
};

function UnifiedEventDetails({ activity, language, sheet }: { activity: Activity; language: Language; sheet: HTMLElement }) {
  const labels = copy[language];
  const joinedIds = useAppStore((state) => state.joinedIds);
  const [mapOpen, setMapOpen] = useState(false);
  const [mapProvider, setMapProvider] = useState<EventMapProvider>(() => loadPreferredEventMapProvider());
  const [unreadCount, setUnreadCount] = useState(0);
  const cityName = getCity(activity.cityId).name[language];
  const title = normalizeText(activity.title[language]);
  const description = normalizeText(activity.description[language]);
  const activityLabel = normalizeText(activity.activity[language]);
  const dateLabel = formatDate(activity, language);
  const artworkCode = resolveEventArtworkCode({
    icon: activityIconFor(activity, language, "✨"),
    activity: activity.activity[language],
    title: activity.title[language],
  });
  const artwork = getEventBackground(artworkCode);
  const isChatMember = activity.organizerKey === getUserKey() || joinedIds.includes(activity.id);
  const joinedMembers = activity.members.filter((member) => member.status === "joined");
  const shareUrl = useMemo(() => activityInviteUrl(activity), [activity.id]);

  useEffect(() => {
    let active = true;
    if (!isChatMember) {
      setUnreadCount(0);
      return () => { active = false; };
    }

    void Promise.all([loadActivityChatMessages(activity.id), getCurrentChatIdentity()])
      .then(([messages, identity]) => {
        if (!active) return;
        const lastRead = Date.parse(localStorage.getItem(`${unreadStoragePrefix}${activity.id}`) || "") || 0;
        const unread = messages.filter((message) => (
          message.status === "visible"
          && message.senderUserKey !== identity.userKey
          && new Date(message.createdAt).getTime() > lastRead
        )).length;
        setUnreadCount(unread);
      })
      .catch(() => { if (active) setUnreadCount(0); });

    return () => { active = false; };
  }, [activity.id, isChatMember]);

  const openMap = (provider: EventMapProvider) => {
    setMapProvider(provider);
    savePreferredEventMapProvider(provider);
    setMapOpen(false);
    const url = buildEventMapProviderUrl(activity, cityName, provider);
    const webApp = getTelegramWebApp();
    if (webApp?.openLink) {
      webApp.openLink(url, { try_instant_view: false });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const openParticipants = () => {
    const toggle = sheet.querySelector<HTMLButtonElement>(".detail-members-toggle");
    if (toggle?.getAttribute("aria-expanded") !== "true") toggle?.click();
    window.requestAnimationFrame(() => sheet.querySelector(".members-section")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const openChat = () => {
    markChatRead(activity.id);
    setUnreadCount(0);
    const toggle = sheet.querySelector<HTMLButtonElement>(".activity-chat-toggle");
    if (toggle?.getAttribute("aria-expanded") !== "true") toggle?.click();
    window.requestAnimationFrame(() => sheet.querySelector(".activity-chat-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <>
      <section
        className="unified-event-details-hero"
        style={artwork ? { backgroundImage: `url(${artwork})` } : undefined}
      >
        <div className="unified-event-details-shade" />
        <div className="unified-event-details-copy">
          <span>{activityLabel}</span>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
          <div className="unified-event-details-facts">
            <span><CalendarDays aria-hidden="true" />{dateLabel}</span>
            <span><MapPin aria-hidden="true" />{activity.address || cityName}</span>
          </div>
        </div>
      </section>

      <section className="unified-event-details-actions" aria-label={title}>
        <button type="button" onClick={() => setMapOpen((open) => !open)} aria-expanded={mapOpen}>
          <MapPin aria-hidden="true" />
          <span>{labels.map}</span>
          <small>{mapProvider === "mapy" ? labels.mapy : mapProvider === "google" ? labels.google : labels.apple}</small>
        </button>
        <button type="button" onClick={openParticipants}>
          <UsersRound aria-hidden="true" />
          <span>{labels.participants}</span>
          <small>{activity.participants} / {activity.capacity}</small>
        </button>
        <button type="button" onClick={openChat} disabled={!isChatMember}>
          <MessageCircle aria-hidden="true" />
          <span>{labels.chat}</span>
          <small>{unreadCount > 0 ? `${unreadCount} ${labels.unread}` : isChatMember ? "GO IRL" : "—"}</small>
          {unreadCount > 0 ? <b className="unified-event-chat-badge">{unreadCount}</b> : null}
        </button>
        <div className="unified-event-share-action">
          <CardShareAction
            title={title}
            date={dateLabel}
            address={activity.address || cityName}
            url={shareUrl}
            label={labels.share}
            onTelegramShare={() => sharePreparedTelegramEvent(activity, language)}
          />
          <span>{labels.share}</span>
          <small>Telegram · Meta</small>
        </div>
      </section>

      {mapOpen ? (
        <section className="unified-event-map-provider-card" aria-label={labels.mapTitle}>
          <div>
            <strong>{labels.mapTitle}</strong>
            <span>{labels.mapHint}</span>
          </div>
          <button type="button" onClick={() => openMap("mapy")}><span>🗺️</span><strong>{labels.mapy}</strong><ChevronRight aria-hidden="true" /></button>
          <button type="button" onClick={() => openMap("google")}><span>G</span><strong>{labels.google}</strong><ChevronRight aria-hidden="true" /></button>
          <button type="button" onClick={() => openMap("apple")}><span></span><strong>{labels.apple}</strong><ChevronRight aria-hidden="true" /></button>
        </section>
      ) : null}

      <section className="unified-event-organizer-card">
        <OrganizerDetailAction organizerKey={activity.organizerKey} organizerName={activity.organizer} label={labels.organizer} />
        <div className="unified-event-member-preview" aria-label={labels.participants}>
          {joinedMembers.slice(0, 4).map((member) => <span key={member.userKey}>{member.name?.slice(0, 2).toUpperCase() || "GO"}</span>)}
          {joinedMembers.length > 4 ? <span>+{joinedMembers.length - 4}</span> : null}
        </div>
      </section>
    </>
  );
}

export function UnifiedEventDetailsPortal() {
  const { activities, language } = useAppStore();
  const [portal, setPortal] = useState<PortalState | null>(null);

  useEffect(() => {
    const refresh = () => {
      const sheets = Array.from(document.querySelectorAll<HTMLElement>(".activity-sheet"));
      const sheet = sheets.at(-1) || null;
      const title = sheet?.querySelector("h2")?.textContent || "";
      const description = sheet?.querySelector(".sheet-description, .sport-sheet-hero p")?.textContent || "";
      const activity = sheet ? findActivityForDetailsSheet(activities, language, title, description) : null;

      if (!sheet || !activity) {
        setPortal((current) => {
          current?.sheet.classList.remove("unified-event-sheet-active");
          current?.target.remove();
          return null;
        });
        return;
      }

      setPortal((current) => {
        if (current?.target.isConnected && current.sheet === sheet && current.activity.id === activity.id) return current;
        current?.sheet.classList.remove("unified-event-sheet-active");
        current?.target.remove();
        const target = document.createElement("div");
        target.className = "unified-event-details-slot";
        const closeButton = sheet.querySelector(".sheet-close");
        if (closeButton) closeButton.insertAdjacentElement("afterend", target);
        else sheet.prepend(target);
        sheet.classList.add("unified-event-sheet-active");
        return { target, sheet, activity };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortal((current) => {
        current?.sheet.classList.remove("unified-event-sheet-active");
        current?.target.remove();
        return null;
      });
    };
  }, [activities, language]);

  if (!portal) return null;
  return createPortal(
    <UnifiedEventDetails activity={portal.activity} language={language} sheet={portal.sheet} />,
    portal.target,
  );
}
