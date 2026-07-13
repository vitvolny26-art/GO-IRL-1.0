import { handleProviderWebhook } from "../_shared/provider-webhook.js";

export default (request: Request) => handleProviderWebhook("whatsapp", request);
