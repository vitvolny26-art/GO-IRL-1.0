import {
  browserMockDisplayName,
  browserMockUserKey,
  getCurrentAuthSession,
  initializeTrustedAuth,
  isBrowserMockMode,
  isTrustedAuthReady,
  readAuthDisplayName,
  readAuthUserKey,
} from "./authSession";
import { supabase } from "./supabase";
import type { ActivityChat, ActivityChatMessage } from "./types";

const demoChatStorageKey = "go-irl-demo-activity-chat-v1";

type DemoChatState = {
  chats: ActivityChat[];
  messages: ActivityChatMessage[];
};

const isActivityChatDemoMode = () =>
  typeof window !== "undefined" &&
  (isBrowserMockMode() || (/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname) && !isTrustedAuthReady()));

const readDemoChatState = (): DemoChatState => {
  try {
    return JSON.parse(localStorage.getItem(demoChatStorageKey) || "{\"chats\":[],\"messages\":[]}") as DemoChatState;
  } catch {
    return { chats: [], messages: [] };
  }
};

const writeDemoChatState = (state: DemoChatState) => {
  localStorage.setItem(demoChatStorageKey, JSON.stringify(state));
};

const demoChatExpiry = () => new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

export async function getCurrentChatIdentity() {
  if (isActivityChatDemoMode()) {
    return { userKey: browserMockUserKey, displayName: browserMockDisplayName };
  }

  const existing = getCurrentAuthSession();
  const existingUserKey = readAuthUserKey(existing);

  if (existingUserKey) {
    return {
      userKey: existingUserKey,
      displayName: readAuthDisplayName(existing),
    };
  }

  const identity = await initializeTrustedAuth();

  return {
    userKey: readAuthUserKey(identity),
    displayName: readAuthDisplayName(identity),
  };
}

export async function ensureActivityChat(activityId: string) {
  if (isActivityChatDemoMode()) {
    const state = readDemoChatState();
    const existing = state.chats.find((chat) => chat.activityId === activityId);
    if (existing) return existing.id;

    const now = new Date().toISOString();
    const chat: ActivityChat = {
      id: `demo-chat-${activityId}`,
      activityId,
      createdByUserKey: browserMockUserKey,
      status: "active",
      expiresAt: demoChatExpiry(),
      createdAt: now,
      updatedAt: now,
    };

    state.chats.push(chat);
    writeDemoChatState(state);
    return chat.id;
  }

  const { data, error } = await supabase.rpc("go_irl_ensure_activity_chat", {
    p_activity_id: activityId,
  });

  if (error) throw error;

  return data as string;
}

export async function loadActivityChat(activityId: string) {
  if (isActivityChatDemoMode()) {
    const state = readDemoChatState();
    return state.chats.find((chat) => chat.activityId === activityId) || null;
  }

  const { data, error } = await supabase
    .from("activity_chats")
    .select("*")
    .eq("activity_id", activityId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    activityId: data.activity_id,
    createdByUserKey: data.created_by_user_key,
    status: data.status,
    expiresAt: data.expires_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  } as ActivityChat;
}

export async function loadActivityChatMessages(activityId: string) {
  if (isActivityChatDemoMode()) {
    const state = read