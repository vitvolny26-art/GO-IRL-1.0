import { describe, expect, it } from "vitest";
import {
  buildWeatherAlertDeduplicationKey,
  buildWeatherAlertOccurrenceKey,
  isServiceCriticalWeatherAlert,
  weatherAlertPolicy,
  weatherNotificationKindByHazard,
} from "./contracts";

describe("weather alert contracts", () => {
  it("builds stable provider-scoped deduplication keys", () => {
    expect(buildWeatherAlertDeduplicationKey("activity-1", "strong_wind", "2026-07-27T12:00:00Z", "provider-a"))
      .toBe("activity-1:strong_wind:2026-07-27T12%3A00%3A00Z:provider-a");
  });

  it("builds recipient occurrence keys", () => {
    expect(buildWeatherAlertOccurrenceKey("alert-1", "user-1")).toBe("alert-1:user-1");
  });

  it("treats warning and critical alerts as service critical", () => {
    expect(isServiceCriticalWeatherAlert("watch")).toBe(false);
    expect(isServiceCriticalWeatherAlert("warning")).toBe(true);
    expect(isServiceCriticalWeatherAlert("critical")).toBe(true);
  });

  it("never permits automatic event cancellation or rescheduling", () => {
    expect(weatherAlertPolicy.automaticCancellationAllowed).toBe(false);
    expect(weatherAlertPolicy.automaticReschedulingAllowed).toBe(false);
  });

  it("maps supported hazards to existing notification kinds", () => {
    expect(weatherNotificationKindByHazard.thunderstorm).toBe("weather.thunderstorm");
    expect(weatherNotificationKindByHazard.strong_wind).toBe("weather.strong_wind");
  });
});