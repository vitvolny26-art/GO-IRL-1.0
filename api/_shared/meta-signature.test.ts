import { describe, expect, it } from "vitest";
import { verifyMetaSignature } from "./meta-signature";

describe("Meta webhook signature verification", () => {
  it("accepts a valid sha256 signature", async () => {
    expect(await verifyMetaSignature(
      '{"object":"page"}',
      "sha256=703eda4acf6d31d5b4fdd07887302c53639dcde8453f05f71727ea203f0166c1",
      "test-secret",
    )).toBe(true);
  });

  it("rejects missing, malformed, or invalid signatures", async () => {
    await expect(verifyMetaSignature("{}", "", "test-secret")).resolves.toBe(false);
    await expect(verifyMetaSignature("{}", "sha1=bad", "test-secret")).resolves.toBe(false);
    await expect(verifyMetaSignature("{}", "sha256=bad", "test-secret")).resolves.toBe(false);
  });
});
