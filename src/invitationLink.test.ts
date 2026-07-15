import { describe, expect, it } from "vitest";
import {
  buildSeparatedInvitationText,
  buildTelegramActivityInviteUrl,
  buildTelegramShareUrl,
  parseInvitationStartParam,
} from "./invitationLink";

const eventId = "3b172dd9-d5e2-4328-86a4-d4107a6359fc";

describe("invitation links", () => {
  it("puts only the event UUID into startapp", () => {
    expect(buildTelegramActivityInviteUrl(eventId, "@GOirl_bot"))
      .toBe(`https://t.me/GOirl_bot?startapp=${eventId}`);
  });

  it("rejects invitation text glued to the UUID", () => {
    expect(parseInvitationStartParam(`${eventId}GO IRL: Волейбол`).valid).toBe(false);
    expect(buildTelegramActivityInviteUrl("demo-event", "GOirl_bot")).toBeNull();
  });

  it("keeps the URL and invitation copy separated", () => {
    const invitationUrl = `https://t.me/GOirl_bot?startapp=${eventId}`;
    const text = "GO IRL: Волейбол\n19 июл. · 16:30\nZŠ Demlova";
    expect(buildSeparatedInvitationText(invitationUrl, text)).toBe(`${invitationUrl}\n\n${text}`);

    const shareUrl = new URL(buildTelegramShareUrl(invitationUrl, text));
    expect(shareUrl.searchParams.get("url")).toBe(invitationUrl);
    expect(shareUrl.searchParams.get("text")).toBe(text);
  });
});
