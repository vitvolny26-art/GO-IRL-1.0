import type { JoinResult } from "../join/types";

export type MetaMessagingProvider = "instagram" | "messenger";

export type MetaEventSummary = {
  eventId: string;
  title: string;
  dateTime: string;
  location: string;
  availableSpots: number;
};

export type MetaQuickReply = {
  content_type: "text";
  title: string;
  payload: string;
};

export type InstagramMessagePayload = {
  recipient: { id: string };
  message: {
    text: string;
    quick_replies?: MetaQuickReply[];
  };
};

export type MessengerMessagePayload = InstagramMessagePayload & {
  messaging_type: "RESPONSE";
};

export type MetaJoinResultPayload = {
  provider: MetaMessagingProvider;
  recipient: { id: string };
  message: { text: string };
  join_status: JoinResult["status"];
};
