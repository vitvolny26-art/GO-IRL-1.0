import { useEffect, useMemo, useState } from "react";
import { Dumbbell, MapPin, Star, UserCheck, XCircle } from "lucide-react";
import {
  cancelCoachRequest,
  getCurrentCoachUserKey,
  getDemoCoachProfile,
  loadCoachRequestsForActivity,
  requestCoachForActivity,
} from "../coachFeature";
import { isActiveCoachRequest, resolveCoachRequestType } from "../coachRequestState";
import type { Activity, CoachRequest, SportLevel, UserRole } from "../types";
