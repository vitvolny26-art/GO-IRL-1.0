import { Map, MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buildMapProviderUrl } from "../mapProvider";
import {
  mapProviderPickerEvent,
  type MapProviderPickerRequest,
} from "../mapProviderPicker";
import type { MapProvider } from "../userPreferences";

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const defaultDeviceProvider = (): MapProvider => {
  const platform = navigator.platform || "";
  const userAgent = navigator.userAgent || "";
  return /iPhone|iPad|iPod|Mac/i.test(`${platform} ${userAgent}`) ? "apple" : "google";
};

export function MapProviderPickerPortal() {
  const [sourceUrl, setSourceUrl] = useState("");

  useEffect(() => {
    const handleRequest = (event: Event) => {
      const request = event as CustomEvent<MapProviderPickerRequest>;
      const nextSourceUrl = request.detail?.sourceUrl?.trim();
      if (!nextSourceUrl) return;
      setSourceUrl(nextSourceUrl);
    };

    window.addEventListener(mapProviderPickerEvent, handleRequest);
    return () => window.removeEventListener(mapProviderPickerEvent, handleRequest);
  }, []);

  if (!sourceUrl) return null;

  const openProvider = (provider: MapProvider) => {
    openUrl(buildMapProviderUrl(sourceUrl, provider));
    setSourceUrl("");
  };

  return (
    <div className="map-provider-picker-backdrop" role="dialog" aria-modal="true" aria-label="Выбор карты">
      <section className="map-provider-picker-sheet" data-map-provider-choice>
        <header>
          <div>
            <strong>Открыть адрес</strong>
            <span>Выберите, где открыть точное место события</span>
          </div>
          <button type="button" aria-label="Закрыть" onClick={() => setSourceUrl("")}><X /></button>
        </header>

        <div
          className="map-provider-picker-options"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          <button type="button" onClick={() => openProvider(defaultDeviceProvider())}>
            <Map />
            <span>Карты устройства</span>
          </button>
          <button type="button" onClick={() => openProvider("mapy")}>
            <MapPin />
            <span>Mapy.com</span>
          </button>
        </div>
      </section>
    </div>
  );
}
