import { describe, expect, it } from "vitest";
import {
  resolveReminderProviderAvailability,
  resolveReminderProviderOptions,
  type MessagingConnection,
  type ReminderProviderCapability,
} from "./providerCapabilities";

const capability = (overrides: Partial<ReminderProviderCapability> = {}): ReminderProviderCapability => ({
  provider: "telegram",
  enabled: true,
  adapterAvailable: true,
  deliveryVerified: true,
  ...overrides,
});

const connection = (overrides: Partial<MessagingConnection> = {}): MessagingConnection => ({
  provider: "telegram",
  externalRecipientId: "123",
  status: "connected",
  verifiedAt: "2026-07-25T00:00:00.000Z",
  revokedAt: null,
  ...overrides,
});

describe("reminder provider capability gating", () => {
  it("allows only a backend-enabled, verified delivery path with a verified connection", () => {
    expect(resolveReminderProviderAvailability(capability(), connection())).toEqual({
      provider: "telegram",
      visible: true,
      selectable: true,
      reason: "available",
    });
  });

  it("does not expose disabled providers as working options", () => {
    expect(resolveReminderProviderAvailability(
      capability({ provider: "whatsapp", enabled: false }),
      connection({ provider: "whatsapp" }),
    )).toMatchObject({ visible: false, selectable: false, reason: "backend_disabled" });
  });

  it("shows a connected but temporarily unavailable provider as disabled", () => {
    expect(resolveReminderProviderAvailability(
      capability({ provider: "messenger" }),
      connection({ provider: "messenger", status: "temporarily_unavailable" }),
    )).toMatchObject({ visible: true, selectable: false, reason: "temporarily_unavailable" });
  });

  it("requires a recipient id and verification timestamp", () => {
    expect(resolveReminderProviderAvailability(
      capability({ provider: "instagram" }),
      connection({ provider: "instagram", externalRecipientId: null, verifiedAt: null }),
    )).toMatchObject({ visible: true, selectable: false, reason: "verification_required" });
  });

  it("filters backend-disabled providers from picker options", () => {
    const options = resolveReminderProviderOptions([
      capability(),
      capability({ provider: "whatsapp", enabled: false }),
    ], [connection()]);

    expect(options).toEqual([{ provider: "telegram", visible: true, selectable: true, reason: "available" }]);
  });
});
