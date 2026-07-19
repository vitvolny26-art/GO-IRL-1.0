export type UserProfile = {
  userKey: string;
  displayName: string;
  bio: string;
  cityId: string;
  avatarPath: string | null;
  avatarCode: string | null;
  isPublic: boolean;
  showFavorites: boolean;
  favoriteActivityIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type PublicProfile = Pick<
  UserProfile,
  | "userKey"
  | "displayName"
  | "bio"
  | "cityId"
  | "avatarPath"
  | "avatarCode"
  | "favoriteActivityIds"
  | "updatedAt"
>;

export type UserProfileDraft