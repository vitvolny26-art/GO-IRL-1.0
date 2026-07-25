import { useEffect, useRef, useState } from "react";
import { buildMapProviderUrl } from "../mapProvider";
import {
  mapProviderPickerEvent,
  type MapProviderPickerRequest,
} from "../mapProviderPicker";
import {
  readUserPreferences,
  updateUserPreferences,
  type MapProvider,
} from "../userPreferences";
import type { Language } from "../types";

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const defaultDeviceProvider = (): MapProvider => {
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";
  return /iPhone|iPad|iPod|Mac/i.test(`${platform} ${userAgent}`) ? "apple" : "google";
};

const DeviceMapsMark = ({ provider }: { provider: MapProvider }) =>
  provider === "apple" ? (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="3" width="26" height="26" rx="7" fill="#f5f5f7" />
      <path d="M8 23.5V8.5l6-2.5 5 2.5 5-2.5v15l-5 2.5-5-2.5-6 2.5Z" fill="#ffffff" stroke="#3a3a3c" strokeWidth="1.2" />
      <path d="M14 6v15M19 8.5v15" stroke="#34c759" strokeWidth="2.2" />
      <path d="M8 14.5 14 12l5 2.5 5-2.5" stroke="#0a84ff" strokeWidth="2" fill="none" />
      <circle cx="19" cy="14.5" r="2.2" fill="#ff3b30" />
    </svg>
  ) : (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3.5a9.5 9.5 0 0 0-9.5 9.5c0 7.2 9.5 15.5 9.5 15.5S25.5 20.2 25.5 13A9.5 9.5 0 0 0 16 3.5Z" fill="#34a853" />
      <path d="M16 3.5A9.5 9.5 0 0 0 7.7 8.4l8.3 4.8 8.3-4.8A9.5 9.5 0 0 0 16 3.5Z" fill="#4285f4" />
      <path d="m7.7 8.4 8.3 4.8-4.8 8.3C8.5 18.4 6.5 15.3 6.5 13c0-1.7.4-3.2 1.2-4.6Z" fill="#fbbc04" />
      <path d="m24.3 8.4-8.3 4.8 4.8 8.3c2.7-3.1 4.7-6.2 4.7-8.5 0-1.7-.4-3.2-1.2-4.6Z" fill="#ea4335" />
      <circle cx="16" cy="13" r="3.4" fill="#ffffff" />
      <circle cx="16" cy="13" r="1.8" fill="#4285f4" />
    </svg>
  );

const MapyMark = () => (
  <svg viewBox="0 0 32 32" aria-hidden="true">
    <rect x="3" y="3" width="26" height="26" rx="8" fill="#b8ff2c" />
    <path d="M9 22V10h3.2l3.8 5.2 3.8-5.2H23v12h-3.2v-7.1L16 20l-3.8-5.1V22H9Z" fill="#111318" />
  </svg>
);

const labels: Record<Language, { menu: string; device: string; mapy: string }> = {
  ru: {
    menu: "Выбор приложения карты",
    device: "Открыть в картах устройства",
    mapy: "Открыть в Mapy.com",
  },
  uk: {
    menu: "Вибір застосунку мап",
    device: "Відкрити в мапах пристрою",
    mapy: "Відкрити в Mapy.com",
  },
  cs: {
    menu: "Výběr mapové aplikace",
    device: "Otevřít v mapách zařízení",
    mapy: "Otevřít v Mapy.com",
  },
  en: {
    menu: "Choose map application",
    device: "Open in device maps",
    mapy: "Open in Mapy.com",
  },
};

type MenuPosition = {
  top: number;
  left: number;
};

const menuWidth = 142;
const menuHeight = 76;
const viewportPadding = 12;

const resolveMenuPosition = (x: number, y: number): MenuPosition => {
  const left = Math.min(
    Math.max(viewportPadding, x - menuWidth / 2),
    window.innerWidth - menuWidth - viewportPadding,
  );
  const preferredTop = y - menuHeight - 14;
  const top = preferredTop >= viewportPadding ? preferredTop : y + 14;
  return { top, left };
};

export function MapProviderPickerPortal() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [position, setPosition] = useState<MenuPosition>({ top: 76, left: 16 });
  const menuRef = useRef<HTMLElement>(null);
  const lastPointer = useRef({ x: window.innerWidth - 72, y: 124 });
  const language = readUserPreferences().language || "ru";
  const copy = labels[language];
  const deviceProvider = defaultDeviceProvider();

  useEffect(() => {
    const rememberPointer = (event: PointerEvent) => {
      lastPointer.current = { x: event.clientX, y: event.clientY };
    };

    const handleRequest = (event: Event) => {
      const request = event as CustomEvent<MapProviderPickerRequest>;
      const nextSourceUrl = request.detail?.sourceUrl?.trim();
      if (!nextSourceUrl) return;

      const savedProvider = readUserPreferences().mapProvider;
      if (savedProvider) {
        openUrl(buildMapProviderUrl(nextSourceUrl, savedProvider));
        return;
      }

      setPosition(resolveMenuPosition(lastPointer.current.x, lastPointer.current.y));
      setSourceUrl(nextSourceUrl);
    };

    document.addEventListener("pointerdown", rememberPointer, true);
    window.addEventListener(mapProviderPickerEvent, handleRequest);
    return () => {
      document.removeEventListener("pointerdown", rememberPointer, true);
      window.removeEventListener(mapProviderPickerEvent, handleRequest);
    };
  }, []);

  useEffect(() => {
    if (!sourceUrl) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setSourceUrl("");
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSourceUrl("");
    };
    const closeOnViewportChange = () => setSourceUrl("");

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [sourceUrl]);

  if (!sourceUrl) return null;

  const chooseProvider = (provider: MapProvider) => {
    updateUserPreferences({ mapProvider: provider });
    openUrl(buildMapProviderUrl(sourceUrl, provider));
    setSourceUrl("");
  };

  return (
    <div className="map-provider-picker-backdrop">
      <section
        ref={menuRef}
        className="map-provider-picker-sheet"
        data-map-provider-choice
        role="menu"
        aria-label={copy.menu}
        style={{ top: position.top, left: position.left }}
      >
        <button
          type="button"
          role="menuitem"
          aria-label={copy.device}
          title={copy.device}
          onClick={() => chooseProvider(deviceProvider)}
        >
          <DeviceMapsMark provider={deviceProvider} />
        </button>
        <button
          type="button"
          role="menuitem"
          aria-label={copy.mapy}
          title={copy.mapy}
          onClick={() => chooseProvider("mapy")}
        >
          <MapyMark />
        </button>
      </section>
    </div>
  );
}
