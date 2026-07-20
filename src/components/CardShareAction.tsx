import { useEffect, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { buildCardShareTarget, buildCardShareText } from "../cardShare";
import { openTelegramShareTarget } from "../cardShareNavigation";
import type { PreparedTelegramShareResult } from "../telegramPreparedShare";

type CardShareActionProps = {
  title: string;
  date: string;
  address: string;
  url: string;
  label: string;
  onTelegramShare?: () => Promise<PreparedTelegramShareResult>;
};

type ShareChannel = "telegram" | "messenger" | "native";

type TelegramWindow = Window & {
  Telegram?: {
    WebApp?: {
      openLink?: (url: string) => void;
    };
  };
};

const channels = [
  { id: "telegram", label: "Telegram", icon: "/icons/telegram.svg" },
  { id: "messenger", label: "Messenger", icon: "/icons/messenger.svg" },
  { id: "native", label: "Поделиться", icon: null },
] as const;

export function CardShareAction({ title, date, address, url, label, onTelegramShare }: CardShareActionProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const content = { title, date, address, url };

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

  const copyShareText = async (shareUrl = url) => {
    try {
      await navigator.clipboard.writeText(buildCardShareText({ ...content, url: shareUrl }));
    } catch {
      // Clipboard access may be unavailable inside some embedded browsers.
    }
  };

  const share = async (channel: ShareChannel) => {
    setOpen(false);

    if (channel === "telegram") {
      if (onTelegramShare) {
        const result = await onTelegramShare();
        if (result === "shared" || result === "cancelled") return;
      }
      openTelegramShareTarget(buildCardShareTarget(channel, content));
      return;
    }

    if (channel === "messenger") {
      const sharePayload = {
        title: `GO IRL: ${title}`,
        text: [date, address].filter(Boolean).join("\n"),
        url,
      };

      if (/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        if (navigator.share) {
          try {
            await navigator.share(sharePayload);
            return;
          } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") return;
          }
        }
        const messengerTarget = buildCardShareTarget(channel, content);
        const telegramWebApp = (window as TelegramWindow).Telegram?.WebApp;
        if (telegramWebApp?.openLink) {
          telegramWebApp.openLink(messengerTarget);
          return;
        }
        window.open(messengerTarget, "_blank", "noopener,noreferrer");
        return;
      }

      window.open(buildCardShareTarget(channel, content), "_blank", "noopener,noreferrer");
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: `GO IRL: ${title}`,
          text: [date, address].filter(Boolean).join("\n"),
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    await copyShareText();
  };

  return (
    <span className="card-share-action" ref={rootRef}>
      <button
        className="sport-card-icon-action"
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
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
    </span>
  );
}
