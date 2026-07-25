import type { ReminderProvider } from "../userPreferences";

export type MessagingConnectionStatus =
  | "connected"
  | "verification_required"
  | "temporarily_unavailable"
  | "revoked"
  | "unsupported";

export type MessagingConnection = {
  provider: ReminderProvider;
  externalRecipientId: string | null;
  status: MessagingConnectionStatus;
  verifiedAt: string | null;
  revokedAt: string | null;
};

export type ReminderProviderCapability = {
  provider: ReminderProvider;
  enabled: boolean;
  adapterAvailable: boolean;
  deliveryVerified: boolean;
};

export type ReminderProviderAvailability = {
  provider: ReminderProvider;
  visible: boolean;
  selectable: boolean;
  reason:
    | "available"
    | "backend_disabled"
    | "adapter_unavailable"
    | "delivery_unverified"
    | "connection_required"
    | "verification_required"
    | "temporarily_unavailable"
    | "revoked"
    | "unsupported";
};

const unavailable = (
  provider: ReminderProvider,
  reason: Exclude<ReminderProviderAvailability["reason"], "available">,
  visible = false,
): ReminderProviderAvailability => ({ provider, visible, selectable: false, reason });

export const resolveReminderProviderAvailability = (
  capability: ReminderProviderCapability,
  connection: MessagingConnection | null,
): ReminderProviderAvailability => {
  const { provider } = capability;

  if (!capability.enabled) return unavailable(provider, "backend_disabled");
  if (!capability.adapterAvailable) return unavailable(provider, "adapter_unavailable");
  if (!capability.deliveryVerified) return unavailable(provider, "delivery_unverified");
  if (!connection) return unavailable(provider, "connection_required", true);
  if (connection.provider !== provider) return unavailable(provider, "connection_required", true);
  if (connection.status === "unsupported") return unavailable(provider, "unsupported");
  if (connection.status === "revoked" || connection.revokedAt) return unavailable(provider, "revoked", true);
  if (connection.status === "verification_required" || !connection.verifiedAt || !connection.externalRecipientId) {
    return unavailable(provider, "verification_required", true);
  }
  if (connection.status === "temporarily_unavailable") {
    return unavailable(provider, "temporarily_unavailable", true);
  }

  return { provider, visible: true, selectable: true, reason: "available" };
};

export const resolveReminderProviderOptions = (
  capabilities: readonly ReminderProviderCapability[],
  connections: readonly MessagingConnection[],
) => capabilities
  .map((capability) => resolveReminderProviderAvailability(
    capability,
    connections.find((connection) => connection.provider === capability.provider) || null,
  ))
  .filter((option) => option.visible);
