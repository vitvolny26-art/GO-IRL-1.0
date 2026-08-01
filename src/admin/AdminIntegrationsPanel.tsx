declare const __GO_IRL_COMMIT__: string;
declare const __GO_IRL_BUILT_AT__: string;

type IntegrationState = "ready" | "checking" | "unavailable" | "not-connected";

type IntegrationItem = {
  name: string;
  detail: string;
  meta: string;
  state: IntegrationState;
  status: string;
};

const stateClass: Record<IntegrationState, string> = {
  ready: "is-ready",
  checking: "is-checking",
  unavailable: "is-unavailable",
  "not-connected": "is-neutral",
};

export const countReadyIntegrations = (authorized: boolean, rolesLoading: boolean, rolesError: string) => {
  let count = 1;
  if (authorized) count += 1;
  if (!rolesLoading && !rolesError) count += 1;
  return count;
};

export function AdminIntegrationsPanel({
  authorized,
  rolesLoading,
  rolesError,
}: {
  authorized: boolean;
  rolesLoading: boolean;
  rolesError: string;
}) {
  const commit = typeof __GO_IRL_COMMIT__ === "string" ? __GO_IRL_COMMIT__ : "unknown";
  const builtAt = typeof __GO_IRL_BUILT_AT__ === "string" ? __GO_IRL_BUILT_AT__ : "unknown";
  const supabaseState: IntegrationState = rolesLoading ? "checking" : rolesError ? "unavailable" : "ready";

  const integrations: IntegrationItem[] = [
    {
      name: "Telegram",
      detail: authorized ? "Защищённая Telegram-сессия текущего администратора подтверждена." : "Telegram-сессия администратора не подтверждена.",
      meta: "Авторизация через проверенный initData и серверную JWT-сессию",
      state: authorized ? "ready" : "unavailable",
      status: authorized ? "Подключено" : "Недоступно",
    },
    {
      name: "Supabase",
      detail: rolesLoading ? "Проверяем защищённые данные ролей…" : rolesError ? "Защищённые данные ролей загрузить не удалось." : "Защищённые данные ролей и Admin006 RPC отвечают.",
      meta: rolesError || "Прямой клиентский доступ к user_roles не используется",
      state: supabaseState,
      status: rolesLoading ? "Проверка" : rolesError ? "Недоступно" : "Подключено",
    },
    {
      name: "Vercel",
      detail: commit === "unknown" ? "Метаданные production-сборки недоступны." : `Production build ${commit}`,
      meta: builtAt === "unknown" ? "Время сборки неизвестно" : `Собрано: ${builtAt}`,
      state: commit === "unknown" ? "unavailable" : "ready",
      status: commit === "unknown" ? "Недоступно" : "Развёрнуто",
    },
    {
      name: "n8n",
      detail: "Read-only health endpoint для админ-панели ещё не настроен.",
      meta: "Управление workflow из приложения отключено",
      state: "not-connected",
      status: "Не подключено",
    },
  ];

  return (
    <section className="admin-tab-panel admin-tab-stack">
      <section className="admin-login-card admin-integrations-summary">
        <div>
          <span className="admin-eyebrow">READ ONLY</span>
          <h2>Интеграции</h2>
          <p>Статусы строятся только из текущей защищённой сессии и метаданных сборки. Секреты не отображаются.</p>
        </div>
        <strong>{countReadyIntegrations(authorized, rolesLoading, rolesError)}/4</strong>
      </section>

      <div className="admin-integration-list">
        {integrations.map((integration) => (
          <article className="admin-login-card admin-integration-row" key={integration.name}>
            <div className="admin-integration-copy">
              <div className="admin-integration-title">
                <strong>{integration.name}</strong>
                <span className={`admin-integration-status ${stateClass[integration.state]}`}>{integration.status}</span>
              </div>
              <p>{integration.detail}</p>
              <small>{integration.meta}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
