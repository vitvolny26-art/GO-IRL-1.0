import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { enableAvatarCropper } from "./avatarCropper";
import { enableBottomNavSwipe } from "./bottom-nav-swipe";
import { enableCardTextCleanup } from "./cardText";
import { enableFullCreateTaxonomy } from "./fullCreateTaxonomy";
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
import "./avatar-cropper.css";

const App = lazy(() => import("./App"));
const queryClient = new QueryClient();

enableBottomNavSwipe();
enableCardTextCleanup();
enableFullCreateTaxonomy();
enableAvatarCropper();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="app-shell-loading">GO IRL</div>}>
        <App />
      </Suspense>
    </QueryClientProvider>
  </StrictMode>,
);
