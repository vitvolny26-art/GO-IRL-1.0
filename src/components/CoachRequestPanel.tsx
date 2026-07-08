import { useEffect, useMemo, useState } from "react";
import { Dumbbell, Star, UserCheck } from "lucide-react";
import {
  getCurrentCoachUserKey,
  loadCoachRequestsForActivity,
  requestCoachForActivity,
} from "../coachFeature";
import type { Activity, CoachRequest, UserRole } from "../types";

type CoachRequestPanelProps = {
  activity: Activity;
  userRole: UserRole;
};

const coachStatusLabel = (status: CoachRequest["status"]) => {
  switch (status) {
    case "pending": return "ожидает подтверждения";
    case "matched": return "тренер найден";
    case "confirmed": return "тренер подтверждён";
    case "completed": return "завершено";
    case "rejected": return "отклонено";
    case "cancelled": return "отменено";
    default: return "в обработке";
  }
};

export function CoachRequestPanel({ activity, userRole }: CoachRequestPanelProps) {
  const [requests, setRequests] = useState<CoachRequest[]>([]);
  const [currentUserKey, setCurrentUserKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const isOrganizer = activity.organizerKey === currentUserKey;
  const canManage = isOrganizer || userRole === "admin" || userRole === "moderator";

  const organizerRequest = useMemo(
    () => requests.find((request) => request.requestType === "organizer_request" && request.status !== "cancelled"),
    [requests],
  );

  const participantInterest = useMemo(
    () => requests.find((request) => request.requestType === "participant_interest" && request.requesterUserKey === currentUserKey && request.status !== "cancelled"),
    [requests, currentUserKey],
  );

  const interestCount = useMemo(
    () => requests.filter((request) => request.requestType === "participant_interest" && request.status === "pending").length,
    [requests],
  );

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
      setMessage("Не удалось загрузить тренера");
    });
  }, [activity.id]);

  const handleRequest = async () => {
    setLoading(true);
    setMessage(null);

    try {
      await requestCoachForActivity(
        activity,
        canManage ? "organizer_request" : "participant_interest",
      );

      await reload();
      setMessage(canManage ? "Тренер запрошен" : "Вы хотите тренера");
    } catch {
      setMessage("Не удалось отправить запрос");
    } finally {
      setLoading(false);
    }
  };

  const buttonLabel = canManage ? "Пригласить тренера" : "Хочу тренера";
  const disabled = loading || Boolean(canManage ? organizerRequest : participantInterest);

  return (
    <section className="coach-panel" aria-label="Тренер">
      <div className="coach-panel-header">
        <div className="coach-panel-icon">
          <Dumbbell size={18} aria-hidden="true" />
        </div>
        <div>
          <h3>Тренер</h3>
          <p>Тренер поможет провести игру, разминку и объяснить правила новичкам.</p>
        </div>
      </div>

      {organizerRequest ? (
        <div className="coach-panel-status">
          <UserCheck size={18} aria-hidden="true" />
          <span>Тренер запрошен · {coachStatusLabel(organizerRequest.status)}</span>
        </div>
      ) : null}

      {interestCount > 0 && canManage ? (
        <div className="coach-panel-status">
          <Star size={18} aria-hidden="true" />
          <span>{interestCount} участников хотят тренера</span>
        </div>
      ) : null}

      {!canManage && participantInterest ? (
        <div className="coach-panel-status">
          <Star size={18} aria-hidden="true" />
          <span>Вы хотите тренера</span>
        </div>
      ) : null}

      <button
        type="button"
        className="coach-panel-button"
        onClick={handleRequest}
        disabled={disabled}
      >
        {disabled ? "Запрос отправлен" : buttonLabel}
      </button>

      {message ? <div className="coach-panel-message">{message}</div> : null}
    </section>
  );
}
