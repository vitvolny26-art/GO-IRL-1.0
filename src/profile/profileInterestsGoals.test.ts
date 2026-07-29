import { describe, expect, it } from "vitest";
import {
  betaProfileInterestIds,
  emptyProfileInterestsGoalsState,
  favoriteLegacyInterestIds,
  maxFavoriteProfileInterests,
  migrateLegacyFavoriteInterests,
  normalizeProfileInterestsGoalsState,
  setProfileInterestState,
  updatePrivateProfileGoal,
} from "./profileInterestsGoals";

describe("profile interests and goals", () => {
  it("exposes only the six canonical beta interests", () => {
    expect(betaProfileInterestIds).toEqual([
      "volleyball",
      "running",
      "walking",
      "coffee-meetup",
      "board-games",
      "language-exchange",
    ]);
  });

  it("migrates legacy favorites and caps them at five", () => {
    const migrated = migrateLegacyFavoriteInterests(emptyProfileInterestsGoalsState(), [
      "volleyball",
      "running",
      "walks",
      "coffee",
      "board-games",
      "language-exchange",
    ]);
    expect(favoriteLegacyInterestIds(migrated)).toHaveLength(maxFavoriteProfileInterests);
    expect(migrated.interests["language-exchange"]).toBeUndefined();
  });

  it("rejects a sixth favorite", () => {
    let state = emptyProfileInterestsGoalsState();
    for (const id of betaProfileInterestIds.slice(0, 5)) {
      state = setProfileInterestState(state, id, "favorite");
    }
    expect(() => setProfileInterestState(state, "language-exchange", "favorite"))
      .toThrow("profile_favorite_limit_exceeded");
  });

  it("keeps private goals out of public favorite ids", () => {
    const state = updatePrivateProfileGoal(
      setProfileInterestState(emptyProfileInterestsGoalsState(), "running", "favorite"),
      "Meet people through regular running",
    );
    expect(favoriteLegacyInterestIds(state)).toEqual(["running"]);
    expect(state.privateGoal).toBe("Meet people through regular running");
  });

  it("normalizes unsupported interests and states", () => {
    expect(normalizeProfileInterestsGoalsState({
      interests: { running: "interested", football: "favorite", walking: "unknown" },
      privateGoal: "goal",
    })).toEqual({
      interests: { running: "interested" },
      privateGoal: "goal",
      updatedAt: "",
    });
  });
});
