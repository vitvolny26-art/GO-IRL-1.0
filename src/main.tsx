import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { enableBottomNavSwipe } from "./bottom-nav-swipe";
import "./styles.css";
import "./mobile-card-fixes.css";
import "./coach-panel.css";
import "./weather-ui-fixes.css";
import "./generic-sheet-fixes.css";
import "./sport-avatar-fixes.css";
import "./compact-sport-card.css";
import "./compact-sport-card-final.css";
import "./all-event-card-template.css";
import "./unified-card-actions.css";
import "./card-action-sheets.css";

const App = lazy(() => import("./App"));
const queryClient = new QueryClient();

enableBottomNavSwipe();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<div className="app-shell-loading">GO IRL</div>}>
        <App />
      </Suspense>
    </QueryClientProvider>
  </StrictMode>,
);
