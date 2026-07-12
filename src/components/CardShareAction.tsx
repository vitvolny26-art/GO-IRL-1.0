import { useState } from "react";
import { Share2 } from "lucide-react";

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
] as const;

export function CardShareAction({ title, date, address, url, label }: CardShareActionProps) {
  const [open, setOpen] = useState(false);
  const message = [`GO IRL: ${title}`, date, address].filter(Boolean).join("\n");
  const messageWithUrl = `${message}\n${url}`;

  const share = (channel: typeof channels[number]["id"]) => {
    const encodedUrl = encodeURIComponent(url);
    const encodedMessage = encodeURIComponent(message);
    const encodedWithUrl = encodeURIComponent(messageWithUrl);
    const target = channel === "telegram"
      ? `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`
      : channel === "whatsapp"
        ? `https://wa.me/?text=${encodedWithUrl}`
        : channel === "messenger"
          ? `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
          : `viber://forward?text=${encodedWithUrl}`;

    setOpen(false);
    window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <span className="card-share-action">
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
        <Share2 size={20} aria-hidden="true" />
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
                share(channel.id);
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
