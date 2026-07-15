import { useEffect, useState } from "react";
import { getCity } from "../config/cities";
import { getTranslation } from "../i18n";
import { getEventWeather, type WeatherResult } from "../services/weather";
import type { Activity, Language } from "../types";

type EventWeatherStripProps = {
  activity: Activity;
  language: Language;
  enabled: boolean;
  durationMinutes?: number;
};

export function EventWeatherStrip({ activity, language, enabled, durationMinutes = 90 }: EventWeatherStripProps) {
  const t = getTranslation(language);
  const [weather, setWeather] = useState<WeatherResult | null>(null);
  const [status, setStatus] = useState(t.weatherLoading);
  const cityName = getCity(activity.cityId).name[language];

  useEffect(() => {
    let active = true;
    if (!enabled) {
      setWeather(null);
      return () => { active = false; };
    }

    setWeather(null);
    setStatus(t.weatherLoading);
    void getEventWeather({
      date: activity.date,
      time: activity.time,
      address: activity.address,
      city: cityName,
      durationMinutes,
    }).then((nextWeather) => {
      if (!active) return;
      setWeather(nextWeather);
      setStatus(nextWeather ? "" : t.weatherUnavailable);
    });

    return () => { active = false; };
  }, [activity.id, activity.date, activity.time, activity.address, cityName, durationMinutes, enabled, t.weatherLoading, t.weatherUnavailable]);

  if (!enabled) return null;

  return (
    <div className={`event-card-weather${weather ? "" : " is-pending"}`} aria-label={t.weatherHint}>
      {weather ? (
        <>
          <span><b aria-hidden="true">{weather.text.split(" ")[0] || "☀️"}</b>{weather.temperature}°C</span>
          <span><b aria-hidden="true">☔</b>{weather.rain}%</span>
          <span><b aria-hidden="true">💨</b>{weather.wind} km/h</span>
        </>
      ) : <span className="event-card-weather-status">{status}</span>}
    </div>
  );
}
