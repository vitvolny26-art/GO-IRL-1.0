import { useEffect, useState } from "react";
import { CalendarDays, CalendarPlus, Check, ChevronRight, CircleUserRound, Clock3, Bug, Dumbbell, Ellipsis, MapPin, Pencil, Share2, ShieldCheck, Sparkles, Star, Ticket, Trash2, UsersRound, X } from "lucide-react";
import { getTranslation, localeByLanguage } from "../i18n";
import { openBugReport } from "../bugReport";
import { getEventWeather, type WeatherHour, type WeatherResult } from "../services/weather";
import { formatEventTime } from "../eventTime";
import { useAppStore } from "../store";
import { getUserKey } from "../supabase";
import type { Activity, Language, SportMetadata } from "../types";
import { getSportMetadata, sportEnvironmentLabel, sportEnvironments, sportFormatLabel, sportFormats, sportLevelLabel, sportLevels } from "./sport";
import { ActivityChatPanel } from "../components/ActivityChatPanel";
import { CoachRequestPanel } from "../components/CoachRequestPanel";
import { getOrganizerRoleRequestState } from "../coachFeature";
import { getCity } from "../config/cities";
import { buildGoogleCalendarUrl } from "../calendar/googleCalendar";
import { getTelegramWebApp } from "../telegram";
import { CardShareAction } from "../components/CardShareAction";
import { stripLeadingEmoji } from "../cardText";
import { activityIconFromText } from "../activityIcon";
import { buildBrowserActivityInviteUrl, buildTelegramActivityInviteUrl } from "../invitationLink";
import { EventWeatherStrip } from "../components/EventWeatherStrip";
import { sharePreparedTelegramEvent } from "../telegramPreparedShare";

type CoachRequestsChangedDetail = { activityId?: string };

const coachRequestsChangedEvent = "go-irl-coach-requests-changed";
const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "").replace(/^\//, "");

const activityInviteUrl = (activity: Activity) => {
  return buildTelegramActivityInviteUrl(activity.id, telegramBotUsername, telegramAppName)
    || buildBrowserActivityInviteUrl(activity.id, window.location.origin);
};

const openActivityMap = (activity: Activity) => {
  if (activity.locationUrl?.trim()) {
    window.open(activity.locationUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const city = getCity(activity.cityId).name.en;
  const query = encodeURIComponent(activity.address.trim() || city);
  window.open(`https://mapy.cz/zakladni?q=${query}`, "_blank", "noopener,noreferrer");
};

const openActivityCalendar = (activity: Activity, language: Language) => {
  const url = buildGoogleCalendarUrl(activity, {
    language,
    eventUrl: activityInviteUrl(activity),
  });
  const webApp = getTelegramWebApp();
  if (webApp?.openLink) {
    webApp.openLink(url, { try_instant_view: false });
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
};

const coachCardCopy: Record<Language, { needed: string; requested: string; confirmed: string }> = {
  ru: { needed: "Нужен тренер", requested: "Тренер запрошен", confirmed: "Есть тренер" },
  uk: { needed: "Потрібен тренер", requested: "Тренера запитано", confirmed: "Є тренер" },
  cs: { needed: "Potřebujeme trenéra", requested: "Trenér vyžádán", confirmed: "Trenér potvrzen" },
  en: { needed: "Coach needed", requested: "Coach requested", confirmed: "Coach confirmed" },
};

const cleanSportLabel = (value: string | null | undefined) => {
  const raw = String(value || "").trim();
  return stripLeadingEmoji(raw) || "Спорт";
};

const buildMapsQuery = (parts: Array<string | null | undefined>) =>
  parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean).join(", ");

const buildGoogleMapsSearchUrl = (query: string) =>
  query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : null;

const weatherSummaryLines = (weather: WeatherResult) => [
  `🌡️ ${weather.temperature}°C`,
  `☔ ${weather.rain}%`,
  `💨 ${weather.wind} km/h`,
];

const sportAvatar = (value: string | null | undefined) => {
  return activityIconFromText(String(value || ""), "🏆");
};

const sportAvatarForActivity = (activity: Activity, language: Language, meta: SportMetadata) =>
  sportAvatar([meta.sportType, activity.activity[language], activity.title[language]].filter(Boolean).join(" "));

type SportCardProps = {
  activity: Activity;
  language: Language;
  onOpen: (activity: Activity) => void;
  onJoin: (activity: Activity) => void;
  onOpenMembers?: (activity: Activity) => void;
};

type SportSheetProps = {
  activity: Activity;
  language: Language;
  cityName: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onJoin: (activity: Activity) => void;
  onShare: (activity: Activity) => void;
  onCalendar: (activity: Activity) => void;
  onEdit: (activity: Activity) => void;
  onDelete: (activity: Activity) => void;
  onCloseMiniApp: () => void;
  initialMembersOpen?: boolean;
};

export function SportCreateFields({ language, initialSport }: { language: Language; initialSport: SportMetadata }) {
  const t = getTranslation(language);
  return (
    <div className="sport-create-panel">
      <div className="sport-panel-title"> {t.sportVertical}</div>
      <div className="form-row">
        <label><span>{t.sportLevel}</span><select name="sportLevel" defaultValue={initialSport.level || "intermediate"}>{sportLevels.map((level) => <option key={level.id} value={level.id}>{level.label[language]}</option>)}</select></label>
        <label><span>{t.sportFormat}</span><select name="sportFormat" defaultValue={initialSport.format || "casual"}>{sportFormats.map((format) => <option key={format.id} value={format.id}>{format.label[language]}</option>)}</select></label>
      </div>
      <div className="form-row">
        <label><span>{t.sportEnvironment}</span><select name="sportEnvironment" defaultValue={initialSport.environment || "outdoor"}>{sportEnvironments.map((environment) => <option key={environment.id} value={environment.id}>{environment.label[language]}</option>)}</select></label>
        <label><span>{t.sportDuration}</span><input name="sportDuration" type="number" min="15" max="480" step="15" defaultValue={initialSport.durationMinutes || 90} /></label>
      </div>
      <label className="sport-check"><input name="sportEquipmentNeeded" type="checkbox" defaultChecked={Boolean(initialSport.equipmentNeeded)} /><span>{t.sportEquipmentNeeded}</span></label>
      <label><span>{t.sportEquipment}</span><input name="sportEquipment" defaultValue={initialSport.equipment} placeholder={t.sportEquipmentPlaceholder} /></label>
      <label><span>{t.sportBring}</span><input name="sportBring" defaultValue={initialSport.bring} placeholder={t.sportBringPlaceholder} /></label>
      <label><span>{t.sportRequirements}</span><input name="sportRequirements" defaultValue={initialSport.requirements} placeholder={t.sportRequirementsPlaceholder} /></label>
      <label><span>{t.sportOrganizerTips}</span><textarea name="sportOrganizerTips" rows={3} defaultValue={initialSport.organizerTips} placeholder={t.sportOrganizerTipsPlaceholder} /></label>
    </div>
  );
}

const compactDateLabel = (date: string, language: Language) => {
  const t = getTranslation(language);
  const eventDate = new Date(`${date}T12:00:00`);
  const today = new Date();
  const todayKey = today.toISOString().slice(0, 10);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date === todayKey) return t.today;
  if (date === tomorrow.toISOString().slice(0, 10)) return t.tomorrow;

  return new Intl.DateTimeFormat(localeByLanguage[language], {
    day: "numeric",
    month: "short",
  }).format(eventDate);
};

const dateLabel = (date: string, language: Language) =>
  new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));

function SportDetailsSkeleton() {
  return (
    <div className="details-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

export function SportActivityCard({ activity, language, onOpen, onJoin }: SportCardProps) {
  const { joinedIds, waitingIds, pendingIds } = useAppStore();
  const t = getTranslation(language);
  const meta = getSportMetadata(activity);
  const joined = joinedIds.includes(activity.id);
  const waiting = waitingIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const isOrganizer = activity.organizerKey === getUserKey();
  const full = activity.participants >= activity.capacity;
  const action = isOrganizer
    ? t.open
    : pending
      ? t.cardRequestSent
      : joined
        ? t.cardOpenChat
        : waiting
          ? t.cardWaitlist
          : activity.visibility === "private"
            ? t.cardInviteOnly
            : full
              ? t.cardNoSpots
              : activity.visibility === "invite"
                ? t.cardJoinRequest
                : t.cardJoin;
  const [membersPreviewOpen, setMembersPreviewOpen] = useState(false);
  const [coachState, setCoachState] = useState<"none" | "requested" | "confirmed">("none");
  const avatar = sportAvatarForActivity(activity, language, meta);
  const mapLabel = activity.address.trim() || getCity(activity.cityId).name[language];
  const hasCardState = isOrganizer || joined || waiting || pending;
  const joinDisabled = !hasCardState && (full || activity.visibility === "private");
  const coachAction = isOrganizer
    ? coachState === "confirmed"
      ? coachCardCopy[language].confirmed
      : coachState === "requested"
        ? coachCardCopy[language].requested
        : coachCardCopy[language].needed
    : coachState === "confirmed"
      ? coachCardCopy[language].confirmed
      : t.details;

  const joinedMembers = activity.members.filter(m => m.status === "joined");
  const shareTitle = cleanSportLabel(activity.activity[language]);
  const shareDate = `${compactDateLabel(activity.date, language)}${formatEventTime(activity.time) ? ` · ${formatEventTime(activity.time)}` : ""}`;

  useEffect(() => {
    let active = true;

    const refreshConfirmedCoach = () => {
      void getOrganizerRoleRequestState(activity.id)
        .then((state) => {
          if (active) setCoachState(state);
        })
        .catch(() => {
          if (active) setCoachState("none");
        });
    };

    const handleCoachRequestsChanged = (event: Event) => {
      const detail = (event as CustomEvent<CoachRequestsChangedDetail>).detail;
      if (detail?.activityId && detail.activityId !== activity.id) return;

      refreshConfirmedCoach();
    };

    refreshConfirmedCoach();
    window.addEventListener(coachRequestsChangedEvent, handleCoachRequestsChanged);

    return () => {
      active = false;
      window.removeEventListener(coachRequestsChangedEvent, handleCoachRequestsChanged);
    };
  }, [activity.id]);

  return (
    <article className="sport-card compact-sport-card unified-event-card">
      <div className="sport-card-top-actions">
        <CardShareAction
          title={shareTitle}
          date={shareDate}
          address={activity.address}
          url={activityInviteUrl(activity)}
          label={t.share}
          onTelegramShare={() => sharePreparedTelegramEvent(activity, language)}
        />
      </div>
      <button className="sport-card-main" onClick={() => onOpen(activity)} type="button">
        <div className="sport-card-symbol"><span className="sport-avatar-glyph">{avatar}</span></div>
        <div>
          <div className="sport-eyebrow"><Sparkles size={14} aria-hidden="true" /> <span>{sportLevelLabel(meta.level, language)} · {sportEnvironmentLabel(meta.environment, language)}</span></div>
          <h3>{shareTitle}</h3>
          <p>{stripLeadingEmoji(activity.title[language])}</p>
        </div>
      </button>
      <div className="sport-chip-row">
        {coachState === "confirmed" ? <span className="sport-card-chip"><Sparkles size={16} aria-hidden="true" /><span>{coachCardCopy[language].confirmed}</span></span> : null}
        <button
          className="sport-card-participants-chip"
          type="button"
          aria-label={`${t.participants}: ${activity.participants} / ${activity.capacity}`}
          aria-expanded={membersPreviewOpen}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMembersPreviewOpen(prev => !prev);
          }}
        >
          <UsersRound size={16} aria-hidden="true" />
          <span>{activity.participants} / {activity.capacity}</span>
        </button>
        <span
          className="sport-card-chip sport-duration-chip"
          aria-label={`${t.sportDuration}: ${meta.durationMinutes || 90} ${t.minutesShort}`}
        >
          <CalendarPlus size={16} aria-hidden="true" />
          <span>{meta.durationMinutes || 90} {t.minutesShort}</span>
        </span>
      </div>
      {membersPreviewOpen && (
        <div className="sport-card-members-preview">
          {joinedMembers.length > 0 ? (
            joinedMembers.map((member) => (
              <div key={member.userKey} className="sport-card-member-preview-row">
                <span className="sport-card-member-avatar">
                  {member.name?.slice(0, 2).toUpperCase() || "GO"}
                </span>
                <span className="sport-card-member-name">
                  {member.name || "GO IRL User"}
                </span>
              </div>
            ))
          ) : (
            <div className="sport-card-members-empty">
              {t.noParticipants || "Пока никого нет"}
            </div>
          )}
        </div>
      )}
      <div className="activity-card-details sport-details-grid">
        <button
          type="button"
          aria-label={t.addToGoogleCalendar}
          onClick={(event) => {
            event.stopPropagation();
            openActivityCalendar(activity, language);
          }}
        ><CalendarDays /><span>{shareDate}</span></button>
        <div><Ticket /><span>{activity.price ? `${activity.price} Kč` : t.free}</span></div>
        <button
          type="button"
          aria-label={`${t.address}: ${mapLabel}`}
          onClick={(event) => {
            event.stopPropagation();
            openActivityMap(activity);
          }}
        ><MapPin /><span>{mapLabel}</span></button>
        <div className="unified-status-cell"><ShieldCheck /><Star /><span>{sportLevelLabel(meta.level, language)} · {sportFormatLabel(meta.format, language)}</span></div>
      </div>
      <EventWeatherStrip activity={activity} language={language} enabled={meta.environment === "outdoor"} durationMinutes={meta.durationMinutes || 90} />
      <div className="activity-card-footer compact-sport-actions">
        <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><Dumbbell size={18} />{coachAction}</button>
        <button className={hasCardState ? "card-join secondary" : "card-join"} onClick={() => hasCardState ? onOpen(activity) : onJoin(activity)} type="button" disabled={joinDisabled}>{action}</button>
      </div>
    </article>
  );
}

export function SportActivitySheet({
  activity,
  language,
  cityName,
  loading,
  error,
  onClose,
  onJoin,
  onShare,
  onCalendar,
  onEdit,
  onDelete,
  onCloseMiniApp,
  initialMembersOpen = false,
}: SportSheetProps) {
  const { joinedIds, pendingIds, userRole, reviewRequest } = useAppStore();
  const [membersOpen, setMembersOpen] = useState(initialMembersOpen);
  const t = getTranslation(language);
  const [weatherText, setWeatherText] = useState(t.weatherPlaceholder);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [weatherHours, setWeatherHours] = useState<WeatherHour[]>([]);
  const [weatherDetailsOpen, setWeatherDetailsOpen] = useState(false);
  const meta = getSportMetadata(activity);
  const showWeather = meta.environment === "outdoor";
  const isOrganizer = activity.organizerKey === getUserKey();
  const canDelete = isOrganizer || userRole === "admin";
  const canManageActivity = isOrganizer || userRole === "admin" || userRole === "moderator";
  const joined = joinedIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const full = activity.participants >= activity.capacity;
  const action = isOrganizer ? t.edit : pending ? t.cancelRequest : joined ? t.leave : full ? t.eventFull : activity.visibility === "invite" ? t.request : t.join;
  const joinedMembers = activity.members.filter((member) => member.status === "joined");
  const waitingMembers = activity.members.filter((member) => member.status === "waiting");
  const pendingMembers = activity.members.filter((member) => member.status === "pending");
  const sportMapQuery = buildMapsQuery([activity.address, cityName]);
  const sportMapSearchUrl = buildGoogleMapsSearchUrl(sportMapQuery);
  const avatar = sportAvatarForActivity(activity, language, meta);

  useEffect(() => {
    setMembersOpen(initialMembersOpen);
  }, [activity.id, initialMembersOpen]);

  useEffect(() => {
    let active = true;

    if (!showWeather) {
      setWeatherText("");
      setWeather(null);
      setWeatherHours([]);
      setWeatherDetailsOpen(false);
      return;
    }

    const days = Math.round((new Date(`${activity.date}T12:00:00`).getTime() - new Date(new Date().setHours(12, 0, 0, 0)).getTime()) / 86400000);

    if (days > 7) {
      setWeatherText(t.weatherAvailableSoon);
      setWeather(null);
      setWeatherHours([]);
      return;
    }

    setWeatherText(t.weatherLoading);
    setWeather(null);
    setWeatherHours([]);
    void getEventWeather({ date: activity.date, time: activity.time, address: activity.address, city: cityName, durationMinutes: meta.durationMinutes || 90 })
      .then((nextWeather) => {
        if (!active) return;
        setWeather(nextWeather);
        setWeatherText(nextWeather?.text || t.weatherUnavailable);
        setWeatherHours(nextWeather?.hours || []);
      });

    return () => {
      active = false;
    };
  }, [activity.id, activity.date, activity.time, activity.address, cityName, showWeather, meta.durationMinutes, t.weatherAvailableSoon, t.weatherLoading, t.weatherUnavailable]);

  const handleReview = async (memberKey: string, approved: boolean) => {
    await reviewRequest(activity.id, memberKey, approved);
  };

  return (
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <article className="activity-sheet sport-sheet" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose} type="button" aria-label={t.close}><X /></button>
        {loading && <SportDetailsSkeleton />}
        {error && <div className="details-error"><ShieldCheck /><span>{t.databaseError}</span></div>}
        <div className="sport-sheet-hero">
          <div className="sport-card-symbol large"><span className="sport-avatar-glyph">{avatar}</span></div>
          <div>
            <div className="sport-eyebrow">{sportLevelLabel(meta.level, language)} · {sportEnvironmentLabel(meta.environment, language)}</div>
            <h2>{stripLeadingEmoji(activity.title[language])}</h2>
            <p>{stripLeadingEmoji(activity.description[language])}</p>
          </div>
        </div>
        <div className="sport-chip-row sport-sheet-chips">
          <span>{cleanSportLabel(meta.sportType || activity.activity[language])}</span>
          <span>{sportEnvironmentLabel(meta.environment, language)}</span>
          <span>{meta.durationMinutes || 90} {t.minutesShort}</span>
        </div>
        <div className="detail-list sport-detail-list">
          <div><Sparkles /><span>{t.sportLevel}</span><strong>{sportLevelLabel(meta.level, language)}</strong></div>
          <div><ShieldCheck /><span>{t.sportFormat}</span><strong>{sportFormatLabel(meta.format, language)}</strong></div>
          <div><MapPin /><span>{t.city}</span><strong>{cityName}</strong></div>
          <div><MapPin /><span>{t.address}</span><a className="sport-address-link" href={activity.locationUrl || sportMapSearchUrl || "#"} target="_blank" rel="noreferrer">{activity.address || cityName}</a></div>
          <div><CalendarDays /><span>{dateLabel(activity.date, language)}</span>{formatEventTime(activity.time) ? <strong>{formatEventTime(activity.time)}</strong> : null}</div>
          <div><Ticket /><span>{t.price}</span><strong>{activity.price ? `${activity.price} Kč` : t.free}</strong></div>
          <div><ShieldCheck /><span>{t.sportEquipmentNeeded}</span><strong>{meta.equipmentNeeded ? t.yes : t.no}</strong></div>
          {meta.equipment && <div><Sparkles /><span>{t.sportEquipment}</span><strong>{meta.equipment}</strong></div>}
          {meta.bring && <div><Sparkles /><span>{t.sportBring}</span><strong>{meta.bring}</strong></div>}
          {meta.requirements && <div><ShieldCheck /><span>{t.sportRequirements}</span><strong>{meta.requirements}</strong></div>}
          {meta.organizerTips && <div><CircleUserRound /><span>{t.sportOrganizerTips}</span><strong>{meta.organizerTips}</strong></div>}
          {showWeather && (
            <button className="weather-detail-toggle" onClick={() => setWeatherDetailsOpen((open) => !open)} type="button">
              <Sparkles />
              <span>{t.weatherHint}</span>
              <strong className="weather-summary-lines">
                {weather ? weatherSummaryLines(weather).map((line) => <span key={line}>{line}</span>) : weatherText}
              </strong>
            </button>
          )}
        </div>
        {showWeather && weatherDetailsOpen && weatherHours.length > 0 && (
          <section className="weather-detail-card" aria-label={t.weatherDetails}>
            <div className="weather-detail-head">
              <span>{t.weatherDetails}</span>
              <strong>{weather ? weatherSummaryLines(weather).join(" · ") : weatherText}</strong>
            </div>
            <div className="weather-bars">
              {weatherHours.map((hour) => (
                <div className="weather-bar-row" key={hour.time}>
                  <span>{hour.time.slice(11, 16)}</span>
                  <span className="weather-hour-metric">🌡️ {hour.temperature}°C</span>
                  <span className="weather-hour-metric">☔ {hour.rain}%</span>
                  <span className="weather-hour-metric">💨 {hour.wind} km/h</span>
                </div>
              ))}
            </div>
          </section>
        )}
        {sportMapSearchUrl && (
          <section className="sport-place-card" aria-label="Место события">
            <div>
              <span>Место</span>
              <strong>{activity.address || cityName}</strong>
            </div>
            <a className="sport-map-link" href={sportMapSearchUrl} target="_blank" rel="noreferrer">
              Открыть в Google Maps
            </a>
          </section>
        )}

        <CoachRequestPanel activity={activity} userRole={userRole} />

        <ActivityChatPanel activity={activity} />

        <button className="detail-members-toggle" onClick={() => setMembersOpen((open: boolean) => !open)} type="button" aria-expanded={membersOpen}>
          <UsersRound />
          <span>{t.participants}</span>
          <strong>{activity.participants} / {activity.capacity}</strong>
          <ChevronRight className={membersOpen ? "open" : ""} />
        </button>
        {membersOpen && (
          <div className="members-section">
            <div className="members-list">
              {joinedMembers.map((member) => (
                <div className="member-row" key={member.userKey}>
                  <span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>
                  <strong>{member.name}</strong>
                  <UsersRound />
                </div>
              ))}
              {!joinedMembers.length && <p>{t.noParticipants}</p>}
              {waitingMembers.length > 0 && <div className="waiting-heading">{t.waitingList} · {waitingMembers.length}</div>}
              {waitingMembers.map((member) => (
                <div className="member-row waiting-member" key={member.userKey}>
                  <span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>
                  <strong>{member.name}</strong>
                  <Clock3 />
                </div>
              ))}
              {canManageActivity && pendingMembers.length > 0 && <div className="pending-heading">{t.requests} · {pendingMembers.length}</div>}
              {canManageActivity && pendingMembers.map((member) => (
                <div className="member-row pending-member" key={member.userKey}>
                  <span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>
                  <strong>{member.name}</strong>
                  <span className="request-actions">
                    <button onClick={() => void handleReview(member.userKey, true)} type="button" aria-label={t.approve} title={t.approve}><Check /></button>
                    <button onClick={() => void handleReview(member.userKey, false)} type="button" aria-label={t.reject} title={t.reject}><X /></button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sheet-actions compact-sheet-actions">
          <button className="main-action" onClick={() => isOrganizer ? onEdit(activity) : onJoin(activity)} type="button" disabled={!isOrganizer && full && !joined && !pending}>{isOrganizer && <Pencil size={18} />}{action}</button>
          <details className="event-more-actions">
            <summary className="square-action" aria-label="Еще" title="Еще"><Ellipsis aria-hidden="true" /></summary>
            <div className="event-more-menu">
              <button onClick={() => void onShare(activity)} type="button"><Share2 size={18} />{t.share}</button>
              <button onClick={() => onCalendar(activity)} type="button"><CalendarPlus size={18} />{t.addToGoogleCalendar}</button>
              <button onClick={() => openBugReport(activity, language)} type="button"><Bug size={18} />{t.report}</button>
            </div>
          </details>
        </div>
        {canDelete && <button className="danger-action" onClick={() => onDelete(activity)} type="button"><Trash2 size={18} />{t.delete}</button>}
        <button className="telegram-close-button compact" onClick={onCloseMiniApp} type="button">{t.backToTelegram}</button>
      </article>
    </div>
  );
}
