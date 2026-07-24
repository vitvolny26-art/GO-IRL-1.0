export type MapPoint = { latitude: number; longitude: number };

const tileSize = 256;
const maxLatitude = 85.05112878;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const normalizeMapPoint = (point: MapPoint): MapPoint => ({
  latitude: clamp(point.latitude, -maxLatitude, maxLatitude),
  longitude: ((((point.longitude + 180) % 360) + 360) % 360) - 180,
});

export const mapPointToWorld = (point: MapPoint, zoom: number) => {
  const normalized = normalizeMapPoint(point);
  const scale = tileSize * (2 ** zoom);
  const latitudeRadians = normalized.latitude * Math.PI / 180;
  return {
    x: ((normalized.longitude + 180) / 360) * scale,
    y: (1 - Math.log(Math.tan(latitudeRadians) + (1 / Math.cos(latitudeRadians))) / Math.PI) / 2 * scale,
    scale,
  };
};

export const worldToMapPoint = (x: number, y: number, zoom: number): MapPoint => {
  const scale = tileSize * (2 ** zoom);
  const longitude = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const latitude = 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return normalizeMapPoint({ latitude, longitude });
};

export const buildOpenStreetMapLocationUrl = (point: MapPoint, zoom = 17) => {
  const normalized = normalizeMapPoint(point);
  const latitude = normalized.latitude.toFixed(6);
  const longitude = normalized.longitude.toFixed(6);
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${zoom}/${latitude}/${longitude}`;
};

export const parseMapPointFromUrl = (value: string): MapPoint | null => {
  if (!value.trim()) return null;
  try {
    const url = new URL(value);
    const latitudeValue = url.searchParams.get("mlat");
    const longitudeValue = url.searchParams.get("mlon");
    if (latitudeValue !== null && longitudeValue !== null) {
      const latitude = Number(latitudeValue);
      const longitude = Number(longitudeValue);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return normalizeMapPoint({ latitude, longitude });
      }
    }
    const match = url.hash.match(/#map=\d+\/(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)/);
    if (!match) return null;
    const hashLatitude = Number(match[1]);
    const hashLongitude = Number(match[2]);
    return Number.isFinite(hashLatitude) && Number.isFinite(hashLongitude)
      ? normalizeMapPoint({ latitude: hashLatitude, longitude: hashLongitude })
      : null;
  } catch {
    return null;
  }
};

export const mapTileSize = tileSize;
