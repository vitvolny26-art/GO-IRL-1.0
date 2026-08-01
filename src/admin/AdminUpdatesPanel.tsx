declare const __GO_IRL_COMMIT__: string;
declare const __GO_IRL_BUILT_AT__: string;

type UpdateState = "ready" | "unavailable" | "not-connected";

export type AdminUpdateItem = {
  name: string;
  detail: string;
  meta: string;
  state: UpdateState;
  status: string;
};

const stateClass: Record<UpdateState, string> = {
  ready: "is-ready",
  unavailable: "is-unavailable",
  "not-connected": "is-neutral",
};

const normalizeBuildValue = (value: string) => value.trim() || "unknown";

export const countReadyUpdateSources = (commit: string) =>
  normalizeBuildValue(commit) === "unknown" ? 0 : 1;

export const buildAdminUpdateItems = (commitValue: string, builtAtValue: string): AdminUpdateItem[] => {
  const commit = normalizeBuildValue(commitValue);
  const builtAt = normalizeBuildValue(builtAtValue);
  const hasBuildMetadata = commit !== "unknown";

  return [
    {
      name: "Клиентская сборка",
      detail: hasBuildMetadata ? `Текущая production-сборка: ${commit.slice(0, 7)}.` : "Метаданные текущей production-сборки недоступны.",
      meta: hasBuildMetadata
        ? `${commit}${builtAt === "unknown" ? "" : ` · собрано ${builtAt}`}`
        : "Build SHA не встроен в клиент",
      state: hasBuildMetadata ? "ready" : "unavailable",
      status: hasBuildMetadata ? "Развёрнуто" : "Недоступно",
    },
    {
      name: "Edge Functions",
      detail: "Защищённый read-only реестр версий Edge Functions ещё не подключён.",
      meta: "Обновление функций из браузера отключено",
      state: "not-connected",
      status: "Не подключено",
    },
    {
      name: "Миграции",
      detail: "Безопасный read-only журнал применённых миграций ещё не подключён.",
      meta: "Применение SQL и миграций из браузера отключено",
      state: "not-connected",
      status: "Не подключено",
    },
    {
      name: "Release reports",
      detail: "Лента подтверждённых release reports из GitHub и Google Drive ещё не подключена.",
      meta: "GitHub остаётся source of truth; Drive — export mirror",
      state: "not-connected",
      status: "Не подключено",
    },
  ];
};

const getCurrentBuildMetadata = () => ({
  commit: typeof __GO_IRL_COMMIT__ === "string" ? __GO_IRL_COMMIT__ : "unknown",
  builtAt: typeof __GO_IRL_BUILT_AT__ === "string" ? __GO_IRL_BUILT_AT__ : "unknown",
});

export const getCurrentAdminUpdateSummary = () => {
  const { commit } = getCurrentBuildMetadata();
  return { ready: countReadyUpdateSources(commit), total: 4 };
};

export function AdminUpdatesPanel() {
  const { commit, builtAt } = getCurrentBuildMetadata();
  const updates = buildAdminUpdateItems(commit, builtAt);
  const readyCount = countReadyUpdateSources(commit);

  return (
    <section className="admin-tab-panel admin-tab-stack">
      <section className="admin-login-card admin-integrations-summary">
        <div>
          <span className="admin-eyebrow">READ ONLY</span>
          <h2>Обновления</h2>
          <p>Панель показывает только подтверждённые метаданные текущей сборки и честные состояния неподключённых реестров.</p>
        </div>
        <strong>{readyCount}/4</strong>
      </section>

      <section className="admin-login-card admin-role-invitations">
        <h2>Безопасный режим</h2>
        <p>Деплой, rollback, обновление Edge Functions, secrets и применение миграций из админ-панели недоступны.</p>
      </section>

      <div className="admin-integration-list">
        {updates.map((update) => (
          <article className="admin-login-card admin-integration-row" key={update.name}>
            <div className="admin-integration-copy">
              <div className="admin-integration-title">
                <strong>{update.name}</strong>
                <span className={`admin-integration-status ${stateClass[update.state]}`}>{update.status}</span>
              </div>
              <p>{update.detail}</p>
              <small>{update.meta}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
