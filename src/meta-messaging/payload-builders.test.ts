import { describe, expect, it } from "vitest";
import {
  buildInstagramInvitationPayload,
  buildMessengerInvitationPayload,
  buildMessengerWelcomePayload,
  buildMetaJoinResultPayload,
} from "./payload-builders";
import type { MetaEventSummary } from "./types";

const event: MetaEventSummary = {
  eventId: "event-meta-1",
  title: "Board games in Olomouc",
