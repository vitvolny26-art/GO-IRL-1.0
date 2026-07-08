import { describe, expect, it } from "vitest";
import {
  createTelegramReplayKey,
  createTelegramInitDataHash,
  TelegramInitDataValidationError,
  validateTelegramInitData,
} from "../supabase/functions/_shared/telegramInitData";

const botToken = "123456:ABC-DEF_test_token";
const nowSeconds = 1_700_000_000;

async function signedInitData(fields: Record<string, string>) {
  const params = new URLSearchParams(fields);
  const hash = await createTelegramInitDataHash(params.toString(), botToken);
  params.set("hash", hash);
  return params.toString();
}

describe("Telegram initData validation", () => {
  it("validates a signed Telegram payload", async () => {
    const initData = await signedInitData({
      auth_date: String(nowSeconds),
      query_id: "AAHdF6IQAAAAAN0XohDhrOrc",
      start_param: "activity-1",
      user: JSON.stringify({ id: 42, first_name: "Vit", username: "vit" }),
    });

    await expect(validateTelegramInitData({ initData, botToken, nowSeconds })).resolves.toMatchObject({
      authDate: nowSeconds,
      startParam: "activity-1",
      user: { id: 42, first_name: "Vit", username: "vit" },
    });
  });

  it("rejects invalid hash", async () => {
    const initData = await signedInitData({
      auth_date: String(nowSeconds),
      user: JSON.stringify({ id: 42 }),
    });
    const tampered = initData.replace("id%22%3A42", "id%22%3A43");

    await expect(validateTelegramInitData({ initData: tampered, botToken, nowSeconds })).rejects.toMatchObject({
      code: "invalid_hash",
    });
  });

  it("rejects expired auth_date", async () => {
    const initData = await signedInitData({
      auth_date: String(nowSeconds - 90_000),
      user: JSON.stringify({ id: 42 }),
    });

    await expect(validateTelegramInitData({ initData, botToken, nowSeconds, maxAgeSeconds: 3600 })).rejects.toMatchObject({
      code: "expired_auth_date",
    });
  });

  it("rejects malformed initData", async () => {
    await expect(validateTelegramInitData({ initData: "", botToken, nowSeconds })).rejects.toBeInstanceOf(
      TelegramInitDataValidationError,
    );
  });

  it("creates a stable replay protection key from the Telegram hash", async () => {
    const initData = await signedInitData({
      auth_date: String(nowSeconds),
      user: JSON.stringify({ id: 42 }),
    });
    const hash = new URLSearchParams(initData).get("hash");

    await expect(createTelegramReplayKey(hash || "")).resolves.toMatch(/^[a-f0-9]{64}$/);
    await expect(createTelegramReplayKey(hash || "")).resolves.toBe(await createTelegramReplayKey(hash || ""));
  });
});
