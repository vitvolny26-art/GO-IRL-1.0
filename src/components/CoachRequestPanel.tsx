import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Star, UserCheck, XCircle } from "lucide-react";
import {
  cancelCoachRequest,
  getCurrentCoachUserKey,
  loadCoachRequestsForActivity,
  requestCoachForActivity,
} from "../coachFeature";
import type { Activity, CoachRequest, UserRole } from "../types";

type CoachRequestPanelVariant = "coach" | "event_helper";
type CoachRequestsChangedDetail = { activityId: string };

type CoachRequestPanelProps = {
  activity: Activity;
  userRole: UserRole;
  variant?: CoachRequestPanelVariant;
};

const coachRequestsChangedEvent = "go-irl-coach-requests-changed";

const notifyCoachRequestsChanged = (activityId: string) => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent<CoachRequestsChangedDetail>(coachRequestsChangedEvent, {
    detail: { activityId },
  }));
};

const copyByVariant = {
  coach: {
    ariaLabel: "Тренер",
    title: "Тренер",
    description: "Тренер поможет провести игру, разминку и объяснить правила новичкам.",
    requested: "Тренер запрошен",
    participantWanted: "Вы хотите тренера",
    participantCount: "участников хотят тренера",
    organizerButton: "Пригласить тренера",
    participantButton: "Хочу тренера",
    disabledButton: "Запрос отправлен",
    organizerCancelButton: "Больше не нужен",
    participantCancelButton: "Отменить запрос",
    loadError: "Не удалось загрузить тренера",
    submitSuccess: "Тренер запрошен",
    participantSuccess: "Вы хотите тренера",
    submitError: "Не удалось отправить запрос",
    cancelSuccess: "Запрос тренера отменён",
    participantCancelSuccess: "Запрос отменён",
    cancelError: "Не удалось отменить запрос",
  },
  event_helper: {
    ariaLabel: "Помощник события",
    title: "Помощник события",
    description: "Поможет событию состояться: встретит новичков, объяснит формат и поддержит группу перед встречей.",
    requested: "Помощник запрошен",
    participantWanted: "Вы хотите помощника события",
    participantCount: "участников хотят помощника",
    organizerButton: "Нужен помощник",
    participantButton: "Хочу помощника",
    disabledButton: "Запрос отправлен",
    organizerCancelButton: "Больше не нужен",
    participantCancelButton: "Отменить запрос",
    loadError: "Не удалось загрузить помощника события",
    submitSuccess: "Помощник события запрошен",
    participantSuccess: "Вы хотите помощника события",
    submitError: "Не удалось отправить запрос",
    cancelSuccess: "Запрос помощника отменён",
    participantCancelSuccess: "Запрос отменён",
    cancelError: "Не удалось отменить запрос",
  },
} satisfies Record<CoachRequestPanelVariant, Record<string, string>>;

const coachStatusLabel = (status: CoachRequest["status"], variant: CoachRequestPanelVariant) => {
  const actor = variant === "coach" ? "тренер" : "помощник";

  switch (status) {
    case "pending": return "ожидает подтверждения";
    case "matched": return `${actor} найден`;
    case "confirmed": return `${actor} подтверждён`;
    case "completed": return "завершено";
    case "rejected": return "отклонено";
    case "cancelled": return "отменено";
    default: return "в обработке";
  }
};

export const isActiveCoachRequest = (request?: CoachRequest) =>
  Boolean(request && !["cancelled", "completed", "rejected"].includes(request.status));

export function CoachRequestPanel({ activity, userRole, variant = "coach" }: CoachRequestPanelProps) {
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const copy = copyByVariant[variant];
  const PanelIcon = variant === "coach" ? Dumbbell : UserCheck;

  const isOrganizer = activity.organizerKey === currentUserKey;
  const canManage = isOrganizer || userRole === "admin" || userRole === "moderator";

  const organizerRequest = useMemo(
    () => requests.find((request) => request.requestType === "organizer_request" && isActiveCoachRequest(request)),
    [requests],
  );

  const participantInterest = useMemo(
    () => requests.find((request) => request.requestType === "participant_interest" && request.requesterUserKey === currentUserKey && isActiveCoachRequest(request)),
    [requests, currentUserKey],
  );

  const interestCount = useMemo(
    () => requests.filter((request) => request.requestType === "participant_interest" && request.status === "pending").length,
    [requests],
  );

  const activeRequest = canManage ? organizerRequest : participantInterest;
  const canCancel = isActiveCoachRequest(activeRequest);

  const reload = async () => {
    const [userKey, coachRequests] = await Promise.all([
      getCurrentCoachUserKey(),
      loadCoachRequestsForActivity(activity.id),
    ]);

    setCurrentUserKey(userKey);
    setRequests(coachRequests);
  };

  useEffect(() => {
    void reload().catch(() => {
      setMessage(copy.loadError);
    });
  }, [activity.id, copy.loadError]);

  const handleRequest = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await requestCoachForActivity(
        activity,
        canManage ? "organizer_request" : "participant_interest",
      );

      await reload();
      notifyCoachRequestsChanged(activity.id);
      setMessage(canManage ? copy.submitSuccess : copy.participantSuccess);
    } catch {
      setMessage(copy.submitError);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!activeRequest) return;

    setLoading(true);
    setMessage(null);

    try {
      await cancelCoachRequest(activeRequest.id);
      await reload();
      notifyCoachRequestsChanged(activeRequest.activityId);
      setMessage(canManage ? copy.cancelSuccess : copy.participantCancelSuccess);
    } catch {
      setMessage(copy.cancelError);
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = canManage ? copy.organizerButton : copy.participantButton;
  const cancelLabel = canManage ? copy.organizerCancelButton : copy.participantCancelButton;
  const disabled = loading || Boolean(activeRequest);

  return (
    <section className="coach-panel" aria-label={copy.ariaLabel}>
      <div className="coach-panel-header">
        <div className="coach-panel-icon">
          <PanelIcon size={18} aria-hidden="true" />
        </div>
        <div>
          <h3>{copy.title}</h3>
          <p>{copy.description}</p>
        </div>
      </div>

      {organizerRequest ? (
        <div className="coach-panel-status">
          <UserCheck size={18} aria-hidden="true" />
          <span>{copy.requested} · {coachStatusLabel(organizerRequest.status, variant)}</span>
        </div>
      ) : null}

      {interestCount > 0 && canManage ? (
        <div className="coach-panel-status">
          <Star size={18} aria-hidden="true" />
          <span>{interestCount} {copy.participantCount}</span>
        </div>
      ) : null}

      {!canManage && participantInterest ? (
        <div className="coach-panel-status">
          <Star size={18} aria-hidden="true" />
          <span>{copy.participantWanted}</span>
        </div>
      ) : null}

      <div className="coach-panel-actions">
        <button
          type="button"
          className="coach-panel-button"
          onClick={handleRequest}
          disabled={disabled}
        >
          {disabled ? copy.disabledButton : buttonLabel}
        </button>

        {canCancel ? (
          <button
            type="button"
            className="coach-panel-cancel-button"
            onClick={handleCancel}
            disabled={loading}
          >
            <XCircle size={16} aria-hidden="true" />
            <span>{cancelLabel}</span>
          </button>
        ) : null}
      </div>

      {message ? <div className="coach-panel-message">{message}</div> : null}
    </section>
  );
}
