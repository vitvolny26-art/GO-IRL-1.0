import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppAuthIdentity } from "../authSession";
import { LocalProfileRepository } from "./localProfileRepository";
import { SupabaseProfileRepository } from "./supabaseProfileRepository";
import type { PublicProfile, UserProfile, UserProfileDraft } from "./profileTypes";

export type PublicProfileMap = ReadonlyMap<string, PublicProfile | null>;

export interface ProfileRepository {
  loadOwnProfile(): Promise<UserProfile | null>;
  loadPublicProfile(userKey: string): Promise<PublicProfile | null>;
  loadPublicProfiles(userKeys: readonly string[]): Promise<PublicProfileMap>;
  saveOwnProfile(input: UserProfileDraft): Promise<UserProfile>;
  uploadAvatar(file: File): Promise<string>;
  resolveAvatarUrl(path: string): Promise<string>;
}

export type ProfileRepositoryKind = "local" | "supabase";

type TrustedProfileIdentity = Extract<AppAuthIdentity, { source: "trusted-telegram" }>;

export type CreateProfileRepositoryOptions = {
  identity: AppAuthIdentity | null;
  supabaseClient: SupabaseClient;
  storage: Storage;
  fallbackDisplayName: string;
  fallbackCityId: string;
  now?: () => Date;
  readFileAsDataUrl?: (file: File) => Promise<string>;
};

const isTrustedProfileIdentity = (
  identity: AppAuthIdentity | null,
): identity is TrustedProfileIdentity => identity?.source === "trusted-telegram";

export function selectProfileRepositoryKind(identity: AppAuthIdentity | null): ProfileRepositoryKind {
  return isTrustedProfileIdentity(identity) ? "supabase" : "local";
}

export function createProfileRepository(options: CreateProfileRepositoryOptions): ProfileRepository {
  if (isTrustedProfileIdentity(options.identity)) {
    return new SupabaseProfileRepository(options.supabaseClient, options.identity.user.userKey);
  }

  const userKey = options.identity && "userKey" in options.identity
    ? options.identity.userKey
    : "guest-local";

  return new LocalProfileRepository({
    storage: options.storage,
    userKey,
    fallbackDisplayName: options.fallbackDisplayName,
    fallbackCityId: options.fallbackCityId,
    now: options.now,
    readFileAsDataUrl: options.readFileAsDataUrl,
  });
}
