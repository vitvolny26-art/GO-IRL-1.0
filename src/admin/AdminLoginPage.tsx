import { useEffect, useState } from "react";
import {
  adminRedirectForAuthorization,
  verifyCurrentAdminSession,
} from "./adminSession";
import "./admin-login.css";

export function AdminLoginPage() {
  useEffect(() => {
    let active = true;

    void (async () => {
      const authorized = await verifyCurrentAdminSession();
      if (active) window.location.replace(adminRedirectForAuthorization(authorized));
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
        <p>Проверяем Telegram-сессию…</p>
      </section>
    </main>
  );
}

export function AdminPanelPage() {
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const allowed = await verifyCurrentAdminSession();
      if (!active) return;
      if (!allowed) {
        window.location.replace("/admin/access-denied");
        return;
      }
      setAuthorized(true);
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="admin-login-shell">
      <section className="admin-login-card" aria-live="polite">
        <div className="admin-login-mark" aria-hidden="true">GO IRL</div>
        <h1>Admin panel</h1>
        {authorized ? (
          <>
            <p>Серверная авторизация подтверждена.</p>
            <div className="admin-login-status">Protected admin session active</div>
            <a href="/">Открыть GO IRL</a>
          </>
        ) : <p>Проверяем доступ…</p>}
      </section>
    </main>
  );
}

export function AdminAccessDeniedPage() {
  return (
    <main className="admin-login-shell">
      <section className="admin-login-card" aria-live="polite">
        <div className="admin-login-mark" aria-hidden="true">GO IRL</div>
        <h1>Admin</h1>
        <p>Access denied.</p>
        <a href="/">Вернуться в приложение</a>
      </section>
    </main>
  );
}
