import { supabase } from "./supabase";

export type EventSupergroupBinding = {
  startGroupUrl: string;
  expiresAt: string;
};

const isSupportedStartGroupUrl = (value: unknown): value is string => {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.hostname === "t.me"
      && /^\/[A-Za-z0-9_]{5,}$/.test(url.pathname)
      && /^[A-Za-z0-9_-]{20,64}$/.test(url.searchParams.get("startgroup") || "");
  } catch {
    return false;
  }
};

export const createEventSupergroupBinding = async (
  activityId: string,
): Promise<EventSupergroupBinding> => {
  if (!activityId) throw new Error("activity_id_required");

  const { data, error } = await supabase.functions.invoke("telegramEventSupergroup", {
    body: { action: "create_binding", activityId },
  });
  if (error) throw error;

  const startGroupUrl = data?.startGroupUrl;
  const expiresAt = data?.expiresAt;
  if (!isSupportedStartGroupUrl(startGroupUrl) || typeof expiresAt !== "string") {
    throw new Error("invalid_supergroup_binding_response");
  }

  return { startGroupUrl, expiresAt };
};
