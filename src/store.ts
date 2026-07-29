import { create } from "zustand";
import { categories } from "./data";
import { supabase, getUserKey } from "./supabase";
import {
  getCurrentDisplayName,
  getCurrentStartParam,
  getCurrentUserRole as getTrustedUserRole,
  initializeTrustedAuth,
  isTrustedAuthReady } from "./authSession";
import { getCurrentUserRole, isCurrentUserAdmin } from "./config/admin";
import { cities, defaultCityId } from "./config/cities";
import { getTranslation } from "./i18n";
import type { Activity, ActivityMetadata, ActivityType, AppView, Language, NewActivity, UserRole } from "./types";
import { activityIdFromJoinPath } from "./invitationLink";
import { isProfilePath } from "./profile/profileRoute";
import { localDateKey, reconcileVisualDemoSnapshot } from "./visualDemoState";

