import { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardPaste, ExternalLink, Link2, Trash2, UsersRound } from "lucide-react";
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
import {
  loadSharedEventTelegramChatLink,
  removeSharedEventTelegramChatLink,
  saveSharedEventTelegramChatLink,
} from "../externalTelegramChatRepository";
import {
  createEventSupergroupBinding,
  openEventSupergroupBinding,
} from "../telegramEventSupergroup";
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
  const [awaitingBinding, setAwaitingBinding] = useState(false);
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

  const refresh = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      const next = await loadSharedEventTelegramChatLink(activity.id);
      const fallback = next || loadLocalEventTelegramChatLink(activity.id);
      setLink(fallback);
      setDraft(fallback?.url || "");
      setShared(Boolean(next));
      if (next) {
        setAwaitingBinding(false);
        setError("");
      }
    } catch {
      const fallback = loadLocalEventTelegramChatLink(activity.id);
      setLink(fallback);
      setDraft(fallback?.url || "");
      setShared(false);
      setError("Общая синхронизация Telegram-чата пока недоступна");
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [activity.id]);

  useEffect(() => {
    setEditing(false);
    setError("");
    setAwaitingBinding(false);
    void refresh(true);
  }, [refresh]);

  useEffect(() => {
    if (!awaitingBinding) return;
    const onFocus = () => void refresh(false);
    window.addEventListener("focus", onFocus);
    const interval = window.setInterval(() => void refresh(false), 4_000);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.clearInterval(interval);
    };
  }, [awaitingBinding, refresh]);

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

  const createGroup = async () => {
    if (!isOrganizer || saving) return;
    setSaving(true);
    setError("");
    try {
      const binding = await createEventSupergroupBinding(activity.id);
      if (!openEventSupergroupBinding(binding.startGroupUrl)) throw new Error("telegram_not_opened");
      setAwaitingBinding(true);
    } catch {
      setError("Не удалось подготовить автоматическую привязку Telegram-группы");
    } finally {
      setSaving(false);
    }
  };

  const save = async (value = draft) => {
    if (!identityKey || !isOrganizer || saving) return;
    const normalized = normalizeExternalTelegramChatUrl(value);
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
      setAwaitingBinding(false);
    } catch {
      setError("Не удалось сохранить Telegram-чат для участников");
    } finally {
      setSaving(false);
    }
  };

  const pasteAndSave = async () => {
    if (!navigator.clipboard?.readText) {
      setError("Вставьте ссылку из буфера в поле вручную");
      return;
    }
    try {
      const value = await navigator.clipboard.readText();
      const normalized = normalizeExternalTelegramChatUrl(value);
      if (!normalized) {
        setError("В буфере нет корректной ссылки t.me");
        return;
      }
      setDraft(normalized);
      await save(normalized);
    } catch {
      setError("Не удалось прочитать буфер. Вставьте ссылку вручную");
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
      setAwaitingBinding(false);
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
          <small>Организатор создаёт группу, бот привязывает её к событию, а подтверждённые участники получают доступ.</small>
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
            <button type="button" className="secondary" onClick={() => void createGroup()} disabled={saving || awaitingBinding}>
              <UsersRound size={17} aria-hidden="true" />
              {awaitingBinding ? "Ожидаем привязку…" : "Создать и привязать чат"}
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
          <button type="button" onClick={() => void pasteAndSave()} disabled={saving}>
            <ClipboardPaste size={17} aria-hidden="true" />
            {saving ? "Сохранение…" : "Вставить и сохранить"}
          </button>
          <button type="button" className="secondary" onClick={() => void save()} disabled={saving}>Сохранить введённую</button>
          {editing ? <button type="button" className="secondary" disabled={saving} onClick={() => { setEditing(false); setDraft(link?.url || ""); setError(""); }}>Отмена</button> : null}
          {!link ? (
            <div className="external-telegram-chat-muted">
              {awaitingBinding
                ? "Создайте группу в Telegram, назначьте бота администратором и вернитесь — ссылка появится автоматически."
                : "Telegram откроет создание группы с GO IRL bot. Ручная вставка остаётся резервным способом."}
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && !isOrganizer && !link ? <div className="external-telegram-chat-muted">Организатор ещё не добавил Telegram-чат.</div> : null}
      {!loading && link && !canAccess ? <div className="external-telegram-chat-muted">Telegram-чат доступен организатору и подтверждённым участникам.</div> : null}
      {error ? <div className="external-telegram-chat-error">{error}</div> : null}
      <div className="external-telegram-chat-note">
        {shared ? "Ссылка синхронизирована и защищена правилами доступа." : "Локальная ссылка видна только на этом устройстве, пока организатор не сохранит её для участников."}
      </div>
    </section>
  );
}
