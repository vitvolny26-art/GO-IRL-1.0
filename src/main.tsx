import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles.css";
import "./mobile-card-fixes.css";
import "./coach-panel.css";
import "./weather-ui-fixes.css";
import "./generic-sheet-fixes.css";
import { enableCardActionsEnhancer } from "./card-actions-enhancer";
import { enableBottomNavSwipe } from "./bottom-nav-swipe";

const App = lazy(() => import("./App"));
const queryClient = new QueryClient();

enableCardActionsEnhancer();
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
