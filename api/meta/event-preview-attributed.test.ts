import { describe, expect, it } from "vitest";
import { buildEventAttributionCapture } from "./event-preview-attributed";

const eventId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";

describe("attributed event preview", () => {
  it("serializes a validated attribution session for canonical Activity entry", () => {
    const result = buildEventAttributionCapture(eventId, {
      source: "instagram",
      medium: "story",
      campaign: "olomouc-pilot-v1",
      ref: "pub_42",
    });
    expect(result.attributed).toBe(true);
    expect(result.script).toContain("go-irl-social-attribution-v1");
    expect(result.script).toContain("olomouc-pilot-v1");
    expect(result.script).toContain(`/e/${eventId}`);
  });

  it("drops invalid attribution and clears stale transient state", () => {
    const result = buildEventAttributionCapture(eventId, {
      source: "Instagram",
      medium: "email",
      ref: "user@example.com",
    });
    expect(result.attributed).toBe(false);
    expect(result.script).toContain("sessionStorage.removeItem");
  });
});
