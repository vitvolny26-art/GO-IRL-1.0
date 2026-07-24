import { Crosshair, LocateFixed, MapPin, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getCity } from "../config/cities";
import {
  buildOpenStreetMapLocationUrl,
  mapPointToWorld,
  mapTileSize,
  parseMapPointFromUrl,
  worldToMapPoint,
  type MapPoint,
} from "../eventLocationMap";
import { useAppStore } from "../store";

const mapWidth = 640;
const mapHeight = 360;
const minZoom = 12;
const maxZoom = 19;

type PortalTarget = { target: HTMLElement; form: HTMLFormElement };
type DragState = { pointerId: number; x: number; y: number; worldX: number; worldY: number };
type Tile = { key: string; src: string; left: number; top: number };
type ReverseGeocodePayload = {
  display_name?: string;
  name?: string;
  address?: Record<string, string | undefined>;
};

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

const setReactInputValue = (input: HTMLInputElement, value: string) => {
  nativeInputValueSetter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const findInput = (form: HTMLFormElement, name: string) =>
  form.elements.namedItem(name) instanceof HTMLInputElement
    ? form.elements.namedItem(name) as HTMLInputElement
    : null;

const selectedCityPoint = (form: HTMLFormElement): MapPoint => {
  const cityField = form.elements.namedItem("cityId");
  const cityId = cityField instanceof HTMLSelectElement ? cityField.value : "olomouc";
  const city = getCity(cityId);
  return { latitude: city.coordinates.latitude, longitude: city.coordinates.longitude };
};

const compactAddress = (payload: ReverseGeocodePayload) => {
  const address = payload.address || {};
  const place = payload.name
    || address.amenity
    || address.building
    || address.leisure
    || address.shop
    || address.road
    || address.pedestrian
    || address.footway;
  const house = address.house_number;
  const city = address.city || address.town || address.village || address.municipality;
  const parts = [place && house ? `${place} ${house}` : place || house, city]
    .map((value) => String(value || "").trim())
    .filter(Boolean);
  return parts.length ? [...new Set(parts)].join(", ") : String(payload.display_name || "").trim();
};

const reverseGeocode = async (point: MapPoint, language: string) => {
  const endpoint = new URL("https://nominatim.openstreetmap.org/reverse");
  endpoint.searchParams.set("format", "jsonv2");
  endpoint.searchParams.set("lat", point.latitude.toFixed(6));
  endpoint.searchParams.set("lon", point.longitude.toFixed(6));
  endpoint.searchParams.set("zoom", "18");
  endpoint.searchParams.set("addressdetails", "1");
  endpoint.searchParams.set("accept-language", language);
  const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`reverse_geocode_${response.status}`);
  const payload = await response.json() as ReverseGeocodePayload;
  const address = compactAddress(payload);
  if (!address) throw new Error("address_not_found");
  return address;
};

const tilesFor = (center: MapPoint, zoom: number): Tile[] => {
  const world = mapPointToWorld(center, zoom);
  const startTileX = Math.floor((world.x - mapWidth / 2) / mapTileSize);
  const endTileX = Math.floor((world.x + mapWidth / 2) / mapTileSize);
  const startTileY = Math.floor((world.y - mapHeight / 2) / mapTileSize);
  const endTileY = Math.floor((world.y + mapHeight / 2) / mapTileSize);
  const count = 2 ** zoom;
  const tiles: Tile[] = [];

  for (let tileY = startTileY; tileY <= endTileY; tileY += 1) {
    if (tileY < 0 || tileY >= count) continue;
    for (let tileX = startTileX; tileX <= endTileX; tileX += 1) {
      const wrappedX = ((tileX % count) + count) % count;
      tiles.push({
        key: `${zoom}-${tileX}-${tileY}`,
        src: `https://tile.openstreetmap.org/${zoom}/${wrappedX}/${tileY}.png`,
        left: tileX * mapTileSize - world.x + mapWidth / 2,
        top: tileY * mapTileSize - world.y + mapHeight / 2,
      });
    }
  }
  return tiles;
};

function LocationMap({ point, zoom, onPointChange, onZoomChange }: {
  point: MapPoint;
  zoom: number;
  onPointChange: (point: MapPoint) => void;
  onZoomChange: (zoom: number) => void;
}) {
  const drag = useRef<DragState | null>(null);
  const tiles = useMemo(() => tilesFor(point, zoom), [point, zoom]);

  return (
    <div
      className="event-location-map"
      onPointerDown={(event) => {
        const world = mapPointToWorld(point, zoom);
        drag.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, worldX: world.x, worldY: world.y };
        event.currentTarget.setPointerCapture(event.pointerId);
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        onPointChange(worldToMapPoint(
          current.worldX - (event.clientX - current.x),
          current.worldY - (event.clientY - current.y),
          zoom,
        ));
      }}
      onPointerUp={(event) => {
        if (drag.current?.pointerId === event.pointerId) drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId);
        }
      }}
      onPointerCancel={() => { drag.current = null; }}
    >
      <div className="event-location-map-tiles" aria-hidden="true">
        {tiles.map((tile) => (
          <img key={tile.key} src={tile.src} alt="" draggable={false} style={{ left: tile.left, top: tile.top }} />
        ))}
      </div>
      <div className="event-location-map-pin" aria-hidden="true"><MapPin /></div>
      <div className="event-location-map-controls">
        <button type="button" aria-label="Приблизить" onClick={(event) => { event.stopPropagation(); onZoomChange(Math.min(maxZoom, zoom + 1)); }}><Plus /></button>
        <button type="button" aria-label="Отдалить" onClick={(event) => { event.stopPropagation(); onZoomChange(Math.max(minZoom, zoom - 1)); }}><Minus /></button>
      </div>
      <a className="event-location-map-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" onPointerDown={(event) => event.stopPropagation()}>© OpenStreetMap</a>
    </div>
  );
}

export function EventLocationPickerPortal() {
  const language = useAppStore((state) => state.language);
  const [portal, setPortal] = useState<PortalTarget | null>(null);
  const [open, setOpen] = useState(false);
  const [point, setPoint] = useState<MapPoint>({ latitude: 49.5938, longitude: 17.2509 });
  const [zoom, setZoom] = useState(16);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => {
      const form = document.querySelector<HTMLFormElement>("form.create-form");
      const address = form ? findInput(form, "address") : null;
      const label = address?.closest("label");
      if (!form || !label) {
        setPortal((current) => {
          current?.target.remove();
          return null;
        });
        setOpen(false);
        return;
      }

      setPortal((current) => {
        if (current?.target.isConnected && current.form === form) return current;
        current?.target.remove();
        const target = document.createElement("div");
        target.className = "event-location-picker-portal";
        label.insertAdjacentElement("afterend", target);
        return { target, form };
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      setPortal((current) => {
        current?.target.remove();
        return null;
      });
    };
  }, []);

  const beginSelection = () => {
    if (!portal) return;
    const locationUrl = findInput(portal.form, "locationUrl")?.value || "";
    const savedPoint = parseMapPointFromUrl(locationUrl);
    setPoint(savedPoint || selectedCityPoint(portal.form));
    setZoom(savedPoint ? 17 : 14);
    setError("");
    setOpen(true);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Геолокация недоступна");
      return;
    }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setPoint({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setZoom(17);
        setLoading(false);
      },
      () => {
        setError("Не удалось получить геолокацию");
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 10_000 },
    );
  };

  const confirm = async () => {
    if (!portal) return;
    setLoading(true);
    setError("");
    try {
      const address = await reverseGeocode(point, language);
      const addressInput = findInput(portal.form, "address");
      const locationInput = findInput(portal.form, "locationUrl");
      if (!addressInput || !locationInput) throw new Error("location_fields_missing");
      setReactInputValue(addressInput, address);
      setReactInputValue(locationInput, buildOpenStreetMapLocationUrl(point, zoom));
      setOpen(false);
    } catch {
      setError("Не удалось определить адрес. Передвиньте карту и попробуйте снова.");
    } finally {
      setLoading(false);
    }
  };

  if (!portal) return null;

  return createPortal(
    <>
      <button className="event-location-picker-button" type="button" onClick={beginSelection}>
        <MapPin />
        <span>Выбрать точку на карте</span>
      </button>
      {open ? createPortal(
        <div className="event-location-picker-backdrop" role="dialog" aria-modal="true" aria-label="Выбор места события">
          <section className="event-location-picker-sheet">
            <header>
              <div><strong>Точка события</strong><span>Передвигайте карту — маркер остаётся в центре</span></div>
              <button type="button" aria-label="Закрыть" onClick={() => setOpen(false)}><X /></button>
            </header>
            <LocationMap point={point} zoom={zoom} onPointChange={setPoint} onZoomChange={setZoom} />
            <div className="event-location-picker-coordinates"><Crosshair />{point.latitude.toFixed(5)}, {point.longitude.toFixed(5)}</div>
            {error ? <div className="event-location-picker-error">{error}</div> : null}
            <div className="event-location-picker-actions">
              <button type="button" className="secondary" onClick={useCurrentLocation} disabled={loading}><LocateFixed />Моё местоположение</button>
              <button type="button" className="primary" onClick={() => void confirm()} disabled={loading}><MapPin />{loading ? "Определяем адрес…" : "Выбрать это место"}</button>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </>,
    portal.target,
  );
}
