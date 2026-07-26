import { Map, Navigation, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { buildMapProviderUrl } from "../mapProvider";
import {
  mapProviderPickerEvent,
  resolveDeviceMapProvider,
  type MapProviderPickerRequest,
} from "../mapProviderPicker";
import { useAppStore } from "../store";
import type { Language } from "../types";
import type { MapProvider } from "../userPreferences";

const copy: Record<Language, { title: string; hint: string; close: string; device: string; mapy: string }> = {
  ru: { title: "Открыть адрес", hint: "Выберите карту", close: "Закрыть", device: "Карты устройства", mapy: "Mapy.com" },
  uk: { title: "Відкрити адресу", hint: "Оберіть карту", close: "Закрити", device: "Карти пристрою", mapy: "Mapy.com" },
  cs: { title: "Otevřít adresu", hint: "Vyberte mapu", close: "Zavřít", device: "Mapy zařízení", mapy: "Mapy.com" },
  en: { title: "Open address", hint: "Choose a map", close: "Close", device: "Device maps", mapy: "Mapy.com" },
};

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export function MapProviderPickerPortal() {
  const language = useAppStore((state) => state.language);
  const [sourceUrl, setSourceUrl] = useState("");
  const deviceProvider = useMemo(() => resolveDeviceMapProvider(), []);
  const labels = copy[language];

  useEffect(() => {
    const handleRequest = (event: Event) => {
      const request = event as CustomEvent<MapProviderPickerRequest>;
      const nextSourceUrl = request.detail?.sourceUrl?.trim();
      if (nextSourceUrl) setSourceUrl(nextSourceUrl);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSourceUrl("");
    };

    window.addEventListener(mapProviderPickerEvent, handleRequest);
    document.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener(mapProviderPickerEvent, handleRequest);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!sourceUrl) return null;

  const openProvider = (provider: MapProvider) => {
    openUrl(buildMapProviderUrl(sourceUrl, provider));
    setSourceUrl("");
  };

  return (
    <div className="map-provider-picker-backdrop" role="presentation" onClick={() => setSourceUrl("")}>
      <section
        className="map-provider-picker-sheet"
        data-map-provider-choice
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <strong>{labels.title}</strong>
            <span>{labels.hint}</span>
          </div>
          <button type="button" aria-label={labels.close} onClick={() => setSourceUrl("")}><X /></button>
        </header>

        <div className="map-provider-picker-options">
          <button type="button" onClick={() => openProvider(deviceProvider)}>
            <Navigation aria-hidden="true" />
            <span>{labels.device}</span>
          </button>
          <button type="button" onClick={() => openProvider("mapy")}>
            <Map aria-hidden="true" />
            <span>{labels.mapy}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
