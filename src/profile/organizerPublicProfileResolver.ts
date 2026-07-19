import { getCurrentAuthIdentity } from "../authSession";
import { supabase } from "../supabase";
import { createProfileRepository, type ProfileRepository } from "./profileRepository";
import type { PublicProfile } from "./profileTypes";

let repository: ProfileRepository | null = null;
let repositoryIdentityKey = "";
let scheduled = false;
const pending = new Map<string, Array<(profile: PublicProfile | null) => void>>();