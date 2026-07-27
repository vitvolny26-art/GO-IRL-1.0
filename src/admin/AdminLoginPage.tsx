import { useEffect, useState } from "react";
import { adminRedirectForAuthorization, verifyCurrentAdminSession } from "./adminSession";
import "./admin-login.css";

export function AdminLoginPage() {
  useEffect(() => {
    let active = true;
    void (async () => {
      const authorized = await verifyCurrentAdminSession();
      if (active) window.location.replace(adminRedirectForAuthorization(authorized));
    })();
    return () => { active = false; };
  }, []);

  return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin</h1><p>Проверяем Telegram-сессию…</p></section></main>;
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
    return () => { active = false; };
  }, []);

  const refreshAuthorization = () => {
    window.location.assign("/admin/login");
  };

  if (!authorized) {
    return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin panel</h1><p>Проверяем доступ…</p></section></main>;
  }

  return (
    <main className="admin-dashboard-shell">
      <header className="admin-dashboard-header">
        <div>
          <div className="admin-login-mark" aria-hidden="true">GO IRL</div>
          <h1>Admin panel</h1>
          <p>Защищённая рабочая область администратора.</p>
        </div>
        <a className="admin-dashboard-link" href="/">Открыть приложение</a>
      </header>

      <section className="admin-dashboard-grid" aria-label="Состояние админ-панели">
        <article className="admin-dashboard-card admin-dashboard-card-accent">
          <span className="admin-dashboard-eyebrow">Authorization</span>
          <h2>Доступ подтверждён</h2>
          <p>Серверная проверка Telegram-сессии завершена успешно.</p>
          <div className="admin-login-status">Protected admin session active</div>
        </article>

        <article className="admin-dashboard-card">
          <span className="admin-dashboard-eyebrow">Users</span>
          <h2>Пользователи</h2>
          <p>Управление пользователями и ролями будет подключено отдельным защищённым модулем.</p>
          <span className="admin-dashboard-state">Not connected</span>
        </article>

        <article className="admin-dashboard-card">
          <span className="admin-dashboard-eyebrow">Events</span>
          <h2>Мероприятия</h2>
          <p>Модерация мероприятий будет добавлена без прямого доступа к production data из клиента.</p>
          <span className="admin-dashboard-state">Not connected</span>
        </article>

        <article className="admin-dashboard-card">
          <span className="admin-dashboard-eyebrow">Session</span>
          <h2>Проверка доступа</h2>
          <p>Повторно запустите серверную авторизацию после смены Telegram-сессии.</p>
          <button type="button" className="admin-dashboard-button" onClick={refreshAuthorization}>Проверить снова</button>
        </article>
      </section>
    </main>
  );
}

export function AdminAccessDeniedPage() {
  return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin</h1><p>Access denied.</p><a href="/">Вернуться в приложение</a></section></main>;
}
