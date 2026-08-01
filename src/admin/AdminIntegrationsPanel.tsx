declare const __GO_IRL_COMMIT__: string;
declare const __GO_IRL_BUILT_AT__: string;

type IntegrationState = "ready" | "checking" | "unavailable" | "not-connected";

type IntegrationItem = {
  name: string;
  detail: string;
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
  let count = 1; // Vercel build metadata is compiled into every release.
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
      detail: authorized ? "Trusted Telegram session verified for the current administrator." : "Telegram administrator session is not verified.",
      state: authorized ? "ready" : "unavailable",
      status: authorized ? "Connected" : "Unavailable",
    },
    {
      name: "Supabase",
      detail: rolesLoading ? "Checking protected role data…" : rolesError ? "Protected role data could not be loaded." : "Protected role data and Admin006 RPC are responding.",
      state: supabaseState,
      status: rolesLoading ? "Checking" : rolesError ? "Unavailable" : "Connected",
    },
    {
      name: "Vercel",
      detail: `Production build ${commit} · ${builtAt}`,
      state: "ready",
      status: "Deployed",
    },
    {
      name: "n8n",
      detail: "No read-only health endpoint is configured for the admin panel yet.",
      state: "not-connected",
      status: "Not connected",
    },
  ];

  return (
    <section className="admin-tab-panel admin-tab-stack">
      <section className="admin-login-card admin-integrations-summary">
        <div>
          <span className="admin-eyebrow">READ ONLY</span>
          <h2>Интеграции</h2>
          <p>Статусы строятся только из текущей защищённой сессии и публичных метаданных сборки. Секреты не отображаются.</p>
        </div>
        <strong>{countReadyIntegrations(authorized, rolesLoading, rolesError)}/4</strong>
      </section>

      <div className="admin-integration-list">
        {integrations.map((integration) => (
          <article className="admin-login-card admin-integration-row" key={integration.name}>
            <div>
              <strong>{integration.name}</strong>
              <p>{integration.detail}</p>
            </div>
            <span className={`admin-integration-status ${stateClass[integration.state]}`}>{integration.status}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
