import { handleProviderWebhook } from "../_shared/provider-webhook";

export default (request: Request) => handleProviderWebhook("whatsapp", request);
