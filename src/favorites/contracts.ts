export const favoriteContractVersion = 1 as const;

export type FavoriteSubjectType = "activity" | "organizer";
export type FavoriteStatus = "active" | "removed";
export type FavoriteSource = "activity_card" | "activity_details" | "organizer_profile" | "notification" | "system_import";

export type FavoriteSubject = {
  type: FavoriteSubjectType;
  id: string;
  activityId?: string | null;
  organizerUserKey?: string | null;
};

export type FavoriteRecord = {
  version: typeof favoriteContractVersion;
  id: string;
  userKey: string;
  subject: FavoriteSubject;
  status: FavoriteStatus;
  source: FavoriteSource;
  createdAt: string;
  updatedAt: string;
  removedAt?: string | null;
};

export type FavoriteOrganizerNotificationPreference = {
  userKey: string;
  organizerUserKey: string;
  newActivityNotificationsEnabled: boolean;
  mutedUntil?: string | null;
  updatedAt: string;
};

export type FavoriteProjection = {
  userKey: string;
  subjectType: FavoriteSubjectType;
  subjectId: string;
  isFavorite: boolean;
  favoritedAt?: string | null;
};

export type FavoriteCounter = {
  subjectType: FavoriteSubjectType;
  subjectId: string;
  activeFavoriteCount: number;
  visibility: "private";
  updatedAt: string;
};

export type FavoritePolicy = {
  publicFavoriteCountsEnabled: boolean;
  organizerCanSeeFavoritingUsers: boolean;
  oneActiveFavoritePerUserAndSubject: boolean;
  removedRecordsRetainedForAudit: boolean;
  directMessagesAllowed: boolean;
};

export const favoritePolicy: FavoritePolicy = {
  publicFavoriteCountsEnabled: false,
  organizerCanSeeFavoritingUsers: false,
  oneActiveFavoritePerUserAndSubject: true,
  removedRecordsRetainedForAudit: true,
  directMessagesAllowed: false,
};

export const buildFavoriteUniquenessKey = (userKey: string, subject: FavoriteSubject) =>
  [userKey, subject.type, subject.id].map(encodeURIComponent).join(":");

export const buildFavoriteOrganizerActivityOccurrenceKey = (
  recipientUserKey: string,
  organizerUserKey: string,
  activityId: string,
) => [recipientUserKey, organizerUserKey, activityId].map(encodeURIComponent).join(":");

export const canNotifyAboutFavoriteOrganizerActivity = (
  preference: Pick<FavoriteOrganizerNotificationPreference, "newActivityNotificationsEnabled" | "mutedUntil">,
  now = new Date(),
) =>
  preference.newActivityNotificationsEnabled &&
  (!preference.mutedUntil || new Date(preference.mutedUntil).getTime() <= now.getTime());
