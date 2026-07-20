import type { JoinResult } from "../join/types.js";
import type {
  InstagramMessagePayload,
  MessengerMessagePayload,
  MetaEventSummary,
  MetaJoinResultPayload,
  MetaMessagingProvider,
  MetaQuickReply,
} from "./types.js";

const eventSummaryText = (event: MetaEventSummary) => [
  event.title,
  event.dateTime,
  event.location,
  event.availableSpots > 0 ? `РћСЃС‚Р°Р»РѕСЃСЊ РјРµСЃС‚: ${event.availableSpots}` : "РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚",
].join("\n");

const eventQuickReplies = (eventId: string): MetaQuickReply[] => [
  { content_type: "text", title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ", payload: `join:${eventId}` },
  { content_type: "text", title: "РџРѕРґСЂРѕР±РЅРµРµ", payload: `details:${eventId}` },
];

const invitationMessage = (event: MetaEventSummary) => {
  if (!event.imageUrl) {
    return {
      text: eventSummaryText(event),
      quick_replies: eventQuickReplies(event.eventId),
    };
  }

  const buttons = event.inviteUrl
    ? [
        { type: "postback" as const, title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ", payload: `join:${event.eventId}` },
        { type: "web_url" as const, title: "РћС‚РєСЂС‹С‚СЊ", url: event.inviteUrl },
      ]
    : [
        { type: "postback" as const, title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ", payload: `join:${event.eventId}` },
        { type: "postback" as const, title: "РџРѕРґСЂРѕР±РЅРµРµ", payload: `details:${event.eventId}` },
      ];

  return {
    attachment: {
      type: "template" as const,
      payload: {
        template_type: "generic" as const,
        elements: [{
          title: event.title.slice(0, 80),
          subtitle: [event.dateTime, event.location].filter(Boolean).join(" В· ").slice(0, 80),
          image_url: event.imageUrl,
          ...(event.inviteUrl ? { default_action: { type: "web_url" as const, url: event.inviteUrl } } : {}),
          buttons,
        }],
      },
    },
  };
};

const messengerEventSummaryText = (event: MetaEventSummary) => [
  event.title,
  event.dateTime,
  event.location,
  event.availableSpots > 0 ? `РћСЃС‚Р°Р»РѕСЃСЊ РјРµСЃС‚: ${event.availableSpots}` : "РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚",
].join("\n");

const messengerEventQuickReplies = (eventId: string): MetaQuickReply[] => [
  { content_type: "text", title: "РџСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ", payload: `join:${eventId}` },
  { content_type: "text", title: "РџРѕРґСЂРѕР±РЅРµРµ", payload: `details:${eventId}` },
];

export function buildInstagramInvitationPayload(
  recipientId: string,
  event: MetaEventSummary,
): InstagramMessagePayload {
  return {
    recipient: { id: recipientId },
    message: invitationMessage(event),
  };
}

export function buildMessengerInvitationPayload(
  recipientId: string,
  event: MetaEventSummary,
): MessengerMessagePayload {
  return {
    messaging_type: "RESPONSE",
    recipient: { id: recipientId },
    message: event.imageUrl
      ? invitationMessage(event)
      : {
          text: messengerEventSummaryText(event),
          quick_replies: messengerEventQuickReplies(event.eventId),
        },
  };
}

export function buildMessengerWelcomePayload(
  recipientId: string,
  appUrl: string,
): MessengerMessagePayload {
  return {
    messaging_type: "RESPONSE",
    recipient: { id: recipientId },
    message: {
      attachment: {
        type: "template",
        payload: {
          template_type: "button",
          text: "РџСЂРёРІРµС‚! GO IRL РїРѕРјРѕРіР°РµС‚ РЅР°С…РѕРґРёС‚СЊ СЃРѕР±С‹С‚РёСЏ СЂСЏРґРѕРј Рё РІСЃС‚СЂРµС‡Р°С‚СЊСЃСЏ РІР¶РёРІСѓСЋ. РћС‚РєСЂРѕР№С‚Рµ РїСЂРёР»РѕР¶РµРЅРёРµ, С‡С‚РѕР±С‹ РїРѕСЃРјРѕС‚СЂРµС‚СЊ СЃРѕР±С‹С‚РёСЏ.",
          buttons: [{ type: "web_url", title: "РћС‚РєСЂС‹С‚СЊ GO IRL", url: appUrl }],
        },
      },
    },
  };
}

const resultHeading = (result: JoinResult) => {
  if (result.status === "joined") return "Р’С‹ РїСЂРёСЃРѕРµРґРёРЅРёР»РёСЃСЊ Рє СЃРѕР±С‹С‚РёСЋ.";
  if (result.status === "already_joined") return "Р’С‹ СѓР¶Рµ СѓС‡Р°СЃС‚РІСѓРµС‚Рµ РІ СЌС‚РѕРј СЃРѕР±С‹С‚РёРё.";
  if (result.status === "pending") return "Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР° РѕСЂРіР°РЅРёР·Р°С‚РѕСЂСѓ.";
  if (result.status === "waitlisted") return "РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚. Р’С‹ РґРѕР±Р°РІР»РµРЅС‹ РІ Р»РёСЃС‚ РѕР¶РёРґР°РЅРёСЏ.";
  if (result.reason === "event_full") return "РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚.";
  if (result.reason === "event_closed") return "РџСЂРёСЃРѕРµРґРёРЅРµРЅРёРµ Рє СЃРѕР±С‹С‚РёСЋ Р·Р°РєСЂС‹С‚Рѕ.";
  if (result.reason === "event_not_found") return "РЎРѕР±С‹С‚РёРµ РЅРµ РЅР°Р№РґРµРЅРѕ.";
  return "РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ Рє СЃРѕР±С‹С‚РёСЋ.";
};

const messengerResultHeading = (result: JoinResult) => {
  if (result.status === "joined") return "Р’С‹ РїСЂРёСЃРѕРµРґРёРЅРёР»РёСЃСЊ Рє СЃРѕР±С‹С‚РёСЋ.";
  if (result.status === "already_joined") return "Р’С‹ СѓР¶Рµ СѓС‡Р°СЃС‚РІСѓРµС‚Рµ РІ СЌС‚РѕРј СЃРѕР±С‹С‚РёРё.";
  if (result.status === "pending") return "Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР° РѕСЂРіР°РЅРёР·Р°С‚РѕСЂСѓ.";
  if (result.status === "waitlisted") return "РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚. Р’С‹ РґРѕР±Р°РІР»РµРЅС‹ РІ Р»РёСЃС‚ РѕР¶РёРґР°РЅРёСЏ.";
  if (result.reason === "event_full") return "РЎРІРѕР±РѕРґРЅС‹С… РјРµСЃС‚ РЅРµС‚.";
  if (result.reason === "event_closed") return "РџСЂРёСЃРѕРµРґРёРЅРµРЅРёРµ Рє СЃРѕР±С‹С‚РёСЋ Р·Р°РєСЂС‹С‚Рѕ.";
  if (result.reason === "event_not_found") return "РЎРѕР±С‹С‚РёРµ РЅРµ РЅР°Р№РґРµРЅРѕ.";
  return "РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРёСЃРѕРµРґРёРЅРёС‚СЊСЃСЏ Рє СЃРѕР±С‹С‚РёСЋ.";
};

const actionLine = (provider: MetaMessagingProvider, action: JoinResult["actions"][number]) => {
  const label = action.kind === "calendar" ? "Р”РѕР±Р°РІРёС‚СЊ РІ РєР°Р»РµРЅРґР°СЂСЊ" : "РћС‚РєСЂС‹С‚СЊ РєР°СЂС‚Сѓ";
  return `${label}: ${action.url}`;
};

export function buildMetaJoinResultPayload(
  provider: MetaMessagingProvider,
  recipientId: string,
  result: JoinResult,
): MetaJoinResultPayload {
  const actionLines = result.actions.map((action) => actionLine(provider, action));
  return {
    provider,
    recipient: { id: recipientId },
    message: {
      text: [provider === "messenger" ? messengerResultHeading(result) : resultHeading(result), ...actionLines].join("\n"),
    },
    join_status: result.status,
  };
}

