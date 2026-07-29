import { mapUserProfileDraftToRpc } from "./profileMappers";
import type { UserProfile, UserProfileDraft } from "./profileTypes";

const equalStringLists = (left: readonly string[], right: readonly string[]) => {
  if (left.length !== right.length) return false;
  const normalizedLeft = [...left].sort();
  const normalizedRight = [...right].sort();
  return normalizedLeft.every((value, index) => value === normalizedRight[index]);
};

export function assertProfileSaveResponseOwner(expectedUserKey: string, actualUserKey: string) {
  if (actualUserKey !== expectedUserKey) throw new Error("profile_save_identity_changed");
}

export function verifySavedProfile(
  input: UserProfileDraft,
  profile: UserProfile,
  expectedUserKey: string,
): UserProfile {
  assertProfileSaveResponseOwner(expectedUserKey, profile.userKey);
  const expected = mapUserProfileDraftToRpc(input);
  const mismatches: string[] = [];

  if (profile.displayName !== expected.p_display_name) mismatches.push("displayName");
  if (profile.bio !== expected.p_bio) mismatches.push("bio");
  if (profile.cityId !== expected.p_city_id) mismatches.push("cityId");
  if (profile.avatarPath !== expected.p_avatar_path) mismatches.push("avatarPath");
  if (profile.avatarCode !== expected.p_avatar_code) mismatches.push("avatarCode");
  if (profile.isPublic !== expected.p_is_public) mismatches.push("isPublic");
  if (profile.showFavorites !== expected.p_show_favorites) mismatches.push("showFavorites");
  if (!equalStringLists(profile.favoriteActivityIds, expected.p_interest_slugs)) {
    mismatches.push("favoriteActivityIds");
  }

  if (mismatches.length > 0) {
    throw new Error(`profile_save_verification_failed:${mismatches.join(",")}`);
  }

  return profile;
}
