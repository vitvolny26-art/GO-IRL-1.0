import type {
  NotificationCategory,
  NotificationDeepLink,
  NotificationKind,
  NotificationRecord,
} from "./contracts.js";

export const notificationCenterContractVersion = 1 as const;

export type NotificationCenterFilter = "all" | "unread" | NotificationCategory;

export type NotificationCenterCursor = {
  createdAt: string;
  notificationId: string;
};

export type NotificationCenterItemState = "unread" | "read" | "opened";

export type NotificationCenterItem = {
  version: typeof notificationCenterContractVersion;
  id: string;
  kind: NotificationKind;
  category: NotificationCategory;
  state: NotificationCenterItemState;
  actor: NotificationRecord["actor"];
  subject: NotificationRecord["subject"];
  payload: NotificationRecord["payload"];
  deepLink?: NotificationDeepLink | null;
  serviceCritical: boolean;
  createdAt: string;
  expiresAt?: string | null;
};

export type NotificationCenterGroupKey = {
  category: NotificationCategory;
  subjectType: NotificationRecord["subject"]["type"];
  subjectId: string;
  localDate: string;
};

export type NotificationCenterGroup = {
  key: NotificationCenterGroupKey;
  items: NotificationCenterItem[];
  unreadCount: number;
  latestCreatedAt: string;
};

export type NotificationCenterPage = {
  items: NotificationCenterItem[];
  groups: NotificationCenterGroup[];
  unreadCount: number;
  nextCursor?: NotificationCenterCursor | null;
};

export type NotificationCenterCommand =
  | { type: "mark_read"; recipientUserKey: string; notificationId: string; occurredAt: string }
  | { type: "mark_opened"; recipientUserKey: string; notificationId: string; occurredAt: string }
  | { type: "mark_all_read"; recipientUserKey: string; before?: NotificationCenterCursor; occurredAt: string };

export type NotificationCenterDeepLinkResolution =
  | { status: "resolved"; deepLink: NotificationDeepLink }
  | { status: "fallback"; deepLink: { view: "home" }; reason: "missing" | "expired" | "target_unavailable" };

export const getNotificationCenterItemState = (
  record: Pick<NotificationRecord, "readAt" | "openedAt">,
): NotificationCenterItemState => {
  if (record.openedAt) return "opened";
  if (record.readAt) return "read";
  return "unread";
};

export const toNotificationCenterItem = (record: NotificationRecord): NotificationCenterItem => ({
  version: notificationCenterContractVersion,
  id: record.id,
  kind: record.kind,
  category: record.category,
  state: getNotificationCenterItemState(record),
  actor: record.actor,
  subject: record.subject,
  payload: record.payload,
  deepLink: record.deepLink,
  serviceCritical: record.serviceCritical,
  createdAt: record.createdAt,
  expiresAt: record.expiresAt,
});

export const buildNotificationCenterCursor = (
  item: Pick<NotificationCenterItem, "createdAt" | "id">,
): NotificationCenterCursor => ({ createdAt: item.createdAt, notificationId: item.id });

export const compareNotificationCenterItems = (
  left: Pick<NotificationCenterItem, "createdAt" | "id">,
  right: Pick<NotificationCenterItem, "createdAt" | "id">,
) => right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id);

export const buildNotificationCenterGroupKey = (
  item: Pick<NotificationCenterItem, "category" | "subject" | "createdAt">,
): NotificationCenterGroupKey => ({
  category: item.category,
  subjectType: item.subject.type,
  subjectId: item.subject.id,
  localDate: item.createdAt.slice(0, 10),
});

export const shouldShowNotificationCenterItem = (
  item: Pick<NotificationCenterItem, "expiresAt" | "serviceCritical">,
  now: string,
) => item.serviceCritical || !item.expiresAt || item.expiresAt > now;

export const resolveNotificationCenterDeepLink = (
  item: Pick<NotificationCenterItem, "deepLink" | "expiresAt">,
  now: string,
  targetAvailable = true,
): NotificationCenterDeepLinkResolution => {
  if (!item.deepLink) return { status: "fallback", deepLink: { view: "home" }, reason: "missing" };
  if (item.expiresAt && item.expiresAt <= now) {
    return { status: "fallback", deepLink: { view: "home" }, reason: "expired" };
  }
  if (!targetAvailable) {
    return { status: "fallback", deepLink: { view: "home" }, reason: "target_unavailable" };
  }
  return { status: "resolved", deepLink: item.deepLink };
};
