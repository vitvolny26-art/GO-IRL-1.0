import { describe, expect, it } from "vitest";
import {
  activityIdFromJoinPath,
  buildMetaEventPreviewUrl,
  buildSeparatedInvitationText,
  buildTelegramActivityInviteUrl,
  buildTelegramShareUrl,
  parseInvitationStartParam,
} from "./invitationLink";

const eventId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";
const persistedEventId = "86016a39-4684-d288-afc9-7e206c027568";

describe("invitation links", () => {
  it("puts only the event UUID into startapp", () => {
    expect(buildTelegramActivityInviteUrl(eventId, "@GOirl_bot"))
      .toBe(`https://t.me/GOirl_bot?startapp=${eventId}`);
  });

  it("accepts persisted UUID-shaped event ids used by preview data", () => {
    expect(parseInvitationStartParam(persistedEventId))
      .toEqual({ valid: true, eventId: persistedEventId });
    expect(buildTelegramActivityInviteUrl(persistedEventId, "GOirl_bot"))
      .toBe(`https://t.me/GOirl_bot?startapp=${persistedEventId}`);
  });

  it("rejects invitation text glued to the UUID", () => {
    expect(parseInvitationStartParam(`${eventId}GO IRL: Волейбол`).valid).toBe(false);
    expect(buildTelegramActivityInviteUrl("demo-event", "GOirl_bot")).toBeNull();
  });

  it("reads a valid event id from the web join path", () => {
    expect(activityIdFromJoinPath(`/join/${eventId}`)).toBe(eventId);
    expect(activityIdFromJoinPath("/join/demo-volleyball")).toBe("demo-volleyball");
    expect(activityIdFromJoinPath("/join/not-an-event")).toBe("");
  });

  it("builds a public preview URL only for persisted event ids", () => {
    expect(buildMetaEventPreviewUrl(eventId, "https://goirl.example", "cs"))
      .toBe(`https://goirl.example/api/meta/event-preview?event=${eventId}&language=cs`);
    expect(buildMetaEventPreviewUrl("demo-volleyball", "https://goirl.example", "ru")).toBeNull();
    expect(buildMetaEventPreviewUrl(eventId, "https://goirl.example", "unexpected"))
      .toBe(`https://goirl.example/api/meta/event-preview?event=${eventId}&language=ru`);
  });

  it("keeps the URL below the invitation copy", () => {
    const invitationUrl = `https://t.me/GOirl_bot?startapp=${eventId}`;
    const text = "GO IRL: Волейбол\n19 июл. · 16:30\nZŠ Demlova";
    expect(buildSeparatedInvitationText(invitationUrl, text)).toBe(`${text}\n\n${invitationUrl}`);

    const shareUrl = new URL(buildTelegramShareUrl(invitationUrl, text));
    expect(shareUrl.searchParams.get("url")).toBe(invitationUrl);
    expect(shareUrl.searchParams.get("text")).toBe(text);
  });
});

