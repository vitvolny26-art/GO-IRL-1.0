import { describe, expect, it } from "vitest";
import { resolveLaunchSurface } from "./launchSurface";

describe("resolveLaunchSurface", () => {
  it("shows the launch page at the clean root URL", () => {
    expect(resolveLaunchSurface({ pathname: "/", hash: "", search: "" })).toBe("launch");
  });

  it("opens activities from the launch-page hash", () => {
    expect(resolveLaunchSurface({ pathname: "/", hash: "#activities", search: "" })).toBe("activities");
  });

  it("opens the services placeholder from the launch-page hash", () => {
    expect(resolveLaunchSurface({ pathname: "/", hash: "#services", search: "" })).toBe("services");
  });

  it("does not intercept application routes or Telegram invitations", () => {
    expect(resolveLaunchSurface({ pathname: "/profile", hash: "", search: "" })).toBe("activities");
    expect(resolveLaunchSurface({ pathname: "/", hash: "", search: "?startapp=event-1" })).toBe("activities");
    expect(resolveLaunchSurface({ pathname: "/", hash: "", search: "", telegramStartParam: "event-1" })).toBe("activities");
  });
});

