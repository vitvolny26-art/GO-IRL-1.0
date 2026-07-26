import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Link2, Trash2 } from "lucide-react";
import { getCurrentChatIdentity } from "../activityChatFeature";
import {
  canAccessExternalTelegramChat,
  loadLocalEventTelegramChatLink,
  normalizeExternalTelegramChatUrl,
  openExternalTelegramChat,
  removeLocalEventTelegramChatLink,
  resolveExternalTelegramChatLifecycle,
  saveLocalEventTelegramChatLink,
  type ExternalTelegramChatLink,
} from "../externalTelegramChat";
import type { Activity } from "../types";
import "./external-telegram-chat.css";

type ExternalTelegramChatPanelProps = {
  activity: Activity;
};

const eventEndsAt = (activity: Activity) => {
  const durationMinutes = activity.metadata?.sport?.durationMinutes || 90;
  const start = new Date(`${activity.date}T${activity.time || "00:00"}:00`);
  if (Number.isNaN(start.getTime())) return null;
  return new Date(start.getTime() + durationMinutes * 60_000).toISOString();
};

export function ExternalTelegramChatPanel({ activity }: ExternalTelegramChatPanelProps) {
  const [identityKey, setIdentityKey] = useState<string | null>(null);
  const [link, setLink] = useState<ExternalTelegramChatLink | null>(() => loadLocalEventTelegramChatLink(activity.id));
  const [draft, setDraft] = useState(link?.url || "");
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void getCurrentChatIdentity()
      .then((identity) => {
        if (active) setIdentityKey(identity.userKey);
      })
      .catch(() => {
        if (active) setIdentityKey(null);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const next = loadLocalEventTelegramChatLink(activity.id);
    setLink(next);
    setDraft(next?.url || "");
    setEditing(false);
    setError("");
  }, [activity.id]);

  const membershipStatus = useMemo(
    () => activity.members.find((member) => member.userKey === identityKey)?.status || null,
    [activity.members, identityKey],
  );
  const isOrganizer = Boolean(identityKey && identityKey === activity.organizerKey);
  const canAccess = canAccessExternalTelegramChat({
    currentUserKey: identityKey,
    organizerUserKey: activity.organizerKey,
    membershipStatus,
  });
  const lifecycle = resolveExternalTelegramChatLifecycle({
    kind: "event",
    eventEndsAt: eventEndsAt(activity),
    keepArchive: link?.keepArchive,
  });
  const canOpen = Boolean(link && canAccess && lifecycle === "active");

  const save = () => {
    if (!identityKey || !isOrganizer) return;
    const normalized = normalizeExternalTelegramChatUrl(draft);
    if (!normalized) {
      setError("Добавьте корректную ссылку t.me на группу или приглашение");
      return;
    }
    const next = saveLocalEventTelegramChatLink(activity.id, normalized, identityKey);
    if (!next) {
      setError("Не удалось сохранить ссылку");
      return;
    }
    setLink(next);
    setDraft(next.url);
    setEditing(false);
    setError("");
  };

  const remove = () => {
    if (!isOrganizer) return;
    removeLocalEventTelegramChatLink(activity.id);
    setLink(null);
    setDraft("");
    setEditing(false);
    setError("");
  };

  return (
    <section className="external-telegram-chat-panel" aria-label="Telegram chat события">
      <div className="external-telegram-chat-head">
        <span className="external-telegram-chat-icon" aria-hidden="true"><Link2 size={18} /></span>
        <div>
          <strong>Telegram-чат события</strong>
          <small>Организатор добавляет ссылку на группу. Внутренний чат остаётся доступен как fallback.</small>
        </div>
      </div>

      {link && canAccess ? (
        <div className="external-telegram-chat-actions">
          <button type="button" onClick={() => openExternalTelegramChat(link.url)} disabled={!canOpen}>
            <ExternalLink size={17} aria-hidden="true" />
            {lifecycle === "active" ? "Открыть Telegram-чат" : "Telegram-чат закрыт"}
          </button>
          {isOrganizer ? (
            <>
              <button type="button" className="secondary" onClick={() => setEditing(true)}>Изменить</button>
              <button type="button" className="danger" onClick={remove} aria-label="Удалить ссылку на Telegram-чат">
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {isOrganizer && (!link || editing) ? (
        <div className="external-telegram-chat-editor">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://t.me/+..."
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <button type="button" onClick={save}>{link ? "Сохранить" : "Добавить чат"}</button>
          {editing ? <button type="button" className="secondary" onClick={() => { setEditing(false); setDraft(link?.url || ""); setError(""); }}>Отмена</button> : null}
        </div>
      ) : null}

      {!isOrganizer && !link ? (
        <div className="external-telegram-chat-muted">Организатор ещё не добавил Telegram-чат.</div>
      ) : null}
      {link && !canAccess ? (
        <div className="external-telegram-chat-muted">Telegram-чат доступен организатору и подтверждённым участникам.</div>
      ) : null}
      {error ? <div className="external-telegram-chat-error">{error}</div> : null}
      <div className="external-telegram-chat-note">Сейчас ссылка хранится только на этом устройстве. Общая синхронизация требует отдельно утверждённого persistence/RLS шага.</div>
    </section>
  );
}
