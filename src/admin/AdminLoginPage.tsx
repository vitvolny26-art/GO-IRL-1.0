import { useEffect, useMemo, useState } from "react";
import { adminRedirectForAuthorization, verifyCurrentAdminSession } from "./adminSession";
import "./admin-login.css";

type AdminSection = "overview" | "users" | "roles" | "events" | "reports" | "health" | "flags";

type AdminModule = {
  id: AdminSection;
  task: string;
  title: string;
  description: string;
  status: "Ready" | "Read only" | "Planned";
};

const modules: AdminModule[] = [
  { id: "overview", task: "Admin104", title: "Dashboard", description: "Сводка защищённой административной области.", status: "Ready" },
  { id: "users", task: "Admin105", title: "Users", description: "Поиск и обзор пользовательских аккаунтов.", status: "Read only" },
  { id: "roles", task: "Admin106", title: "Roles", description: "Матрица ролей и разрешений без изменения auth/RLS.", status: "Read only" },
  { id: "events", task: "Admin107", title: "Events", description: "Очередь модерации мероприятий.", status: "Read only" },
  { id: "reports", task: "Admin108", title: "Reports", description: "Журнал административных отчётов и аудита.", status: "Read only" },
  { id: "health", task: "Admin109", title: "Runtime Health", description: "Состояние клиентских и серверных контуров.", status: "Ready" },
  { id: "flags", task: "Admin110", title: "Feature Flags", description: "Обзор флагов без записи production-конфигурации.", status: "Read only" },
];

const users = [
  { name: "Demo Organizer", role: "organizer", state: "active" },
  { name: "Demo Participant", role: "member", state: "active" },
  { name: "Moderation Queue", role: "moderator", state: "review" },
];

const events = [
  { title: "Morning Run", city: "Praha", state: "published" },
  { title: "Indoor Volleyball", city: "Brno", state: "review" },
  { title: "Weekend Hike", city: "Liberec", state: "draft" },
];

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
  const [section, setSection] = useState<AdminSection>("overview");
  const [query, setQuery] = useState("");

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

  const filteredUsers = useMemo(() => users.filter((user) => `${user.name} ${user.role} ${user.state}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const activeModule = modules.find((module) => module.id === section) ?? modules[0];

  if (!authorized) {
    return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin panel</h1><p>Проверяем доступ…</p></section></main>;
  }

  return (
    <main className="admin-dashboard-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><div className="admin-login-mark">GO IRL</div><strong>Admin OS</strong><span>Admin104–110</span></div>
        <nav aria-label="Admin modules">
          {modules.map((module) => <button key={module.id} type="button" className={section === module.id ? "is-active" : ""} onClick={() => setSection(module.id)}><span>{module.task}</span>{module.title}</button>)}
        </nav>
        <a href="/">Открыть приложение</a>
      </aside>

      <section className="admin-workspace">
        <header className="admin-dashboard-header">
          <div><span className="admin-dashboard-eyebrow">{activeModule.task}</span><h1>{activeModule.title}</h1><p>{activeModule.description}</p></div>
          <div className="admin-session-pill">Protected session</div>
        </header>

        {section === "overview" && <section className="admin-dashboard-grid">{modules.slice(1).map((module) => <button type="button" className="admin-dashboard-card" key={module.id} onClick={() => setSection(module.id)}><span className="admin-dashboard-eyebrow">{module.task}</span><h2>{module.title}</h2><p>{module.description}</p><span className="admin-dashboard-state">{module.status}</span></button>)}</section>}

        {section === "users" && <section className="admin-panel-card"><div className="admin-toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск пользователей" aria-label="Поиск пользователей"/><span>{filteredUsers.length} records</span></div><div className="admin-table">{filteredUsers.map((user) => <div className="admin-table-row" key={user.name}><strong>{user.name}</strong><span>{user.role}</span><span>{user.state}</span></div>)}</div></section>}

        {section === "roles" && <section className="admin-panel-card"><div className="admin-notice">Read-only: изменения auth, RLS и production permissions требуют отдельного approval.</div><div className="admin-matrix"><div><strong>super_admin</strong><span>Full administrative scope</span></div><div><strong>moderator</strong><span>Events and reports review</span></div><div><strong>organizer</strong><span>Own events management</span></div><div><strong>member</strong><span>Application access</span></div></div></section>}

        {section === "events" && <section className="admin-panel-card"><div className="admin-table">{events.map((event) => <div className="admin-table-row" key={event.title}><strong>{event.title}</strong><span>{event.city}</span><span>{event.state}</span></div>)}</div></section>}

        {section === "reports" && <section className="admin-panel-card"><div className="admin-empty"><strong>Audit stream prepared</strong><p>Источник административных событий ещё не подключён. UI-контракт готов к API integration.</p></div></section>}

        {section === "health" && <section className="admin-dashboard-grid"><article className="admin-dashboard-card"><span className="admin-dashboard-eyebrow">Session API</span><h2>Healthy</h2><p>Текущая серверная авторизация подтверждена.</p><span className="admin-dashboard-state">Online</span></article><article className="admin-dashboard-card"><span className="admin-dashboard-eyebrow">Client</span><h2>Loaded</h2><p>Admin workspace отрисован без DevPanel.</p><span className="admin-dashboard-state">Ready</span></article><article className="admin-dashboard-card"><span className="admin-dashboard-eyebrow">Data APIs</span><h2>Not connected</h2><p>Users, events и audit остаются read-only fixtures.</p><span className="admin-dashboard-state">Partial</span></article></section>}

        {section === "flags" && <section className="admin-panel-card"><div className="admin-notice">Read-only: production configuration не изменяется.</div><div className="admin-flag-list"><label><span><strong>admin_dashboard</strong><small>Admin104 shell</small></span><input type="checkbox" checked readOnly/></label><label><span><strong>admin_read_models</strong><small>Admin105–108 fixtures</small></span><input type="checkbox" checked readOnly/></label><label><span><strong>admin_mutations</strong><small>Requires backend approval</small></span><input type="checkbox" readOnly/></label></div></section>}
      </section>
    </main>
  );
}

export function AdminAccessDeniedPage() {
  return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin</h1><p>Access denied.</p><a href="/">Вернуться в приложение</a></section></main>;
}
