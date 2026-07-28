import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Link2, Trash2, UsersRound } from "lucide-react";
import { getCurrentChatIdentity } from "../activityChatFeature";
import {
  canAccessExternalTelegramChat,
  loadLocalEventTelegramChatLink,
  normalizeExternalTelegramChatUrl,
  openExternalTelegramChat,
  openTelegramGroupCreation,
  removeLocalEventTelegramChatLink,
  resolveExternalTelegramChatLifecycle,
  saveLocalEventTelegramChatLink,
  type ExternalTelegramChatLink,
} from "../externalTelegramChat";
import {
  loadSharedEventTelegramChatLink,
  removeSharedEventTelegramChatLink,
  saveSharedEventTelegramChatLink,
} from "../externalTelegramChatRepository";
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
  const [link, setLink] = useState<ExternalTelegramChatLink | null>(null);
  const [draft, setDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [shared, setShared] = useState(false);
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
    let active = true;
    setLoading(true);
    setEditing(false);
    setError("");

    void loadSharedEventTelegramChatLink(activity.id)
      .then((next) => {
        if (!active) return;
        const fallback = next || loadLocalEventTelegramChatLink(activity.id);
        setLink(fallback);
        setDraft(fallback?.url || "");
        setShared(Boolean(next));
      })
      .catch(() => {
        if (!active) return;
        const fallback = loadLocalEventTelegramChatLink(activity.id);
        setLink(fallback);
        setDraft(fallback?.url || "");
        setShared(false);
        setError("Общая синхронизация Telegram-чата пока недоступна");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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

  const save = async () => {
    if (!identityKey || !isOrganizer || saving) return;
    const normalized = normalizeExternalTelegramChatUrl(draft);
    if (!normalized) {
      setError("Добавьте корректную ссылку t.me на группу или приглашение");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const next = await saveSharedEventTelegramChatLink(activity.id, normalized, identityKey, link?.keepArchive);
      if (!next) throw new Error("telegram_chat_not_saved");
      saveLocalEventTelegramChatLink(activity.id, next.url, identityKey);
      setLink(next);
      setDraft(next.url);
      setShared(true);
      setEditing(false);
    } catch {
      setError("Не удалось сохранить Telegram-чат для участников");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!isOrganizer || saving) return;
    setSaving(true);
    setError("");
    try {
      await removeSharedEventTelegramChatLink(activity.id);
      removeLocalEventTelegramChatLink(activity.id);
      setLink(null);
      setDraft("");
      setShared(false);
      setEditing(false);
    } catch {
      setError("Не удалось удалить Telegram-чат");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="external-telegram-chat-panel" aria-label="Telegram chat события">
      <div className="external-telegram-chat-head">
        <span className="external-telegram-chat-icon" aria-hidden="true"><Link2 size={18} /></span>
        <div>
          <strong>Telegram-чат события</strong>
          <small>Организатор создаёт группу или добавляет готовую ссылку. Доступ получают подтверждённые участники.</small>
        </div>
      </div>

      {loading ? <div className="external-telegram-chat-muted">Загрузка Telegram-чата…</div> : null}

      {!loading && link && canAccess ? (
        <div className="external-telegram-chat-actions">
          <button type="button" onClick={() => openExternalTelegramChat(link.url)} disabled={!canOpen || saving}>
            <ExternalLink size={17} aria-hidden="true" />
            {lifecycle === "active" ? "Открыть Telegram-чат" : "Telegram-чат закрыт"}
          </button>
          {isOrganizer ? (
            <>
              <button type="button" className="secondary" onClick={() => setEditing(true)} disabled={saving}>Изменить</button>
              <button type="button" className="danger" onClick={() => void remove()} disabled={saving} aria-label="Удалить ссылку на Telegram-чат">
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      ) : null}

      {!loading && isOrganizer && (!link || editing || !shared) ? (
        <div className="external-telegram-chat-editor">
          {!link ? (
            <button type="button" className="secondary" onClick={() => openTelegramGroupCreation()} disabled={saving}>
              <UsersRound size={17} aria-hidden="true" />
              Создать чат
            </button>
          ) : null}
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="https://t.me/+..."
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            disabled={saving}
          />
          <button type="button" onClick={() => void save()} disabled={saving}>{saving ? "Сохранение…" : "Сохранить ссылку"}</button>
          {editing ? <button type="button" className="secondary" disabled={saving} onClick={() => { setEditing(false); setDraft(link?.url || ""); setError(""); }}>Отмена</button> : null}
          {!link ? <div className="external-telegram-chat-muted">После создания группы скопируйте ссылку-приглашение и сохраните её здесь.</div> : null}
        </div>
      ) : null}

      {!loading && !isOrganizer && !link ? (
        <div className="external-telegram-chat-muted">Организатор ещё не добавил Telegram-чат.</div>
      ) : null}
      {!loading && link && !canAccess ? (
        <div className="external-telegram-chat-muted">Telegram-чат доступен организатору и подтверждённым участникам.</div>
      ) : null}
      {error ? <div className="external-telegram-chat-error">{error}</div> : null}
      <div className="external-telegram-chat-note">
        {shared ? "Ссылка синхронизирована и защищена правилами доступа." : "Локальная ссылка видна только на этом устройстве, пока организатор не сохранит её для участников."}
      </div>
    </section>
  );
}