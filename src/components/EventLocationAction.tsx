import { MapPin } from "lucide-react";
import { buildEventLocationUrl } from "../eventLocations";
import { requestMapProvider } from "../mapProviderPicker";

type EventLocationActionProps = {
  city: string;
  address: string;
  sourceUrl?: string | null;
  ariaLabel: string;
};

export function EventLocationAction({ city, address, sourceUrl, ariaLabel }: EventLocationActionProps) {
  const cleanCity = city.trim();
  const cleanAddress = address.trim();
  const target = sourceUrl?.trim() || buildEventLocationUrl(cleanAddress, cleanCity);

  return (
    <button
      className="event-location-action"
      type="button"
      aria-label={`${ariaLabel}: ${[cleanCity, cleanAddress].filter(Boolean).join(", ")}`}
      disabled={!target}
      onClick={() => requestMapProvider(target)}
    >
      <MapPin aria-hidden="true" />
      <span className="event-location-copy">
        {cleanCity ? <strong className="event-location-city">{cleanCity}</strong> : null}
        {cleanAddress ? <span className="event-location-address">{cleanAddress}</span> : null}
      </span>
    </button>
  );
}
