import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import {
  ensureActivityChat,
  loadActivityChat,
  loadActivityChatMessages,
  sendActivityChatMessage,
} from "../activityChatFeature";
import { getCity } from "../config/cities";
import { getEventWeather, type WeatherHour, type WeatherResult } from "../services/weather";
import { useAppStore } from "../store";
import type { Activity, ActivityChat, ActivityChatMessage } from "../types";
import { isOutdoorGenericActivity } from "../eventWeather";
import { CoachRequestPanel } from "./CoachRequestPanel";

type ActivityChatPanelProps = {
  activity: Activity;
  openRequest?: number;
  showHelperAction?: boolean;
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

const weatherSummaryLines = (weather: WeatherResult) => [
  `🌡️ ${weather.temperature}°C`,
  `☔ ${weather.rain}%`,
  `💨 ${weather.wind} km/h`,
];

function OutdoorWeatherPanel({ activity }: { activity: Activity }) {
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [weatherHours, setWeatherHours] = useState<WeatherHour[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("Загрузка погоды…");
  const city = getCity(activity.cityId);
  const cityName = city?.name.ru || activity.cityId;

  useEffect(() => {
    let active = true;
    setStatus("Загрузка погоды…");
    setWeather(null);
    setWeatherHours([]);

    void getEventWeather({
      date: activity.date,
      time: activity.time,
      address: activity.address,
      city: cityName,
      durationMinutes: activity.metadata?.sport?.durationMinutes || 90,
    }).then((nextWeather) => {
      if (!active) return;
      setWeather(nextWeather);
      setWeatherHours(nextWeather?.hours || []);
      setStatus(nextWeather ? "" : "Прогноз недоступен");
    });

    return () => {
      active = false;
    };
  }, [activity.id, activity.date, activity.time, activity.address, cityName, activity.metadata?.sport?.durationMinutes]);

  return (
    <section className="generic-weather-card">
      <button className="weather-detail-toggle generic-weather-toggle" onClick={() => setOpen((current) => !current)} type="button">
        <span className="generic-weather-icon">☀️</span>
        <span>Погода</span>
        <strong className="weather-summary-lines">
          {weather ? weatherSummaryLines(weather).map((line) => <span key={line}>{line}</span>) : status}
        </strong>
      </button>

      {open && weatherHours.length > 0 ? (
        <div className="weather-detail-card generic-weather-details">
          <div className="weather-detail-head">
            <span>Детали погоды</span>
            <strong>{weather ? weatherSummaryLines(weather).join(" · ") : status}</strong>
          </div>
          <div className="weather-bars">
            {weatherHours.map((hour) => (
              <div className="weather-bar-row" key={hour.time}>
                <span>{hour.time.slice(11, 16)}</span>
                <span className="weather-hour-metric">🌡️ {hour.temperature}°C</span>
                <span className="weather-hour-metric">☔ {hour.rain}%</span>
                <span className="weather-hour-metric">💨 {hour.wind} km/h</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ActivityChatPanel({ activity, openRequest = 0, showHelperAction = true }: ActivityChatPanelProps) {
  const userRole = useAppStore((state) => state.userRole);
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState<ActivityChat | null>(null);
  const [messages, setMessages] = useState<ActivityChatMessage[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const showEventHelperPanel = activity.type !== "sport" && activity.categoryId !== "sport";
  const showOutdoorWeather = isOutdoorGenericActivity(activity);

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

  useEffect(() => {
    if (!openRequest) return;
    setOpen(true);
    window.requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      inputRef.current?.focus({ preventScroll: true });
    });
  }, [activity.id, openRequest]);

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
      {showOutdoorWeather ? <OutdoorWeatherPanel activity={activity} /> : null}

      {showEventHelperPanel && showHelperAction ? <CoachRequestPanel activity={activity} userRole={userRole} variant="event_helper" /> : null}

      <section className="activity-chat-panel" ref={panelRef}>
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
                  ref={inputRef}
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
