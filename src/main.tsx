import { lazy, StrictMode, Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { enableFullCreateTaxonomy } from "./fullCreateTaxonomy";
import { enableParticipantJoinNotifications } from "./participantNotifications";
import { enableMapyRuntimeLinks } from "./mapyRuntimeLinks";
import { OrganizerProfilePortal } from "./components/OrganizerProfilePortal";
import { OrganizerEventDetailsPortal } from "./components/OrganizerEventDetailsPortal";
import { EventLocationPickerPortal } from "./components/EventLocationPickerPortal";
import {
  getCurrentAuthSession,
  startMetaProviderAuth,
  startWhatsAppAuth,
  verifyWhatsAppAuth,
} from "./authSession";
import { getTelegramInitData } from "./telegram";
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
import "./organizer-event-details.css";
import "./event-location-picker.css";

const App = lazy(() => import("./App"));
const queryClient = new QueryClient();

function BrowserAuthEntry() {
  const [authenticated, setAuthenticated] = useState(() => Boolean(getCurrentAuthSession()));
  const [whatsAppOpen, setWhatsAppOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const changed = () => setAuthenticated(Boolean(getCurrentAuthSession()));
    window.addEventListener("go-irl-auth-changed", changed);
    return () => window.removeEventListener("go-irl-auth-changed", changed);
  }, []);

  if (getTelegramInitData() || authenticated) return null;

  const panelStyle = {
    position: "fixed", right: 12, bottom: 76, zIndex: 10000, width: "min(360px, calc(100vw - 24px))",
    padding: 14, borderRadius: 18, background: "rgba(20,22,20,.96)", border: "1px solid rgba(255,255,255,.14)",
    boxShadow: "0 18px 50px rgba(0,0,0,.42)", color: "white", fontFamily: "inherit",
  } as const;
  const buttonStyle = {
    width: "100%", minHeight: 42, border: 0, borderRadius: 12, marginTop: 8, padding: "0 12px",
    font: "inherit", fontWeight: 800, cursor: "pointer",
  } as const;
  const inputStyle = {
    width: "100%", minHeight: 42, boxSizing: "border-box", borderRadius: 12, marginTop: 8,
    padding: "0 12px", border: "1px solid rgba(255,255,255,.18)", background: "#121412", color: "white", font: "inherit",
  } as const;

  const sendCode = async () => {
    setBusy(true); setError("");
    try { await startWhatsAppAuth(phone); setCodeSent(true); }
    catch (next) { setError(next instanceof Error ? next.message : "whatsapp_auth_failed"); }
    finally { setBusy(false); }
  };
  const verifyCode = async () => {
    setBusy(true); setError("");
    try { await verifyWhatsAppAuth(phone, code); window.location.reload(); }
    catch (next) { setError(next instanceof Error ? next.message : "whatsapp_auth_failed"); }
    finally { setBusy(false); }
  };

  return (
    <aside style={panelStyle} aria-label="GO IRL sign in">
      <strong style={{ display: "block", fontSize: 16 }}>Войти в GO IRL</strong>
      <span style={{ display: "block", marginTop: 4, color: "#b7bdc6", fontSize: 12, lineHeight: 1.4 }}>
        Один аккаунт для браузера и мессенджеров. Мы не объединяем профили только по имени или email.
      </span>
      <button style={{ ...buttonStyle, background: "#1877f2", color: "white" }} type="button" onClick={() => startMetaProviderAuth("facebook")}>Facebook</button>
      <button style={{ ...buttonStyle, background: "#f3f3f3", color: "#111" }} type="button" onClick={() => startMetaProviderAuth("instagram")}>Instagram</button>
      <button style={{ ...buttonStyle, background: "#25d366", color: "#07140b" }} type="button" onClick={() => { setWhatsAppOpen((value) => !value); setError(""); }}>WhatsApp</button>
      {whatsAppOpen ? (
        <div>
          <input style={inputStyle} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+420…" inputMode="tel" aria-label="WhatsApp phone" />
          {codeSent ? <input style={inputStyle} value={code} onChange={(event) => setCode(event.target.value)} placeholder="6-значный код" inputMode="numeric" maxLength={6} aria-label="WhatsApp code" /> : null}
          <button style={{ ...buttonStyle, background: "#d8ff4f", color: "#111" }} type="button" disabled={busy || !phone.trim()} onClick={codeSent ? verifyCode : sendCode}>
            {busy ? "…" : codeSent ? "Подтвердить код" : "Получить код в WhatsApp"}
          </button>
        </div>
      ) : null}
      {error ? <small style={{ display: "block", marginTop: 8, color: "#ff9b9b" }}>{error}</small> : null}
    </aside>
  );
}

enableFullCreateTaxonomy();
enableParticipantJoinNotifications();
enableMapyRuntimeLinks();

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
      <BrowserAuthEntry />
      <OrganizerProfilePortal />
      <OrganizerEventDetailsPortal />
      <EventLocationPickerPortal />
    </QueryClientProvider>
  </StrictMode>,
);
