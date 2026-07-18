import {
  browserMockUserKey,
  getCurrentAuthSession,
  initializeTrustedAuth,
  isBrowserMockMode,
  isTrustedAuthReady,
  readAuthUserKey,
} from "./authSession";
import { normalizeCoachRequestDetails, type CoachRequestDetails } from "./coachRequestState";
import { attachDemoCoachProfile, demoCoachProfile } from "./demoCoachProfile";
import { supabase } from "./