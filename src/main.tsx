import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { enableFullCreateTaxonomy } from "./fullCreateTaxonomy";
import { enableParticipantJoinNotifications } from "./participantNotifications";
import { enableMapyRuntimeLinks } from "./mapyRuntimeLinks";
import { enableActivity3dIcons } from "./enableActivity3dIcons";
import { enableUxRegressionPack } from "./uxRegressionPack";
import { enableCardParticipantsDropdown } from "./cardParticipantsDropdown";
import { enableSportEventCardPolicy } from "./sportEventCardPolicy";
import { enableUnifiedEventPrimaryControls } from "./unifiedEventPrimaryControls";
import { OrganizerProfilePortal } from "./components/OrganizerProfilePortal";
import { OrganizerEventDetailsPortal } from "./components/OrganizerEventDetailsPortal";
import { EventLocationPickerPortal } from "./components/EventLocationPickerPortal";
import { EventLocationProviderPortal } from "./components/EventLocationProviderPortal";
import { MapProviderPickerPortal } from "./components/MapProviderPickerPortal";
import { ParticipantIdentityPortal } from "./components/ParticipantIdentityPortal";
import { DevPanel, shouldShowAdminDevPanel } from "./components/DevPanel";
import { AdminAccessDeniedPage, AdminLoginPage, AdminPanelPage } from "./admin/AdminLoginPage";
import { resolveAdminRoute } from "./admin/adminSession";
import { useAppStore } from "./store";
import "./styles.css";
import "./category-cards.css";
import "./activity-3d-icons.css";
import "./mobile-card-fixes.css";
import "./coach-panel.css";
import "./weather-ui-fixes.css";
import "./generic-sheet-fixes.css";
import "./compact-sport-card.css";
import "./compact-sport-card-final.css";
import "./all-event-card-template.css";
import "./unified-card-actions.css";
import "./card-share-action.css";
import "./glass-event-card.css";
import "./glass-event-card-polish.css";
import "./glass-event-card-borderless-v4.css";
import "./event-card-control-spacing-v7.css";
import "./event-card-control-v8.css";
import "./sport-organizer-card-labels.css";
import "./avatar-cropper.css";
import "./participant-notifications.css";
import "./profile-avatar-proportions.css";
import "./organizer-event-details.css";
import "./event-location-picker.css";
import "./event-location-provider.css";
import "./map-provider-picker.css";
import "./profile-preferences.css";
import "./participant-identity.css";
import "./profile-hub.css";
import "./mobile-ux-followup.css";
import "./event-main-block.css";
import "./sport-metadata-compact-location.css";
import "./ux-regression-pack.css";
import "./card-participants-dropdown.css";
import "./sport-event-card-policy.css";
import "./unified-event-primary-controls.css";

type SupportedLanguage = "ru" | "uk" | "cs" | "en";
type StoredPreferences = { language?: SupportedLanguage; cityId?: string; mapProvider?: "google" | "apple" | "mapy" };
type TelegramUserWithLanguage = { language_code?: string };

const supportedLanguages = new Set<SupportedLanguage>(["ru", "uk", "cs", "en"]);
const preferencesStorageKey = "go-irl-user-preferences";
const legacyLanguageStorageKey = "go-irl-language";

const normalizeDeviceLanguage = (value: string | undefined): SupportedLanguage | null => {
  const code = value?.trim().toLowerCase().split(/[-_]/)[0] as SupportedLanguage | undefined;
  return code && supportedLanguages.has(code) ? code : null;
};

const readStoredPreferences = (): StoredPreferences => {
  try {
    const parsed = JSON.parse(localStorage.getItem(preferencesStorageKey) || "null") as StoredPreferences | null;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const initializeLanguagePreference = () => {
  const preferences = readStoredPreferences();
  const storedUnifiedLanguage = preferences.language && supportedLanguages.has(preferences.language) ? preferences.language : null;
  const storedLegacyLanguage = normalizeDeviceLanguage(localStorage.getItem(legacyLanguageStorageKey) || undefined);
  const storedLanguage = storedUnifiedLanguage || storedLegacyLanguage;
  if (storedLanguage) {
    localStorage.setItem(legacyLanguageStorageKey, storedLanguage);
    if (preferences.language !== storedLanguage) localStorage.setItem(preferencesStorageKey, JSON.stringify({ ...preferences, language: storedLanguage }));
    return;
  }
  const telegramUser = window.Telegram?.WebApp?.initDataUnsafe?.user as TelegramUserWithLanguage | undefined;
  const telegramLanguage = normalizeDeviceLanguage(telegramUser?.language_code);
  const browserLanguage = navigator.languages.map((language) => normalizeDeviceLanguage(language)).find((language): language is SupportedLanguage => Boolean(language));
  const language = telegramLanguage || browserLanguage || "en";
  localStorage.setItem(legacyLanguageStorageKey, language);
  localStorage.setItem(preferencesStorageKey, JSON.stringify({ ...preferences, language }));
};

initializeLanguagePreference();
const App = lazy(() => import("./App"));
const queryClient = new QueryClient();
const adminRoute = resolveAdminRoute(window.location.pathname);

enableFullCreateTaxonomy();
enableParticipantJoinNotifications();
enableMapyRuntimeLinks();
enableUxRegressionPack();
enableCardParticipantsDropdown();
enableSportEventCardPolicy();
enableUnifiedEventPrimaryControls();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => { void navigator.serviceWorker.register("/service-worker.js").catch(() => undefined); });
}

const adminSurface = adminRoute === "login"
  ? <AdminLoginPage />
  : adminRoute === "denied"
    ? <AdminAccessDeniedPage />
    : adminRoute === "panel"
      ? <AdminPanelPage />
      : null;

function AdminDevPanel() {
  const userRole = useAppStore((state) => state.userRole);
  return shouldShowAdminDevPanel(userRole) ? <DevPanel /> : null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {adminSurface || (
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={<div className="app-shell-loading">GO IRL</div>}><App /></Suspense>
        <OrganizerProfilePortal />
        <OrganizerEventDetailsPortal />
        <EventLocationPickerPortal />
        <EventLocationProviderPortal />
        <MapProviderPickerPortal />
        <ParticipantIdentityPortal />
        <AdminDevPanel />
      </QueryClientProvider>
    )}
  </StrictMode>,
);

enableActivity3dIcons();
