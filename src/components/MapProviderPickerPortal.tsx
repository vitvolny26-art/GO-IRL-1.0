import { Map, MapPinned } from "lucide-react";
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

export function MapProviderPickerPortal() {
  const [sourceUrl, setSourceUrl] = useState("");
  const menuRef = useRef<HTMLElement>(null);
  const language = readUserPreferences().language || "ru";
  const copy = labels[language];

  useEffect(() => {
    const handleRequest = (event: Event) => {
      const request = event as CustomEvent<MapProviderPickerRequest>;
      const nextSourceUrl = request.detail?.sourceUrl?.trim();
      if (!nextSourceUrl) return;

      const savedProvider = readUserPreferences().mapProvider;
      if (savedProvider) {
        openUrl(buildMapProviderUrl(nextSourceUrl, savedProvider));
        return;
      }

      setSourceUrl(nextSourceUrl);
    };

    window.addEventListener(mapProviderPickerEvent, handleRequest);
    return () => window.removeEventListener(mapProviderPickerEvent, handleRequest);
  }, []);

  useEffect(() => {
    if (!sourceUrl) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setSourceUrl("");
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSourceUrl("");
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
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
      >
        <button
          type="button"
          role="menuitem"
          aria-label={copy.device}
          title={copy.device}
          onClick={() => chooseProvider(defaultDeviceProvider())}
        >
          <Map aria-hidden="true" />
        </button>
        <button
          type="button"
          role="menuitem"
          aria-label={copy.mapy}
          title={copy.mapy}
          onClick={() => chooseProvider("mapy")}
        >
          <MapPinned aria-hidden="true" />
        </button>
      </section>
    </div>
  );
}
