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

export type UserProfileDraft = Pick<
  UserProfile,
  | "displayName"
  | "bio"
  | "cityId"
  | "avatarPath"
  | "avatarCode"
  | "isPublic"
  | "showFavorites"
  | "favoriteActivityIds"
>;

export type UserProfileRow = {
  user_key: string;
  display_name: string;
  bio: string;
  city_id: string;
  avatar_path: string | null;
  avatar_code: string | null;
  is_public: boolean;
  show_favorites: boolean;
  created_at: string;
  updated_at: string;
};

export type UserProfileInterestRow = {
  interest_slug: string;
};

export type SaveMyProfileRpcArgs = {
  p_display_name: string;
  p_bio: string;
  p_city_id: string;
  p_avatar_path: string | null;
  p_avatar_code: string | null;
  p_is_public: boolean;
  p_show_favorites: boolean;
  p_interest_slugs: string[];
};

export type LegacyLocalProfile = {
  name?: string;
  bio?: string;
  cityId?: string;
  avatar?: string;
  registeredAt?: string;
  updatedAt?: string;
  favoriteActivities?: string[];
};
