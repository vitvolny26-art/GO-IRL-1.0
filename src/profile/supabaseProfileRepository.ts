import type { SupabaseClient } from "@supabase/supabase-js";
import { profileAvatarBucket } from "../profileAvatar";
import {
  mapUserProfileDraftToRpc,
  mapUserProfileRow,
  mapUserProfileToPublicProfile,
} from "./profileMappers";
import type { ProfileRepository, PublicProfileMap } from "./profileRepository";
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
const publicProfileCacheTtlMs = 30_000;

const avatarExtension = (file: File) => file.type === "image/png" ? "png" : "jpg";

type PublicProfileCacheEntry = {
  value: PublicProfile | null;
  expiresAt: number;
};

export function buildTrustedProfileAvatarPath(
  userKey: string,
  file: File,
  randomUUID: () => string = () => crypto.randomUUID(),
) {
  return `${userKey}/${randomUUID()}.${avatarExtension(file)}`;
}

export class SupabaseProfileRepository implements ProfileRepository {
  private readonly publicProfileCache = new Map<string, PublicProfileCacheEntry>();

  constructor(
    private readonly client: SupabaseClient,
    private readonly userKey: string,
    private readonly now: () => number = () => Date.now(),
  ) {}

  async loadOwnProfile(): Promise<UserProfile | null> {
    return this.loadProfile(this.userKey, true);
  }

  async loadPublicProfile(userKey: string): Promise<PublicProfile | null> {
    return (await this.loadPublicProfiles([userKey])).get(userKey) ?? null;
  }

  async loadPublicProfiles(userKeys: readonly string[]): Promise<PublicProfileMap> {
    const uniqueKeys = [...new Set(userKeys.filter(Boolean))];
    const result = new Map<string, PublicProfile | null>();
    const missingKeys: string[] = [];
    const currentTime = this.now();

    for (const userKey of uniqueKeys) {
      const cached = this.publicProfileCache.get(userKey);
      if (cached && cached.expiresAt > currentTime) {
        result.set(userKey, cached.value);
      } else {
        this.publicProfileCache.delete(userKey);
        missingKeys.push(userKey);
      }
    }

    if (missingKeys.length === 0) return result;

    const profileResult = await this.client
      .from("user_profiles")
      .select("user_key, display_name, bio, city_id, avatar_path, avatar_code, is_public, show_favorites, created_at, updated_at")
      .in("user_key", missingKeys);

    if (profileResult.error) throw profileResult.error;

    const rows = (profileResult.data || []) as UserProfileRow[];
    const visibleRows = rows.filter((row) => row.is_public);
    const favoriteKeys = visibleRows
      .filter((row) => row.show_favorites)
      .map((row) => row.user_key);

    const interestsResult = favoriteKeys.length > 0
      ? await this.client
        .from("user_profile_interests")
        .select("user_key, interest_slug")
        .in("user_key", favoriteKeys)
        .order("created_at", { ascending: true })
      : { data: [], error: null };

    if (interestsResult.error) throw interestsResult.error;

    const interestsByUser = new Map<string, UserProfileInterestRow[]>();
    for (const interest of (interestsResult.data || []) as Array<UserProfileInterestRow & { user_key: string }>) {
      const existing = interestsByUser.get(interest.user_key) || [];
      existing.push({ interest_slug: interest.interest_slug });
      interestsByUser.set(interest.user_key, existing);
    }

    const rowByUser = new Map(rows.map((row) => [row.user_key, row]));
    const expiresAt = currentTime + publicProfileCacheTtlMs;

    for (const userKey of missingKeys) {
      const row = rowByUser.get(userKey);
      const value = row
        ? mapUserProfileToPublicProfile(mapUserProfileRow(row, interestsByUser.get(userKey) || []))
        : null;
      this.publicProfileCache.set(userKey, { value, expiresAt });
      result.set(userKey, value);
    }

    return result;
  }

  async saveOwnProfile(input: UserProfileDraft): Promise<UserProfile> {
    const args = mapUserProfileDraftToRpc(input);
    const result = await this.client.rpc("save_my_profile", args);

    if (result.error) throw result.error;
    const data = Array.isArray(result.data) ? result.data[0] : result.data;
    if (!data) throw new Error("profile_save_empty_response");

    this.publicProfileCache.delete(this.userKey);
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

  private async loadProfile(
    userKey: string,
    includeHiddenFavorites: boolean,
  ): Promise<UserProfile | null> {
    const profileResult = await this.client
      .from("user_profiles")
      .select("user_key, display_name, bio, city_id, avatar_path, avatar_code, is_public, show_favorites, created_at, updated_at")
      .eq("user_key", userKey)
      .maybeSingle();

    if (profileResult.error) throw profileResult.error;
    if (!profileResult.data) return null;

    const row = profileResult.data as UserProfileRow;
    const interestsResult = includeHiddenFavorites || row.show_favorites
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
