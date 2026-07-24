import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronRight, MapPin, MessageCircle, Navigation } from "lucide-react";
import { getCurrentChatIdentity, loadActivityChatMessages } from "../activityChatFeature";
import {
  countUnreadActivityChatMessages,
  loadActivityChatReadAt,
  markActivityChatRead,
} from "../activityChatUnread";
import { stripLeadingEmoji } from "../cardText";
import { getCity } from "../config/cities";
import {
  buildEventMapEmbedUrl,
  buildEventMapProviderUrl,
  loadPreferredEventMapProvider,
  savePreferredEventMapProvider,
  type EventMapProvider,
} from "../eventMapProviders";
import { isOutdoorGenericActivity } from "../eventWeather";
import { formatEventTime } from "../eventTime";
import { localeByLanguage } from "../i18n";
import { buildBrowserActivityInviteUrl, buildTelegramActivityInviteUrl } from "../invitationLink";
import { resolveOrganizerIdentity, organizerInitials, type OrganizerIdentity } from "../profile/organizerIdentityResolver";
import { useAppStore } from "../store";
import { getTelegramWebApp } from "../telegram";
import { sharePreparedTelegramEvent } from "../telegramPreparedShare";
import type { Activity, Language } from "../types";
import { CardShareAction } from "./CardShareAction";
import { EventCardArtwork } from "./EventCardArtwork";
import { isOrganizerAvatarImage, organizerProfileEventName } from "./EventCardPrimitives";
import { EventWeatherStrip } from "./EventWeatherStrip";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "").replace(/^\//, "");

const copy: Record<Language, {
  public: string;
  private: string;
  invite: string;
  route: string;
  organizer: string;
  participants: string;
  allParticipants: string;
  chat: string;
  noUnread: string;
  unread: string;
  mapProvider: string;
  share: string;
}> = {
  ru: { public: "Публичное", private: "Приватное", invite: "По приглашению", route: "Построить маршрут", organizer: "Организатор", participants: "Участники", allParticipants: "Все участники", chat: "Чат события", noUnread: "Нет новых сообщений", unread: "Новых сообщений", mapProvider: "Открывать карту в", share: "Поделиться" },
  uk: { public: "Публічна", private: "Приватна", invite: "За запрошенням", route: "Побудувати маршрут", organizer: "Організатор", participants: "Учасники", allParticipants: "Усі учасники", chat: "Чат події", noUnread: "Немає нових повідомлень", unread: "Нових повідомлень", mapProvider: "Відкривати мапу в", share: "Поділитися" },
  cs: { public: "Veřejná", private: "Soukromá", invite: "Na pozvání", route: "Naplánovat trasu", organizer: "Organizátor", participants: "Účastníci", allParticipants: "Všichni účastníci", chat: "Chat události", noUnread: "Žádné nové zprávy", unread: "Nové zprávy", mapProvider: "Otevírat mapu v", share: "Sdílet" },
  en: { public: "Public", private: "Private", invite: "Invite only", route: "Build route", organizer: "Organizer", participants: "Participants", allParticipants: "All participants", chat: "Event chat", noUnread: "No new messages", unread: "New messages", mapProvider: "Open maps with", share: "Share" },
};

const providerLabels: Record<EventMapProvider, string> = {
  mapy: "Mapy.com",
  google: "Google Maps",
  apple: "Apple Maps",
};

const normalizeText = (value: string) => stripLeadingEmoji(value).trim();

export const findActivityForDetailsSheet = (
  activities: Activity[],
  language: Language,
  title: string,
  description: string,
) => {
  const normalizedTitle = normalizeText(title);
  const normalizedDescription = normalizeText(description);
  return activities.find((activity) => (
    normalizeText(activity.title[language]) === normalizedTitle
    && normalizeText(activity.description[language]) === normalizedDescription
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

const fallbackIdentity = (userKey: string, name: string): OrganizerIdentity => ({
  organizerKey: userKey,
  displayName: name || "GO IRL User",
  bio: "",
  cityId: "",
  avatar: organizerInitials(name || "GO IRL User"),
});

function ProfileAction({ userKey, name, compact = false }: { userKey: string; name: string; compact?: boolean }) {
  const [identity, setIdentity] = useState<OrganizerIdentity>(() => fallbackIdentity(userKey, name));

  useEffect(() => {
    let active = true;
    void resolveOrganizerIdentity(userKey, name).then((next) => {
      if (active) setIdentity(next);
    });
    return () => { active = false; };
  }, [name, userKey]);

  return (
    <button
      className={compact ? "event-details-v2-profile compact" : "event-details-v2-profile"}
      type="button"
      aria-label={identity.displayName}
      onClick={() => window.dispatchEvent(new CustomEvent(organizerProfileEventName, { detail: identity }))}
    >
      <span className="event-details-v2-avatar">
        {isOrganizerAvatarImage(identity.avatar) ? <img src={identity.avatar} alt="" /> : identity.avatar}
      </span>
      {!compact ? (
        <span className="event-details-v2-profile-copy">
          <strong>{identity.displayName}</strong>
          {identity.bio ? <small>{identity.bio}</small> : null}
        </span>
      ) : null}
    </button>
  );
}

function EventDetailsTemplate({ portal }: { portal: PortalState }) {
  const { language } = useAppStore();
  const activity = portal.activity;
  const labels = copy[language];
  const cityName = getCity(activity.cityId).name[language];
  const [provider, setProvider] = useState<EventMapProvider>(() => loadPreferredEventMapProvider());
  const [unread, setUnread] = useState(0);
  const joinedMembers = useMemo(() => activity.members.filter((member) => member.status === "joined"), [activity.members]);
  const mapEmbedUrl = useMemo(() => buildEventMapEmbedUrl(activity), [activity]);
  const mapTarget = useMemo(() => buildEventMapProviderUrl(activity, cityName, provider), [activity, cityName, provider]);
  const eventDate = useMemo(() => new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(`${activity.date}T12:00:00`)), [activity.date, language]);
  const time = formatEventTime(activity.time);
  const shareDate = `${eventDate}${time ? ` · ${time}` : ""}`;
  const shareUrl = activityInviteUrl(activity);
  const visibility = activity.visibility === "public" ? labels.public : activity.visibility === "private" ? labels.private : labels.invite;

  const refreshUnread = useCallback(async () => {
    try {
      const [messages, identity] = await Promise.all([
        loadActivityChatMessages(activity.id),
        getCurrentChatIdentity(),
      ]);
      setUnread(countUnreadActivityChatMessages(
        messages,
        identity.userKey,
        loadActivityChatReadAt(activity.id),
      ));
    } catch {
      setUnread(0);
    }
  }, [activity.id]);

  useEffect(() => {
    void refreshUnread();
    const timer = window.setInterval(() => { if (!document.hidden) void refreshUnread(); }, 20_000);
    window.addEventListener("focus", refreshUnread);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refreshUnread);
    };
  }, [refreshUnread]);

  const selectProvider = (next: EventMapProvider) => {
    setProvider(next);
    savePreferredEventMapProvider(next);
  };

  const openRoute = () => {
    const webApp = getTelegramWebApp();
    if (webApp?.openLink) {
      webApp.openLink(mapTarget, { try_instant_view: false });
      return;
    }
    window.open(mapTarget, "_blank", "noopener,noreferrer");
  };

  const openChat = () => {
    markActivityChatRead(activity.id);
    setUnread(0);
    const toggle = portal.sheet.querySelector<HTMLButtonElement>(".activity-chat-toggle");
    if (toggle?.getAttribute("aria-expanded") !== "true") toggle?.click();
    window.requestAnimationFrame(() => portal.sheet.querySelector(".activity-chat-panel")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const openMembers = () => {
    const section = portal.sheet.querySelector(".members-section");
    const toggle = portal.sheet.querySelector<HTMLButtonElement>(".detail-members-toggle");
    if (!section) toggle?.click();
    window.requestAnimationFrame(() => portal.sheet.querySelector(".members-section")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="event-details-v2">
      <section className="event-details-v2-hero">
        <EventCardArtwork
          icon={stripLeadingEmoji(activity.activity[language]).slice(0, 2) || "✨"}
          activity={activity.activity[language]}
          title={activity.title[language]}
        />
        <div className="event-details-v2-hero-shade" />
        <div className="event-details-v2-share">
          <CardShareAction
            title={normalizeText(activity.title[language])}
            date={shareDate}
            address={activity.address || cityName}
            url={shareUrl}
            label={labels.share}
            onTelegramShare={() => sharePreparedTelegramEvent(activity, language)}
          />
        </div>
        <div className="event-details-v2-hero-copy">
          <span className="event-details-v2-visibility">{visibility}</span>
          <h1>{normalizeText(activity.title[language])}</h1>
          <p>{normalizeText(activity.description[language])}</p>
          <div className="event-details-v2-hero-meta">
            <span><CalendarDays aria-hidden="true" />{shareDate}</span>
            <span><MapPin aria-hidden="true" />{activity.address || cityName}</span>
          </div>
          <EventWeatherStrip
            activity={activity}
            language={language}
            enabled={isOutdoorGenericActivity(activity)}
            durationMinutes={activity.metadata?.sport?.durationMinutes || 90}
          />
        </div>
      </section>

      <section className="event-details-v2-map" aria-label={activity.address || cityName}>
        {mapEmbedUrl ? <iframe title={activity.address || cityName} src={mapEmbedUrl} loading="lazy" /> : <div className="event-details-v2-map-fallback"><MapPin aria-hidden="true" /></div>}
        <div className="event-details-v2-map-overlay">
          <strong>{activity.address || cityName}</strong>
          <small>{labels.mapProvider}</small>
          <div className="event-details-v2-provider-row" data-map-provider-choice>
            {(Object.keys(providerLabels) as EventMapProvider[]).map((item) => (
              <button className={provider === item ? "is-selected" : ""} key={item} type="button" onClick={() => selectProvider(item)}>{providerLabels[item]}</button>
            ))}
          </div>
          <button className="event-details-v2-route" type="button" onClick={openRoute}><Navigation aria-hidden="true" />{labels.route}</button>
        </div>
      </section>

      <section className="event-details-v2-people">
        <div className="event-details-v2-section-label">{labels.organizer}</div>
        <ProfileAction userKey={activity.organizerKey} name={activity.organizer} />
      </section>

      <section className="event-details-v2-people">
        <div className="event-details-v2-section-head">
          <span>{labels.participants}</span>
          <strong>{activity.participants} / {activity.capacity}</strong>
        </div>
        <div className="event-details-v2-participant-row">
          {joinedMembers.slice(0, 5).map((member) => <ProfileAction compact key={member.userKey} userKey={member.userKey} name={member.name} />)}
          {joinedMembers.length > 5 ? <span className="event-details-v2-more">+{joinedMembers.length - 5}</span> : null}
          <button className="event-details-v2-all-participants" type="button" onClick={openMembers}>{labels.allParticipants}<ChevronRight aria-hidden="true" /></button>
        </div>
      </section>

      <button className="event-details-v2-chat" type="button" onClick={openChat}>
        <span className="event-details-v2-chat-icon"><MessageCircle aria-hidden="true" />{unread > 0 ? <b>{unread}</b> : null}</span>
        <span><strong>{labels.chat}</strong><small>{unread > 0 ? `${labels.unread}: ${unread}` : labels.noUnread}</small></span>
        <ChevronRight aria-hidden="true" />
      </button>
    </div>
  );
}

export function EventDetailsTemplatePortal() {
  const { activities, language } = useAppStore();
  const [portal, setPortal] = useState<PortalState | null>(null);

  useEffect(() => {
    const refresh = () => {
      const sheet = document.querySelector<HTMLElement>(".activity-sheet");
      const title = sheet?.querySelector("h2")?.textContent || "";
      const description = sheet?.querySelector(".sport-sheet-hero p, .sheet-description")?.textContent || "";
      const activity = sheet ? findActivityForDetailsSheet(activities, language, title, description) : null;

      if (!sheet || !activity) {
        setPortal((current) => {
          current?.sheet.classList.remove("event-details-v2-active");
          current?.target.remove();
          return null;
        });
        return;
      }

      setPortal((current) => {
        if (current?.target.isConnected && current.sheet === sheet && current.activity.id === activity.id) return current;
        current?.sheet.classList.remove("event-details-v2-active");
        current?.target.remove();
        const target = document.createElement("div");
        target.className = "event-details-v2-portal-slot";
        const anchor = sheet.querySelector(".sport-sheet-hero, .sheet-symbol");
        if (anchor) sheet.insertBefore(target, anchor);
        else sheet.prepend(target);
        sheet.classList.add("event-details-v2-active");
        return { target, sheet, activity };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortal((current) => {
        current?.sheet.classList.remove("event-details-v2-active");
        current?.target.remove();
        return null;
      });
    };
  }, [activities, language]);

  if (!portal) return null;
  return createPortal(<EventDetailsTemplate portal={portal} />, portal.target);
}
