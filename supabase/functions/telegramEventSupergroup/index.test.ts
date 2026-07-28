import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("telegramEventSupergroup create_binding", () => {
  it("does not call Telegram webhook setup during organizer handshake", () => {
    const source = readFileSync(
      new URL("./index.ts", import.meta.url),
      "utf8",
    );
    const organizerCheck = source.indexOf('return json({ error: "organizer_required" }, 403);');
    const tokenCreation = source.indexOf("const bindingToken = base64UrlEncode", organizerCheck);

    expect(organizerCheck).toBeGreaterThan(-1);
    expect(tokenCreation).toBeGreaterThan(organizerCheck);

    const createBindingHandshake = source.slice(organizerCheck, tokenCreation);
    expect(createBindingHandshake).not.toContain("ensureTelegramWebhook");
    expect(createBindingHandshake).not.toContain("getWebhookInfo");
    expect(createBindingHandshake).not.toContain("setWebhook");
  });
});
