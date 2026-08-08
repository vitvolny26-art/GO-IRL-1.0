import { useState } from "react";
import {
  requestInstagramPublisherReadiness,
  type InstagramPublisherReadinessResult,
} from "./instagramPublisherReadiness";

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

const instagramFailureCopy: Record<
  Exclude<InstagramPublisherReadinessResult, { ok: true }>["error"],
  string
> = {
  trusted_session_required: "Нет активной защищённой Telegram admin-сессии.",
  access_denied: "Текущая сессия не прошла admin-проверку.",
  publisher_unavailable: "Publisher readiness не подтверждён сервером.",
  invalid_readiness_response: "Сервер вернул некорректный readiness-ответ.",
  network_unavailable: "Readiness endpoint сейчас недоступен по сети.",
  unexpected_status: "Readiness endpoint вернул неожиданный статус.",
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
  const [instagramChecking, setInstagramChecking] = useState(false);
  const [instagramReadiness, setInstagramReadiness] = useState<InstagramPublisherReadinessResult | null>(null);
  const commit = typeof __GO_IRL_COMMIT__ === "string" ? __GO_IRL_COMMIT__ : "unknown";
  const builtAt = typeof __GO_IRL_BUILT_AT__ === "string" ? __GO_IRL_BUILT_AT__ : "unknown";
  const supabaseState: IntegrationState = rolesLoading ? "checking" : rolesError ? "unavailable" : "ready";

  const checkInstagramPublisher = async () => {
    setInstagramChecking(true);
    try {
      setInstagramReadiness(await requestInstagramPublisherReadiness());
    } finally {
      setInstagramChecking(false);
    }
  };

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

  const instagramState: IntegrationState = instagramChecking
    ? "checking"
    : instagramReadiness?.ok
      ? "ready"
      : instagramReadiness
        ? "unavailable"
        : "not-connected";
  const instagramStatus = instagramChecking
    ? "Проверка"
    : instagramReadiness?.ok
      ? "Аккаунт подтверждён"
      : instagramReadiness
        ? "Недоступно"
        : "Не проверено";

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

      <article className="admin-login-card admin-integration-row admin-instagram-readiness">
        <div className="admin-integration-copy">
          <div className="admin-integration-title">
            <strong>Instagram publisher</strong>
            <span className={`admin-integration-status ${stateClass[instagramState]}`}>{instagramStatus}</span>
          </div>
          {instagramReadiness?.ok ? (
            <>
              <p>@{instagramReadiness.username} · account {instagramReadiness.accountId}</p>
              <small>Account binding подтверждён. {instagramReadiness.requiredPermission}: {instagramReadiness.permissionStatus}.</small>
            </>
          ) : (
            <>
              <p>{instagramReadiness ? instagramFailureCopy[instagramReadiness.error] : "Проверяет runtime credential и привязку аккаунта без публикации поста."}</p>
              <small>Токены и provider body не выводятся в интерфейс.</small>
            </>
          )}
          <button
            className="admin-integration-action"
            type="button"
            onClick={() => void checkInstagramPublisher()}
            disabled={!authorized || instagramChecking}
          >
            {instagramChecking ? "Проверяем…" : "Проверить publisher"}
          </button>
        </div>
      </article>
    </section>
  );
}
