import { useEffect, useRef, useState } from "react";
import { Forward } from "lucide-react";
import { buildCardShareTarget, buildCardShareText, type CardShareChannel } from "../cardShare";
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

const channels = [
  { id: "telegram", label: "Telegram", icon: "/icons/telegram.svg" },
  { id: "whatsapp", label: "WhatsApp", icon: "/icons/whatsapp.svg" },
  { id: "messenger", label: "Messenger", icon: "/icons/messenger.svg" },
  { id: "instagram", label: "Instagram", icon: "/icons/instagram.svg" },
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

  const share = async (channel: CardShareChannel) => {
    setOpen(false);
    if (channel === "telegram") {
      if (onTelegramShare) {
        const result = await onTelegramShare();
        if (result === "shared" || result === "cancelled") return;
      }
      openTelegramShareTarget(buildCardShareTarget(channel, content));
      return;
    }
    if (channel === "instagram") {
      const message = buildCardShareText(content);
      try {
        await navigator.clipboard.writeText(message);
      } catch {
        // Instagram has no supported web URL for prefilled shares; opening Direct still gives a useful fallback.
      }
      window.open("https://www.instagram.com/direct/inbox/", "_blank", "noopener,noreferrer");
      return;
    }
    window.open(buildCardShareTarget(channel, content), "_blank", "noopener,noreferrer");
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
        <Forward size={32} strokeWidth={2.2} aria-hidden="true" />
      </button>
      {open ? (
        <span className="card-share-channel-list" role="menu" aria-label={label}>
          {channels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              role="menuitem"
              aria-label={channel.label}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                void share(channel.id);
              }}
            >
              <span className="card-share-icon-circle">
                <img src={channel.icon} alt="" decoding="async" />
              </span>
            </button>
          ))}
        </span>
      ) : null}
    </span>
  );
}
