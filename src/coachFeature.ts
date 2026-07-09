import { initializeTrustedAuth, getCurrentAuthSession, isTrustedAuthReady } from "./authSession";
import { supabase } from "./supabase";
import type { Activity, CoachRequest, CoachRequestType } from "./types";

type AuthLike = {
  user?: {
    userKey?: string;
  };
  userKey?: string;
};

const readAuthUserKey = (identity: unknown) => {
  const auth = identity as AuthLike | null;
  return auth?.user?.userKey || auth?.userKey || null;
};

const demoUserKey = "telegram:999999";
const demoCoachStorageKey = "go-irl-demo-coach-requests-v1";

const isBrowserDemoMode = () =>
  typeof window !== "undefined" &&
  /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) &&
  !isTrustedAuthReady();

const readDemoCoachRequests = () => {
  try {
    return JSON.parse(localStorage.getItem(demoCoachStorageKey) || "[]") as CoachRequest[];
  } catch {
    return [] as CoachRequest[];
  }
};

const writeDemoCoachRequests = (requests: CoachRequest[]) => {
  localStorage.setItem(demoCoachStorageKey, JSON.stringify(requests));
};

const isConfirmedOrganizerCoachRequest = (request: CoachRequest) =>
  request.requestType === "organizer_request" && request.status === "confirmed";

export async function getCurrentCoachUserKey() {
  if (isBrowserDemoMode()) return demoUserKey;

  const existing = getCurrentAuthSession();
  const existingKey = readAuthUserKey(existing);
  if (existingKey) return existingKey;

  const identity = await initializeTrustedAuth();
  return readAuthUserKey(identity);
}

export async function loadCoachRequestsForActivity(activityId: string) {
  if (isBrowserDemoMode()) {
    return readDemoCoachRequests().filter((request) => request.activityId === activityId);
  }

  const { data, error } = await supabase
    .from("coach_requests")
    .select("*")
    .eq("activity_id", activityId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || []).map((row) => ({
    id: row.id,
    activityId: row.activity_id,
    requesterUserKey: row.requester_user_key,
    coachProfileId: row.coach_profile_id,
    requestType: row.request_type,
    sportType: row.sport_type,
    goal: row.goal,
    level: row.level,
    budgetMin: row.budget_min,
    budgetMax: row.budget_max,
    paymentMode: row.payment_mode,
    status: row.status,
    adminNote: row.admin_note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })) as CoachRequest[];
}

export async function hasConfirmedCoachForActivity(activityId: string) {
  const requests = await loadCoachRequestsForActivity(activityId);
  return requests.some(isConfirmedOrganizerCoachRequest);
}

export async function requestCoachForActivity(
  activity: Activity,
  requestType: CoachRequestType,
) {
  const userKey = await getCurrentCoachUserKey();

  if (!userKey) {
    throw new Error("auth_required");
  }

  if (isBrowserDemoMode()) {
    const requests = readDemoCoachRequests();
    const now = new Date().toISOString();
    const id = `demo-coach-${activity.id}-${userKey}-${requestType}`;
    const next: CoachRequest = {
      id,
      activityId: activity.id,
      requesterUserKey: userKey,
      requestType,
      sportType: activity.categoryId || "sport",
      level: undefined,
      paymentMode: "split",
      status: requestType === "organizer_request" ? "confirmed" : "pending",
      createdAt: requests.find((request) => request.id === id)?.createdAt || now,
      updatedAt: now,
    };

    writeDemoCoachRequests([
      next,
      ...requests.filter((request) => request.id !== id),
    ]);
    return;
  }

  const { error } = await supabase
    .from("coach_requests")
    .upsert({
      activity_id: activity.id,
      requester_user_key: userKey,
      request_type: requestType,
      sport_type: activity.categoryId || "sport",
      level: null,
      payment_mode: "split",
      status: "pending",
    }, {
      onConflict: "activity_id,requester_user_key,request_type",
      ignoreDuplicates: false,
    });

  if (error) throw error;
}

export async function cancelCoachRequest(requestId: string) {
  if (isBrowserDemoMode()) {
    const requests = readDemoCoachRequests();
    writeDemoCoachRequests(requests.map((request) =>
      request.id === requestId ? { ...request, status: "cancelled", updatedAt: new Date().toISOString() } : request,
    ));
    return;
  }

  const { error } = await supabase
    .from("coach_requests")
    .update({ status: "cancelled", updated_at: new Date().toISOString() })
    .eq("id", requestId);

  if (error) throw error;
}
