import { readProfileAvatarAsDataUrl } from "../profileAvatar";
import { mapLegacyLocalProfile, mapUserProfileDraftToLegacy } from "./profileMappers";
import type { ProfileRepository } from "./profileRepository";
import type { LegacyLocalProfile, UserProfile, UserProfileDraft } from "./profileTypes";

const profileStorageKey = "go-irl-profile";
const registeredAtStorageKey = "go-irl-registered-at";

type LocalProfileRepositoryOptions = {
  storage: Storage;
  userKey: string;
  fallbackDisplayName: string;
  fallbackCityId: string;
  now?: () => Date;
  readFileAsDataUrl?: (file: File) => Promise<string>;
};

export class LocalProfileRepository implements ProfileRepository {
  private readonly now: () => Date;
  private readonly readFileAsDataUrl: (file: File) => Promise<string>;

  constructor(private readonly options: LocalProfileRepositoryOptions) {
    this.now = options.now || (() => new Date());
    this.readFileAsDataUrl = options.readFileAsDataUrl || readProfileAvatarAsDataUrl;
  }

  async loadOwnProfile(): Promise<UserProfile> {
    const registeredAt = this.readOrCreateRegisteredAt();
    const fallback = {
      userKey: this.options.userKey,
      displayName: this.options.fallbackDisplayName,
      cityId: this.options.fallbackCityId,
      registeredAt,
    };
    const stored = this.options.storage.getItem(profileStorageKey);

    if (!stored) return mapLegacyLocalProfile({}, fallback);

    try {
      const parsed: unknown = JSON.parse(stored);
      const legacy = parsed && typeof parsed === "object" ? parsed as LegacyLocalProfile : {};
      return mapLegacyLocalProfile(legacy, fallback);
    } catch {
      return mapLegacyLocalProfile({}, fallback);
    }
  }

  async saveOwnProfile(input: UserProfileDraft): Promise<UserProfile> {
    const current = await this.loadOwnProfile();
    const updatedAt = this.now().toISOString();
    const legacy = mapUserProfileDraftToLegacy(input, current.createdAt, updatedAt);
    this.options.storage.setItem(profileStorageKey, JSON.stringify(legacy));

    return mapLegacyLocalProfile(legacy, {
      userKey: this.options.userKey,
      displayName: this.options.fallbackDisplayName,
      cityId: this.options.fallbackCityId,
      registeredAt: current.createdAt,
    });
  }

  async uploadAvatar(file: File): Promise<string> {
    return this.readFileAsDataUrl(file);
  }

  async resolveAvatarUrl(path: string): Promise<string> {
    return path;
  }

  private readOrCreateRegisteredAt() {
    const existing = this.options.storage.getItem(registeredAtStorageKey);
    if (existing) return existing;

    const createdAt = this.now().toISOString();
    this.options.storage.setItem(registeredAtStorageKey, createdAt);
    return createdAt;
  }
}
