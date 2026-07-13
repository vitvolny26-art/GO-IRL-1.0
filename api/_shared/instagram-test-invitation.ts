import { createProviderTestInvitationHandler } from "./provider-test-invitation.js";
import { getProviderEventSummary } from "./provider-join-service.js";
import { sendProviderInvitation } from "./provider-messages.js";

export const handleInstagramTestInvitation = createProviderTestInvitationHandler({
  tokenEnv: "INSTAGRAM_TEST_TRIGGER_TOKEN",
  dependencies: {
    getEventSummary: getProviderEventSummary,
    sendInvitation: (recipientId, event) => sendProviderInvitation("instagram", recipientId, event),
  },
});
