import { describe, expect, it } from "vitest";
import {
  buildSocialAttributionUrl,
  captureActivityAttribution,
  parseSocialAttribution,
  readActivityAttribution,
  socialAttributionSessionKey,
  type AttributionStorage,
} from "./socialAttribution";

const activityId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";

const memoryStorage = (): AttributionStorage => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
};

describe("DIST200 social attribution", () => {
  it("parses only the normative v1 attribution fields", () => {
    expect(parseSocialAttribution("?source=instagram&medium=story&campaign=olomouc-pilot-v1&ref=pub_42&user=secret")).toEqual({
      source: "instagram",
      medium: "story",
      campaign: "olomouc-pilot-v1",
      ref: "pub_42",
    });
  });

  it("drops invalid values without repairing them", () => {
    expect(parseSocialAttribution("?source=Instagram&medium=email&campaign=Olomouc Pilot&ref=user@example.com")).toEqual({});
  });

  it("enforces campaign and ref bounds", () => {
    expect(parseSocialAttribution(`?campaign=${"a".repeat(65)}&ref=${"b".repeat(97)}`)).toEqual({});
    expect(parseSocialAttribution(`?campaign=${"a".repeat(64)}&ref=${"b".repeat(96)}`)).toEqual({
      campaign: "a".repeat(64),
      ref: "b".repeat(96),
    });
  });

  it("builds a decorated URL while preserving non-attribution query parameters", () => {
    expect(buildSocialAttributionUrl(`https://go-irl.fun/e/${activityId}?language=en&source=bad`, {
      source: "facebook",
      medium: "share",
      campaign: "olomouc-pilot-v1",
    })).toBe(`https://go-irl.fun/e/${activityId}?language=en&source=facebook&medium=share&campaign=olomouc-pilot-v1`);
  });

  it("captures an Activity entry into transient session state", () => {
    const storage = memoryStorage();
    const captured = captureActivityAttribution({
      pathname: `/e/${activityId}`,
      search: "?source=instagram&medium=story&campaign=olomouc-pilot-v1&ref=pub_42",
      storage,
    });
    expect(readActivityAttribution(storage)).toEqual(captured);
  });

  it("clears stale attribution on an unattributed Activity entry", () => {
    const storage = memoryStorage();
    storage.setItem(socialAttributionSessionKey, JSON.stringify({
      activityId,
      entryPath: `/e/${activityId}`,
      source: "facebook",
      medium: "share",
    }));
    expect(captureActivityAttribution({ pathname: `/join/${activityId}`, search: "", storage })).toBeNull();
    expect(storage.getItem(socialAttributionSessionKey)).toBeNull();
  });

  it("does not mutate attribution on a non-Activity path", () => {
    const storage = memoryStorage();
    storage.setItem(socialAttributionSessionKey, "sentinel");
    expect(captureActivityAttribution({ pathname: "/services", search: "?source=facebook", storage })).toBeNull();
    expect(storage.getItem(socialAttributionSessionKey)).toBe("sentinel");
  });
});
