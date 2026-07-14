import type { JoinResult } from "../join/types.js";
import type { EventInvitationSummary } from "../invitations/types.js";

export type WhatsAppEventSummary = EventInvitationSummary;

export type WhatsAppTextPayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: { body: string };
};

export type WhatsAppButtonPayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "interactive";
  interactive: {
    type: "button";
    header?: {
      type: "image";
      image: { link: string };
    };
    body: { text: string };
    action: {
      buttons: Array<{
        type: "reply";
        reply: { id: string; title: string };
      }>;
    };
  };
};

export type WhatsAppFlowPayload = {
  messaging_product: "whatsapp";
  to: string;
  type: "interactive";
  interactive: {
    type: "flow";
    body: { text: string };
    action: {
      name: "flow";
      parameters: {
        flow_message_version: "3";
        flow_id: string;
        flow_token: string;
        flow_cta: string;
        flow_action: "navigate";
        flow_action_payload: {
          screen: "JOIN_EVENT";
          data: WhatsAppEventSummary;
        };
      };
    };
  };
};

export type WhatsAppJoinResultPayload = WhatsAppTextPayload & {
  join_status: JoinResult["status"];
};
