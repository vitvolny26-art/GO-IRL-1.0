import { handleProviderWebhook } from "../_shared/provider-webhook.js";

export default (request: Request) => handleProviderWebhook("messenger", request);
