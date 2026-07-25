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

const providerSprite = "/assets/providers/map-provider-marks.svg";

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const defaultDeviceProvider = (): MapProvider => {
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";
  return /iPhone|iPad|iPod|Mac/i.test(`${platform} ${userAgent}`) ? "apple" : "google";
};

const ProviderMark = ({ provider }: { provider: MapProvider }) => (
  <svg viewBox={provider === "mapy" ? "0 0 40 32" : "0 0 32 32"} aria-hidden="true">
    <use href={`${providerSprite}#${provider}`} />
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
          <ProviderMark provider={deviceProvider} />
        </button>
        <button
          type="button"
          role="menuitem"
          aria-label={copy.mapy}
          title={copy.mapy}
          onClick={() => chooseProvider("mapy")}
        >
          <ProviderMark provider="mapy" />
        </button>
      </section>
    </div>
  );
}
