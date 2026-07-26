import { getTelegramWebApp } from "./telegram";

export type ExternalTelegramChatKind = "event" | "team";
export type ExternalTelegramChatLifecycle = "active" | "locked" | "deletion_due" | "archived";

export type ExternalTelegramChatLink = {
  kind: ExternalTelegramChatKind;
  url: string;
  attachedByUserKey: string;
  attachedAt: string;
  keepArchive?: boolean;
};

type ChatAccessInput = {
  currentUserKey: string | null | undefined;
  organizerUserKey: string;
  membershipStatus?: "joined" | "waiting" | "pending" | null;
};

type LifecycleInput = {
  kind: ExternalTelegramChatKind;
  eventEndsAt?: string | null;
  keepArchive?: boolean;
  now?: Date;
};

const allowedHosts = new Set(["t.me", "telegram.me", "www.t.me", "www.telegram.me"]);
const validPath = /^\/(?:joinchat\/[-_A-Za-z0-9]+|\+[-_A-Za-z0-9]+|[A-Za-z0-9_]{5,})(?:\/\d+)?\/?$/;

export const normalizeExternalTelegramChatUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" || !allowedHosts.has(parsed.hostname.toLowerCase())) return null;
    if (parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash) return null;
    if (!validPath.test(parsed.pathname)) return null;

    const path = parsed.pathname.replace(/\/$/, "");
    return `https://t.me${path}`;
  } catch {
    return null;
  }
};

export const isValidExternalTelegramChatUrl = (value: string) =>
  normalizeExternalTelegramChatUrl(value) !== null;

export const canAccessExternalTelegramChat = ({
  currentUserKey,
  organizerUserKey,
  membershipStatus,
}: ChatAccessInput) => Boolean(
  currentUserKey
  && (currentUserKey === organizerUserKey || membershipStatus === "joined")
);

export const resolveExternalTelegramChatLifecycle = ({
  kind,
  eventEndsAt,
  keepArchive = false,
  now = new Date(),
}: LifecycleInput): ExternalTelegramChatLifecycle => {
  if (kind === "team") return "active";
  if (!eventEndsAt) return "active";

  const eventEnd = new Date(eventEndsAt).getTime();
  if (!Number.isFinite(eventEnd)) return "active";

  const elapsed = now.getTime() - eventEnd;
  if (elapsed < 24 * 60 * 60 * 1000) return "active";
  if (keepArchive) return "archived";
  if (elapsed < 7 * 24 * 60 * 60 * 1000) return "locked";
  return "deletion_due";
};

type OpenDependencies = {
  openTelegramLink?: (url: string) => void;
  openBrowser?: (url: string) => void;
};

export const openExternalTelegramChat = (
  value: string,
  dependencies: OpenDependencies = {},
) => {
  const url = normalizeExternalTelegramChatUrl(value);
  if (!url) return false;

  const telegramOpen = dependencies.openTelegramLink || getTelegramWebApp()?.openTelegramLink;
  if (telegramOpen) {
    telegramOpen(url);
    return true;
  }

  const browserOpen = dependencies.openBrowser || ((target: string) => {
    window.open(target, "_blank", "noopener,noreferrer");
  });
  browserOpen(url);
  return true;
};
