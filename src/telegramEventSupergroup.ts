import { supabase } from "./supabase";
import { getTelegramWebApp } from "./telegram";

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

export const openEventSupergroupBinding = (
  startGroupUrl: string,
  dependencies: {
    openTelegramLink?: (url: string) => void;
    openBrowser?: (url: string) => void;
  } = {},
) => {
  if (!isSupportedStartGroupUrl(startGroupUrl)) return false;
  const telegramOpen = dependencies.openTelegramLink || getTelegramWebApp()?.openTelegramLink;
  if (telegramOpen) {
    telegramOpen(startGroupUrl);
    return true;
  }
  if (!dependencies.openBrowser && typeof window === "undefined") return false;
  const browserOpen = dependencies.openBrowser || ((url: string) => window.open(url, "_blank", "noopener,noreferrer"));
  browserOpen(startGroupUrl);
  return true;
};
