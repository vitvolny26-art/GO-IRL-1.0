import { getProviderEventSummary } from "./provider-join-service.js";
import { sendProviderInvitation } from "./provider-messages.js";
import { createProviderTestInvitationHandler } from "./provider-test-invitation.js";

export const handleMessengerTestInvitation = createProviderTestInvitationHandler({
  tokenEnv: "MESSENGER_TEST_TRIGGER_TOKEN",
  dependencies: {
    getEventSummary: getProviderEventSummary,
    sendInvitation: (recipientId, event) => sendProviderInvitation("messenger", recipientId, event),
  },
});
