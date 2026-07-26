import { MapPin, X } from "lucide-react";
import { useEffect, useState } from "react";
import { buildMapProviderUrl } from "../mapProvider";
import {
  mapProviderOptions,
  mapProviderPickerEvent,
  type MapProviderPickerRequest,
} from "../mapProviderPicker";
import {
  readUserPreferences,
  updateUserPreferences,
  type MapProvider,
} from "../userPreferences";

const openUrl = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export function MapProviderPickerPortal() {
  const [sourceUrl, setSourceUrl] = useState("");
  const [selected, setSelected] = useState<MapProvider>("mapy");
  const [remember, setRemember] = useState(true);

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
      setSelected("mapy");
      setRemember(true);
    };

    window.addEventListener(mapProviderPickerEvent, handleRequest);
    return () => window.removeEventListener(mapProviderPickerEvent, handleRequest);
  }, []);

  if (!sourceUrl) return null;

  const confirm = () => {
    if (remember) updateUserPreferences({ mapProvider: selected });
    openUrl(buildMapProviderUrl(sourceUrl, selected));
    setSourceUrl("");
  };

  return (
    <div className="map-provider-picker-backdrop" role="dialog" aria-modal="true" aria-label="Выбор карты">
      <section className="map-provider-picker-sheet" data-map-provider-choice>
        <header>
          <div>
            <strong>Открыть адрес</strong>
            <span>Выберите приложение карты</span>
          </div>
          <button type="button" aria-label="Закрыть" onClick={() => setSourceUrl("")}><X /></button>
        </header>

        <div className="map-provider-picker-options">
          {mapProviderOptions.map((provider) => (
            <button
              key={provider.id}
              type="button"
              className={selected === provider.id ? "is-selected" : ""}
              onClick={() => setSelected(provider.id)}
            >
              <MapPin />
              <span>{provider.label}</span>
            </button>
          ))}
        </div>

        <label className="map-provider-picker-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span>Запомнить мой выбор</span>
        </label>

        <button className="map-provider-picker-confirm" type="button" onClick={confirm}>
          Открыть
        </button>
      </section>
    </div>
  );
}
