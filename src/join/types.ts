export type JoinProvider = "telegram" | "whatsapp";

export type JoinIntent = {
  eventId: string;
  provider: JoinProvider;
  providerUserId: string;
  idempotencyKey: string;
  requestedAt: string;
};

export type JoinResultAction = {
  kind: "calendar" | "map";
  label: string;
  url: string;
};

export type JoinResult =
  | {
      status: "joined";
      eventId: string;
      actions: JoinResultAction[];
    }
  | {
      status: "already_joined";
      eventId: string;
      actions: JoinResultAction[];
    }
  | {
      status: "waitlisted";
      eventId: string;
      reason: "event_full";
      actions: JoinResultAction[];
    }
  | {
      status: "rejected";
      eventId: string;
      reason: "event_full" | "event_closed" | "event_not_found" | "not_allowed";
      actions: [];
    };
