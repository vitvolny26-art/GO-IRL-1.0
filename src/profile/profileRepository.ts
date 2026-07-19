import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppAuthIdentity } from "../authSession";
import { LocalProfileRepository } from "./localProfileRepository";
import { SupabaseProfileRepository } from "./supabaseProfileRepository";
import type { PublicProfile, UserProfile, UserProfileDraft } from "./profileTypes";