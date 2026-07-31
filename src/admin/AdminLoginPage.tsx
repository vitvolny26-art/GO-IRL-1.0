import { useEffect, useState, type FormEvent } from "react";
import { DevPanel } from "../components/DevPanel";
import { adminRedirectForAuthorization, verifyCurrentAdminSession } from "./adminSession";
import {
  buildRoleInvitationUrl,
  requestRoleInvitation,
  type CreatedRoleInvitation,
  type RoleInvitationTargetRole,
} from "./roleInvitations";
import "./admin-login.css";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "");

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
  const [targetRole, setTargetRole] = useState<RoleInvitationTargetRole>("organizer");
  const [invitation, setInvitation] = useState<(CreatedRoleInvitation & { url: string }) | null>(null);
  const [invitationError, setInvitationError] = useState("");
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const createInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingInvitation(true);
    setInvitation(null);
    setInvitationError("");
    setCopied(false);

    try {
      const created = await requestRoleInvitation(targetRole);
      const url = buildRoleInvitationUrl(created.startParam, telegramBotUsername, telegramAppName);
      if (!url) throw new Error("role_invitation_link_failed");
      setInvitation({ ...created, url });
    } catch {
      setInvitationError("Не удалось создать приглашение. Проверьте Telegram-сессию и повторите попытку.");
    } finally {
      setCreatingInvitation(false);
    }
  };

  const copyInvitation = async () => {
    if (!invitation) return;
    try {
      await navigator.clipboard.writeText(invitation.url);
      setCopied(true);
    } catch {
      setInvitationError("Не удалось скопировать ссылку. Скопируйте её вручную.");
    }
  };

  return <main className="admin-login-shell admin-panel-shell">
    {authorized ? <DevPanel /> : null}
    <section className="admin-login-card" aria-live="polite">
      <div className="admin-login-mark" aria-hidden="true">GO IRL</div>
      <h1>Admin panel</h1>
      {authorized ? <>
        <p>Серверная авторизация подтверждена.</p>
        <div className="admin-login-status">Protected admin session active</div>
        <a href="/">Открыть GO IRL</a>
      </> : <p>Проверяем доступ…</p>}
    </section>
    {authorized ? <section className="admin-login-card admin-role-invitations" aria-labelledby="role-invitation-title">
      <div className="admin-login-mark">ADMIN005</div>
      <h2 id="role-invitation-title">Приглашение роли</h2>
      <p>Одноразовая ссылка действует 24 часа. Роль получит первый Telegram-аккаунт, который её откроет.</p>
      <form onSubmit={createInvitation}>
        <label htmlFor="role-invitation-target">Кого приглашаем</label>
        <select
          id="role-invitation-target"
          value={targetRole}
          onChange={(event) => setTargetRole(event.target.value as RoleInvitationTargetRole)}
          disabled={creatingInvitation}
        >
          <option value="organizer">Организатор</option>
          <option value="professional">Мастер</option>
        </select>
        <button type="submit" disabled={creatingInvitation}>
          {creatingInvitation ? "Создаём…" : "Сформировать приглашение"}
        </button>
      </form>
      {invitation ? <div className="admin-role-invitation-result" aria-live="polite">
        <strong>{invitation.targetRole === "professional" ? "Мастер" : "Организатор"}</strong>
        <span>Действует до {new Date(invitation.expiresAt).toLocaleString("ru-RU")}</span>
        <input aria-label="Ссылка приглашения" readOnly value={invitation.url} />
        <button type="button" onClick={() => void copyInvitation()}>{copied ? "Скопировано" : "Скопировать ссылку"}</button>
      </div> : null}
      {invitationError ? <div className="admin-role-invitation-error" role="alert">{invitationError}</div> : null}
    </section> : null}
  </main>;
}

export function AdminAccessDeniedPage() {
  return <main className="admin-login-shell"><section className="admin-login-card" aria-live="polite"><div className="admin-login-mark" aria-hidden="true">GO IRL</div><h1>Admin</h1><p>Access denied.</p><a href="/">Вернуться в приложение</a></section></main>;
}
