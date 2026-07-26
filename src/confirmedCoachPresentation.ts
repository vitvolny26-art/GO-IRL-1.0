import type { CoachRequest } from "./types";

export type ConfirmedCoachPresentation = {
  requestId: string;
  coachProfileId: string | null;
  title: string;
  supportCopy: string;
};

const isConfirmedOrganizerCoach = (request: CoachRequest) =>
  request.requestType === "organizer_request" && request.status === "confirmed";

export const resolveConfirmedCoachPresentation = (
  requests: CoachRequest[],
): ConfirmedCoachPresentation | null => {
  const request = requests.find(isConfirmedOrganizerCoach);
  if (!request) return null;

  return {
    requestId: request.id,
    coachProfileId: request.coachProfileId || null,
    title: "Тренер подтверждён",
    supportCopy: "Поможет с разминкой, правилами и поддержит новичков перед началом активности.",
  };
};
