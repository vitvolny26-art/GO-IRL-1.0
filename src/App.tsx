import { lazy, Suspense, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  ArrowLeft,
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
  UploadCloud,
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
import { getCurrentStartParam, initializeTrustedAuth } from "./authSession";
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
import { getUserKey } from "./supabase";
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
import { getOrganizerRoleRequestState } from "./coachFeature";
import { CardShareAction } from "./components/CardShareAction";
import { stripLeadingEmoji } from "./cardText";
import { buildEventLocationUrl, loadSavedEventLocations, rememberEventLocation } from "./eventLocations";
import { openAvatarCropper } from "./avatarCropper";
import { readProfileAvatarAsDataUrl } from "./profileAvatar";
import { activityIconFor } from "./activityIcon";
import {
  buildBrowserActivityInviteUrl,
  buildSeparatedInvitationText,
  buildTelegramActivityInviteUrl,
  buildTelegramShareUrl,
  parseInvitationStartParam,
} from "./invitationLink";
import { EventWeatherStrip } from "./components/EventWeatherStrip";
import { isOutdoorGenericActivity } from "./eventWeather";
import { sharePreparedTelegramEvent } from "./telegramPreparedShare";


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

const activityIdFromJoinPath = () => {
  if (typeof window === "undefined") return "";
  const match = window.location.pathname.match(/^\/join\/([^/?#]+)/);
  return match ? decodeURIComponent(match[1]) : "";
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
  const t = getTranslation(store.language);

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
        if (selected) setSelected(null);
        else store.setView("home");
      });
    }
    return undefined;
  }, [selected, store.view, store]);

  useEffect(() => {
    if (invitationHandled.current) return;
    const startParam = getCurrentStartParam();
    const pathId = activityIdFromJoinPath();
    const parsedStartParam = startParam ? parseInvitationStartParam(startParam) : null;
    if (parsedStartParam && !parsedStartParam.valid) {
      invitationHandled.current = true;
      showNotice(t.invalidInvitationLink);
      return;
    }
    const invitedId = parsedStartParam?.eventId || pathId;
    if (invitedId) {
      const invitedActivity = store.activities.find((item) => item.id === invitedId);
      if (invitedActivity) {
        invitationHandled.current = true;
        setSelected(invitedActivity);
        if (window.location.pathname.startsWith("/join/")) {
          window.history.replaceState({}, "", "/");
        }
      } else if (!store.loading) {
        invitationHandled.current = true;
        showNotice(t.invitationEventNotFound);
      }
    }
  }, [store.activities, store.loading, t.invalidInvitationLink, t.invitationEventNotFound]);

  const flash = (message: string) => {
    setNotice(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setNotice(""), 2200);
  };

  const requestCloseMiniApp = () => {
    if (!closeMiniApp()) flash(t.telegramCloseFallback);
  };

  const openRandom = () => {
    const random = store.activities[Math.floor(Math.random() * store.activities.length)];
    if (random) setSelected(random);
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

      <main>
        {store.syncError && <div className="sync-banner">{store.syncError === "database_unavailable" ? t.databaseError : store.syncError}</div>}
        {store.loading && <div className="sync-loading">{t.loadingEvents}</div>}
        {store.view === "home" && (
          <HomeView
            language={store.language}
            onOpen={setSelected}
            onJoin={handleJoin}
            onRandom={openRandom}
            onCreate={() => store.setView("create")}
          />
        )}
        {store.view === "discover" && <DiscoverView language={store.language} onOpen={setSelected} onJoin={handleJoin} />}
        {store.view === "explore" && <ExploreView language={store.language} onOpen={setSelected} onJoin={handleJoin} />}
        {store.view === "create" && <CreateView key={editingActivity?.id || "new-event"} language={store.language} initialActivity={editingActivity} onCancel={() => {
          setEditingActivity(null);
          store.setView("home");
        }} onCreated={(id) => {
          flash(editingActivity ? t.updatedSuccess : t.createdSuccess);
          setEditingActivity(null);
          setCompletionActivityId(id);
          setCompletion(editingActivity ? t.updatedSuccess : t.createdSuccess);
        }} />}
        {store.view === "profile" && <ProfileView language={store.language} onOpen={setSelected} onJoin={handleJoin} onCloseMiniApp={requestCloseMiniApp} />}
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
        />
      )}
      {completion && (
        <CompletionBar
          message={completion}
          language={store.language}
          onDismiss={() => {
            setCompletion("");
            setCompletionActivityId(null);
          }}
          onOpen={() => {
            const activity = useAppStore.getState().activities.find((item) => item.id === completionActivityId);
            if (activity) setSelected(activity);
          }}
          onShare={() => {
            const activity = useAppStore.getState().activities.find((item) => item.id === completionActivityId);
            if (activity) void shareActivity(activity);
          }}
          onCalendar={() => {
            const activity = useAppStore.getState().activities.find((item) => item.id === completionActivityId);
            if (activity) saveToGoogleCalendar(activity);
          }}
          onCloseMiniApp={requestCloseMiniApp}
        />
      )}
      {notice && <div className="toast">{notice}</div>}
    </div>
  );
}

function HomeView({ language, onOpen, onJoin, onRandom, onCreate }: { language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void; onRandom: () => void; onCreate: () => void }) {
  const { activities, loading, selectedCityId, setCategory } = useAppStore();
  const t = getTranslation(language);
  const city = getCity(selectedCityId);
  const today = new Date().toISOString().slice(0, 10);
  const nearby = activities.filter((item) => item.date >= today).slice(0, 4);
  const popular = activities.filter((item) => item.popular);
  const urgent = activities.filter((item) => item.urgent);
  const activeCategoryCount = new Set(activities.map((item) => item.categoryId)).size;

  return (
    <>
      <section className="home-hero">
        <div className="go-irl-hero-logo-frame">
          <img className="go-irl-hero-logo-img" src="/brand/logo-wide.png?v=logo-fix-2" alt="GO IRL" />
        </div>
        <div className="home-kicker"><MapPin />{t.liveInCity} · {city.name[language]}</div>
        <h1>{t.homeTitle}</h1>
        <p>{t.homeSubtitle}</p>
        <div className="home-stats" aria-label={t.categories}>
          <div><strong>{nearby.length}</strong><span>{t.upcomingCount}</span></div>
          <div><strong>{activeCategoryCount || categories.length}</strong><span>{t.activeDirections}</span></div>
          <div><strong>{urgent.length}</strong><span>{t.urgentShort}</span></div>
        </div>
      </section>

      <div className="quick-actions">
        <button className="quick primary" onClick={onRandom} type="button"><Dices size={25} /><span>{t.surprise}</span></button>
        <button className="quick secondary" onClick={onCreate} type="button"><Plus size={25} /><span>{t.create}</span></button>
      </div>

      <SectionHeader title={t.chooseDirection} />
      <div className="category-grid module-grid">
        {categories.map((category) => (
          <button className="category-button" key={category.id} onClick={() => setCategory(category.id)} type="button">
            <span>{category.icon}</span>
            <strong>{category.name[language]}</strong>
            <small>{activities.filter((activity) => activity.categoryId === category.id).length} {t.eventCountLabel}</small>
            <ChevronRight size={16} />
          </button>
        ))}
      </div>

      {loading ? <EventListSkeleton /> : nearby.length ? <ActivitySection title={t.nearby} activities={nearby} language={language} onOpen={onOpen} onJoin={onJoin} /> : <EmptyState text={t.noEvents} />}
      {urgent.length > 0 && <ActivitySection title={t.urgent} icon={<Zap size={18} />} activities={urgent} language={language} onOpen={onOpen} onJoin={onJoin} urgent />}
      <ActivitySection title={t.popular} activities={popular} language={language} onOpen={onOpen} onJoin={onJoin} />
    </>
  );
}

function DiscoverView({ language, onOpen, onJoin }: { language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void }) {
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

function DiscoverSection({ title, activities, language, onOpen, onJoin }: { title: string; activities: Activity[]; language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void }) {
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

function DiscoverActivityCard({ activity, language, onOpen, onJoin }: { activity: Activity; language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void }) {
  return <ActivityCard activity={activity} language={language} onOpen={onOpen} onJoin={onJoin} />;
}

function ExploreView({ language, onOpen, onJoin }: { language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void }) {
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
      setPriceError(priceError);
      setFormError("");
      setSubmitting(false);
      return;
    }

    const activity: NewActivity = {
      type: categoryId === "sport" ? "sport" : "custom",
      categoryId,
      activityText,
      titleText: rawTitle,
      descriptionText: rawDescription,
      date,
      time: String(data.get("time")),
      cityId,
      address: rawAddress,
      locationUrl: rawLocationUrl || undefined,
      participantNote: rawParticipantNote || undefined,
      price,
      capacity,
      visibility: String(data.get("visibility")) as NewActivity["visibility"],
      metadata: categoryId === "sport" ? { sport: sportMetadataFromForm(data, activityText) } : undefined,
    };
    try {
      const id = initialActivity
        ? await updateActivity(initialActivity.id, activity)
        : await createActivity(activity);
      rememberEventLocation(rawAddress, rawLocationUrl);
      setSelectedCity(cityId);
      onCreated(id);
      if (!initialActivity) event.currentTarget.reset();
    } catch {
      setFormError(t.publishError);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="page-section create-page">
      <button className="back-button" onClick={onCancel} type="button"><ArrowLeft size={20} /></button>
      <div className="page-title">{initialActivity ? <Pencil /> : <Plus />}<div><h1>{initialActivity ? t.edit : t.createTitle}</h1><p>{t.createHint}</p></div></div>
      <form className="create-form" ref={formRef} onSubmit={submit}>
        <div className="template-row" aria-label={t.quickTemplates}>
          <span>{t.quickTemplates}</span>
          <div>
            {quickTemplates.map((template) => (
              <button key={template.id} onClick={() => applyTemplate(template)} type="button">
                {template.icon} {template.label}
              </button>
            ))}
          </div>
        </div>
        <label><span>{t.category}</span><select name="categoryId" value={categoryId} onChange={(event) => setCategoryId(event.target.value)} required>{createCategories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name[language]}</option>)}</select></label>
        <label><span>{t.activity}</span><select key={`${categoryId}-${language}`} name="activityText" defaultValue={initialActivity?.categoryId === categoryId ? stripLeadingEmoji(initialActivity.activity[language]) : undefined} required>{(createActivityOptions[categoryId] || []).map((option) => <option key={`${option.icon}-${option.name[language]}`} value={option.name[language]}>{option.icon} {option.name[language]}</option>)}</select></label>
        {categoryId === "sport" && (
          <Suspense fallback={<div className="sport-create-panel">{t.loadingEvents}</div>}>
            <LazySportCreateFields language={language} initialSport={initialSport} />
          </Suspense>
        )}
        <label><span>{t.title}</span><input name="titleText" defaultValue={initialActivity?.title[language]} placeholder={t.titlePlaceholder} maxLength={MAX_EVENT_TITLE_LENGTH} required /></label>
        <label><span>{t.description}</span><textarea name="descriptionText" rows={4} defaultValue={initialActivity?.description[language]} maxLength={MAX_EVENT_DESCRIPTION_LENGTH} required /></label>
        <div className="form-row">
          <label><span>{t.date}</span><input name="date" type="date" min={today} defaultValue={initialActivity?.date || today} required /></label>
          <label><span>{t.time}</span><input name="time" type="time" defaultValue={initialActivity?.time || "18:00"} required /></label>
        </div>
        <label><span>{t.city}</span><select name="cityId" value={cityId} onChange={(event) => {
          const nextCityId = event.target.value;
          const oldAutoUrl = buildEventLocationUrl(addressValue, selectedCity.name[language]);
          const nextCityName = getCity(nextCityId).name[language];
          setCityId(nextCityId);
          if (!locationUrlValue || locationUrlValue === oldAutoUrl) setLocationUrlValue(buildEventLocationUrl(addressValue, nextCityName));
        }} required>{cities.map((city) => <option key={city.id} value={city.id}>{city.name[language]}</option>)}</select></label>
        <label><span>{t.address}</span><input name="address" list="saved-event-locations" value={addressValue} onChange={(event) => {
          const nextAddress = event.target.value;
          const previousAutoUrl = buildEventLocationUrl(addressValue, selectedCity.name[language]);
          const saved = savedLocations.find((item) => item.address.toLocaleLowerCase() === nextAddress.trim().toLocaleLowerCase());
          setAddressValue(nextAddress);
          if (saved?.locationUrl) setLocationUrlValue(saved.locationUrl);
          else if (!locationUrlValue || locationUrlValue === previousAutoUrl) setLocationUrlValue(buildEventLocationUrl(nextAddress, selectedCity.name[language]));
        }} maxLength={MAX_EVENT_ADDRESS_LENGTH} required /></label>
        <datalist id="saved-event-locations">{savedLocations.map((item) => <option key={item.address} value={item.address} />)}</datalist>
        <label><span>{t.locationUrl}</span><input name="locationUrl" type="url" value={locationUrlValue} onChange={(event) => setLocationUrlValue(event.target.value)} placeholder={t.locationPlaceholder} /></label>
        <label><span>{t.participantNote}</span><textarea name="participantNote" rows={3} defaultValue={initialActivity?.participantNote} maxLength={MAX_EVENT_NOTE_LENGTH} placeholder={t.participantNotePlaceholder} /></label>
        <div className="form-row">
          <label className="price-field"><span>{t.price}</span><input name="price" type="number" min="0" max={MAX_EVENT_PRICE} defaultValue={initialActivity?.price || 0} onInput={(event) => setPriceError(validateEventPrice(Number(event.currentTarget.value), t))} onChange={(event) => setPriceError(validateEventPrice(Number(event.currentTarget.value), t))} required /><small className="field-error">{priceError || t.priceTooHigh}</small></label>
          <label><span>{t.capacity}</span><input name="capacity" type="number" min={MIN_EVENT_CAPACITY} max={MAX_EVENT_CAPACITY} defaultValue={initialActivity?.capacity || 8} required /></label>
        </div>
        <fieldset>
          <legend>{t.visibility}</legend>
          <div className="segmented">
            <label><input name="visibility" type="radio" value="public" defaultChecked={!initialActivity || initialActivity.visibility === "public"} /><span>{t.public}</span></label>
            <label><input name="visibility" type="radio" value="private" defaultChecked={initialActivity?.visibility === "private"} /><span>{t.private}</span></label>
            <label><input name="visibility" type="radio" value="invite" defaultChecked={initialActivity?.visibility === "invite"} /><span>{t.invite}</span></label>
          </div>
        </fieldset>
        {formError && <div className="form-error">{formError}</div>}
        <button className="publish-button" type="submit" disabled={submitting || Boolean(priceError)}>{initialActivity ? <Pencil size={20} /> : <Sparkles size={20} />}{submitting ? "…" : initialActivity ? t.save : t.publish}</button>
      </form>
    </section>
  );
}

type LocalProfile = {
  name: string;
  bio: string;
  cityId: string;
  avatar: string;
  registeredAt: string;
  favoriteActivities: string[];
};

const avatarOptions = ["GI", "GO", "IRL", "🏐", "🎉", "🌿"];
const maxAvatarBytes = 5 * 1024 * 1024;
const profilePolishCopy: Record<Language, { title: string; hint: string; upload: string; formats: string; invalid: string }> = {
  ru: { title: "Профиль", hint: "Настройте профиль и интересы", upload: "Нажмите или перетащите фото", formats: "JPG или PNG до 5 МБ", invalid: "Выберите JPG или PNG размером до 5 МБ" },
  uk: { title: "Профіль", hint: "Налаштуйте профіль та інтереси", upload: "Натисніть або перетягніть фото", formats: "JPG або PNG до 5 МБ", invalid: "Виберіть JPG або PNG розміром до 5 МБ" },
  cs: { title: "Profil", hint: "Nastavte profil a zájmy", upload: "Klikněte nebo přetáhněte fotku", formats: "JPG nebo PNG do 5 MB", invalid: "Vyberte JPG nebo PNG do 5 MB" },
  en: { title: "Profile", hint: "Set up your profile and interests", upload: "Click or drag a photo here", formats: "JPG or PNG up to 5 MB", invalid: "Choose a JPG or PNG up to 5 MB" },
};

const loadProfile = (fallbackName: string, fallbackCityId: string): LocalProfile => {
  const stored = localStorage.getItem("go-irl-profile");
  const registeredAt = localStorage.getItem("go-irl-registered-at") || new Date().toISOString();
  localStorage.setItem("go-irl-registered-at", registeredAt);
  if (!stored) return { name: fallbackName, bio: "", cityId: fallbackCityId, avatar: "GI", registeredAt, favoriteActivities: [] };

  try {
    const parsed = JSON.parse(stored) as Partial<LocalProfile>;
    return {
      name: parsed.name || fallbackName,
      bio: parsed.bio || "",
      cityId: parsed.cityId || fallbackCityId,
      avatar: parsed.avatar || "GI",
      registeredAt: parsed.registeredAt || registeredAt,
      favoriteActivities: Array.isArray(parsed.favoriteActivities) ? parsed.favoriteActivities : [],
    };
  } catch {
    return { name: fallbackName, bio: "", cityId: fallbackCityId, avatar: "GI", registeredAt, favoriteActivities: [] };
  }
};

function ProfileView({ language, onOpen, onJoin, onCloseMiniApp }: { language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void; onCloseMiniApp: () => void }) {
  const { activities, joinedIds, pendingIds, loading, syncError, selectedCityId, setSelectedCity } = useAppStore();
  const [editing, setEditing] = useState(false);
  const t = getTranslation(language);
  const tgUser = getTelegramWebApp()?.initDataUnsafe?.user;
  const fallbackName = [tgUser?.first_name, tgUser?.last_name].filter(Boolean).join(" ") || t.guestName;
  const [profile, setProfile] = useState(() => loadProfile(fallbackName, selectedCityId));
  const [avatarDraft, setAvatarDraft] = useState(profile.avatar);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const userKey = getUserKey();
  const city = getCity(profile.cityId);
  const today = new Date().toISOString().slice(0, 10);
  const organized = activities.filter((item) => item.organizerKey === userKey);
  const participating = activities.filter((item) => joinedIds.includes(item.id) && item.organizerKey !== userKey);
  const pendingRequests = activities.filter((item) => pendingIds.includes(item.id));
  const activeEvents = activities.filter((item) => item.date >= today && (item.organizerKey === userKey || joinedIds.includes(item.id) || pendingIds.includes(item.id)));
  const joinedCount = activities.filter((item) => joinedIds.includes(item.id)).length;
  const registeredLabel = new Intl.DateTimeFormat(localeByLanguage[language], { day: "numeric", month: "short", year: "numeric" }).format(safeDate(profile.registeredAt));
  const favoriteOptions = favoriteActivityOptions(language);
  const selectedFavorites = favoriteOptions.filter((option) => profile.favoriteActivities.includes(option.id));
  const profileCopy = profilePolishCopy[language];

  const processAvatarFile = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > maxAvatarBytes) {
      setAvatarError(profileCopy.invalid);
      return;
    }

    setAvatarError("");
    setAvatarBusy(true);
    try {
      const cropped = await openAvatarCropper(file);
      if (cropped) setAvatarDraft(await readProfileAvatarAsDataUrl(cropped));
    } finally {
      setAvatarBusy(false);
    }
  };

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const nextProfile: LocalProfile = {
      name: String(data.get("profileName") || fallbackName).trim() || fallbackName,
      bio: String(data.get("profileBio") || "").trim(),
      cityId: String(data.get("profileCity") || selectedCityId),
      avatar: avatarDraft || String(data.get("profileAvatar") || "GI"),
      registeredAt: profile.registeredAt,
      favoriteActivities: data.getAll("favoriteActivities").map(String),
    };
    localStorage.setItem("go-irl-profile", JSON.stringify(nextProfile));
    setProfile(nextProfile);
    setAvatarDraft(nextProfile.avatar);
    setSelectedCity(nextProfile.cityId);
    setEditing(false);
    notifyTelegram("success");
  };

  return (
    <section className={`page-section profile-page${editing ? " is-editing" : ""}`}>
      {loading && <ProfileSkeleton />}
      {syncError && <div className="details-error profile-error"><ShieldCheck /><span>{t.databaseError}</span></div>}
      {!editing && <div className="profile-hero">
        <div className="profile-avatar">{profile.avatar.startsWith("data:image/") ? <img src={profile.avatar} alt={t.avatar} /> : profile.avatar}</div>
        <div className="profile-main">
          <div className="profile-kicker"><MapPin />{city.name[language]}</div>
          <h1>{profile.name}</h1>
          <p>{profile.bio || t.profileBioFallback}</p>
          <small>{t.registeredAt}: {registeredLabel}</small>
        </div>
        <button className="profile-edit-button" onClick={() => setEditing(true)} type="button"><Pencil size={18} />{t.editProfile}</button>
      </div>}

      {editing && (
        <form id="profile-edit-form" className="profile-edit-form" onSubmit={saveProfile}>
          <div className="profile-edit-intro">
            <h1>{profileCopy.title}</h1>
            <p>{profileCopy.hint}</p>
            <div className="profile-edit-avatar">
              {avatarDraft.startsWith("data:image/") ? <img src={avatarDraft} alt={t.avatar} /> : <span>{avatarDraft}</span>}
              <i aria-hidden="true"><Camera size={16} /></i>
            </div>
          </div>
          <label><span>{t.name}</span><input name="profileName" defaultValue={profile.name} required /></label>
          <label><span>{t.shortBio}</span><textarea name="profileBio" rows={3} defaultValue={profile.bio} placeholder={t.profileBioPlaceholder} /></label>
          <label><span>{t.city}</span><select name="profileCity" defaultValue={profile.cityId}>{cities.map((item) => <option key={item.id} value={item.id}>{item.name[language]}</option>)}</select></label>
          <div className="interest-picker">
            <span>{t.favoriteActivities}</span>
            <p>{t.favoriteActivitiesHint}</p>
            <div>
              {favoriteOptions.map((option) => (
                <label key={option.id}>
                  <input name="favoriteActivities" type="checkbox" value={option.id} defaultChecked={profile.favoriteActivities.includes(option.id)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="profile-avatar-choice-label">{t.avatar}</div>
          <div className="avatar-picker" role="radiogroup" aria-label={t.avatar}>
            {avatarOptions.map((avatar) => (
              <label key={avatar}>
                <input name="profileAvatar" type="radio" value={avatar} defaultChecked={profile.avatar === avatar} onChange={() => setAvatarDraft(avatar)} />
                <span>{avatar}</span>
              </label>
            ))}
          </div>
          <label
            className={`profile-avatar-upload${avatarBusy ? " is-busy" : ""}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              void processAvatarFile(event.dataTransfer.files?.[0]);
            }}
          >
            <input type="file" accept="image/jpeg,image/png" disabled={avatarBusy} aria-label={t.avatar} onChange={(event) => {
              const input = event.currentTarget;
              void processAvatarFile(input.files?.[0]).finally(() => { input.value = ""; });
            }} />
            <UploadCloud aria-hidden="true" />
            <strong>{avatarBusy ? "…" : profileCopy.upload}</strong>
            <small>{profileCopy.formats}</small>
          </label>
          {avatarError && <div className="profile-avatar-error" role="alert">{avatarError}</div>}
          <button className="publish-button" type="submit" disabled={avatarBusy}><Pencil size={18} />{avatarBusy ? "…" : t.save}</button>
        </form>
      )}

      {!editing && <>
        <SectionHeader title={t.favoriteActivities} />
        {selectedFavorites.length ? (
          <div className="profile-interest-list">
            {selectedFavorites.map((option) => <span key={option.id}>{option.label}</span>)}
          </div>
        ) : (
          <EmptyState text={t.noFavoriteActivities} />
        )}

        <SectionHeader title={t.profileStats} />
        <div className="life-grid profile-stats-grid">
          <Metric icon={<Star />} value={String(organized.length)} label={t.createdEvents} />
          <Metric icon={<UserRoundCheck />} value={String(joinedCount)} label={t.visitedEvents} />
          <Metric icon={<Zap />} value={String(activeEvents.length)} label={t.activeEvents} />
          <Metric icon={<Clock3 />} value={String(pendingRequests.length)} label={t.pendingRequests} />
        </div>

        <SectionHeader title={t.myEvents} />
        <ProfileEventGroup title={t.organizing} activities={organized} language={language} emptyText={t.noOrganizedEvents} onOpen={onOpen} onJoin={onJoin} />
        <ProfileEventGroup title={t.participating} activities={participating} language={language} emptyText={t.noJoinedEvents} onOpen={onOpen} onJoin={onJoin} />
        <ProfileEventGroup title={t.waitingDecision} activities={pendingRequests} language={language} emptyText={t.noPendingRequests} onOpen={onOpen} onJoin={onJoin} />
        <button className="telegram-close-button" onClick={onCloseMiniApp} type="button">{t.backToTelegram}</button>
      </>}
    </section>
  );
}

function ProfileEventGroup({ title, activities, language, emptyText, onOpen, onJoin }: { title: string; activities: Activity[]; language: Language; emptyText: string; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void }) {
  return (
    <section className="profile-event-group">
      <h3>{title}</h3>
      {activities.length ? (
        <div className="activity-stack">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} language={language} onOpen={onOpen} onJoin={onJoin} />)}</div>
      ) : (
        <EmptyState text={emptyText} />
      )}
    </section>
  );
}

function ProfileSkeleton() {
  return (
    <div className="profile-skeleton" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>
  );
}

function ActivitySection({ title, activities, language, onOpen, onJoin, icon, urgent = false }: { title: string; activities: Activity[]; language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void; icon?: React.ReactNode; urgent?: boolean }) {
  if (!activities.length) return null;
  return (
    <section className={urgent ? "activity-section urgent-section" : "activity-section"}>
      <SectionHeader title={title} icon={icon} />
      <div className="activity-stack">{activities.map((activity) => <ActivityCard key={activity.id} activity={activity} language={language} onOpen={onOpen} onJoin={onJoin} />)}</div>
    </section>
  );
}

function ActivityCard(props: { activity: Activity; language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void; onOpenMembers?: (activity: Activity) => void }) {
  if (!isSportExperience(props.activity)) return <GenericActivityCard {...props} />;
  return (
    <Suspense fallback={<GenericActivityCard {...props} />}>
      <LazySportActivityCard {...props} />
    </Suspense>
  );
}

function GenericActivityCard({ activity, language, onOpen, onJoin }: { activity: Activity; language: Language; onOpen: (activity: Activity) => void; onJoin: (activity: Activity) => void }) {
  const { joinedIds, waitingIds, pendingIds } = useAppStore();
  const t = getTranslation(language);
  const category = getActivityCategory(activity);
  const joined = joinedIds.includes(activity.id);
  const waiting = waitingIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const isOrganizer = activity.organizerKey === getUserKey();
  const full = activity.participants >= activity.capacity;
  const [membersPreviewOpen, setMembersPreviewOpen] = useState(false);
  const [helperState, setHelperState] = useState<"none" | "requested" | "confirmed">("none");
  const joinedMembers = activity.members.filter((member) => member.status === "joined");
  const shareTitle = stripLeadingEmoji(activity.activity[language]);
  const shareDate = `${compactDateLabel(activity.date, language)}${formatEventTime(activity.time) ? ` · ${formatEventTime(activity.time)}` : ""}`;
  const avatar = genericActivityAvatar(activity, language, category.icon);
  const mapLabel = activity.address.trim() || getCity(activity.cityId).name[language];
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
  const helperAction = isOrganizer
    ? helperState === "confirmed"
      ? eventHelperCardCopy[language].confirmed
      : helperState === "requested"
        ? eventHelperCardCopy[language].requested
        : eventHelperCardCopy[language].needed
    : helperState === "confirmed"
      ? eventHelperCardCopy[language].confirmed
      : t.details;
  const hasCardState = isOrganizer || joined || waiting || pending;
  const joinDisabled = !hasCardState && (full || activity.visibility === "private");

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
  const status = isOrganizer
    ? t.organizerStatus
    : pending
      ? t.requested
      : joined
        ? t.joined
        : waiting
          ? t.waiting
          : full
            ? t.eventFull
            : activity.visibility === "private"
              ? t.privateAccess
              : activity.visibility === "invite"
                ? t.inviteStatus
                : t.publicStatus;

  return (
    <article className="activity-card sport-card compact-sport-card unified-event-card">
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
        <div className={`sport-card-symbol category-${category.id}`}><span className="sport-avatar-glyph">{avatar}</span></div>
        <div>
          <div className="sport-eyebrow"><Sparkles size={14} aria-hidden="true" /><span>{category.name[language]}</span></div>
          <h3>{shareTitle}</h3>
          <p>{stripLeadingEmoji(activity.title[language])}</p>
        </div>
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
        <span
          className="sport-card-chip sport-duration-chip"
          aria-label={`${t.time}: ${formatEventTime(activity.time) || compactDateLabel(activity.date, language)}`}
        ><CalendarPlus size={16} aria-hidden="true" /><span>{formatEventTime(activity.time) || compactDateLabel(activity.date, language)}</span></span>
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
      <div className="activity-card-details sport-details-grid">
        <button type="button" onClick={(event) => { event.stopPropagation(); openActivityCalendar(activity, language); }}><CalendarDays /><span>{shareDate}</span></button>
        <div><Ticket /><span>{activity.price ? `${activity.price} Kč` : t.free}</span></div>
        <button type="button" onClick={(event) => { event.stopPropagation(); openActivityMap(activity); }}><MapPin /><span>{mapLabel}</span></button>
        <div className="unified-status-cell"><ShieldCheck /><Star /><span>{status}</span></div>
      </div>
      <EventWeatherStrip activity={activity} language={language} enabled={isOutdoorGenericActivity(activity)} />
      <div className="activity-card-footer compact-sport-actions">
        <button className="sport-coach-action" onClick={() => onOpen(activity)} type="button"><UsersRound size={18} />{helperAction}</button>
        <button className={hasCardState ? "card-join secondary" : "card-join"} onClick={() => hasCardState ? onOpen(activity) : onJoin(activity)} type="button" disabled={joinDisabled}>
          {action}
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
}: ActivitySheetProps) {
  const { joinedIds, waitingIds, pendingIds, reviewRequest, userRole } = useAppStore();
  const [membersOpen, setMembersOpen] = useState(initialMembersOpen);

  useEffect(() => {
    setMembersOpen(initialMembersOpen);
  }, [activity.id, initialMembersOpen]);
  const t = getTranslation(language);
  const category = getActivityCategory(activity);
  const isOrganizer = activity.organizerKey === getUserKey();
  const canDelete = isOrganizer || userRole === "admin";
  const joined = joinedIds.includes(activity.id);
  const waiting = waitingIds.includes(activity.id);
  const pending = pendingIds.includes(activity.id);
  const full = activity.participants >= activity.capacity;
  const action = isOrganizer
    ? t.edit
    : pending
      ? t.cancelRequest
      : joined || waiting
        ? t.leave
        : activity.visibility === "private"
          ? t.privateAccess
          : full
            ? t.eventFull
            : activity.visibility === "invite"
              ? t.request
              : t.join;
  const status = isOrganizer
    ? t.organizerStatus
    : pending
      ? t.requested
      : joined
        ? t.joined
        : waiting
          ? t.waiting
          : full
            ? t.eventFull
            : activity.visibility === "private"
              ? t.privateJoinInfo
              : activity.visibility === "invite"
                ? t.inviteStatus
                : t.publicStatus;
  const accessLabel = activity.visibility === "public" ? t.publicAccess : activity.visibility === "private" ? t.privateAccess : t.inviteAccess;
  const joinedMembers = activity.members.filter((member) => member.status === "joined");
  const waitingMembers = activity.members.filter((member) => member.status === "waiting");
  const pendingMembers = activity.members.filter((member) => member.status === "pending");
  const activityAvatar = genericActivityAvatar(activity, language, category.icon);

  const handleReview = async (memberKey: string, approved: boolean) => {
    await reviewRequest(activity.id, memberKey, approved);
  };

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
          <div><CircleUserRound /><span>{t.organizer}</span><strong>{activity.organizer}</strong></div>
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
                    <button onClick={() => void handleReview(member.userKey, true)} type="button" aria-label={t.approve} title={t.approve}><Check /></button>
                    <button onClick={() => void handleReview(member.userKey, false)} type="button" aria-label={t.reject} title={t.reject}><X /></button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        {!isOrganizer && (joined || waiting || pending) && <div className="status-banner">{joined ? <UserRoundCheck /> : <Clock3 />}<span>{joined ? t.joined : waiting ? t.waiting : t.requested}</span></div>}
        {!isOrganizer && activity.visibility === "private" && !joined && !waiting && !pending && <div className="status-banner neutral"><ShieldCheck /><span>{t.privateJoinInfo}</span></div>}
        {full && !joined && !waiting && !pending && !isOrganizer && <div className="status-banner danger"><UsersRound /><span>{t.eventFull}</span></div>}
              <ActivityChatPanel activity={activity} />

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




