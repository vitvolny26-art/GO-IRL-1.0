import { getCurrentAuthIdentity } from "../authSession";
import { supabase } from "../supabase";
import { createProfileRepository, type ProfileRepository } from "./profileRepository";
import type { PublicProfile } from "./profileTypes";

let repository: ProfileRepository | null = null;
let repositoryIdentityKey = "";
let scheduled = false;
const pending = new Map<string, Array<(profile: PublicProfile | null) => void>>();

const getRepository = () => {
  const identity = getCurrentAuthIdentity();
  const identityKey = identity?.source === "trusted-telegram"
    ? identity.user.userKey
    : identity && "userKey" in identity
      ? identity.userKey
      : "guest-local";

  if (!repository || repositoryIdentityKey !== identityKey) {
    repository = createProfileRepository({
      identity,
      supabaseClient: supabase,
      storage: localStorage,
      fallbackDisplayName: "GO IRL User",
      fallbackCityId: "olomouc",
    });
    repositoryIdentityKey = identityKey;
  }

  return repository;
};

const flush = async () => {
  scheduled = false;
  const entries = [...pending.entries()];
  pending.clear();
  if (!entries.length) return;

  const keys = entries.map(([userKey]) => userKey);

  try {
    const profiles = await getRepository().loadPublicProfiles(keys);
    for (const [userKey, resolvers] of entries) {
      const profile = profiles.get(userKey) ?? null;
      resolvers.forEach((resolve) => resolve(profile));
    }
  } catch {
    entries.forEach(([, resolvers]) => resolvers.forEach((resolve) => resolve(null)));
  }
};

export function loadOrganizerPublicProfile(userKey: string) {
  return new Promise<PublicProfile | null>((resolve) => {
    const resolvers = pending.get(userKey) || [];
    resolvers.push(resolve);
    pending.set(userKey, resolvers);

    if (!scheduled) {
      scheduled = true;
      queueMicrotask(() => void flush());
    }
  });
}

export async function resolveOrganizerPublicAvatar(profile: PublicProfile | null) {
  if (!profile?.avatarPath) return profile?.avatarCode || "";
  try {
    return await getRepository().resolveAvatarUrl(profile.avatarPath);
  } catch {
    return profile.avatarCode || "";
  }
}
