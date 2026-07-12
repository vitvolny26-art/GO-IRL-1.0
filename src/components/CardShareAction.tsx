import { useEffect, useId, useRef, useState } from "react";
import { Share2 } from "lucide-react";
import { buildCardShareTarget, type CardShareChannel } from "../share/card-share-targets";

type CardShareActionProps = {
  title: string;
  date: string;
  address: string;
  url: string;
  label: string;
};

const channels = [
  { id: "telegram", label: "Telegram", icon: "/icons/telegram.svg" },
  { id: "whatsapp", label: "WhatsApp", icon: "/icons/whatsapp.svg" },
  { id: "messenger", label: "Messenger", icon: "/icons/messenger.svg" },
  { id: "viber", label: "Viber", icon: "/icons/viber.svg" },
] as const satisfies ReadonlyArray<{ id: CardShareChannel; label: string; icon: string }>;

export function CardShareAction({ title, date, address, url, label }: CardShareActionProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");
  const rootRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const firstChannelRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    firstChannelRef.current?.focus();
    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const share = async (channel: CardShareChannel) => {
    const target = buildCardShareTarget(channel, { title, date, address, url });
    setOpen(false);
    const opened = window.open(target, "_blank", "noopener,noreferrer");
    if (opened) return;

    try {
      await navigator.clipboard.writeText(url);
      setStatus("Ссылка скопирована");
    } catch {
      setStatus("Не удалось открыть приложение");
    }
  };

  return (
    <span className="card-share-action" ref={rootRef}>
      <button
        ref={triggerRef}
        className="sport-card-icon-action"
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((current) => !current);
        }}
      >
        <Share2 size={20} aria-hidden="true" />
      </button>
      {open ? (
        <span className="card-share-channel-list" id={menuId} role="menu" aria-label={label}>
          {channels.map((channel, index) => (
            <button
              ref={index === 0 ? firstChannelRef : undefined}
              key={channel.id}
              type="button"
              role="menuitem"
              aria-label={channel.label}
              data-channel={channel.id}
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
      <span className="card-share-status" aria-live="polite">{status}</span>
    </span>
  );
}
