import type { CoachProfile, CoachRequest } from "./types";

export const demoCoachProfile: CoachProfile = {
  id: "demo-coach-alex",
  userKey: "demo-coach-alex-user",
  displayName: "Alex",
  city: "Olomouc",
  bio: "Sport Coach who helps with warm-up, basic rules, and beginner confidence.",
  sports: ["volleyball", "running"],
  languages: ["cs", "en", "ru"],
  priceCurrency: "CZK",
  isVerified: false,
  isActive: true,
  ratingAvg: 0,
  ratingCount: 0,
  ratingWeighted: 0,
  createdAt: "2026-07-18T00:00:00.000Z",
  updatedAt: "2026-07-18T00:00:00.000Z",
};

export const attachDemoCoachProfile = (request: CoachRequest): CoachRequest =>
  request.requestType === "organizer_request" && request.status === "confirmed"
    ? { ...request, coachProfileId: demoCoachProfile.id }
    : request;

export const resolveDemoCoachProfile = (request?: Pick<CoachRequest, "coachProfileId">) =>
  request?.coachProfileId === demoCoachProfile.id ? demoCoachProfile : null;
