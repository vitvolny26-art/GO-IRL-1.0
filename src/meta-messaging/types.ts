import type { JoinResult } from "../join/types.js";
import type { EventInvitationSummary } from "../invitations/types.js";

export type MetaMessagingProvider = "instagram" | "messenger";

export type MetaEventSummary = EventInvitationSummary;

export type MetaQuickReply = {
  content_type: "text";
  title: string;
  payload: string;
};

export type MetaTemplateButton =
  | { type: "postback"; title: string; payload: string }
  | { type: "web_url"; title: string; url: string };

export type MetaMessage = {
  text?: string;
  quick_replies?: MetaQuickReply[];
  attachment?: {
    type: "template";
    payload: {
      template_type: "generic";
      elements: Array<{
        title: string;
        subtitle: string;
        image_url: string;
        default_action?: { type: "web_url"; url: string };
        buttons: MetaTemplateButton[];
      }>;
    } | {
      template_type: "button";
      text: string;
      buttons: MetaTemplateButton[];
    };
  };
};

export type InstagramMessagePayload = {
  recipient: { id: string };
  message: MetaMessage;
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
