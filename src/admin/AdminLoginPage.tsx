import { useEffect, useState } from "react";
import { adminRedirectForAuthorization, verifyCurrentAdminSession } from "./adminSession";
import "./admin-login.css";

export type AdminSection = "overview" | "users" | "roles" | "events" | "reports" | "health" | "flags";

type AdminModule = {
  id: AdminSection;
  task: string;
  title: string;
  description: string;
  status: "Доступно" | "Не подключено";
};

export const adminModules: readonly AdminModule[] = [
  { id: "overview", task: "Admin104", title: "Обзор", description: "Сводка защищённой административной области.", status: "Доступно" },
  { id: "users", task: "Admin105", title: "Пользователи", description: "Поиск и обзор аккаунтов после подключения серверной read model.", status: "Не подключено" },
  { id: "roles", task: "Admin106", title: "Роли", description: "Документированные границы ролей без изменения auth или RLS.", status: "Доступно" },
  { id: "events", task: "Admin107", title: "События", description: "Очередь модерации после подключения защищённого API.", status: "Не подключено" },
  { id: "reports", task: "Admin108", title: "Аудит", description: "Административные события после подключения audit read model.", status: "Не подключено" },
  { id: "health", task: "Admin109", title: "Состояние", description: "Проверяемые свойства текущей admin-сессии и UI.", status: "Доступно" },
  { id: "flags", task: "Admin110", title: "Флаги", description: "Статус интеграции без чтения или записи production-конфигурации.", status: "Доступно" },
];

export const adminRoleMatrix = [
  { role: "admin", capability: "Управление platform-настройками и действиями высокого риска." },
  { role: "moderator", capability: "Проверка жалоб, небезопасных событий и moderation holds." },
  { role: "organizer", capability: "Управление собственными событиями и заявками участников." },
  { role: "user", capability: "Обычное участие в приложении без admin-доступа." },
] as const;

const adminSectionIds = new Set<AdminSection>(adminModules.map((module) => module.id));

export const adminSectionForPath = (pathname: string): AdminSection => {
  const section = pathname.replace(/\/+$/, "").split("/")[2] as AdminSection | undefined;
  return section && adminSectionIds.has(section) ? section : "overview";
};

export const adminPathForSection = (section: AdminSection) => (
  section === "overview" ? "/admin" : `/admin/${section}`
);

type UnavailablePanelProps = {
  task: string;
  title: string;
  description: string;
};

function UnavailablePanel({ task, title, description }: UnavailablePanelProps) {
  return (
    <section className="admin-panel-card">
      <div className="admin-empty">
        <span className="admin-dashboard-eyebrow">{task} · Not connected</span>
        <h2>{title}</h2>
        <p>{description}</p>
        <p>Данные не запрашиваются и фиктивные production-записи не показываются.</p>
      </div>
    </section>
  );
}

const integrationStates = [
  { name: "admin_shell", description: "Защищённый frontend shell присутствует в текущей сборке.", state: "Доступно" },
  { name: "admin_read_models", description: "Users, events и audit API не подключены.", state: "Не подключено" },
  { name: "admin_mutations", description: "Изменяющие операции не реализованы и не разрешены.", state: "Выключено" },
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
  const [section, setSection] = useState<AdminSection>(() => adminSectionForPath(window.location.pathname));

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

  useEffect(() => {
    const handlePopState = () => setSection(adminSectionForPath(window.location.pathname));
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openSection = (nextSection: AdminSection) => {
    const nextPath = adminPathForSection(nextSection);
    if (window.location.pathname !== nextPath) window.history.pushState({}, "", nextPath);
    setSection(nextSection);
  };

  const activeModule = adminModules.find((module) => module.id === section) ?? adminModules[0];

  if (!authorized) {
    return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin panel</h1><p>Проверяем доступ…</p></section></main>;
  }

  return (
    <main className="admin-dashboard-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-login-mark">GO IRL</div>
          <strong>Admin OS</strong>
          <span>Admin104–110 · read only</span>
        </div>
        <nav aria-label="Разделы админ-панели">
          {adminModules.map((module) => (
            <button
              key={module.id}
              type="button"
              className={section === module.id ? "is-active" : ""}
              aria-current={section === module.id ? "page" : undefined}
              onClick={() => openSection(module.id)}
            >
              <span>{module.task}</span>
              <strong>{module.title}</strong>
              <small>{module.status}</small>
            </button>
          ))}
        </nav>
        <a href="/">Открыть приложение</a>
      </aside>

      <section className="admin-workspace">
        <header className="admin-dashboard-header">
          <div><span className="admin-dashboard-eyebrow">{activeModule.task}</span><h1>{activeModule.title}</h1><p>{activeModule.description}</p></div>
          <div className="admin-session-pill">Protected session</div>
        </header>

        {section === "overview" && (
          <section className="admin-dashboard-grid">
            {adminModules.slice(1).map((module) => (
              <button type="button" className="admin-dashboard-card" key={module.id} onClick={() => openSection(module.id)}>
                <span className="admin-dashboard-eyebrow">{module.task}</span>
                <h2>{module.title}</h2>
                <p>{module.description}</p>
                <span className="admin-dashboard-state">{module.status}</span>
              </button>
            ))}
          </section>
        )}

        {section === "users" && (
          <UnavailablePanel task="Admin105" title="Пользовательские данные не подключены" description="Требуется отдельная server-side read model с минимальным набором полей и admin authorization." />
        )}

        {section === "roles" && (
          <section className="admin-panel-card">
            <div className="admin-notice">Документированная read-only матрица. Текущие роли пользователей здесь не читаются и не изменяются.</div>
            <div className="admin-matrix">
              {adminRoleMatrix.map((entry) => <div key={entry.role}><strong>{entry.role}</strong><span>{entry.capability}</span></div>)}
            </div>
          </section>
        )}

        {section === "events" && (
          <UnavailablePanel task="Admin107" title="Очередь событий не подключена" description="Нужен отдельный защищённый endpoint с ограниченным moderation projection." />
        )}

        {section === "reports" && (
          <UnavailablePanel task="Admin108" title="Audit read model не подключена" description="Raw initData, bearer tokens и полные JWT не должны попадать в этот интерфейс." />
        )}

        {section === "health" && (
          <section className="admin-dashboard-grid">
            <article className="admin-dashboard-card">
              <span className="admin-dashboard-eyebrow">Session API</span>
              <h2>Authorized</h2>
              <p>Серверная проверка текущей admin-сессии успешно завершена.</p>
              <span className="admin-dashboard-state">Protected</span>
            </article>
            <article className="admin-dashboard-card">
              <span className="admin-dashboard-eyebrow">Client shell</span>
              <h2>Loaded</h2>
              <p>Admin workspace отрисован после проверки доступа.</p>
              <span className="admin-dashboard-state">Ready</span>
            </article>
            <article className="admin-dashboard-card">
              <span className="admin-dashboard-eyebrow">Data APIs</span>
              <h2>Not connected</h2>
              <p>Users, events и audit endpoints не заявлены как доступные.</p>
              <span className="admin-dashboard-state">No data</span>
            </article>
          </section>
        )}

        {section === "flags" && (
          <section className="admin-panel-card">
            <div className="admin-notice">Это статус интеграции, а не значения production feature flags. Конфигурация не читается и не изменяется.</div>
            <div className="admin-flag-list">
              {integrationStates.map((item) => (
                <div key={item.name}>
                  <span><strong>{item.name}</strong><small>{item.description}</small></span>
                  <b>{item.state}</b>
                </div>
              ))}
            </div>
          </section>
        )}
      </section>
    </main>
  );
}

export function AdminAccessDeniedPage() {
  return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin</h1><p>Access denied.</p><a href="/">Вернуться в приложение</a></section></main>;
}
