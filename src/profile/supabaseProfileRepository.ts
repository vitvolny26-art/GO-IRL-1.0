import type { SupabaseClient } from "@supabase/supabase-js";
import { profileAvatarBucket } from "../profileAvatar";
import {
  mapUserProfileDraftToRpc,
  mapUserProfileRow,
  mapUserProfileToPublicProfile,
} from "./profileMappers";
import type { ProfileRepository } from "./profileRepository";
import type {
  PublicProfile,
  UserProfile,
  UserProfileDraft,
  UserProfileInterestRow,
  UserProfileRow,
} from "./profileTypes";

const allowedAvatarMimeTypes = new Set(["image/jpeg", "image/png"]);
const maxAvatarBytes = 5 * 1024 * 1024;
const signedAvatarUrlSeconds = 300;

const avatarExtension = (file: File) => file.type === "image/png" ? "png" : "jpg";

export function buildTrustedProfileAvatarPath(
  userKey: string,
  file: File,
  randomUUID: () => string = () => crypto.randomUUID(),
) {
  return `${userKey}/${randomUUID()}.${avatarExtension(file)}`;
}

export class SupabaseProfileRepository implements ProfileRepository {
  constructor(
    private readonly client: SupabaseClient,
    private readonly userKey: string,
  ) {}

  async loadOwnProfile(): Promise<UserProfile | null> {
    return this.loadProfile(this.userKey);
  }

  async loadPublicProfile(userKey: string): Promise<PublicProfile | null> {
    const profile = await this.loadProfile(userKey);
    return profile ? mapUserProfileToPublicProfile(profile) : null;
  }

  async saveOwnProfile(input: UserProfileDraft): Promise<UserProfile> {
    const args = mapUserProfileDraftToRpc(input);
    const result = await this.client.rpc("save_my_profile", args);

    if (result.error) throw result.error;
    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!data) throw new Error("profile_save_empty_response");

    return mapUserProfileRow(
      data as UserProfileRow,
      input.favoriteActivityIds.map((interest_slug) => ({ interest_slug })),
    );
  }

  async uploadAvatar(file: File): Promise<string> {
    if (!allowedAvatarMimeTypes.has(file.type) || file.size > maxAvatarBytes) {
      throw new Error("profile_avatar_invalid");
    }

    const path = buildTrustedProfileAvatarPath(this.userKey, file);
    const result = await this.client.storage
      .from(profileAvatarBucket)
      .upload(path, file, {
        cacheControl: "3600",
        contentType: file.type,
        upsert: false,
      });
    if (result.error) throw result.error;
    return path;
  }

  async resolveAvatarUrl(path: string): Promise<string> {
    if (!path) return "";
    const result = await this.client.storage
      .from(profileAvatarBucket)
      .createSignedUrl(path, signedAvatarUrlSeconds);
    if (result.error) throw result.error;
    return result.data.signedUrl;
  }

  private async loadProfile(userKey: string): Promise<UserProfile | null> {
    const profileResult = await this.client
      .from("user_profiles")
      .select("user_key, display_name, bio, city_id, avatar_path, avatar_code, is_public, show_favorites, created_at, updated_at")
      .eq("user_key", userKey)
      .maybeSingle();

    if (profileResult.error) throw profileResult.error;
    if (!profileResult.data) return null;

    const row = profileResult.data as UserProfileRow;
    const interestsResult = row.show_favorites
      ? await this.client
        .from("user_profile_interests")
        .select("interest_slug")
        .eq("user_key", userKey)
        .order("created_at", { ascending: true })
      : { data: [], error: null };

    if (interestsResult.error) throw interestsResult.error;

    return mapUserProfileRow(
      row,
      (interestsResult.data || []) as UserProfileInterestRow[],
    );
  }
}
