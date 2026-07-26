import { useEffect, useState } from "react";
import { getCurrentAuthSession, initializeTrustedAuth } from "../authSession";
import "./admin-login.css";

type AdminLoginState = "loading" | "authorized" | "denied";

export function AdminLoginPage() {
  const [state, setState] = useState<AdminLoginState>("loading");

  useEffect(() => {
    let active = true;

    void (async () => {
      const identity = await initializeTrustedAuth();
      const session = identity && "source" in identity && identity.source === "trusted-telegram"
        ? identity
        : getCurrentAuthSession();

      if (!session?.accessToken) {
        if (active) setState("denied");
        return;
      }

      try {
        const response = await fetch("/api/admin/session", {
          method: "POST",
          headers: {
            authorization: `Bearer ${session.accessToken}`,
          },
        });
        if (active) setState(response.ok ? "authorized" : "denied");
      } catch {
        if (active) setState("denied");
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card" aria-live="polite">
        <div className="admin-login-mark" aria-hidden="true">GO IRL</div>
        <h1>Admin</h1>
        {state === "loading" ? <p>Проверяем Telegram-сессию…</p> : null}
        {state === "authorized" ? (
          <>
            <p>Доступ подтверждён.</p>
            <a href="/">Открыть GO IRL</a>
          </>
        ) : null}
        {state === "denied" ? (
          <>
            <p>Access denied.</p>
            <a href="/">Вернуться в приложение</a>
          </>
        ) : null}
      </section>
    </main>
  );
}
