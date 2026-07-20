import type {
  LegacyLocalProfile,
  PublicProfile,
  SaveMyProfileRpcArgs,
  UserProfile,
  UserProfileDraft,
  UserProfileInterestRow,
  UserProfileRow,
} from "./profileTypes";

export const maxProfileInterestCount = 12;

const isDataImage = (value: string) => value.startsWith("data:image/");
const nullableText = (value: string | null) => value?.trim() || null;

export function mapUserProfileRow(
  row: UserProfileRow,
  interests: UserProfileInterestRow[] = [],
): UserProfile {
  return {
    userKey: row.user_key,
    displayName: row.display_name,
    bio: row.bio,
    cityId: row.city_id,
    avatarPath: row.avatar_path,
    avatarCode: row.avatar_code,
    isPublic: row.is_public,
    showFavorites: row.show_favorites,
    favoriteActivityIds: interests.map((interest) => interest.interest_slug),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapUserProfileToPublicProfile(profile: UserProfile): PublicProfile | null {
  if (!profile.isPublic) return null;

  return {
    userKey: profile.userKey,
    displayName: profile.displayName,
    bio: profile.bio,
    cityId: profile.cityId,
    avatarPath: profile.avatarPath,
    avatarCode: profile.avatarCode,
    favoriteActivityIds: profile.showFavorites ? [...profile.favoriteActivityIds] : [],
    updatedAt: profile.updatedAt,
  };
}

export function mapUserProfileDraftToRpc(input: UserProfileDraft): SaveMyProfileRpcArgs {
  const avatarPath = nullableText(input.avatarPath);
  const avatarCode = nullableText(input.avatarCode);
  const interestSlugs = [...input.favoriteActivityIds];

  if (avatarPath && avatarCode) throw new Error("profile_avatar_source_conflict");
  if (avatarPath && (avatarPath.startsWith("data:") || avatarPath.includes("://"))) {
    throw new Error("profile_avatar_path_invalid");
  }
  if (interestSlugs.length > maxProfileInterestCount) throw new Error("profile_interest_limit_exceeded");
  if (new Set(interestSlugs).size !== interestSlugs.length) throw new Error("profile_interests_must_be_unique");

  return {
    p_display_name: input.displayName.trim(),
    p_bio: input.bio,
    p_city_id: input.cityId,
    p_avatar_path: avatarPath,
    p_avatar_code: avatarCode,
    p_is_public: input.isPublic,
    p_show_favorites: input.showFavorites,
    p_interest_slugs: interestSlugs,
  };
}

export function mapLegacyLocalProfile(
  value: LegacyLocalProfile,
  fallback: {
    userKey: string;
    displayName: string;
    cityId: string;
    registeredAt: string;
  },
): UserProfile {
  const avatar = value.avatar?.trim() || "GI";
  const createdAt = value.registeredAt || fallback.registeredAt;

  return {
    userKey: fallback.userKey,
    displayName: value.name?.trim() || fallback.displayName,
    bio: value.bio || "",
    cityId: value.cityId || fallback.cityId,
    avatarPath: isDataImage(avatar) ? avatar : null,
    avatarCode: isDataImage(avatar) ? null : avatar,
    isPublic: true,
    showFavorites: true,
    favoriteActivityIds: Array.isArray(value.favoriteActivities) ? [...value.favoriteActivities] : [],
    createdAt,
    updatedAt: value.updatedAt || createdAt,
  };
}

export function mapUserProfileDraftToLegacy(
  input: UserProfileDraft,
  registeredAt: string,
  updatedAt: string,
): Required<LegacyLocalProfile> {
  return {
    name: input.displayName.trim(),
    bio: input.bio,
    cityId: input.cityId,
    avatar: input.avatarPath || input.avatarCode || "GI",
    registeredAt,
    updatedAt,
    favoriteActivities: [...input.favoriteActivityIds],
  };
}
