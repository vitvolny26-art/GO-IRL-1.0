import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { enableFullCreateTaxonomy } from "./fullCreateTaxonomy";
import { enableParticipantJoinNotifications } from "./participantNotifications";
import { OrganizerProfilePortal } from "./components/OrganizerProfilePortal";
import "./styles.css";
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

const App = lazy(() => import("./App"));
const queryClient = new QueryClient();

enableFullCreateTaxonomy();
enableParticipantJoinNotifications();

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="app-shell-loading">GO IRL</div>}>
        <App />
      </Suspense>
      <OrganizerProfilePortal />
    </QueryClientProvider>
  </StrictMode>,
);
