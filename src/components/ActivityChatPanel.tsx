import { useEffect, useMemo, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import {
  ensureActivityChat,
  loadActivityChat,
  loadActivityChatMessages,
  sendActivityChatMessage,
} from "../activityChatFeature";
import { useAppStore } from "../store";
import type { Activity, ActivityChat, ActivityChatMessage } from "../types";
import { CoachRequestPanel } from "./CoachRequestPanel";

type ActivityChatPanelProps = {
  activity: Activity;
};

const formatCloseTime = (value?: string | null) => {
  if (!value) return "";
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

export function ActivityChatPanel({ activity }: ActivityChatPanelProps) {
  const userRole = useAppStore((state) => state.userRole);
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ActivityChat | null>(null);
  const [messages, setMessages] = useState<ActivityChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showCoachPanel = activity.type !== "sport" && activity.categoryId !== "sport";

  const expired = useMemo(() => {
    if (!chat) return false;
    return chat.status !== "active" || new Date(chat.expiresAt).getTime() <= Date.now();
  }, [chat]);

  const reload = async () => {
    setLoading(true);
    setError(null);

    try {
      await ensureActivityChat(activity.id);
      const [nextChat, nextMessages] = await Promise.all([
        loadActivityChat(activity.id),
        loadActivityChatMessages(activity.id),
      ]);

      setChat(nextChat);
      setMessages(nextMessages);
    } catch {
      setError("Чат доступен только участникам");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void reload();
  }, [activity.id, open]);

  const handleSend = async () => {
    if (!body.trim()) return;

    setSending(true);
    setError(null);

    try {
      await sendActivityChatMessage(activity.id, body);
      setBody("");
      await reload();
    } catch {
      setError("Не удалось отправить сообщение");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {showCoachPanel ? <CoachRequestPanel activity={activity} userRole={userRole} /> : null}

      <section className="activity-chat-panel">
        <button
          type="button"
          className="activity-chat-toggle"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
        >
          <span className="activity-chat-toggle-icon">
            <MessageCircle size={18} aria-hidden="true" />
          </span>
          <span>
            <strong>Чат события</strong>
            <small>Для участников. Закроется через 24 часа после события.</small>
          </span>
        </button>

        {open ? (
          <div className="activity-chat-box">
            {loading ? <div className="activity-chat-muted">Загрузка чата…</div> : null}

            {chat?.expiresAt ? (
              <div className="activity-chat-muted">
                Чат закроется: {formatCloseTime(chat.expiresAt)}
              </div>
            ) : null}

            {expired ? (
              <div className="activity-chat-muted">Чат закрыт. Сообщения больше недоступны.</div>
            ) : null}

            {error ? <div className="activity-chat-error">{error}</div> : null}

            {!loading && !error ? (
              <div className="activity-chat-messages">
                {messages.length > 0 ? (
                  messages.map((message) => (
                    <article key={message.id} className="activity-chat-message">
                      <div className="activity-chat-message-meta">
                        <strong>{message.senderDisplayName || "GO IRL User"}</strong>
                        <span>{formatCloseTime(message.createdAt)}</span>
                      </div>
                      <p>{message.body}</p>
                    </article>
                  ))
                ) : (
                  <div className="activity-chat-muted">Сообщений пока нет. Напишите первым.</div>
                )}
              </div>
            ) : null}

            {!expired && !error ? (
              <div className="activity-chat-form">
                <input
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Сообщение…"
                  maxLength={1000}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !body.trim()}
                  aria-label="Отправить"
                >
                  <Send size={18} aria-hidden="true" />
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </section>
    </>
  );
}
