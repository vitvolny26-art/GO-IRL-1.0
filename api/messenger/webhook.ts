import { handleProviderWebhook } from "../_shared/provider-webhook";

export default (request: Request) => handleProviderWebhook("messenger", request);
