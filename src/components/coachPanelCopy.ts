import type { CoachRequest, SportLevel } from "../types";

export type CoachPanelLocale = "ru" | "en";

type CoachPanelCopy = {
  ariaLabel: string;
  title: string;
  description: string;
  requested: string;
  participantWanted: string;
  participantCount: string;
  organizerButton: string;
  participantButton: string;
  disabledButton: string;
  loadingButton: string;
  unavailableButton: string;
  organizerCancelButton: string;
  participantCancelButton: string;
  loadError: string;
  submitSuccess: string;
  participantSuccess: string;
  submitError: string;
  cancelSuccess: string;
  participantCancelSuccess: string;
  cancelError: string;
  participantLevel: string;
  unspecified: string;
  goalLabel: string;
  goalPlaceholder: string;
  coachRole: string;
};

export const coachPanelCopy: Record<CoachPanelLocale, CoachPanelCopy> = {
  ru: {
    ariaLabel: "Тренер",
    title: "Тренер",
    description: "Тренер поможет провести игру, разминку и объяснить правила новичкам.",
    requested: "Тренер запрошен",
    participantWanted: "Вы хотите тренера",
    participantCount: "участников хотят тренера",
    organizerButton: "Пригласить тренера",
    participantButton: "Хочу тренера",
    disabledButton: "Запрос отправлен",
    loadingButton: "Отправка...",
    unavailableButton: "Недоступно",
    organizerCancelButton: "Больше не нужен",
    participantCancelButton: "Отменить запрос",
    loadError: "Не удалось загрузить тренера",
    submitSuccess: "Тренер запрошен",
    participantSuccess: "Вы хотите тренера",
    submitError: "Не удалось отправить запрос",
    cancelSuccess: "Запрос тренера отменён",
    participantCancelSuccess: "Запрос отменён",
    cancelError: "Не удалось отменить запрос",
    participantLevel: "Уровень участников",
    unspecified: "Не указан",
    goalLabel: "Что должен сделать тренер",
    goalPlaceholder: "Например: провести разминку и помочь новичкам с правилами",
    coachRole: "Sport Coach",
  },
  en: {
    ariaLabel: "Coach",
    title: "Coach",
    description: "A coach can lead the warm-up, explain the rules, and support beginners.",
    requested: "Coach requested",
    participantWanted: "You want a coach",
    participantCount: "participants want a coach",
    organizerButton: "Request a coach",
    participantButton: "I want a coach",
    disabledButton: "Request sent",
    loadingButton: "Sending...",
    unavailableButton: "Unavailable",
    organizerCancelButton: "No longer needed",
    participantCancelButton: "Cancel request",
    loadError: "Could not load coach information",
    submitSuccess: "Coach requested",
    participantSuccess: "You want a coach",
    submitError: "Could not send the request",
    cancelSuccess: "Coach request cancelled",
    participantCancelSuccess: "Request cancelled",
    cancelError: "Could not cancel the request",
    participantLevel: "Participant level",
    unspecified: "Not specified",
    goalLabel: "What should the coach do",
    goalPlaceholder: "For example: lead the warm-up and help beginners with the rules",
    coachRole: "Sport Coach",
  },
};

export const coachLevelOptions = (locale: CoachPanelLocale): Array<{ value: SportLevel; label: string }> => locale === "en"
  ? [
      { value: "beginner", label: "Beginner" },
      { value: "intermediate", label: "Intermediate" },
      { value: "advanced", label: "Advanced" },
    ]
  : [
      { value: "beginner", label: "Новички" },
      { value: "intermediate", label: "Средний уровень" },
      { value: "advanced", label: "Продвинутые" },
    ];

export const coachStatusLabel = (status: CoachRequest["status"], locale: CoachPanelLocale) => {
  const labels: Record<CoachPanelLocale, Record<CoachRequest["status"], string>> = {
    ru: {
      pending: "ожидает подтверждения",
      matched: "тренер найден",
      confirmed: "тренер подтверждён",
      completed: "завершено",
      rejected: "отклонено",
      cancelled: "отменено",
    },
    en: {
      pending: "awaiting confirmation",
      matched: "coach found",
      confirmed: "coach confirmed",
      completed: "completed",
      rejected: "rejected",
      cancelled: "cancelled",
    },
  };

  return labels[locale][status];
};

export const coachActionLabel = ({
  locale,
  loading,
  requestAvailable,
  hasActiveRequest,
  canManage,
}: {
  locale: CoachPanelLocale;
  loading: boolean;
  requestAvailable: boolean;
  hasActiveRequest: boolean;
  canManage: boolean;
}) => {
  const copy = coachPanelCopy[locale];
  if (loading) return copy.loadingButton;
  if (!requestAvailable) return copy.unavailableButton;
  if (hasActiveRequest) return copy.disabledButton;
  return canManage ? copy.organizerButton : copy.participantButton;
};
