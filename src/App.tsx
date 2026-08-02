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
import { clientNavigationLabels, domainActionLabels, homeCategoriesForPath } from "./domainHomeCategories";
import { AppHeader } from "./components/AppHeader";
import { buildGoogleCalendarUrl } from "./calendar/googleCalendar";
import { openBugReport } from "./bugReport";
import { getCurrentAuthIdentity, getCurrentRoleInvitationResult, getCurrentStartParam, initializeTrustedAuth, isTrustedAuthReady } from "./authSession";
import { cities, getCity } from "./config/cities";
import { getTranslation, localeByLanguage } from "./i18n";
import { formatEventTime } from "./eventTime";
import {
  applyDiscoverFilters,
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
import { ActivityIcon } from "./components/ActivityIcon";
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
import { getEventSheetBackgroundStyle } from "./eventSheetBackground";
import { ServicesCatalogView, ServicesClientProfileView, ServicesForYouView } from "./services/ServicesClientViews";
import { professionalCountLabel, professionalsForCity } from "./services/servicesProfessionalDirectory";
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
import type { ProfilePanelSection } from "./profile/profilePanelTypes";
import { ProfilePanel } from "./components/ProfilePanel";
import { ProfilePreferences } from "./components/ProfilePreferences";
import { isRoleInvitationStartParam } from "./admin/roleInvitations";


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
    if (!completionActivityId) return;
    const activity = store.activities.find((item) => item.id === completionActivityId);
    if (!activity || selected?.id === activity.id) return;
    store.setView("home");
    openActivity(activity);
  }, [completionActivityId, selected?.id, store.activities]);

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
    if (isRoleInvitationStartParam(startParam)) {
      invitationHandled.current = true;
      void initializeTrustedAuth().then(() => {
        const result = getCurrentRoleInvitationResult();
        if (result?.status === "accepted") {
          showNotice(result.targetRole === "professional" ? t.roleInvitationProfessionalAccepted : t.roleInvitationOrganizerAccepted);
          notifyTelegram("success");
          return;
        }
        showNotice(result?.status === "role_conflict" ? t.roleInvitationConflict : t.roleInvitationInvalid);
        notifyTelegram("error");
      });
      return;
    }
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
  }, [
    store.activities,
    store.language,
    store.loading,
    t.invalidInvitationLink,
    t.invitationEventNotFound,
    t.roleInvitationConflict,
    t.roleInvitationInvalid,
    t.roleInvitationOrganizerAccepted,
    t.roleInvitationProfessionalAccepted,
  ]);

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

  const handleJoin = async (activity: Activity) => {
    try {
      const result = await store.toggleJoin(activity.id);
      if (result === "left") {
        setSelected(null);
        setSelectedMembersOpen(false);
        setSelectedChatRequest(0);
        store.setView("home");
      }
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
  const isServicesDomain = window.location.pathname.replace(/\/+$/, "") === "/services";

  return (
    <div className="app">
      <AppHeader
        language={store.language}
        selectedCityId={store.selectedCityId}
        translation={t}
        onBrandClick={() => {
          setSelected(null);
          setSelectedMembersOpen(false);
          setSelectedChatRequest(0);
          store.setView("home");
          window.history.pushState(null, "", "/");
          window.dispatchEvent(new PopStateEvent("popstate"));
        }}
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
          />
        )}
        {store.view === "discover" && (isServicesDomain
          ? <ServicesForYouView language={store.language} selectedCityId={store.selectedCityId} />
          : <DiscoverView language={store.language} onOpen={openActivity} onJoin={handleJoin} />)}
        {store.view === "explore" && (isServicesDomain
          ? <ServicesCatalogView language={store.language} selectedCityId={store.selectedCityId} />
          : <ExploreView language={store.language} onOpen={openActivity} onJoin={handleJoin} />)}
        {store.view === "bookings" && <BookingsView language={store.language} onOpen={openActivity} onJoin={handleJoin} />}
        {store.view === "create" && <CreateView key={editingActivity?.id || "new-event"} language={store.language} initialActivity={editingActivity} onCancel={() => {
          setEditingActivity(null);
          store.setView("home");
        }} onCreated={(id) => {
          const message = editingActivity ? t.updatedSuccess : t.createdSuccess;
          flash(message);
          setEditingActivity(null);
          setCompletionActivityId(id);
          setCompletion(message);
        }} />}
        {store.view === "profile" && (isServicesDomain
          ? <ServicesClientProfileView language={store.language} selectedCityId={store.selectedCityId} />
          : <ProfileView language={store.language} onOpen={openActivity} onJoin={handleJoin} onCloseMiniApp={requestCloseMiniApp} />)}
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
            setCompletion("");
            setCompletionActivityId(null);
          }}
          onJoin={handleJoin}
          onShare={shareActivity}
          onCalendar={saveToGoogleCalendar}
          onEdit={(activity) => {
            setSelected(null);
            setSelectedMembersOpen(false);
            setEditingActivity(activity);
            store.setView("create");
          }}
          onDelete={handleDelete}
          onCloseMiniApp={requestCloseMiniApp}
          onNotice={showNotice}
          initialMembersOpen={selectedMembersOpen}
          initialChatRequest={selectedChatRequest}
        />
      )}
      {completion && selected?.id === completionActivityId && (
        <CompletionBar
          activity={store.activities.find((item) => item.id === completionActivityId) || selected}
          language={store.language}
          onCalendar={() => {
            const activity = useAppStore.getState().activities.find((item) => item.id === completionActivityId);
            setCompletion("");
            setCompletionActivityId(null);
            if (activity) saveToGoogleCalendar(activity);
          }}
          onCloseMiniApp={() => {
            setCompletion("");
            setCompletionActivityId(null);
            requestCloseMiniApp();
          }}
        />
      )}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}

function HomeView({ language, onOpen, onJoin }: { language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void }) {
  const { activities, loading, selectedCityId, setCategory } = useAppStore();
  const t = getTranslation(language);
  const today = new Date().toISOString().slice(0, 10);
  const nearby = activities.filter((item) => item.date >= today).slice(0, 4);
  const popular = activities.filter((item) => item.popular);
  const urgent = activities.filter((item) => item.urgent);
  const homeCategories = homeCategoriesForPath(window.location.pathname, language);
  const servicesDomain = window.location.pathname.replace(/\/+$/, "") === "/services";
  const professionalCount = servicesDomain ? professionalsForCity(selectedCityId).length : 0;

  return (
    <>
      <div className={homeCategories.length === 1 ? "category-grid module-grid services-category-grid" : "category-grid module-grid"}>
        {homeCategories.map((category) => (
          <button className="category-button" data-category={category.id} key={category.id} onClick={() => setCategory(category.id)} type="button">
            <span>{category.icon}</span>
            <strong>{category.name[language]}</strong>
            <small>{servicesDomain ? professionalCount + " " + professionalCountLabel(language, professionalCount) : activities.filter((activity) => activity.categoryId === category.id).length + " " + t.eventCountLabel}</small>
          </button>
        ))}
      </div>

      {loading ? <EventListSkeleton /> : nearby.length ? <ActivitySection title={t.nearby} activities={nearby} language={language} onOpen={onOpen} onJoin={onJoin} /> : <EmptyState text={t.noEvents} />}
      {urgent.length > 0 && <ActivitySection title={t.urgent} icon={<Zap size={18} />} activities={urgent} language={language} onOpen={onOpen} onJoin={onJoin} urgent />}
      <ActivitySection title={t.popular} activities={popular} language={language} onOpen={onOpen} onJoin={onJoin} />
    </>
  );
}

function BookingsView({ language, onOpen, onJoin }: { language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void }) {
  const { activities, joinedIds, waitingIds, pendingIds } = useAppStore();
  const serviceDomain = window.location.pathname.replace(/\/+$/, "") === "/services";
  const relevantIds = new Set([...joinedIds, ...waitingIds, ...pendingIds]);
  const bookings = activities.filter((activity) => relevantIds.has(activity.id) && (!serviceDomain || activity.categoryId === "creativity"));
  const title = clientNavigationLabels[language][3];

  return (
    <section>
      <SectionHeader title={title} icon={<CalendarDays />} />
      {bookings.length
        ? <ActivitySection title={title} activities={bookings} language={language} onOpen={onOpen} onJoin={onJoin} />
        : <EmptyState text={language === "ru" ? "У вас пока нет записей" : language === "uk" ? "У вас поки немає записів" : language === "cs" ? "Zatím nemáte žádné rezervace" : "You have no bookings yet"} />}
    </section>
  );
}

function DiscoverView({ language, onOpen, onJoin }: { language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void }) {
  const { activities, loading, selectedCityId } = useAppStore();
  const t = getTranslation(language);
  const [query, setQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<DiscoverFilter[]>([]);
  const [locationState, setLocationState] = useState<"idle" | "ready" | "blocked">("idle");
  const profile = useMemo(() => loadProfile(t.guestName, selectedCityId), [selectedCityId, t.guestName]);
  const favoriteTerms = profile.favoriteActivities;
  const now = useMemo(() => new Date(), []);
  const city = getCity(profile.cityId || selectedCityId);
  const recommended = simpleRecommendationEngine.recommend(activities, {
    cityId: profile.cityId || selectedCityId,
    favoriteActivities: favoriteTerms,
    language,
    now,
  });
  const filteredActivities = applyDiscoverFilters(searchActivities(recommended, query, language), activeFilters, language, now);
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);
  const weekLimit = new Date(now);
  weekLimit.setDate(now.getDate() + 7);
  const weekLimitDate = weekLimit.toISOString().slice(0, 10);
  const nearby = recommended.filter((activity) => activity.cityId === city.id).slice(0, 8);
  const interestMatches = favoriteTerms.length
    ? recommended.filter((activity) => matchesActivityInterest(activity, favoriteTerms, language)).slice(0, 8)
    : recommended.slice(0, 4);
  const filterOptions: Array<{ id: DiscoverFilter; label: string }> = [
    { id: "today", label: t.today },
    { id: "tomorrow", label: t.tomorrow },
    { id: "weekend", label: t.weekend },
    { id: "free", label: t.free },
    { id: "up-to-200", label: t.upTo200 },
    { id: "sport", label: t.templateSport },
    { id: "board-games", label: t.templateBoardGames },
    { id: "skating", label: t.templateSkating },
    { id: "walks", label: t.templateWalk },
    { id: "coffee", label: t.templateCoffee },
    { id: "beginners", label: t.beginners },
    { id: "public-only", label: t.publicOnly },
  ];

  const toggleFilter = (filter: DiscoverFilter) => {
    setActiveFilters((current) => current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter]);
  };

  const enableLocation = () => {
    if (!navigator.geolocation) {
      setLocationState("blocked");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => setLocationState("ready"),
      () => setLocationState("blocked"),
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 5000 },
    );
  };

  return (
    <section className="page-section discover-page">
      <div className="page-title"><Sparkles /><div><h1>{t.forYou}</h1><p>{t.discoverSubtitle}</p></div></div>
      <label className="discover-search">
        <Search />
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} />
      </label>
      <div className="discover-filter-block">
        <span>{t.quickFilters}</span>
        <div className="filter-row discover-filters">
          {filterOptions.map((filter) => (
            <button className={activeFilters.includes(filter.id) ? "filter active" : "filter"} key={filter.id} onClick={() => toggleFilter(filter.id)} type="button">
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {(query || activeFilters.length > 0) && (
        <ActivitySection title={t.matchedForYou} activities={filteredActivities} language={language} onOpen={onOpen} onJoin={onJoin} />
      )}

      {loading ? (
        <EventListSkeleton />
      ) : (
        <>
          <DiscoverSection title={t.byInterestsSection} activities={interestMatches} language={language} onOpen={onOpen} onJoin={onJoin} />
          <DiscoverSection title={t.nearestEvents} activities={recommended.slice(0, 8)} language={language} onOpen={onOpen} onJoin={onJoin} />
          <DiscoverSection title={t.popularEvents} activities={recommended.filter((activity) => activity.popular).slice(0, 8)} language={language} onOpen={onOpen} onJoin={onJoin} />
          <DiscoverSection title={t.newEvents} activities={[...recommended].reverse().slice(0, 8)} language={language} onOpen={onOpen} onJoin={onJoin} />
          <DiscoverSection title={t.todaySection} activities={recommended.filter((activity) => activity.date === today)} language={language} onOpen={onOpen} onJoin={onJoin} />
          <DiscoverSection title={t.tomorrowSection} activities={recommended.filter((activity) => activity.date === tomorrowDate)} language={language} onOpen={onOpen} onJoin={onJoin} />
          <DiscoverSection title={t.thisWeekSection} activities={recommended.filter((activity) => activity.date >= today && activity.date <= weekLimitDate).slice(0, 8)} language={language} onOpen={onOpen} onJoin={onJoin} />
          <section className="discover-section">
            <div className="section-title discover-section-title">
              <MapPin />
              <h2>{t.nearMeSection}</h2>
              {locationState === "idle" && <button onClick={enableLocation} type="button">{t.enableLocation}</button>}
            </div>
            {locationState === "blocked" && <div className="nearby-note">{t.nearMeUnavailable}</div>}
            <div className="horizontal-events">
              {nearby.length ? nearby.map((activity) => <DiscoverActivityCard key={activity.id} activity={activity} language={language} onOpen={onOpen} onJoin={onJoin} />) : <EmptyState text={t.noEvents} />}
            </div>
          </section>
        </>
      )}
    </section>
  );
}

function DiscoverSection({ title, activities, language, onOpen, onJoin }: { title: string; activities: Activity[]; language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void }) {
  if (!activities.length) return null;
  return (
    <section className="discover-section">
      <SectionHeader title={title} />
      <div className="horizontal-events">
        {activities.map((activity) => <DiscoverActivityCard key={activity.id} activity={activity} language={language} onOpen={onOpen} onJoin={onJoin} />)}
      </div>
    </section>
  );
}

function DiscoverActivityCard({ activity, language, onOpen, onJoin }: { activity: Activity; language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void }) {
  return <ActivityCard activity={activity} language={language} onOpen={onOpen} onJoin={onJoin} />;
}

function ExploreView({ language, onOpen, onJoin }: { language: Language; onOpen: OpenActivity; onJoin: (activity: Activity) => void }) {
  const { activities, loading, selectedCategory, selectedCityId, setCategory } = useAppStore();
  const t = getTranslation(language);
  const city = getCity(selectedCityId);
  const filtered = selectedCategory ? activities.filter((item) => item.categoryId === selectedCategory) : activities;

  return (
    <section className="page-section">
      <div className="page-title"><Compass /><div><h1>{t.all}</h1><p>{city.name[language]}</p></div></div>
      <div className="filter-row">
        <button className={!selectedCategory ? "filter active" : "filter"} onClick={() => setCategory(null)} type="button">{t.all}</button>
        {categories.map((category) => (
          <button className={selectedCategory === category.id ? "filter active" : "filter"} key={category.id} onClick={() => setCategory(category.id)} type="button">
            {category.icon} {category.name[language]}
          </button>
        ))}
      </div>
      <div className="activity-stack">
        {loading ? <EventListSkeleton /> : filtered.length ? filtered.map((item) => <ActivityCard key={item.id} activity={item} language={language} onOpen={onOpen} onJoin={onJoin} />) : <EmptyState text={t.noEvents} />}
      </div>
    </section>
  );
}

function CreateView({ language, initialActivity, onCreated, onCancel }: { language: Language; initialActivity: Activity | null; onCreated: (id: string) => void; onCancel: () => void }) {
  const createActivity = useAppStore((state) => state.createActivity);
  const updateActivity = useAppStore((state) => state.updateActivity);
  const selectedCityId = useAppStore((state) => state.selectedCityId);
  const setSelectedCity = useAppStore((state) => state.setSelectedCity);
  const formRef = useRef<HTMLFormElement>(null);
  const templateGesture = useRef<{ x: number; y: number; dragged: boolean } | null>(null);
  const [categoryId, setCategoryId] = useState(initialActivity?.categoryId || "sport");
  const [cityId, setCityId] = useState(initialActivity?.cityId || selectedCityId);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [priceError, setPriceError] = useState("");
  const t = getTranslation(language);
  const selectedCity = getCity(cityId);
  const initialAddress = initialActivity?.address || getCity(initialActivity?.cityId || selectedCityId).name[language];
  const [addressValue, setAddressValue] = useState(initialAddress);
  const [locationUrlValue, setLocationUrlValue] = useState(
    initialActivity?.locationUrl || buildEventLocationUrl(initialAddress, getCity(initialActivity?.cityId || selectedCityId).name[language]),
  );
  const [savedLocations] = useState(loadSavedEventLocations);
  const today = new Date().toISOString().slice(0, 10);
  const initialSport = initialActivity?.metadata?.sport || {};
  const createCategories = initialActivity ? categories : closedBetaCategories;
  const createActivityOptions: Partial<typeof activityOptions> = initialActivity ? activityOptions : closedBetaActivityOptions;
  const quickTemplates = [
    { id: "volleyball", label: t.favoriteVolleyball, icon: "🏐", categoryId: "sport", activity: "🏐", title: t.favoriteVolleyball, description: t.favoriteVolleyball, capacity: 8 },
    { id: "running", label: t.favoriteRunning, icon: "🏃", categoryId: "sport", activity: "🏃", title: t.favoriteRunning, description: t.favoriteRunning, capacity: 6 },
    { id: "coffee", label: t.templateCoffee, icon: "☕", categoryId: "activities", activity: "☕", title: t.templateCoffee, description: t.templateCoffee, capacity: 4 },
    { id: "walk", label: t.templateWalk, icon: "🚶", categoryId: "social", activity: "🚶", title: t.templateWalk, description: t.templateWalk, capacity: 6 },
    { id: "board-games", label: t.templateBoardGames, icon: "🎲", categoryId: "activities", activity: "🎲", title: t.templateBoardGames, description: t.templateBoardGames, capacity: 6 },
    { id: "language-exchange", label: t.favoriteLanguageExchange, icon: "🗣️", categoryId: "social", activity: "🗣️", title: t.favoriteLanguageExchange, description: t.favoriteLanguageExchange, capacity: 6 },
  ];

  const setFieldValue = (name: string, value: string) => {
    const field = formRef.current?.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null;
    if (field) field.value = value;
  };

  const applyTemplate = (template: (typeof quickTemplates)[number]) => {
    const options = createActivityOptions[template.categoryId] || closedBetaActivityOptions.sport;
    const option = options.find((item) => item.icon === template.activity) || options[0];
    setCategoryId(template.categoryId);
    window.requestAnimationFrame(() => {
      setFieldValue("activityText", option.name[language]);
      setFieldValue("titleText", template.title);
      setFieldValue("descriptionText", template.description);
      setFieldValue("capacity", String(template.capacity));
    });
  };

  const handleTemplatePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    templateGesture.current = { x: event.clientX, y: event.clientY, dragged: false };
  };

  const handleTemplatePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const gesture = templateGesture.current;
    if (!gesture || gesture.dragged) return;
    if (isTemplateCarouselDrag(gesture, { x: event.clientX, y: event.clientY })) gesture.dragged = true;
  };

  const finishTemplateGesture = () => {
    window.setTimeout(() => { templateGesture.current = null; }, 0);
  };

  const handleTemplateClick = (template: (typeof quickTemplates)[number]) => {
    if (templateGesture.current?.dragged) {
      templateGesture.current = null;
      return;
    }
    applyTemplate(template);
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    const data = new FormData(event.currentTarget);
    const activityText = stripLeadingEmoji(String(data.get("activityText")));
    const rawTitle = stripLeadingEmoji(String(data.get("titleText")).trim());
    const rawDescription = String(data.get("descriptionText")).trim();
    const rawAddress = String(data.get("address")).trim();
    const rawLocationUrl = String(data.get("locationUrl") || "").trim()
      || buildEventLocationUrl(rawAddress, selectedCity.name[language]);
    const rawParticipantNote = String(data.get("participantNote") || "").trim();
    const date = String(data.get("date"));
    const price = Number(data.get("price"));
    const capacity = Number(data.get("capacity"));
    const fieldError =
      validateRequiredText(rawTitle, t)
      || validateRequiredText(rawDescription, t)
      || validateRequiredText(rawAddress, t)
      || validateEventDate(date, t)
      || validateMaxLength(rawTitle, MAX_EVENT_TITLE_LENGTH, t.titleTooLong)
      || validateMaxLength(rawDescription, MAX_EVENT_DESCRIPTION_LENGTH, t.descriptionTooLong)
      || validateMaxLength(rawAddress, MAX_EVENT_ADDRESS_LENGTH, t.addressTooLong)
      || validateMaxLength(rawParticipantNote, MAX_EVENT_NOTE_LENGTH, t.noteTooLong)
      || validateEventCapacity(capacity, t)
      || validateOptionalUrl(rawLocationUrl, t);
    if (fieldError) {
      setFormError(fieldError);
      setSubmitting(false);
      return;
    }
    const priceError = validateEventPrice(price, t);
    if (priceError) {
      setPri…30256 tokens truncated…der-radius: 12px; background: var(--lime); color: #11150d; font: inherit; font-weight: 900; }
.card-reminder-save:disabled, .card-reminder-remove:disabled { cursor: wait; opacity: .65; }
.card-reminder-remove { display: inline-flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; border: 0; background: transparent; color: #aeb4bd; font: inherit; font-size: 12px; font-weight: 750; }
.card-reminder-remove svg { width: 15px; height: 15px; }
@media (max-width: 720px) {
  .card-reminder-panel {
    position: fixed;
    inset: auto 12px calc(76px + env(safe-area-inset-bottom)) 12px;
    width: auto;
    max-height: min(620px, calc(100dvh - 110px));
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}
.status-banner { display: flex; align-items: center; gap: 8px; margin-top: 14px; padding: 12px; border: 1px solid #37431e; border-radius: 7px; background: rgba(201,255,61,.08); color: var(--lime); font-size: 13px; font-weight: 800; }
.status-banner.neutral { border-color: rgba(87,217,232,.3); background: rgba(87,217,232,.08); color: var(--cyan); }
.status-banner.danger { border-color: rgba(255,111,97,.36); background: rgba(255,111,97,.09); color: var(--coral); }
.sheet-actions { display: grid; grid-template-columns: 1fr 48px 48px; gap: 8px; margin-top: 16px; }
.main-action, .square-action { min-height: 49px; border: 0; border-radius: 7px; font-weight: 850; }
.main-action { display: flex; align-items: center; justify-content: center; gap: 7px; background: var(--lime); color: var(--lime-text); }
.main-action:disabled { cursor: not-allowed; opacity: .52; }
.square-action { display: grid; place-items: center; background: var(--surface-2); color: var(--text); }
.square-action.muted { color: var(--muted); }
.toast { position: fixed; z-index: 80; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom)); max-width: calc(100% - 32px); padding: 11px 15px; border-radius: 7px; background: var(--text); color: #111; font-size: 13px; font-weight: 800; transform: translateX(-50%); }
.completion-bar { position: fixed; z-index: 75; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom)); display: flex; flex-wrap: wrap; align-items: center; gap: 8px; width: min(calc(100% - 24px), 536px); padding: 10px; border: 1px solid rgba(201,255,61,.28); border-radius: 8px; background: rgba(18,20,25,.98); box-shadow: 0 16px 40px rgba(0,0,0,.4); transform: translateX(-50%); animation: card-in 180ms ease-out; }
.completion-bar div { display: grid; gap: 2px; min-width: 0; }
.completion-bar > div { flex: 1 1 100%; }
.completion-bar strong { font-size: 13px; overflow-wrap: anywhere; }
.completion-bar span { color: var(--muted); font-size: 11px; line-height: 1.25; }
.completion-bar button { min-height: 40px; padding: 0 11px; border: 0; border-radius: 7px; background: var(--lime); color: var(--lime-text); font-size: 12px; font-weight: 900; }
.completion-bar button.secondary { border: 1px solid var(--line); background: var(--surface-2); color: var(--text); }
.empty-state { display: grid; place-items: center; gap: 8px; min-height: 150px; padding: 20px; border: 1px dashed var(--line); border-radius: 8px; color: var(--muted); text-align: center; animation: fade-in 180ms ease-out; }
.empty-state p { margin: 0; }
.event-list-skeleton { display: grid; gap: 10px; }
.event-skeleton-card { display: grid; gap: 10px; padding: 13px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
.event-skeleton-card span, .details-skeleton span { display: block; border-radius: 6px; background: linear-gradient(90deg, #1b1e24 0%, #262a32 42%, #1b1e24 82%); background-size: 220% 100%; animation: shimmer 1.15s ease-in-out infinite; }
.event-skeleton-card span:nth-child(1) { width: 52px; height: 52px; }
.event-skeleton-card span:nth-child(2) { width: 72%; height: 18px; }
.event-skeleton-card span:nth-child(3) { width: 92%; height: 13px; }
.event-skeleton-card span:nth-child(4) { width: 100%; height: 46px; }
.details-skeleton { display: grid; gap: 9px; margin: 0 54px 16px 0; }
.details-skeleton span:nth-child(1) { width: 58px; height: 58px; }
.details-skeleton span:nth-child(2) { width: 76%; height: 22px; }
.details-skeleton span:nth-child(3) { width: 100%; height: 48px; }

@keyframes shimmer { from { background-position: 120% 0; } to { background-position: -120% 0; } }
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes sheet-up { from { transform: translateY(22px); opacity: .82; } to { transform: translateY(0); opacity: 1; } }
@keyframes card-in { from { transform: translateY(6px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }

@media (max-width: 370px) {
  .header-inner { gap: 4px; padding-inline: 10px; }
  .header-controls { gap: 2px; }
  .header-brand { min-width: 44px; }
  .header-brand img { width: 42px; height: 42px; }
  .header-control { padding-inline: 4px; }
  .header-control:not(.language-control) > span { max-width: 56px; }
  .city-control > span { max-width: 68px !important; font-size: 14px; }
  .quick-actions, .category-grid, .form-row { grid-template-columns: 1fr; }
  .segmented { grid-template-columns: 1fr; }
  .activity-card-main { grid-template-columns: 42px minmax(0, 1fr); }
  .category-icon { width: 42px; height: 42px; }
  .card-arrow { display: none; }
  .activity-card-details { grid-template-columns: 1fr; }
  .activity-card-footer { grid-template-columns: 1fr; }
  .card-status { width: 100%; }
  .card-join { width: 100%; }
  .achievements { grid-template-columns: repeat(2, 1fr); }
  .completion-bar { display: grid; grid-template-columns: 1fr; }
  .completion-bar button { width: 100%; }
}

@media (min-width: 700px) {
  body { background: #050607; }
  .app { border-left: 1px solid #17191d; border-right: 1px solid #17191d; background: var(--bg); }
}
/* Sport card chip hardening: no emoji mojibake, no default white buttons. */
.sport-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.sport-card-chip,
.sport-card-participants-chip {
  appearance: none;
  -webkit-appearance: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 0 9px;
  border: 1px solid rgba(201,255,61,.16);
  border-radius: 7px;
  background: rgba(201,255,61,.07);
  color: #dfff89;
  font: inherit;
  font-size: 11px;
  font-weight: 850;
  line-height: 1;
  gap: 6px;
}

.sport-card-participants-chip {
  cursor: pointer;
}

.sport-card-participants-chip:hover,
.sport-card-participants-chip:focus-visible {
  border-color: rgba(201,255,61,.42);
  background: rgba(201,255,61,.12);
}

.sport-card-chip span,
.sport-card-participants-chip span {
  display: inline;
  min-height: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
}

.sport-card-chip svg,
.sport-card-participants-chip svg {
  flex: 0 0 auto;
  width: 16px;
  height: 16px;
}


.coach-panel {
  margin-top: 16px;
  padding: 14px;
  border: 1px solid rgba(190, 255, 46, 0.18);
  border-radius: 18px;
  background: rgba(190, 255, 46, 0.06);
  display: grid;
  gap: 12px;
}

.coach-panel-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.coach-panel-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(190, 255, 46, 0.12);
  color: var(--accent, #bfff2e);
  flex: 0 0 auto;
}

.coach-panel h3 {
  margin: 0 0 4px;
  font-size: 17px;
  font-weight: 900;
  color: var(--text-primary, #f7f7f7);
}

.coach-panel p {
  margin: 0;
  color: var(--text-muted, #a5a8b3);
  font-size: 13px;
  line-height: 1.35;
}

.coach-panel-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent, #bfff2e);
  font-weight: 800;
  font-size: 13px;
}

.coach-panel-button {
  appearance: none;
  border: 0;
  border-radius: 14px;
  padding: 12px 14px;
  background: var(--accent, #bfff2e);
  color: #10140d;
  font: inherit;
  font-weight: 900;
  cursor: pointer;
}

.coach-panel-button:disabled {
  cursor: default;
  opacity: 0.72;
}

.coach-panel-message {
  color: var(--text-muted, #a5a8b3);
  font-size: 13px;
  font-weight: 700;
}


.activity-chat-panel {
  margin-top: 16px;
  display: grid;
  gap: 10px;
}

.activity-chat-toggle {
  appearance: none;
  width: 100%;
  border: 1px solid rgba(190, 255, 46, 0.18);
  border-radius: 18px;
  background: rgba(190, 255, 46, 0.06);
  color: inherit;
  font: inherit;
  padding: 14px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  text-align: left;
  cursor: pointer;
}

.activity-chat-toggle-icon {
  width: 38px;
  height: 38px;
  border-radius: 14px;
  background: rgba(190, 255, 46, 0.12);
  color: var(--accent, #bfff2e);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.activity-chat-toggle strong {
  display: block;
  font-weight: 900;
  color: var(--text-primary, #f7f7f7);
}

.activity-chat-toggle small {
  display: block;
  margin-top: 4px;
  color: var(--text-muted, #a5a8b3);
  font-size: 12px;
  line-height: 1.35;
}

.activity-chat-box {
  border: 1px solid rgba(190, 255, 46, 0.14);
  border-radius: 18px;
  background: rgba(8, 12, 10, 0.76);
  padding: 12px;
  display: grid;
  gap: 10px;
}

.activity-chat-messages {
  max-height: 260px;
  overflow: auto;
  display: grid;
  gap: 10px;
  padding-right: 4px;
}

.activity-chat-message {
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.045);
  padding: 10px;
}

.activity-chat-message-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-muted, #a5a8b3);
  font-size: 12px;
}

.activity-chat-message-meta strong {
  color: var(--accent, #bfff2e);
}

.activity-chat-message p {
  margin: 6px 0 0;
  color: var(--text-primary, #f7f7f7);
  line-height: 1.4;
  overflow-wrap: anywhere;
}

.activity-chat-form {
  display: flex;
  gap: 8px;
}

.activity-chat-form input {
  min-width: 0;
  flex: 1;
  border: 1px solid rgba(190, 255, 46, 0.16);
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.22);
  color: var(--text-primary, #f7f7f7);
  font: inherit;
  padding: 12px;
}

.activity-chat-form button {
  appearance: none;
  border: 0;
  border-radius: 14px;
  background: var(--accent, #bfff2e);
  color: #10140d;
  width: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.activity-chat-form button:disabled {
  opacity: 0.56;
  cursor: default;
}

.activity-chat-muted {
  color: var(--text-muted, #a5a8b3);
  font-size: 13px;
  font-weight: 700;
}

.activity-chat-error {
  color: #ff7b7b;
  font-size: 13px;
  font-weight: 800;
}


.sport-card-members-preview {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid rgba(190, 255, 46, 0.16);
  border-radius: 14px;
  background: rgba(8, 12, 10, 0.72);
  display: grid;
  gap: 8px;
}

.sport-card-member-preview-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sport-card-member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(190, 255, 46, 0.1);
  color: #bfff2e;
  font-weight: 800;
  font-size: 12px;
}

.sport-card-member-name {
  font-weight: 700;
  color: var(--text-primary);
}

.sport-card-members-empty {
  color: var(--text-muted);
  font-weight: 600;
}


/* GO IRL targeted UI v3 */

.home-brand-logo-wrap {
  width: 100%;
  margin: 0;
  padding: 0;
}

.home-brand-logo {
  display: block;
  width: 100% !important;
  max-width: 100% !important;
  height: auto !important;
  max-height: 220px;
  margin: 0;
  border: 1px solid rgba(201,255,61,.16);
  border-radius: 16px;
  background: #05070a;
  object-fit: contain !important;
  object-position: center;
  box-shadow: 0 18px 44px rgba(0,0,0,.28);
  overflow: hidden;
}

.home-hero h1 {
  margin: 0;
  max-width: none;
  font-size: clamp(30px, 8.5vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.045em;
  white-space: nowrap;
}

.home-hero p {
  font-size: 14px;
  line-height: 1.35;
}

@media (max-width: 360px) {
  .home-hero h1 {
  margin: 0;
  max-width: none;
  font-size: clamp(30px, 8.5vw, 36px);
  line-height: 1.05;
  letter-spacing: -0.045em;
  white-space: nowrap;
}
}

.sport-card-main h3 {
  margin-bottom: 4px;
}

.sport-card-main p {
  line-height: 1.3;
}

.sport-chip-row {
  gap: 8px;
  flex-wrap: wrap;
}

.sport-card-chip,
.sport-card-participants-chip,
.sport-sheet-chips span {
  min-height: 36px;
  padding: 8px 11px;
  border-radius: 999px;
}

.sport-sheet-chips span {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.compact-sport-detail-list {
  gap: 0;
}

.compact-sport-detail-list > div {
  min-height: auto;
  padding: 12px 0;
}

.compact-sport-detail-list strong {
  line-height: 1.35;
}

.sport-map-preview {
  margin: 14px 0 16px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(92, 225, 230, 0.26);
  background:
    linear-gradient(135deg, rgba(92, 225, 230, 0.12), rgba(190, 255, 46, 0.08)),
    rgba(0, 0, 0, 0.24);
}

.sport-map-preview iframe {
  display: block;
  width: 100%;
  min-height: 190px;
  border: 0;
}

.sport-map-link {
  display: block;
  padding: 12px 14px;
  text-align: center;
  color: #5ce1e6;
  text-decoration: none;
  font-weight: 900;
  border-top: 1px solid rgba(92, 225, 230, 0.2);
}

.sport-card-members-preview {
  margin-top: 10px;
}



/* GO IRL logo hard fix */
@media (max-width: 360px) {
  .home-hero h1 {
    white-space: normal;
    font-size: 30px;
  }
}

/* GO IRL hard hero logo fix v2 */
.home-hero {
  padding-top: 8px !important;
}

.go-irl-hero-logo-frame {
  width: 100% !important;
  height: auto !important;
  max-height: 230px !important;
  aspect-ratio: 16 / 9 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  border: 1px solid rgba(201,255,61,.18) !important;
  border-radius: 18px !important;
  background: #05070a !important;
  box-shadow: 0 18px 44px rgba(0,0,0,.28) !important;
}

.go-irl-hero-logo-img {
  display: block !important;
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  object-position: center center !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.home-hero h1 {
  max-width: none !important;
  font-size: clamp(30px, 8.5vw, 36px) !important;
  line-height: 1.05 !important;
  white-space: nowrap !important;
}

/* GO IRL header logo overflow fix */
.app-header .header-brand,
.header-brand {
  width: 70px !important;
  min-width: 70px !important;
  max-width: 70px !important;
  height: 70px !important;
  min-height: 70px !important;
  max-height: 70px !important;
  flex: 0 0 70px !important;
  overflow: hidden !important;
}

.app-header .header-brand img,
.header-brand img {
  width: 68px !important;
  min-width: 68px !important;
  max-width: 68px !important;
  height: 68px !important;
  min-height: 68px !important;
  max-height: 68px !important;
  object-fit: cover !important;
  object-position: center !important;
  display: block !important;
  border-radius: 8px !important;
  transform: none !important;
}

/* Home hero logo must be wide, but only this exact class */
.go-irl-hero-logo-frame {
  width: 100% !important;
  max-width: 100% !important;
  aspect-ratio: 16 / 9 !important;
  max-height: 220px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow: hidden !important;
  border: 1px solid rgba(201,255,61,.18) !important;
  border-radius: 18px !important;
  background: #05070a !important;
}

.go-irl-hero-logo-img {
  width: 100% !important;
  height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
  border: 0 !important;
  box-shadow: none !important;
  background: transparent !important;
}
/* GO IRL report bug action cleanup */
.report-bug-action {
  width: 100% !important;
  min-height: 54px !important;
  grid-column: 1 / -1 !important;
  display: inline-flex !important;
  gap: 10px !important;
}

.report-bug-action span {
  display: inline !important;
  font-weight: 800 !important;
}
/* GO IRL compact details and actions */
.compact-sheet-actions {
  grid-template-columns: 1fr 56px !important;
  align-items: stretch !important;
}

.event-more-actions {
  position: relative !important;
}

.event-more-actions summary {
  list-style: none !important;
  cursor: pointer !important;
  font-size: 30px !important;
  line-height: 1 !important;
}

.event-more-actions summary::-webkit-details-marker {
  display: none !important;
}

.event-more-menu {
  position: absolute !important;
  right: 0 !important;
  bottom: 64px !important;
  z-index: 50 !important;
  min-width: 240px !important;
  padding: 8px !important;
  border: 1px solid rgba(255,255,255,.14) !important;
  border-radius: 16px !important;
  background: rgba(12,15,20,.98) !important;
  box-shadow: 0 20px 60px rgba(0,0,0,.45) !important;
}

.event-more-menu button {
  width: 100% !important;
  min-height: 46px !important;
  display: flex !important;
  align-items: center !important;
  gap: 10px !important;
  padding: 10px 12px !important;
  border: 0 !important;
  border-radius: 12px !important;
  background: transparent !important;
  color: inherit !important;
  font-weight: 800 !important;
  text-align: left !important;
}

.sport-detail-list {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 0 !important;
  border: 1px solid rgba(255,255,255,.08) !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.sport-detail-list > div {
  min-height: 76px !important;
  padding: 12px !important;
  border-bottom: 1px solid rgba(255,255,255,.08) !important;
}

.sport-detail-list > div:nth-child(odd) {
  border-right: 1px solid rgba(255,255,255,.10) !important;
}

.sport-detail-list > div:nth-last-child(-n+2) {
  border-bottom: 0 !important;
}

.sport-detail-list > div span {
  font-size: 13px !important;
  line-height: 1.2 !important;
}

.sport-detail-list > div strong,
.sport-detail-list > div a {
  font-size: 16px !important;
  line-height: 1.2 !important;
  text-align: right !important;
}
/* GO IRL compact detail grid readability fix */
.sport-detail-list > div {
  display: grid !important;
  grid-template-columns: 26px 1fr !important;
  grid-template-areas:
    "icon label"
    "icon value" !important;
  column-gap: 10px !important;
  row-gap: 5px !important;
  align-items: center !important;
  min-width: 0 !important;
  min-height: 86px !important;
}

.sport-detail-list > div > svg {
  grid-area: icon !important;
}

.sport-detail-list > div > span {
  grid-area: label !important;
  min-width: 0 !important;
  font-size: 13px !important;
  line-height: 1.15 !important;
}

.sport-detail-list > div > strong,
.sport-detail-list > div > a {
  grid-area: value !important;
  min-width: 0 !important;
  max-width: 100% !important;
  font-size: 15px !important;
  line-height: 1.15 !important;
  text-align: left !important;
  overflow-wrap: anywhere !important;
  word-break: normal !important;
}

.sport-detail-list > div > a {
  color: #67e8f9 !important;
}
/* GO IRL place card instead of embedded map */
.sport-map-preview {
  display: none !important;
}

.sport-place-card {
  margin: 14px 0 16px !important;
  padding: 14px !important;
  display: grid !important;
  gap: 12px !important;
  border-radius: 18px !important;
  border: 1px solid rgba(92,225,230,.22) !important;
  background: rgba(92,225,230,.06) !important;
}

.sport-place-card span {
  display: block !important;
  color: var(--muted) !important;
  font-size: 13px !important;
  margin-bottom: 4px !important;
}

.sport-place-card strong {
  display: block !important;
  font-size: 18px !important;
}
/* GO IRL map cleanup and address link */
.sport-map-preview,
.sport-map-preview iframe {
  display: none !important;
}

.sport-address-link {
  color: #67e8f9 !important;
  font-weight: 900 !important;
  text-decoration: underline !important;
  text-underline-offset: 3px !important;
}



.weather-detail-toggle {
  display: grid !important;
  grid-template-columns: 25px 1fr minmax(0, 1.5fr) !important;
  align-items: center !important;
  gap: 8px !important;
  min-height: 52px !important;
  width: 100% !important;
  padding: 0 !important;
  border: 0 !important;
  border-bottom: 1px solid rgba(255,255,255,.08) !important;
  background: transparent !important;
  color: var(--text) !important;
  text-align: left !important;
}

.weather-detail-toggle svg {
  width: 19px !important;
  color: var(--lime) !important;
}

.weather-detail-toggle span {
  color: var(--muted) !important;
  font-size: 12px !important;
}

.weather-detail-toggle strong {
  font-size: 13px !important;
  text-align: right !important;
  overflow-wrap: anywhere !important;
}

.weather-detail-card {
  margin: 14px 0 16px !important;
  padding: 14px !important;
  border-radius: 18px !important;
  border: 1px solid rgba(201,255,61,.22) !important;
  background: rgba(201,255,61,.06) !important;
}

.weather-detail-head {
  display: grid !important;
  gap: 4px !important;
  margin-bottom: 12px !important;
}

.weather-detail-head span {
  color: var(--muted) !important;
  font-size: 13px !important;
}

.weather-detail-head strong {
  font-size: 16px !important;
}

.weather-bars {
  display: grid !important;
  gap: 8px !important;
}

.weather-bar-row {
  display: grid !important;
  grid-template-columns: 46px 1fr 54px !important;
  align-items: center !important;
  gap: 8px !important;
  font-size: 12px !important;
}

.weather-bar-row meter {
  width: 100% !important;
}

.weather-detail-grid {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 8px !important;
  margin-top: 12px !important;
  color: var(--muted) !important;
  font-size: 12px !important;
}

.profile-avatar img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}


/* PLAN1152 profile photo controls */
.profile-edit-avatar {
  width: 152px;
  height: 152px;
  margin-top: 8px;
  border-radius: 28px;
  font-size: 30px;
  box-shadow: 0 18px 42px rgba(0,0,0,.34);
  cursor: pointer;
}
.profile-edit-avatar input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
.profile-edit-avatar.is-busy {
  pointer-events: none;
  opacity: .7;
}
.profile-edit-avatar i {
  right: -10px;
  bottom: -10px;
  width: 46px;
  height: 46px;
  border-width: 3px;
  border-radius: 15px;
}


/* Event sheet UI polish: participants, three-line address, neutral coach action. */
.sport-detail-list > .sport-location-row {
  min-height: 118px !important;
}

.sport-location-block {
  display: grid !important;
  gap: 3px !important;
  align-content: center !important;
  min-height: 66px !important;
  overflow: hidden !important;
}

.sport-location-city,
.sport-location-address {
  display: -webkit-box !important;
  overflow: hidden !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 1 !important;
}

.sport-detail-list > .sport-detail-members-row {
  grid-column: 1 / -1 !important;
  grid-template-columns: 26px 1fr auto 22px !important;
  grid-template-areas: "icon label value arrow" !important;
  min-height: 64px !important;
  width: 100% !important;
  padding: 12px !important;
  border: 0 !important;
  border-top: 1px solid rgba(255,255,255,.08) !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: inherit !important;
  text-align: left !important;
}

.sport-detail-members-row > svg:first-child { grid-area: icon !important; }
.sport-detail-members-row > span { grid-area: label !important; }
.sport-detail-members-row > strong { grid-area: value !important; }
.sport-detail-members-row > svg:last-child { grid-area: arrow !important; }

.coach-panel-button {
  border: 1px solid rgba(255,255,255,.18) !important;
  background: transparent !important;
  color: var(--text-primary, #f7f7f7) !important;
}


/* Event sheet post-save polish. */
.activity-sheet.sport-sheet {
  padding-top: 30px !important;
}

.sport-sheet .sport-sheet-hero {
  margin-top: -12px !important;
  align-items: flex-start !important;
}

.sport-detail-list > .sport-date-row > span,
.sport-detail-list > .sport-date-row > strong {
  font-size: 15px !important;
  font-weight: 800 !important;
  line-height: 1.15 !important;
}

.sport-location-block {
  grid-template-rows: repeat(3, minmax(0, 1.25em)) !important;
}

.sport-location-city,
.sport-location-address {
  line-height: 1.25 !important;
}

.sport-detail-list > .sport-bring-row > strong {
  display: -webkit-box !important;
  min-height: calc(3 * 1.2em) !important;
  max-height: calc(3 * 1.2em) !important;
  overflow: hidden !important;
  -webkit-box-orient: vertical !important;
  -webkit-line-clamp: 3 !important;
}

.sport-detail-list > .sport-organizer-tips-row {
  grid-column: 1 / -1 !important;
  min-height: 64px !important;
}

.sport-detail-list > .sport-organizer-tips-row > strong {
  display: block !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}

.post-save-actions {
  position: fixed !important;
  left: 50% !important;
  bottom: calc(16px + env(safe-area-inset-bottom)) !important;
  z-index: 80 !important;
  width: min(calc(100% - 96px), 390px) !important;
  transform: translateX(-50%) !important;
  display: grid !important;
  grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
  gap: 6px !important;
  padding: 0 !important;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

.post-save-actions button {
  min-width: 0 !important;
  min-height: 40px !important;
  padding: 6px 7px !important;
  border: 1px solid rgba(255,255,255,.18) !important;
  border-radius: 12px !important;
  background: rgba(8,12,10,.72) !important;
  color: var(--text-primary, #f7f7f7) !important;
  backdrop-filter: blur(10px) !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 5px !important;
  font-size: 10px !important;
  font-weight: 800 !important;
}

.post-save-actions button svg {
  width: 15px !important;
  height: 15px !important;
  flex: 0 0 auto !important;
}

.post-save-actions button span {
  min-width: 0 !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  white-space: nowrap !important;
}
