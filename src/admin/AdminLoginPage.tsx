import { useEffect, useState, type FormEvent } from "react";
import { DevPanel } from "../components/DevPanel";
import { adminRedirectForAuthorization, verifyCurrentAdminSession } from "./adminSession";
import {
  buildRoleInvitationUrl,
  requestRoleAssignments,
  requestRoleDemotion,
  requestRoleInvitation,
  type CreatedRoleInvitation,
  type RoleAssignment,
  type RoleInvitationTargetRole,
} from "./roleInvitations";
import "./admin-login.css";

const telegramBotUsername = String(import.meta.env.VITE_GO_IRL_BOT_USERNAME || "GOirl_bot");
const telegramAppName = String(import.meta.env.VITE_GO_IRL_APP_NAME || "");
const roleLabels: Record<string, string> = {
  organizer: "Организатор",
  professional: "Мастер",
  moderator: "Модератор",
  admin: "Администратор",
};

export function AdminLoginPage() {
  useEffect(() => {
    let active = true;
    void (async () => {
      const authorized = await verifyCurrentAdminSession();
      if (active) window.location.replace(adminRedirectForAuthorization(authorized));
    })();
    return () => { active = false; };
  }, []);
  return <main className="admin-login-shell"><section className="admin-login-card"><h1>Admin</h1><p>Проверяем Telegram-сессию…</p></section></main>;
}

export function AdminPanelPage() {
  const [authorized, setAuthorized] = useState(false);
  const [targetRole, setTargetRole] = useState<RoleInvitationTargetRole>("organizer");
  const [invitation, setInvitation] = useState<(CreatedRoleInvitation & { url: string }) | null>(null);
  const [invitationError, setInvitationError] = useState("");
  const [creatingInvitation, setCreatingInvitation] = useState(false);
  const [copied, setCopied] = useState(false);
  const [assignments, setAssignments] = useState<RoleAssignment[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [rolesError, setRolesError] = useState("");
  const [demotingUserKey, setDemotingUserKey] = useState("");

  const loadAssignments = async () => {
    setRolesLoading(true);
    setRolesError("");
    try { setAssignments(await requestRoleAssignments()); }
    catch { setRolesError("Не удалось загрузить список ролей."); }
    finally { setRolesLoading(false); }
  };

  useEffect(() => {
    let active = true;
    void (async () => {
      const allowed = await verifyCurrentAdminSession();
      if (!active) return;
      if (!allowed) { window.location.replace("/admin/access-denied"); return; }
      setAuthorized(true);
      await loadAssignments();
    })();
    return () => { active = false; };
  }, []);

  const createInvitation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatingInvitation(true); setInvitation(null); setInvitationError(""); setCopied(false);
    try {
      const created = await requestRoleInvitation(targetRole);
      const url = buildRoleInvitationUrl(created.startParam, telegramBotUsername, telegramAppName);
      if (!url) throw new Error("role_invitation_link_failed");
      setInvitation({ ...created, url });
    } catch { setInvitationError("Не удалось создать приглашение."); }
    finally { setCreatingInvitation(false); }
  };

  const demote = async (assignment: RoleAssignment) => {
    if (assignment.role === "admin") return;
    const name = [assignment.firstName, assignment.lastName].filter(Boolean).join(" ") || assignment.username || assignment.userKey;
    if (!window.confirm(`Разжаловать ${name} из роли «${roleLabels[assignment.role]}» в обычного пользователя?`)) return;
    setDemotingUserKey(assignment.userKey); setRolesError("");
    try {
      await requestRoleDemotion(assignment.userKey);
      await loadAssignments();
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      setRolesError(code === "role_conflict" ? "Роль уже изменилась. Обновите список." : "Не удалось разжаловать пользователя.");
    } finally { setDemotingUserKey(""); }
  };

  const copyInvitation = async () => {
    if (!invitation) return;
    try { await navigator.clipboard.writeText(invitation.url); setCopied(true); }
    catch { setInvitationError("Не удалось скопировать ссылку."); }
  };

  return <main className="admin-login-shell admin-panel-shell">
    {authorized ? <DevPanel /> : null}
    <section className="admin-login-card"><h1>Admin panel</h1>{authorized ? <p>Серверная авторизация подтверждена.</p> : <p>Проверяем доступ…</p>}</section>
    {authorized ? <section className="admin-login-card admin-role-invitations">
      <h2>Приглашение роли</h2>
      <form onSubmit={createInvitation}>
        <select value={targetRole} onChange={(event) => setTargetRole(event.target.value as RoleInvitationTargetRole)} disabled={creatingInvitation}>
          <option value="organizer">Организатор</option><option value="professional">Мастер</option>
        </select>
        <button type="submit" disabled={creatingInvitation}>{creatingInvitation ? "Создаём…" : "Сформировать приглашение"}</button>
      </form>
      {invitation ? <div className="admin-role-invitation-result"><input readOnly value={invitation.url} /><button type="button" onClick={() => void copyInvitation()}>{copied ? "Скопировано" : "Скопировать"}</button></div> : null}
      {invitationError ? <div className="admin-role-invitation-error">{invitationError}</div> : null}
    </section> : null}
    {authorized ? <section className="admin-login-card admin-role-invitations admin-role-removal">
      <h2>Назначенные роли</h2>
      <button type="button" onClick={() => void loadAssignments()} disabled={rolesLoading}>{rolesLoading ? "Обновляем…" : "Обновить список"}</button>
      {assignments.length ? <div className="admin-role-list">{assignments.map((item) => {
        const displayName = [item.firstName, item.lastName].filter(Boolean).join(" ") || item.username || item.userKey;
        return <article className="admin-role-row" key={item.userKey}>
          <div><strong>{displayName}</strong><span>{item.username ? `@${item.username} · ` : ""}{item.telegramId || item.userKey}</span><span>{roleLabels[item.role]}</span></div>
          {item.role === "admin" ? <span className="admin-role-protected">Защищено</span> : <button className="admin-danger-button" type="button" onClick={() => void demote(item)} disabled={demotingUserKey === item.userKey}>{demotingUserKey === item.userKey ? "Разжалование…" : "Разжаловать"}</button>}
        </article>;
      })}</div> : !rolesLoading ? <p>Повышенных ролей нет.</p> : null}
      {rolesError ? <div className="admin-role-invitation-error">{rolesError}</div> : null}
    </section> : null}
  </main>;
}

export function AdminAccessDeniedPage() {
  return <main className="admin-login-shell"><section className="admin-login-card"><h1>Admin</h1><p>Access denied.</p><a href="/">Вернуться в приложение</a></section></main>;
}
