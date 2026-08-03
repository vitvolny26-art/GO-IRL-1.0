import { useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import {
  buildCardShareTarget,
  buildOrganicCardShareContent,
  buildCardShareText,
} from "../cardShare";
import {
  openExternalShareTarget,
  openMessengerShareTarget,
  openTelegramShareTarget,
} from "../cardShareNavigation";
import type { PreparedTelegramShareResult } from "../telegramPreparedShare";
import { canPrepareBeautyTelegramShare, sharePreparedTelegramBeauty } from "../telegramPreparedBeautyShare";
import type { Language } from "../types";
import { readUserPreferences, type ShareProvider } from "../userPreferences";
import { getCurrentChatIdentity, loadActivityChatMessages } from "../activityChatFeature";
import {
  activityChatUnreadChangedEvent,
  countUnreadActivityChatMessages,
  loadActivityChatReadAt,
} from "../activityChatUnread";
import { activityIdFromInviteUrl, canShowEventCardUnread } from "../cardChatUnread";
import { useAppStore } from "../store";
import "./card-chat-unread.css";

type CardShareActionProps = {
  title: string;
  date: string;
  address: string;
  url: string;
  label: string;
  onTelegramShare?: () => Promise<PreparedTelegramShareResult>;
};

type ShareChannel = ShareProvider | "facebook" | "native";
type ShareNotice = "copied" | "instagramCopied" | "copyFailed";
type ActivityChatUnreadChangedDetail = { activityId?: string };

const channels: Array<{ id: ShareChannel; label: string; icon: string | null }> = [
  { id: "telegram", label: "Telegram", icon: "/icons/telegram.svg" },
  { id: "facebook", label: "Facebook", icon: "/icons/facebook.svg" },
  { id: "messenger", label: "Messenger", icon: "/icons/messenger.svg" },
  { id: "whatsapp", label: "WhatsApp", icon: "/icons/whatsapp.svg" },
  { id: "instagram", label: "Instagram", icon: "/icons/instagram.svg" },
  { id: "native", label: "Поделиться", icon: null },
];

const shareNotices: Record<Language, Record<ShareNotice, string>> = {
  ru: {
    copied: "Приглашение скопировано",
    instagramCopied: "Приглашение скопировано — вставьте его в Instagram",
    copyFailed: "Не удалось скопировать приглашение",
  },
  uk: {
    copied: "Запрошення скопійовано",
    instagramCopied: "Запрошення скопійовано — вставте його в Instagram",
    copyFailed: "Не вдалося скопіювати запрошення",
  },
  cs: {
    copied: "Pozvánka byla zkopírována",
    instagramCopied: "Pozvánka byla zkopírována — vložte ji do Instagramu",
    copyFailed: "Pozvánku se nepodařilo zkopírovat",
  },
  en: {
    copied: "Invitation copied",
    instagramCopied: "Invitation copied — paste it into Instagram",
    copyFailed: "Could not copy the invitation",
  },
};

export function CardShareAction({ title, date, address, url, label, onTelegramShare }: CardShareActionProps) {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [shareNotice, setShareNotice] = useState("");
  const rootRef = useRef<HTMLSpanElement>(null);
  const shareNoticeTimerRef = useRef<number | null>(null);
  const content = { title, date, address, url };
  const activityId = useMemo(() => activityIdFromInviteUrl(url), [url]);
  const joinedIds = useAppStore((state) => state.joinedIds);
  const language = useAppStore((state) => state.language);
  const canAccessChat = Boolean(activityId && joinedIds.includes(activityId));
  const showUnread = canShowEventCardUnread(activityId, joinedIds, unreadCount);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => () => {
    if (shareNoticeTimerRef.current !== null) window.clearTimeout(shareNoticeTimerRef.current);
  }, []);

  useEffect(() => {
    let active = true;

    const refreshUnread = async () => {
      if (!canAccessChat || !activityId) {
        if (active) setUnreadCount(0);
        return;
      }

      try {
        const [identity, messages] = await Promise.all([
          getCurrentChatIdentity(),
          loadActivityChatMessages(activityId),
        ]);
        const lastReadAt = loadActivityChatReadAt(activityId, identity.userKey);
        const nextUnreadCount = countUnreadActivityChatMessages(messages, identity.userKey, lastReadAt);
        if (active) setUnreadCount(nextUnreadCount);
      } catch {
        if (active) setUnreadCount(0);
      }
    };

    const handleUnreadChanged = (event: Event) => {
      const detail = (event as CustomEvent<ActivityChatUnreadChangedDetail>).detail;
      if (detail?.activityId && detail.activityId !== activityId) return;
      void refreshUnread();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshUnread();
    };

    void refreshUnread();
    window.addEventListener(activityChatUnreadChangedEvent, handleUnreadChanged);
    window.addEventListener("focus", refreshUnread);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.removeEventListener(activityChatUnreadChangedEvent, handleUnreadChanged);
      window.removeEventListener("focus", refreshUnread);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activityId, canAccessChat]);

  const clearShareNotice = () => {
    if (shareNoticeTimerRef.current !== null) {
      window.clearTimeout(shareNoticeTimerRef.current);
      shareNoticeTimerRef.current = null;
    }
    setShareNotice("");
  };

  const showShareNotice = (notice: ShareNotice) => {
    clearShareNotice();
    setShareNotice(shareNotices[language][notice]);
    shareNoticeTimerRef.current = window.setTimeout(() => {
      setShareNotice("");
      shareNoticeTimerRef.current = null;
    }, 5000);
  };

  const copyShareText = async (shareUrl = url) => {
    const shareText = buildCardShareText({ ...content, url: shareUrl });
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareText;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      try {
        textarea.select();
        return document.execCommand("copy");
      } catch {
        return false;
      } finally {
        textarea.remove();
      }
    }
  };

  const share = async (channel: ShareChannel) => {
    setOpen(false);
    clearShareNotice();

    if (channel === "telegram") {
      if (onTelegramShare) {
        const result = await onTelegramShare();
        if (result === "shared" || result === "cancelled") return;
      } else if (canPrepareBeautyTelegramShare(url)) {
        const result = await sharePreparedTelegramBeauty(url, date, language);
        if (result === "shared" || result === "cancelled") return;
      }
      openTelegramShareTarget(buildCardShareTarget(channel, content));
      return;
    }

    if (channel === "facebook" || channel === "whatsapp") {
      openExternalShareTarget(buildCardShareTarget(channel, content));
      return;
    }

    if (channel === "messenger") {
      openMessengerShareTarget(content);
      return;
    }

    const organicContent = buildOrganicCardShareContent(content);
    if (channel === "instagram") {
      const copied = await copyShareText(organicContent.url);
      showShareNotice(copied ? "instagramCopied" : "copyFailed");
      openExternalShareTarget("https://www.instagram.com/");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share(organicContent);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    const copied = await copyShareText(organicContent.url);
    showShareNotice(copied ? "copied" : "copyFailed");
  };

  const activate = () => {
    const preferred = readUserPreferences().shareProvider;
    if (preferred) {
      void share(preferred);
      return;
    }
    setOpen((current) => !current);
  };

  const openUnreadChat = () => {
    const card = rootRef.current?.closest("article");
    const chatAction = card?.querySelector<HTMLButtonElement>(".compact-sport-actions .sport-coach-action");
    if (!chatAction) return;
    setUnreadCount(0);
    chatAction.click();
  };

  return (
    <span className="card-share-action" ref={rootRef}>
      {showUnread ? (
        <button
          className="event-chat-unread-alert"
          type="button"
          aria-label={`Непрочитанные сообщения: ${unreadCount}`}
          title="Открыть непрочитанные сообщения"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            openUnreadChat();
          }}
        >
          <MessageCircle size={18} aria-hidden="true" />
          <span>{unreadCount > 99 ? "99+" : unreadCount}</span>
        </button>
      ) : null}
      <button
        className="sport-card-icon-action"
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          activate();
        }}
      >
        <svg className="card-share-forward-icon" viewBox="8 12 50 36" aria-hidden="true">
          <path d="M10 45C16 30 27 23 42 23V13L56 28 42 43V33C29 33 20 37 10 45Z" />
        </svg>
      </button>
      {open ? (
        <span className="card-share-channel-list" role="menu" aria-label={label}>
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              role="menuitem"
              aria-label={channel.label}
              title={channel.label}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void share(channel.id);
              }}
            >
              <span className="card-share-icon-circle">
                {channel.icon
                  ? <img src={channel.icon} alt="" decoding="async" />
                  : <Share2 size={28} aria-hidden="true" />}
              </span>
            </button>
          ))}
        </span>
      ) : null}
      {shareNotice ? (
        <span className="card-share-status" role="status" aria-live="polite">
          {shareNotice}
        </span>
      ) : null}
    </span>
  );
}
