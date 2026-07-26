import { describe, expect, it } from "vitest";
import {
  buildFavoriteOrganizerActivityOccurrenceKey,
  buildFavoriteUniquenessKey,
  canNotifyAboutFavoriteOrganizerActivity,
  favoritePolicy,
} from "./contracts.js";

describe("favorite contracts", () => {
  it("builds stable uniqueness keys", () => {
    expect(
      buildFavoriteUniquenessKey("user:1", { type: "organizer", id: "org/2", organizerUserKey: "org/2" }),
    ).toBe("user%3A1:organizer:org%2F2");
  });

  it("builds recipient-specific organizer activity occurrence keys", () => {
    expect(buildFavoriteOrganizerActivityOccurrenceKey("user-1", "org-2", "activity-3")).toBe(
      "user-1:org-2:activity-3",
    );
  });

  it("keeps social expansion disabled by default", () => {
    expect(favoritePolicy.publicFavoriteCountsEnabled).toBe(false);
    expect(favoritePolicy.organizerCanSeeFavoritingUsers).toBe(false);
    expect(favoritePolicy.directMessagesAllowed).toBe(false);
  });

  it("respects notification mute windows", () => {
    const now = new Date("2026-07-26T12:00:00.000Z");

    expect(
      canNotifyAboutFavoriteOrganizerActivity(
        { newActivityNotificationsEnabled: true, mutedUntil: "2026-07-26T11:59:59.000Z" },
        now,
      ),
    ).toBe(true);

    expect(
      canNotifyAboutFavoriteOrganizerActivity(
        { newActivityNotificationsEnabled: true, mutedUntil: "2026-07-26T12:00:01.000Z" },
        now,
      ),
    ).toBe(false);
  });
});
