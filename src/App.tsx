import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent, type TouchEvent as ReactTouchEvent } from "react";
import {
  ArrowLeft,
  BellDot,
  CalendarDays,
  CalendarPlus,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Compass,
  Dices,
  Bug,
  Camera,
  Home,
  MapPin,
  Ellipsis,
  Pencil,
  Plus,
  Search,
  Share2,
  ShieldCheck,
  Sparkles,
  Star,
  Ticket,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import { activityOptions, categories, closedBetaActivityOptions, closedBetaCategories } from "./data";
import { AppHeader } from "./components/AppHeader";
import { DevPanel } from "./components/DevPanel";
import { buildGoogleCalendarUrl } from "./calendar/googleCalendar";
import { openBugReport } from "./bugReport";
import { getCurrentAuthIdentity, getCurrentStartParam, initializeTrustedAuth, isTrustedAuthReady } from "./authSession";
import { cities, getCity } from "./config/cities";
import { getTranslation, localeByLanguage } from "./i18n";
import { formatEventTime } from "./eventTime";
import {
  applyDiscoverFilters,
  actionableSurpriseActivities,
  matchesActivityInterest,
  searchActivities,
  simpleRecommendationEngine,
  type DiscoverFilter,
} from "./recommendations";
import { useAppStore } from "./store";
import { ShareTemplateService } from "./share";
import { getUserKey, supabase } from "./supabase";
import { closeMiniApp, expandMiniApp, getTelegramWebApp, impactTelegram, notifyTelegram, readyMiniApp, showBackButton } from "./telegram";
import type { Activity, AppView, Category, Language, NewActivity, SportEnvironment, SportFormat, SportLevel, SportMetadata } from "./types";
import {
  MAX_EVENT_ADDRESS_LENGTH,
  MAX_EVENT_CAPACITY,
  MAX_EVENT_DESCRIPTION_LENGTH,
  MAX_EVENT_NOTE_LENGTH,
  MAX_EVENT_PRICE,
  MAX_EVENT_TITLE_LENGTH,
  MIN_EVENT_CAPACITY,
  validateEventCapacity,
  validateEventDate,
  validateEventPrice,
  validateMaxLength,
  validateOptionalUrl,
  validateRequiredText,
} from "./validation";
import { ActivityChatPanel } from "./components/ActivityChatPanel";
import { EventCardMetaItem, EventDetailsAction, OrganizerAvatarAction, OrganizerDetailAction } from "./components/EventCardPrimitives";
import { getOrganizerRoleRequestState } from "./coachFeature";
import { CardShareAction } from "./components/CardShareAction";
import { CardReminderAction } from "./components/CardReminderAction";
import { EventCardArtwork } from "./components/EventCardArtwork";
import { stripLeadingEmoji } from "./cardText";
import { buildEventLocationUrl, loadSavedEventLocations, rememberEventLocation } from "./eventLocations";
import { openAvatarCropper } from "./avatarCropper";
import { activityIconFor } from "./activityIcon";
import {
  activityIdFromJoinPath,
  buildBrowserActivityInviteUrl,
  buildMetaEventPreviewUrl,
  buildSeparatedInvitationText,
  buildTelegramActivityInviteUrl,
  buildTelegramShareUrl,
  parseInvitationStartParam,
} from "./invitationLink";
import { EventWeatherStrip } from "./components/EventWeatherStrip";
import { isOutdoorGenericActivity } from "./eventWeather";
import { sharePreparedTelegramEvent } from "./telegramPreparedShare";
import {
  eventActionTranslationKey,
  eventStatusTranslationKey,
  isActivityFinished,
  resolveEventInteractionState,
  runEventPrimaryAction,
} from "./eventInteractionState";
import { isTabSwipeBlockedTarget, resolveAdjacentTab, resolveSwipeDirection } from "./bottom-nav-swipe";
import { isTemplateCarouselDrag } from "./templateCarousel";
import { createProfileRepository, type ProfileRepository } from "./profile/profileRepository";
import type { UserProfile, UserProfileDraft } from "./profile/profileTypes";


const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot").replace(/^@/, "");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "").replace(/^\//, "");

type ActivityOpenOptions = { focusChat?: boolean; focusRequests?: boolean };
type OpenActivity = (activity: Activity, options?: ActivityOpenOptions) => void;

const activityInviteUrl = (activity: Activity) => {
  return buildTelegramActivityInviteUrl(activity.id, telegramBotUsername, telegramAppName)
    || buildBrowserActivityInviteUrl(activity.id, window.location.origin);
};

const openActivityMap = (activity: Activity) => {
  if (activity.locationUrl?.trim()) {
    window.open(activity.locationUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const query = activity.address.trim() || getCity(activity.cityId).name.en;
  window.open(`https://mapy.cz/zakladni?q=${encodeURIComponent(query)}`, "_blank", "noopener,noreferrer");
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

const genericActivityAvatar = (activity: Activity, language: Language, fallback: string) => {
  return activityIconFor(activity, language, fallback || "✨");
};

const eventHelperCardCopy: Record<Language, { needed: string; requested: string; confirmed: string }> = {
  ru: { needed: "Нужен помощник", requested: "Помощник запрошен", confirmed: "Есть помощник" },
  uk: { needed: "Потрібен помічник", requested: "Помічника запитано", confirmed: "Є помічник" },
  cs: { needed: "Potřebujeme pomocníka", requested: "Pomocník vyžádán", confirmed: "Pomocník potvrzen" },
  en: { needed: "Helper needed", requested: "Helper requested", confirmed: "Helper confirmed" },
};

const LazySportActivityCard = lazy(() => import("./verticals/SportVertical").then((module) => ({ default: module.SportActivityCard })));
const LazySportActivitySheet = lazy(() => import("./verticals/SportVertical").then((module) => ({ default: module.SportActivitySheet })));
const LazySportCreateFields = lazy(() => import("./verticals/SportVertical").then((module) => ({ default: module.SportCreateFields })));

const dateLabel = (date: string, language: Language) =>
  new Intl.DateTimeFormat(localeByLanguage[language], {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(`${date}T12:00:00`));

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

const fallbackCategory: Category = {
  id: "custom",
  icon: "✨",
  name: { ru: "Событие", uk: "Подія", cs: "Událost", en: "Event" },
};

const getActivityCategory = (activity: Activity) =>
  categories.find((item) => item.id === activity.categoryId) || fallbackCategory;

const isSportExperience = (activity: Activity) => activity.type === "sport" || activity.categoryId === "sport";

const safeDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const favoriteActivityOptions = (language: Language) => {
  const t = getTranslation(language);
  return [
    { id: "coffee", label: t.templateCoffee },
    { id: "walks", label: t.templateWalk },
    { id: "skating", label: t.templateSkating },
    { id: "cycling", label: t.favoriteCycling },
    { id: "running", label: t.favoriteRunning },
    { id: "hiking", label: t.favoriteHiking },
    { id: "board-games", label: t.templateBoardGames },
    { id: "football", label: t.favoriteFootball },
    { id: "tennis", label: t.favoriteTennis },
    { id: "volleyball", label: t.favoriteVolleyball },
    { id: "basketball", label: t.favoriteBasketball },
    { id: "swimming", label: t.favoriteSwimming },
    { id: "yoga", label: t.favoriteYoga },
    { id: "fitness", label: t.favoriteFitness },
    { id: "concerts", label: t.favoriteConcerts },
    { id: "cinema", label: t.favoriteCinema },
    { id: "food", label: t.templateFood },
    { id: "language-exchange", label: t.favoriteLanguageExchange },
    { id: "other", label: t.templateOther },
  ];
};

const sportMetadataFromForm = (data: FormData, sportType: string): SportMetadata => ({
  sportType,
  level: String(data.get("sportLevel") || "intermediate") as SportLevel,
  format: String(data.get("sportFormat") || "casual") as SportFormat,
  environment: String(data.get("sportEnvironment") || "outdoor") as SportEnvironment,
  equipmentNeeded: data.get("sportEquipmentNeeded") === "on",
  equipment: String(data.get("sportEquipment") || "").trim(),
  bring: String(data.get("sportBring") || "").trim(),
  requirements: String(data.get("sportRequirements") || "").trim(),
  organizerTips: String(data.get("sportOrganizerTips") || "").trim(),
  durationMinutes: Number(data.get("sportDuration") || 90),
});

function App() {
  const store = useAppStore();
  const [selected, setSelected] = useState<Activity | null>(null);
  const [selectedMembersOpen, setSelectedMembersOpen] = useState(false);
  const [selectedChatRequest, setSelectedChatRequest] = useState(0);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [completion, setCompletion] = useState("");
  const [completionActivityId, setCompletionActivityId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const toastTimer = useRef<number | null>(null);
  const showNotice = (msg: string) => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    setNotice(msg);
    toastTimer.current = window.setTimeout(() => setNotice(""), 2200);
  };
  const invitationHandled = useRef(false);
  const tabSwipeStart = useRef<{ x: number; y: number } | null>(null);
  const t = getTranslation(store.language);
  const openActivity: OpenActivity = (activity, options) => {
    setSelected(activity);
    setSelectedMembersOpen(Boolean(options?.focusRequests));
    setSelectedChatRequest(options?.focusChat ? (request) => request + 1 : 0);
  };

  useEffect(() => {
  readyMiniApp();
  expandMiniApp();
  const init = async () => {
    await initializeTrustedAuth();
    await useAppStore.getState().initialize();
  };
  init();

  const handleVisibility = () => {
    if (document.hidden) {
      useAppStore.getState().disposeRealtime();
    } else {
      void (async () => {
        await initializeTrustedAuth();
        await useAppStore.getState().initialize();
      })();
    }
  };

  window.addEventListener("focus", handleVisibility);
  window.addEventListener("blur", handleVisibility);
  document.addEventListener("visibilitychange", handleVisibility);

  return () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    window.removeEventListener("focus", handleVisibility);
    window.removeEventListener("blur", handleVisibility);
    document.removeEventListener("visibilitychange", handleVisibility);
    useAppStore.getState().disposeRealtime();
  };
}, []);

  useEffect(() => {
    if (selected || store.view !== "home") {
      return showBackButton(() => {
        if (selected) {
          setSelected(null);
          setSelectedChatRequest(0);
        }
        else store.setView("home");
      });
    }
    return undefined;
  }, [selected, store.view, store]);

  useEffect(() => {
    if (invitationHandled.current) return;
    const startParam = getCurrentStartParam();
    const pathId = activityIdFromJoinPath(window.location.pathname);
    const parsedStartParam = startParam ? parseInvitationStartParam(startParam) : null;
    if (parsedStartParam && !parsedStartParam.valid) {
      invitationHandled.current = true;
      showNotice(t.invalidInvitationLink);
      return;
    }
    const invitedId = parsedStartParam?.eventId || pathId;
    const browserPreviewUrl = pathId && !isTrustedAuthReady()
      ? buildMetaEventPreviewUrl(pathId, window.location.origin, store.language)
      : null;
    if (browserPreviewUrl) {
      invitationHandled.current = true;
      window.location.replace(browserPreviewUrl);
      return;
    }
    if (invitedId) {
      const invitedActivity = store.activities.find((item) => item.id === invitedId);
      if (invitedActivity) {
        invitationHandled.current = true;
        openActivity(invitedActivity);
        if (window.location.pathname.startsWith("/join/")) {
          window.history.replaceState({}, "", "/");
        }
      } else if (!store.loading) {
        invitationHandled.current = true;
        showNotice(t.invitationEventNotFound);
      }
    }
  }, [store.activities, store.language, store.loading, t.invalidInvitationLink, t.invitationEventNotFound]);

  const flash = (message: string) => {
    setNotice(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(""), 2200);
  };

  const requestCloseMiniApp = () => {
    if (!closeMiniApp()) flash(t.telegramCloseFallback);
  };

  const handleTabTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    if (isTabSwipeBlockedTarget(event.target)) {
      tabSwipeStart.current = null;
      return;
    }
    const touch = event.touches[0];
    tabSwipeStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  };

  const handleTabTouchEnd = (event: ReactTouchEvent<HTMLElement>) => {
    const start = tabSwipeStart.current;
    tabSwipeStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch) return;
    const direction = resolveSwipeDirection(touch.clientX - start.x, touch.clientY - start.y);
    if (!direction) return;
    const nextView = resolveAdjacentTab(store.view, direction);
    if (nextView !== store.view) {
      store.setView(nextView);
      impactTelegram("light");
    }
  };

  const openRandom = () => {
    const eligible = actionableSurpriseActivities(store.activities, {
      userKey: getUserKey(),
      joinedIds: store.joinedIds,
      waitingIds: store.waitingIds,
      pendingIds: store.pendingIds,
      now: new Date(),
    });
    const random = eligible[Math.floor(Math.random() * eligible.length)];
    if (random) openActivity(random);
    else flash(t.noEvents);
    impactTelegram("medium");
  };

  const handleJoin = async (activity: Activity) => {
    try {
      const result = await store.toggleJoin(activity.id);
      const message = result === "joined"
        ? t.joined
        : result === "pending"
          ? t.requested
          : result === "full"
            ? t.eventFull
            : result === "private"
              ? t.privateJoinInfo
              : t.leave;
      flash(message);
      notifyTelegram(result === "left" || result === "full" || result === "private" ? "warning" : "success");
    } catch {
      flash(t.joinError);
    }
  };

  const handleDelete = async (activity: Activity) => {
    const confirmed = window.confirm(`${t.deleteEventTitle}\n\n${t.deleteEventWarning}`);
    if (!confirmed) return;

    try {
      await store.deleteActivity(activity.id);
      setSelected(null);
      setSelectedChatRequest(0);
      flash(t.eventDeleted);
      notifyTelegram("success");
    } catch {
      flash(t.deleteError);
      notifyTelegram("error");
    }
  };

  const shareActivity = async (activity: Activity) => {
    const url = activityInviteUrl(activity);
    const preparedResult = await sharePreparedTelegramEvent(activity, store.language);
    if (preparedResult === "shared" || preparedResult === "cancelled") return;
    const text = ShareTemplateService.build(activity, store.language);
    const invitationText = buildSeparatedInvitationText(url, text);
    const telegramShareUrl = buildTelegramShareUrl(url, text);

    const webApp = getTelegramWebApp();
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(telegramShareUrl);
      return;
    }

    if (navigator.share) {
      await navigator.share({ title: "GO IRL", text: invitationText });
    } else {
      await navigator.clipboard?.writeText(invitationText);
      showNotice(t.copied);
    }
  };

  const saveToGoogleCalendar = (activity: Activity) => {
    const url = buildGoogleCalendarUrl(activity, {
      language: store.language,
      eventUrl: activityInviteUrl(activity),
    });
    const webApp = getTelegramWebApp();
    if (webApp?.openLink) {
      webApp.openLink(url, { try_instant_view: false });
      return;
    }
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="app">
      <DevPanel />
      <AppHeader
        language={store.language}
        selectedCityId={store.selectedCityId}
        translation={t}
        onBrandClick={() => store.setView("home")}
        onCityChange={store.setSelectedCity}
        onLanguageChange={store.setLanguage}
      />

      <main onTouchStart={handleTabTouchStart} onTouchEnd={handleTabTouchEnd}>
        {store.syncError && <div className="sync-banner">{store.syncError === "database_unavailable" ? t.databaseError : store.syncError}</div>}
        {store.loading && <div className="sync-loading">{t.loadingEvents}</div>}
        {store.view === "home" && (
          <HomeView
            language={store.language}
            onOpen={openActivity}
            onJoin={handleJoin}
            onRandom={openRandom}
            onCreate={() => store.setView("create")}
          />
        )}
        {store.view === "discover" && <DiscoverView language={store.language} onOpen={openActivity} onJoin={handleJoin} />}
        {store.view === "explore" && <ExploreView language={store.language} onOpen={openActivity} onJoin={handleJoin} />}
        {store.view === "create" && <CreateView key={editingActivity?.id || "new-event"} language={store.language} initialActivity={editingActivity} onCancel={() => {
          setEditingActivity(null);
          store.setView("home");
        }} onCreated={(id) => {
          flash(editingActivity ? t.updatedSuccess : t.createdSuccess);
          setEditingActivity(null);
          setCompletionActivityId(id);
          setCompletion(editingActivity ? t.updatedSuccess : t.createdSuccess);
        }} />}
        {store.view === "profile" && <ProfileView language={store.language} onOpen={openActivity} onJoin={handleJoin} onCloseMiniApp={requestCloseMiniApp} />}
      </main>

      <BottomNav view={store.view} setView={store.setView} language={store.language} />

      {selected && (
        <ActivitySheet
          activity={store.activities.find((item) => item.id === selected.id) || selected}
          language={store.language}
          cityName={getCity((store.activities.find((item) => item.id === selected.id) || selected).cityId).name[store.language]}
          loading={store.loading}
          error={store.syncError}
          onClose={() => {
            setSelected(null);
            setSelectedMembersOpen(false);
            setSelectedChatRequest(0);
          }}
          onJoin={handleJoin}
          onShare={shareActivity}
          onCalendar={saveToGoogleCalendar}
          onEdi…11148 tokens truncated… = genericActivityAvatar(activity, language, category.icon);
  const mapLabel = activity.address.trim() || getCity(activity.cityId).name[language];
  const action = t[eventActionTranslationKey(interaction.primaryAction, "card")];
  const membershipActive = joined || pending || waiting;
  const cardRightLabel = joined || waiting ? t.leave : pending ? t.cancelRequest : action;
  const cardRightDisabled = !membershipActive && interaction.disabled;
  const cardLeftLabel = joined ? t.cardOpenChat : t.details;
  const handleCardLeftAction = () => {
    if (joined) {
      onOpen(activity, { focusChat: true });
      return;
    }
    onOpen(activity);
  };
  const handleCardRightAction = () => {
    if (membershipActive) {
      onJoin(activity);
      return;
    }
    runEventPrimaryAction(interaction.primaryAction, {
      open: () => onOpen(activity),
      openChat: () => onOpen(activity, { focusChat: true }),
      join: () => onJoin(activity),
    });
  };
  const helperAction = isOrganizer
    ? helperState === "confirmed"
      ? eventHelperCardCopy[language].confirmed
      : helperState === "requested"
        ? eventHelperCardCopy[language].requested
        : eventHelperCardCopy[language].needed
    : helperState === "confirmed"
      ? eventHelperCardCopy[language].confirmed
      : t.details;
  const showHelperAction = interaction.showHelperAction && (isOrganizer || helperState === "confirmed");

  useEffect(() => {
    let active = true;
    const refresh = () => {
      void getOrganizerRoleRequestState(activity.id)
        .then((state) => { if (active) setHelperState(state); })
        .catch(() => { if (active) setHelperState("none"); });
    };
    const onChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ activityId?: string }>).detail;
      if (!detail?.activityId || detail.activityId === activity.id) refresh();
    };
    refresh();
    window.addEventListener("go-irl-coach-requests-changed", onChanged);
    return () => {
      active = false;
      window.removeEventListener("go-irl-coach-requests-changed", onChanged);
    };
  }, [activity.id]);
  return (
    <article className="activity-card sport-card compact-sport-card unified-event-card glass-event-card">
      <EventCardArtwork icon={avatar} activity={activity.activity[language]} title={activity.title[language]} />
      <div className="sport-card-top-actions">
        {pendingRequestCount > 0 ? (
          <button
            className="event-request-alert"
            type="button"
            aria-label={`${t.requests}: ${pendingRequestCount}`}
            onClick={() => onOpen(activity, { focusRequests: true })}
          >
            <BellDot aria-hidden="true" />
            <span>{pendingRequestCount}</span>
          </button>
        ) : null}
        <CardReminderAction activityId={activity.id} date={activity.date} time={activity.time} />
        <CardShareAction
          title={shareTitle}
          date={shareDate}
          address={activity.address}
          url={activityInviteUrl(activity)}
          label={t.share}
          onTelegramShare={() => sharePreparedTelegramEvent(activity, language)}
        />
      </div>
      <button className="sport-card-main glass-event-card-main" onClick={() => onOpen(activity)} type="button">
        <h3>{shareTitle}</h3>
        <p>{stripLeadingEmoji(activity.title[language]) || mapLabel}</p>
      </button>
      <div className="sport-chip-row">
        <button
          className="sport-card-participants-chip"
          type="button"
          aria-label={`${t.participants}: ${activity.participants} / ${activity.capacity}`}
          aria-expanded={membersPreviewOpen}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            setMembersPreviewOpen((open) => !open);
          }}
        ><UsersRound size={16} aria-hidden="true" /><span>{activity.participants} / {activity.capacity}</span></button>
      </div>
      {membersPreviewOpen && (
        <div className="sport-card-members-preview">
          {joinedMembers.length ? joinedMembers.map((member) => (
            <div key={member.userKey} className="sport-card-member-preview-row">
              <span className="sport-card-member-avatar">{member.name?.slice(0, 2).toUpperCase() || "GO"}</span>
              <span className="sport-card-member-name">{member.name || "GO IRL User"}</span>
            </div>
          )) : <div className="sport-card-members-empty">{t.noParticipants || "Пока никого нет"}</div>}
        </div>
      )}
      <EventWeatherStrip activity={activity} language={language} enabled={isOutdoorGenericActivity(activity)} />
      <div className="activity-card-details sport-details-grid">
        <EventCardMetaItem icon={<CalendarDays />} caption={t.date} value={shareDate} ariaLabel={t.addToGoogleCalendar} onClick={() => openActivityCalendar(activity, language)} />
        <EventCardMetaItem icon={<Ticket />} caption={t.price.split(",")[0]} value={activity.price ? `${activity.price} Kč` : t.free} />
        <EventCardMetaItem icon={<MapPin />} caption={t.address} value={mapLabel} ariaLabel={`${t.address}: ${mapLabel}`} onClick={() => openActivityMap(activity)} />
        <OrganizerAvatarAction organizerKey={activity.organizerKey} organizerName={activity.organizer} />
      </div>
      <div className="activity-card-footer compact-sport-actions">
        {joined
          ? <button className="sport-coach-action" onClick={handleCardLeftAction} type="button"><UsersRound size={18} /><span>{cardLeftLabel}</span></button>
          : showHelperAction
            ? <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><UsersRound size={18} /><span>{helperAction}</span></button>
            : <EventDetailsAction label={t.details} onClick={() => onOpen(activity)} />}
        <button className={membershipActive ? "card-join card-leave" : interaction.canJoin && !pending ? "card-join" : "card-join secondary"} onClick={handleCardRightAction} type="button" disabled={cardRightDisabled}>
          {cardRightLabel}
        </button>
      </div>
    </article>
  );
}

type ActivitySheetProps = {
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
  onNotice: (msg: string) => void;
  initialMembersOpen?: boolean;
  initialChatRequest?: number;
};

function ActivitySheet(props: ActivitySheetProps) {
  if (!isSportExperience(props.activity)) return <GenericActivitySheet {...props} />;
  return (
    <Suspense fallback={<GenericActivitySheet {...props} />}>
      <LazySportActivitySheet {...props} />
    </Suspense>
  );
}

function GenericActivitySheet({
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
  initialChatRequest = 0,
}: ActivitySheetProps) {
  const { joinedIds, waitingIds, pendingIds, reviewRequest, userRole } = useAppStore();
  const [membersOpen, setMembersOpen] = useState(initialMembersOpen);
  const [chatOpenRequest, setChatOpenRequest] = useState(initialChatRequest);
  const moreActionsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    setMembersOpen(initialMembersOpen);
  }, [activity.id, initialMembersOpen]);

  useEffect(() => {
    setChatOpenRequest(initialChatRequest);
  }, [activity.id, initialChatRequest]);

  useEffect(() => {
    const closeMoreActions = () => {
      if (moreActionsRef.current?.open) moreActionsRef.current.open = false;
    };
    const handlePointerDown = (event: Event) => {
      const details = moreActionsRef.current;
      if (details?.open && event.target instanceof Node && !details.contains(event.target)) {
        details.open = false;
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("scroll", closeMoreActions, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("scroll", closeMoreActions, true);
    };
  }, [activity.id]);

  const t = getTranslation(language);
  const category = getActivityCategory(activity);
  const isOrganizer = activity.organizerKey === getUserKey();
  const canDelete = isOrganizer || userRole === "admin";
  const joined = joinedIds.includes(activity.id);
  const waiting = waitingIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const full = activity.participants >= activity.capacity;
  const interaction = resolveEventInteractionState({
    isOrganizer,
    isJoined: joined,
    isWaiting: waiting,
    isPending: pending,
    isFull: full,
    visibility: activity.visibility,
    isFinished: isActivityFinished(activity),
    hasWaitingList: false,
  });
  const action = t[eventActionTranslationKey(interaction.primaryAction, "sheet")];
  const status = t[eventStatusTranslationKey(interaction)];
  const accessLabel = activity.visibility === "public" ? t.publicAccess : activity.visibility === "private" ? t.privateAccess : t.inviteAccess;
  const joinedMembers = activity.members.filter((member) => member.status === "joined");
  const waitingMembers = activity.members.filter((member) => member.status === "waiting");
  const pendingMembers = activity.members.filter((member) => member.status === "pending");
  const activityAvatar = genericActivityAvatar(activity, language, category.icon);

  const handleReview = async (memberKey: string, approved: boolean) => {
    await reviewRequest(activity.id, memberKey, approved);
  };

  const handlePrimaryAction = () => runEventPrimaryAction(interaction.primaryAction, {
    open: () => onEdit(activity),
    openChat: () => setChatOpenRequest((request) => request + 1),
    join: () => onJoin(activity),
  });

  return (
    <div className="sheet-backdrop" onMouseDown={onClose}>
      <article className="activity-sheet" onMouseDown={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <button className="sheet-close" onClick={onClose} type="button" aria-label={t.close}><X /></button>
        {loading && <EventDetailsSkeleton />}
        {error && <div className="details-error"><ShieldCheck /><span>{t.databaseError}</span></div>}
        <div className={`sheet-symbol category-${category.id}`}>{activityAvatar}</div>
        <div className="sheet-label">{category.name[language]} · {stripLeadingEmoji(activity.activity[language])}</div>
        <h2>{stripLeadingEmoji(activity.title[language])}</h2>
        <p className="sheet-description">{stripLeadingEmoji(activity.description[language])}</p>
        <div className="details-status-row">
          <span className={isOrganizer ? "details-status organizer" : pending ? "details-status pending" : joined ? "details-status joined" : full ? "details-status full" : "details-status"}>{status}</span>
          <span className="details-access">{accessLabel}</span>
        </div>
        <div className="detail-list">
          <div><Sparkles /><span>{t.category}</span><strong>{category.name[language]}</strong></div>
          <div><CalendarDays /><span>{dateLabel(activity.date, language)}</span>{formatEventTime(activity.time) ? <strong>{formatEventTime(activity.time)}</strong> : null}</div>
          <div><Compass /><span>{t.city}</span><strong>{cityName}</strong></div>
          <div><MapPin /><span>{t.address}</span>{activity.locationUrl ? <a href={activity.locationUrl} target="_blank" rel="noreferrer">{activity.address}</a> : <strong>{activity.address}</strong>}</div>
          <div><Ticket /><span>{t.price}</span><strong>{activity.price ? `${activity.price} Kč` : t.free}</strong></div>
          {activity.participantNote && <div><Sparkles /><span>{t.participantNote}</span><strong>{activity.participantNote}</strong></div>}
          <OrganizerDetailAction organizerKey={activity.organizerKey} organizerName={activity.organizer} label={t.organizer} />
          <div><ShieldCheck /><span>{t.visibility}</span><strong>{accessLabel}</strong></div>
        </div>
        <button className="detail-members-toggle" onClick={() => setMembersOpen((open) => !open)} type="button">
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
                  <UserRoundCheck />
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
              {isOrganizer && pendingMembers.length > 0 && <div className="pending-heading">{t.requests} · {pendingMembers.length}</div>}
              {isOrganizer && pendingMembers.map((member) => (
                <div className="member-row pending-member" key={member.userKey}>
                  <span className="member-avatar">{member.name.slice(0, 2).toUpperCase()}</span>
                  <strong>{member.name}</strong>
                  <span className="request-actions">
                    <button onClick={() => void handleReview(member.userKey, true)} type="button" aria-label={t.approve} title={t.approve}><Check /><span>{t.approve}</span></button>
                    <button onClick={() => void handleReview(member.userKey, false)} type="button" aria-label={t.reject} title={t.reject}><X /><span>{t.reject}</span></button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isOrganizer && (joined || waiting || pending) && <div className="status-banner">{joined ? <UserRoundCheck /> : <Clock3 />}<span>{joined ? t.joined : waiting ? t.waiting : t.requested}</span></div>}
        {!isOrganizer && activity.visibility === "private" && !joined && !waiting && !pending && <div className="status-banner neutral"><ShieldCheck /><span>{t.privateJoinInfo}</span></div>}
        {full && !joined && !waiting && !pending && !isOrganizer && <div className="status-banner danger"><UsersRound /><span>{t.eventFull}</span></div>}
              <ActivityChatPanel activity={activity} openRequest={chatOpenRequest} showHelperAction={interaction.showHelperAction} />

      <div className="sheet-actions compact-sheet-actions">
          <button className="main-action" onClick={handlePrimaryAction} type="button" disabled={interaction.disabled}>{interaction.primaryAction === "manage" && <Pencil size={18} />}{action}</button>
          <details ref={moreActionsRef} className="event-more-actions">
            <summary className="square-action" aria-label="Еще" title="Еще"><Ellipsis aria-hidden="true" /></summary>
            <div className="event-more-menu">
              <button onClick={() => void onShare(activity)} type="button"><Share2 size={18} />{t.share}</button>
              <button onClick={() => onCalendar(activity)} type="button"><CalendarPlus size={18} />{t.addToGoogleCalendar}</button>
              <button onClick={() => openBugReport(activity, language)} type="button"><Bug size={18} />{t.report}</button>
            </div>
          </details>
        </div>
        {!isOrganizer && (joined || waiting || pending) && (
          <button className="danger-action membership-leave-action" onClick={() => onJoin(activity)} type="button">
            <X size={18} />
            {pending ? t.cancelRequest : t.leave}
          </button>
        )}
        {canDelete && (
          <button className="danger-action" onClick={() => onDelete(activity)} type="button">
            <Trash2 size={18} />
            {t.delete}
          </button>
        )}
        <button className="telegram-close-button compact" onClick={onCloseMiniApp} type="button">{t.backToTelegram}</button>
      </article>
    </div>
  );
}

function CompletionBar({
  message,
  language,
  onDismiss,
  onOpen,
  onShare,
  onCalendar,
  onCloseMiniApp,
}: {
  message: string;
  language: Language;
  onDismiss: () => void;
  onOpen: () => void;
  onShare: () => void;
  onCalendar: () => void;
  onCloseMiniApp: () => void;
}) {
  const t = getTranslation(language);
  return (
    <div className="completion-bar">
      <div>
        <strong>{message}</strong>
        <span>{t.closeAfterDoneHint}</span>
      </div>
      <button onClick={onOpen} type="button">{t.openCreatedEvent}</button>
      <button onClick={onCalendar} type="button">{t.addToGoogleCalendar}</button>
      <button onClick={onShare} type="button">{t.share}</button>
      <button onClick={onCloseMiniApp} type="button">{t.done}</button>
      <button className="secondary" onClick={onDismiss} type="button">{t.close}</button>
    </div>
  );
}

function EventDetailsSkeleton() {
  return (
    <div className="details-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function BottomNav({ view, setView, language }: { view: AppView; setView: (view: AppView) => void; language: Language }) {
  const t = getTranslation(language);
  const items: Array<{ id: AppView; label: string; icon: React.ReactNode }> = [
    { id: "home", label: t.navHome, icon: <Home /> },
    { id: "discover", label: t.navDiscover, icon: <Sparkles /> },
    { id: "explore", label: t.navExplore, icon: <Compass /> },
    { id: "create", label: t.navCreate, icon: <Plus /> },
    { id: "profile", label: t.navProfile, icon: <CircleUserRound /> },
  ];
  return <nav className="bottom-nav">{items.map((item) => <button className={view === item.id ? "active" : ""} key={item.id} onClick={() => setView(item.id)} type="button">{item.icon}<span>{item.label}</span></button>)}</nav>;
}

function SectionHeader({ title, icon }: { title: string; icon?: React.ReactNode }) {
  return <div className="section-title">{icon}<h2>{title}</h2></div>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="metric">{icon}<strong>{value}</strong><span>{label}</span></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><Dices /><p>{text}</p></div>;
}

function EventListSkeleton() {
  return (
    <div className="event-list-skeleton" aria-hidden="true">
      {[0, 1, 2].map((item) => (
        <div className="event-skeleton-card" key={item}>
          <span />
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

export default App;





